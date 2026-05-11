# Performance assessment & piano di intervento

Sintesi di tre analisi esterne (V1 piano completo, V2 audit codebase, V3 workflow misurazione-driven) confrontate con lo stato reale del codice in `skill-practice/`.

Diagnosi condivisa: ogni navigazione su rotta protetta attende `proxy.getUser()` → `getCurrentProfile()` → query di pagina prima di mostrare contenuto. La somma di queste latenze è ciò che l'utente percepisce come lentezza.

---

## 1. Stato attuale (già implementato, non rifare)

| Area | Stato |
|------|-------|
| `loading.tsx` rotte principali | Presenti per `(app)`, today, programma, library, progress, news, skill/[skillId], sessions/setup |
| Navigation con `<Link>` | BottomNav, hub, library, programma, calendar, profile — tutto Link. Unico `router.replace` in [ResetScheduleSection.tsx:36](../skill-practice/src/components/sessions/ResetScheduleSection.tsx#L36) (redirect post-action, legittimo) |
| `Promise.all` parallelo | today (4 query), programma (4), progress (3+2), calendar (3), library (3), skill/[skillId] (3 dopo `getSkillById`) |
| Optimistic UI reale | `PlanFormsSection` (sessions). `PracticeCompletionToggle` ha stato locale ma aggiorna solo dopo action; vedi gap UI |
| Indici DB base | `(user_id, source) WHERE is_hidden=false`, `(user_id, date DESC)` su practice_logs, indici skills su discipline/grade |
| RLS abilitata | Tutte le tabelle |

V1 sovrastima il lavoro mancante: 60% dei suoi punti sono già fatti.

---

## 2. Gap reali (verificati nel codice)

### Architetturali
- **Nessuna config region Vercel**. Niente `vercel.json`, niente `preferredRegion`. [next.config.ts](../skill-practice/next.config.ts) ha solo gli headers di sicurezza. Se le function girano su `iad1` con DB in Frankfurt, ogni query paga ~90ms RTT × N round-trip.
- **`loading.tsx` mancante per `/calendar`** (e anche profile, plan/exam, plan/custom, hub). Cadono sullo skeleton del parent.
- **Nessun streaming con `Suspense`**. Pagine bloccano l'intero render sulla query più lenta. Esempio [progress/page.tsx:15](../skill-practice/src/app/(app)/progress/page.tsx#L15).
- **Nessuno strumento di misura**: no `Speed Insights`, no timing helper. Si naviga al buio.

### Query / dati
- **`/progress` non bounded**: [progress.ts:55-59](../skill-practice/src/lib/queries/progress.ts#L55-L59) scarica `activityLogs` senza limite di data per `countPracticeDays` e `computeCurrentStreakFromLogs`. Costo cresce linearmente con lo storico. Va aggregato lato SQL.
- **`/sessions/setup` sequenziale**: [page.tsx:13-15](../skill-practice/src/app/(app)/sessions/setup/page.tsx#L13-L15) — schedule e items in serie invece di `Promise.all`.
- **`/skill/[skillId]` parzialmente sequenziale**: [page.tsx:27-34](../skill-practice/src/app/(app)/skill/[skillId]/page.tsx#L27-L34) attende `getSkillById()` prima di avviare plan items, note e log di oggi. Dopo `profile` e `skillId`, questi fetch sono indipendenti e possono partire insieme; si accetta solo qualche query sprecata nel caso raro di skill inesistente.
- **`getCalendarSkillOptions()` senza `school_id`**: [calendar.ts:92](../skill-practice/src/lib/queries/calendar.ts#L92).
- **`getSkillById()` senza filtro `school_id`/tenant**: [skills.ts:50](../skill-practice/src/lib/queries/skills.ts#L50). Con RLS statica `USING (true)`, in multi-school potrebbe mostrare contenuti di un'altra scuola se si conosce l'ID.

### Auth
- **Doppio `getUser()` tra middleware e render**: [middleware.ts:47](../skill-practice/src/lib/supabase/middleware.ts#L47) + [user-profile.ts:14](../skill-practice/src/lib/queries/user-profile.ts#L14). È reale, ma `React.cache()` **non** deduplica attraverso il boundary middleware → Server Components: può deduplicare solo chiamate ripetute dentro lo stesso render React.
- **Nessun helper `requireUser()` condiviso**: ogni server action ricrea il client e richiama `getUser`. È corretto come security boundary e non incide sul TTFB delle pagine; un helper ridurrebbe duplicazione e incoerenze più che latenza di navigazione.

### UI optimistic incompleta / finta
- **`PracticeCompletionToggle`**: [PracticeCompletionToggle.tsx:32-48](../skill-practice/src/components/calendar/PracticeCompletionToggle.tsx#L32-L48) chiama `setOptimisticDone(next)` **dopo** che l'action ritorna — anche qui è pending-then-update, non optimistic.
- **`PracticeCheckButton`**: [PracticeCheckButton.tsx:20-29](../skill-practice/src/components/today/PracticeCheckButton.tsx#L20-L29) chiama `setDone(true)` **dopo** che l'action ritorna — non è optimistic, è pending-then-update.
- **`RepsCounter`**: [RepsCounter.tsx:39-41](../skill-practice/src/components/today/RepsCounter.tsx#L39-L41) il counter `{repsDone}/{repsTarget}` viene direttamente dai props. Nessun stato locale → aggiorna solo dopo `revalidatePath()` re-renderizza il parent.
- **`SkillStatusMenu`**: nessuno stato ottimistico per il cambio status.

### Revalidate
- **Liste lunghe ma coerenti**: ogni action revalida 4-6 path. V1 chiama questo "over-broad" ma rileggendo le liste (es. [practice.ts:63-66](../skill-practice/src/lib/actions/practice.ts#L63-L66)) sono effettivamente i path impattati. Margine reale: nullo o minimo.

### RLS / indici
- Static RLS con `USING (true)`: [0001_schema.sql:139-156](../skill-practice/supabase/migrations/0001_schema.sql#L139-L156). OK single-tenant, da rivedere con multi-school.
- Policy dinamiche usano `auth.uid()` non wrappato in `(select auth.uid())`. Micro-ottimizzazione consigliata da Supabase, impatto trascurabile su singolo utente.
- Manca indice composito su `skills(school_id, discipline, minimum_grade_value desc, display_order)` — solo se Index Advisor lo segnala.

---

## 3. Azioni di verifica esterna (fare per prime)

### V.1 — Vercel function region
1. Aprire **Vercel Dashboard → Project → Settings → Functions → Function Region**.
2. Se non è `Frankfurt (fra1)`, cambiarlo. È il singolo intervento a più alto ROI.
3. Per blindarlo da repo: creare `skill-practice/vercel.json`:
   ```json
   { "regions": ["fra1"] }
   ```
4. Redeploy e verificare nei Vercel Logs che le function partano da `fra1`.

### V.2 — Supabase auto-pause
1. Aprire **Supabase Dashboard → Project Settings → Compute & Disk**.
2. Verificare lo stato auto-pause. Free tier pausa dopo 1 settimana di inattività; wake-up costa ~1-2s sulla prima richiesta.
3. Se l'app sta inattiva per giorni: opzioni → upgrade Pro (~$25/mo), oppure cron Vercel che ping ogni 5 minuti.

### V.3 — Misurazione pre-intervento
1. **Chrome DevTools → Network** sull'app deployata. Per ogni rotta protetta:
   - **TTFB** (Time to First Byte) per la navigazione principale.
   - TTFB primo click dopo idle (cold start) vs. click successivi.
2. **Vercel Functions logs**: guardare `Duration` per request. Baseline > 400ms = problema region/query.
3. Annotare i numeri prima di toccare il codice — serve un confronto per validare gli interventi.

### V.4 — Supabase Query Performance / Index Advisor
1. **Supabase Dashboard → Database → Query Performance**.
2. Ordinare per total time. Identificare le 3-5 query più costose.
3. **Database → Index Advisor**: applicare solo gli indici suggeriti che riguardano query effettivamente lente. Non aggiungere indici "perché potrebbero servire".

---

## 4. Azioni sul codice (ordine consigliato)

### C.1 — Strumentazione timing (prerequisito di tutto)
Aggiungere helper `src/lib/perf.ts`:
```ts
import "server-only";
export async function timed<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  try { return await fn(); }
  finally { console.log(`[perf] ${label}: ${Math.round(performance.now() - start)}ms`); }
}
```
Strumentare `today`, `progress`, `calendar` per identificare il vero collo. Senza questo, gli step successivi sono speculativi.

### C.2 — `loading.tsx` mancanti
Creare:
- `src/app/(app)/calendar/loading.tsx`
- `src/app/(app)/profile/loading.tsx`
- `src/app/(app)/hub/loading.tsx`
- `src/app/(app)/plan/exam/loading.tsx`
- `src/app/(app)/plan/custom/loading.tsx`

Tutti possono riusare [AppRouteSkeleton](../skill-practice/src/components/shared/AppRouteSkeleton.tsx). Zero rischio, beneficio percepito alto.

### C.3 — Auth/profile cache dentro il render React
Wrappare `getCurrentProfile`, `getCurrentProfileAccount` e creare `getCurrentUser`:
```ts
// src/lib/queries/user-profile.ts
import { cache } from "react";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

export const getCurrentProfile = cache(async (): Promise<UserProfile | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle();
  return (data as UserProfile | null) ?? null;
});
```
`React.cache` deduplica solo chiamate ripetute dentro lo stesso render React. **Non elimina** il `getUser()` del middleware/proxy, perché quello gira in un boundary separato. Quindi è una pulizia utile e future-proof, ma il ROI immediato è più basso di region, loading skeleton, parallelizzazione e query bounded.

### C.4 — `/sessions/setup` parallelizza
Da [page.tsx:13-15](../skill-practice/src/app/(app)/sessions/setup/page.tsx#L13-L15):
```ts
const [schedule, items] = await Promise.all([
  getTrainingSchedule(profile.id),
  getUserPlanItems(profile.id, undefined, sourceFilter),
]);
```

### C.4b — `/skill/[skillId]` parallelizza i fetch indipendenti
Da [page.tsx:27-34](../skill-practice/src/app/(app)/skill/[skillId]/page.tsx#L27-L34), avviare insieme:
```ts
const [skill, planItems, personalNotes, todayLog] = await Promise.all([
  getSkillById(skillId),
  getUserPlanItemsBySkill(profile.id, skillId),
  getPersonalNotesForSkill(profile.id, skillId),
  getTodayLogForSkill(profile.id, skillId),
]);
if (!skill) notFound();
```
È un cambio piccolo: riduce un round-trip seriale sulla pagina dettaglio skill.

### C.5 — `/progress` aggregazione SQL invece di download storico
Sostituire le due query "tutti i logs di sempre" in [progress.ts:55-59](../skill-practice/src/lib/queries/progress.ts#L55-L59) con:
- Un RPC `count_practice_days(p_user_id uuid)` che ritorna `count(distinct date)`.
- Un RPC `current_streak(p_user_id uuid)` che calcola lo streak lato SQL.

Alternativa più semplice: limitare a `gte("date", "<oggi - N anni>")` per cap deterministico.

### C.6 — Streaming `Suspense` su pagine pesanti
`/progress` è il candidato più chiaro:
```tsx
export default async function ProgressPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return (
    <div className="space-y-6">
      <ProgressHeader />
      <Suspense fallback={<ActiveCycleSkeleton />}><ActiveCycleSection userId={profile.id} profile={profile} /></Suspense>
      <Suspense fallback={<GeneralProgressSkeleton />}><GeneralProgressSection userId={profile.id} /></Suspense>
      <Suspense fallback={<CalendarHeatmapSkeleton />}><PracticeCalendarSection userId={profile.id} /></Suspense>
    </div>
  );
}
```
Stesso pattern per `/today` (header instant, content streaming).

### C.7 — Optimistic UI vero
- `PracticeCompletionToggle`: spostare `setOptimisticDone(next)` **prima** della call, fare rollback su errore.
- `PracticeCheckButton`: spostare `setDone(true)` **prima** della call, fare rollback su errore.
- `RepsCounter`: aggiungere `useOptimistic` (o `useState` locale) sul counter, rollback su errore.
- `SkillStatusMenu`: idem per cambio status.

Pattern:
```tsx
const [optimistic, setOptimistic] = useOptimistic(initial, (_, next) => next);
function handleClick() {
  startTransition(async () => {
    setOptimistic(next);
    const result = await action(next);
    if ("error" in result) { /* React revert automatico a fine transition */ }
  });
}
```

### C.8 — `unstable_cache` su dati statici per schoolId
Tabelle statiche: `skills`, `exam_programs`, `exam_skill_requirements`. Cambiano raramente.
```ts
import { unstable_cache } from "next/cache";

export const getSkillsForDiscipline = unstable_cache(
  async (schoolId: string, discipline: Discipline, gradeValue: number) => { /* ... */ },
  ["skills-by-discipline"],
  { revalidate: 3600, tags: ["skills"] }
);
```
Invalidare con `revalidateTag("skills")` dalle mutation rare (seed, schema evolution). **Vincolo critico**: cache key DEVE includere `school_id`; mai cachare dati user-scoped per evitare leak fra utenti.

### C.9 — Filtro `school_id` esplicito su catalogo
Anche con `school_id` unico, aggiungerlo a:
- [getCalendarSkillOptions()](../skill-practice/src/lib/queries/calendar.ts#L92)
- [getSkillById()](../skill-practice/src/lib/queries/skills.ts#L50)
- `listSkillsForDiscipline`, `listSkillsAtGrade`, `listSkillsForExam`

Prepara multi-tenant, abilita indici compositi efficaci, è un cambio meccanico a basso rischio.

### C.10 — RLS `auth.uid()` → `(select auth.uid())`
Migrazione che riscrive le policy USING/WITH CHECK:
```sql
ALTER POLICY "user_plan_items_owner" ON user_plan_items
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));
```
Impatto trascurabile single-user, ma è "best practice gratis" prima del multi-tenant.

### C.11 — Indice composito `skills` (solo se Index Advisor lo segnala)
```sql
CREATE INDEX IF NOT EXISTS idx_skills_school_disc_grade_order
  ON skills (school_id, discipline, minimum_grade_value DESC, display_order);
```

---

## 5. Cosa NON fare

- **Niente SWR / React Query / client cache**. Combatte l'architettura Server Components.
- **Niente cache del service worker su rotte autenticate**. Decisione di privacy già presa, non revertirla per velocità.
- **Niente switch Server Actions → REST**. Le action non sono il collo.
- **Niente prefetcher manuale delle 5 core routes**: `<Link>` in BottomNav è sempre in viewport, Next.js prefetcha già automaticamente in produzione.
- **Niente Vercel Pro upfront**. Fix region e perceived latency prima.
- **Niente narrow di `revalidatePath`**: le liste attuali sono già coerenti, il margine è zero.

---

## 6. Ordine di esecuzione raccomandato

### Settimana 1 (verifica + low-effort high-impact)
1. **V.3** Misura TTFB e Vercel Function Duration (1h)
2. **V.1** Verifica/imposta region Vercel fra1 (15min + redeploy)
3. **V.2** Verifica auto-pause Supabase (10min)
4. **C.1** Strumentazione timing (30min)
5. **C.2** `loading.tsx` mancanti (30min)
6. **C.3** cache auth/profile intra-render (30min, ROI immediato basso ma utile)
7. **C.4** Parallelizza `/sessions/setup` (5min)
8. **C.4b** Parallelizza `/skill/[skillId]` (10min)

**Stop. Rimisurare.** Se le navigazioni sono accettabili, fine.

### Settimana 2 (se ancora lento)
9. **V.4** Supabase Index Advisor (30min)
10. **C.5** `/progress` aggregazione SQL (1-2h)
11. **C.6** `Suspense` streaming su `/progress` e `/today` (2-3h)
12. **C.7** Optimistic UI vero su PracticeCompletionToggle, PracticeCheckButton, RepsCounter, SkillStatusMenu (1-2h)
13. **C.8** `unstable_cache` su catalogo statico (1-2h)

### Backlog (multi-tenant prep, basso impatto immediato)
14. **C.9** Filtri `school_id` espliciti
15. **C.10** Migrazione RLS `(select auth.uid())`
16. **C.11** Indice composito skills (solo se segnalato)

---

## 7. Pessimistic take onesto

Se dopo lo step 8 i click sono ancora lenti, probabili cause residue:
- Supabase free tier in cold-start dopo inattività (V.2)
- Vercel cold start su function fredde (free tier limit)
- Hydration React lenta — verificare con Performance tab che sia server e non client

In quel caso: bundle analysis (`@next/bundle-analyzer`), dynamic import di `VideoPlayer` e componenti pesanti, e considerare upgrade Supabase Pro.

---

## 8. Piano di esecuzione dettagliato

Ogni step ha: pre-requisiti, file toccati, implementazione concreta, verifica, effort, criteri di accettazione. Eseguire in ordine; commit atomico per step (semplifica rollback e bisect).

### Setup iniziale (pre-tutto)

**Branch e baseline**
```bash
git checkout -b perf/measurement-and-quick-wins
```
Acquisire i numeri pre-intervento da V.3 (TTFB per rotta protetta su Vercel produzione, durata function nei log). Salvarli in `docs/perf-baseline.md` o in un commento del PR. Senza questi numeri non si può dichiarare vinto/perso un intervento.

---

### C.1 — Strumentazione timing

**Pre**: nessuno.
**File creati**: `skill-practice/src/lib/perf.ts`
**File toccati**: `today/page.tsx`, `progress/page.tsx`, `calendar/page.tsx`, `library/page.tsx`, `lib/queries/user-profile.ts`

**Implementazione**:
```ts
// skill-practice/src/lib/perf.ts
import "server-only";

const ENABLED = process.env.NODE_ENV !== "production" || process.env.PERF_LOG === "1";

export async function timed<T>(label: string, fn: () => Promise<T>): Promise<T> {
  if (!ENABLED) return fn();
  const start = performance.now();
  try {
    return await fn();
  } finally {
    console.log(`[perf] ${label}: ${Math.round(performance.now() - start)}ms`);
  }
}
```

Wrappare per ogni rotta hot le 3-5 chiamate principali:
```ts
// today/page.tsx
const profile = await timed("today.profile", () => getCurrentProfile());
// ...
const [items, logs, unreadNewsCount, schedule] = await Promise.all([
  timed("today.plan_items", () => getUserPlanItems(profile.id, undefined, sourceFilter)),
  timed("today.week_logs", () => getThisWeekLogs(profile.id)),
  timed("today.unread_news", () => getUnreadNewsCount(profile)),
  timed("today.schedule", () => getTrainingSchedule(profile.id)),
]);
```

**Verifica**: in Vercel Logs (Runtime Logs della function) compaiono righe `[perf] today.* : Nms`. Su Postgres remoto in EU con region allineata, ogni chiamata dovrebbe stare sotto 80ms.

**Effort**: 30 min.
**Criterio di accettazione**: log presenti su tutte e 4 le rotte protette principali; sotto produzione (con `PERF_LOG=1` come env Vercel) sono leggibili.
**Rollback**: rimuovere wrap `timed(…)`, eliminare `perf.ts`. Cambio reversibile riga per riga.

---

### C.2 — `loading.tsx` mancanti

**Pre**: nessuno.
**File creati**:
- `skill-practice/src/app/(app)/calendar/loading.tsx`
- `skill-practice/src/app/(app)/profile/loading.tsx`
- `skill-practice/src/app/(app)/hub/loading.tsx`
- `skill-practice/src/app/(app)/plan/exam/loading.tsx`
- `skill-practice/src/app/(app)/plan/custom/loading.tsx`

**Implementazione** (template identico per tutte):
```tsx
// es. src/app/(app)/calendar/loading.tsx
import { AppRouteSkeleton } from "@/components/shared/AppRouteSkeleton";

export default function Loading() {
  return <AppRouteSkeleton />;
}
```

Opzionale (qualità superiore): skeleton route-specifici. Per calendar, ad esempio una griglia 7×6 di placeholder. Da fare solo dopo aver visto che generic skeleton non basta.

**Verifica**: navigando da `/today` a `/calendar` con throttling rete (DevTools → Network → Slow 3G) lo skeleton appare immediatamente al click, non c'è "freeze".

**Effort**: 15 min.
**Criterio**: nessuna rotta protetta cade sullo skeleton parent generico durante navigazione.
**Rollback**: cancellare i 5 file.

---

### C.3 — Cache auth/profile intra-render

**Pre**: nessuno.
**File toccati**: `skill-practice/src/lib/queries/user-profile.ts`. Tutte le pagine consumano già `getCurrentProfile` — nessun cambio call-site.

**Implementazione**:
```ts
// src/lib/queries/user-profile.ts
import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/lib/types";

export type CurrentProfileAccount = UserProfile & {
  email: string | null;
  school_name: string | null;
};

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

export const getCurrentProfile = cache(async (): Promise<UserProfile | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  return (data as UserProfile | null) ?? null;
});

export const getCurrentProfileAccount = cache(
  async (): Promise<CurrentProfileAccount | null> => {
    const user = await getCurrentUser();
    if (!user) return null;
    const supabase = await createClient();
    const { data } = await supabase
      .from("user_profiles")
      .select("*, school:schools(name)")
      .eq("id", user.id)
      .maybeSingle();

    const row = data as (UserProfile & { school?: { name: string | null } | null }) | null;
    if (!row) return null;
    const { school, ...profile } = row;
    return { ...profile, email: user.email ?? null, school_name: school?.name ?? null };
  },
);
```

**Verifica**: in una pagina che chiama sia `getCurrentProfile` sia `getCurrentProfileAccount` (es. `/profile`) verificare con `timed()` da C.1 che la seconda invocazione di `auth.getUser()` non parta più.

**Effort**: 20 min.
**Criterio**: build verde, lint verde, comportamento identico, log mostra una sola chiamata Auth per render (escluso middleware).
**Rollback**: rimuovere `cache()` wrapper, ripristinare versione precedente.

---

### C.4 — Parallelizza `/sessions/setup`

**Pre**: nessuno.
**File toccati**: `skill-practice/src/app/(app)/sessions/setup/page.tsx`.

**Implementazione**: sostituire righe 13-15:
```ts
// PRIMA
const schedule = await getTrainingSchedule(profile.id);
const sourceFilter = profile.plan_mode === "custom" ? "manual" : "exam_program";
const items = await getUserPlanItems(profile.id, undefined, sourceFilter);

// DOPO
const sourceFilter = profile.plan_mode === "custom" ? "manual" : "exam_program";
const [schedule, items] = await Promise.all([
  getTrainingSchedule(profile.id),
  getUserPlanItems(profile.id, undefined, sourceFilter),
]);
```

**Verifica**: aprire `/sessions/setup` con timing log → `setup.schedule` e `setup.items` partono insieme (timestamp ravvicinato).
**Effort**: 5 min.
**Criterio**: pagina renderizza come prima, durata totale ≈ max(schedule, items) invece di sum.

---

### C.4b — Parallelizza `/skill/[skillId]`

**Pre**: nessuno.
**File toccati**: `skill-practice/src/app/(app)/skill/[skillId]/page.tsx`.

**Implementazione**: sostituire righe 26-34:
```ts
const { skillId } = await params;

const [skill, planItems, personalNotes, todayLog] = await Promise.all([
  getSkillById(skillId),
  getUserPlanItemsBySkill(profile.id, skillId),
  getPersonalNotesForSkill(profile.id, skillId),
  getTodayLogForSkill(profile.id, skillId),
]);
if (!skill) notFound();
```

**Trade-off documentato**: nel caso raro di `skillId` invalido si pagano 3 query "sprecate". Su una pagina dettaglio skill è accettabile.

**Verifica**: aprire una qualunque skill, controllare log → i 4 fetch partono insieme.
**Effort**: 10 min.
**Criterio**: tempo totale ≈ max(4 query) invece di getSkillById + max(3).

---

### C.5 — `/progress` aggregazione SQL

**Pre**: V.4 fatto (per confermare che è davvero un costo).
**File creati**: `skill-practice/supabase/migrations/0022_progress_aggregates.sql`.
**File toccati**: `skill-practice/src/lib/queries/progress.ts`, `skill-practice/src/lib/types.ts` (se servono nuovi tipi).

**Migration SQL**:
```sql
-- 0022_progress_aggregates.sql
CREATE OR REPLACE FUNCTION public.count_practice_days(p_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT COUNT(DISTINCT date)::int
  FROM practice_logs
  WHERE user_id = p_user_id
    AND (completed = true OR reps_done > 0);
$$;

CREATE OR REPLACE FUNCTION public.current_streak(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
AS $$
DECLARE
  streak integer := 0;
  cursor_date date;
  has_row boolean;
BEGIN
  cursor_date := CURRENT_DATE;
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM practice_logs
      WHERE user_id = p_user_id
        AND date = cursor_date
        AND (completed = true OR reps_done > 0)
    ) INTO has_row;

    IF NOT has_row THEN
      -- Tolleranza: se è oggi e non c'è pratica, controlla ieri prima di rompere
      IF cursor_date = CURRENT_DATE THEN
        cursor_date := cursor_date - 1;
        CONTINUE;
      END IF;
      EXIT;
    END IF;

    streak := streak + 1;
    cursor_date := cursor_date - 1;
  END LOOP;

  RETURN streak;
END;
$$;

GRANT EXECUTE ON FUNCTION public.count_practice_days(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_streak(uuid) TO authenticated;
```

**Refactor `progress.ts`**:
```ts
// Sostituire la query activityLogsResult con:
const [recentLogsResult, totalDaysResult, streakResult, scheduleResult] = await Promise.all([
  supabase
    .from("practice_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("date", dateKeyDaysAgo(89))
    .order("date", { ascending: true }),
  supabase.rpc("count_practice_days", { p_user_id: userId }),
  supabase.rpc("current_streak", { p_user_id: userId }),
  supabase
    .from("training_schedule")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle(),
]);

const practicedDaysTotal = (totalDaysResult.data as number | null) ?? 0;
const currentStreak = (streakResult.data as number | null) ?? 0;
// rimuovere computeCurrentStreakFromLogs(activityLogs) e countPracticeDays(activityLogs)
```

**Coordinamento DB**: la CLI Supabase non è in PATH (vedi memoria). Per applicare la migration: aprire **Supabase Dashboard → SQL Editor**, incollare l'intero SQL, eseguire.

**Verifica**:
1. Confrontare valori prima/dopo refactor — devono coincidere a meno della tolleranza streak (lo streak ora considera anche `reps_done > 0`, allineato a `computeCurrentStreakFromLogs`).
2. Timing log: la query non-bounded sparisce.
3. Test esistenti su `progress-logic.test.ts` continuano a passare (le funzioni TS restano usate per il calendario, lo streak è solo SQL).

**Effort**: 1-2h (compreso test di equivalenza).
**Criterio**: la query `select * from practice_logs where user_id = ?` con orderbycdate ascending senza upper bound non compare più in `/progress`.
**Rollback**: tenere le funzioni TS, droppare gli RPC se serve, ripristinare `progress.ts` precedente.

---

### C.6 — Streaming `Suspense`

**Pre**: C.5 fatto (altrimenti `/progress` ha ancora la query non-bounded).
**File creati**: nuovi Server Components per ogni sezione streamata.
**File toccati**: `progress/page.tsx`, `today/page.tsx`, `lib/queries/progress.ts` (split funzioni).

**Refactor `lib/queries/progress.ts`**: spezzare `getProgressData` in funzioni indipendenti consumabili dalle sezioni:
```ts
export async function getGeneralProgress(userId: string): Promise<GeneralProgress> { /* ... */ }
export async function getActiveCycleProgress(userId: string, profile: UserProfile): Promise<ActiveCycleProgress | null> { /* ... */ }
export async function getPracticeCalendarDays(userId: string): Promise<PracticeDay[]> { /* ... */ }
```

**Nuove Server Components**:
```tsx
// src/components/progress/sections/ActiveCycleSection.tsx
import "server-only";
import { getActiveCycleProgress } from "@/lib/queries/progress";
import { ActiveCycleProgress } from "@/components/progress/ActiveCycleProgress";
import type { UserProfile } from "@/lib/types";

export async function ActiveCycleSection({ profile }: { profile: UserProfile }) {
  const progress = await getActiveCycleProgress(profile.id, profile);
  if (!progress) return null;
  return <ActiveCycleProgress progress={progress} />;
}
```

Analogo per `GeneralProgressSection`, `PracticeCalendarSection`. Skeleton già usabili da `AppRouteSkeleton` o nuovi placeholder light.

**Refactor `progress/page.tsx`**:
```tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { ActiveCycleSection } from "@/components/progress/sections/ActiveCycleSection";
import { GeneralProgressSection } from "@/components/progress/sections/GeneralProgressSection";
import { PracticeCalendarSection } from "@/components/progress/sections/PracticeCalendarSection";
import { ProgressHeader } from "@/components/progress/ProgressHeader";
import { SectionSkeleton } from "@/components/shared/SectionSkeleton";

export default async function ProgressPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return (
    <div className="space-y-6">
      <ProgressHeader />
      <Suspense fallback={<SectionSkeleton lines={3} />}>
        <ActiveCycleSection profile={profile} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton lines={2} />}>
        <GeneralProgressSection userId={profile.id} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton lines={6} />}>
        <PracticeCalendarSection userId={profile.id} />
      </Suspense>
    </div>
  );
}
```

**Per `/today`**: header (giorno, modalità, badge) deve essere "fast shell" (Server Component sincrono o con sole props da `profile`/`schedule`). Le sezioni `TodayPracticeSections`, `TodaySessionSummary`, `NewsBanner` ognuna dietro `Suspense` con le proprie query.

**Verifica**:
- Network tab → vedere chunk HTML arrivare in streaming (compaiono progressivamente).
- Performance tab → header visibile prima che le query finiscano.
- Errori dentro una sezione non rompono le altre.

**Effort**: 2-3h (compreso split funzioni e skeleton).
**Criterio**: TTFB header ≤ 200ms anche se le query interne sono lente.
**Rollback**: ripristinare versione monolitica di `progress/page.tsx` e `getProgressData`.

---

### C.7 — Optimistic UI vero

**Pre**: C.1 utile per misurare differenza percepita.
**File toccati**:
- `skill-practice/src/components/calendar/PracticeCompletionToggle.tsx`
- `skill-practice/src/components/today/PracticeCheckButton.tsx`
- `skill-practice/src/components/today/RepsCounter.tsx`
- `skill-practice/src/components/today/SkillStatusMenu.tsx`

**Pattern di riferimento (PracticeCompletionToggle)**:
```tsx
function handleClick() {
  const next = !checked;
  const previous = checked;
  setOptimisticDone(next);              // UPDATE PRIMA
  startTransition(async () => {
    setError(null);
    const result =
      kind === "free"
        ? next
          ? await addFreePracticeForDate(skillId, dateKey)
          : await removeFreePracticeForDate(skillId, dateKey)
        : await setPracticeCompletionForDate(skillId, dateKey, next);

    if ("error" in result) {
      setOptimisticDone(previous);      // ROLLBACK su errore
      setError(result.error);
    }
  });
}
```

**`PracticeCheckButton`**:
```tsx
function handleClick() {
  setDone(true);                        // UPDATE PRIMA
  start(async () => {
    const result = await markPracticeDone(skillId);
    if (result && "error" in result) {
      setDone(false);                   // ROLLBACK
      setMessage(result.error);
      return;
    }
    setNoteOpen(true);
  });
}
```

**`RepsCounter`** (richiede `useOptimistic`):
```tsx
"use client";
import { useOptimistic, useState, useTransition } from "react";
// ...

export function RepsCounter({ skillId, repsDone, repsTarget }: Props) {
  const [optimisticReps, setOptimisticReps] = useOptimistic(
    repsDone,
    (_, delta: number) => Math.max(0, Math.min(repsTarget, _ + delta)),
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const completed = optimisticReps >= repsTarget;

  function handleIncrement() {
    startTransition(async () => {
      setOptimisticReps(+1);
      setError(null);
      const result = await incrementRep(skillId);
      if (result && "error" in result) setError(result.error);
      // a fine transition useOptimistic riallinea con il nuovo valore dei props (dopo revalidate)
    });
  }
  function handleDecrement() { /* analogo, +1 → -1 */ }
  // render: usa optimisticReps al posto di repsDone
}
```

**`SkillStatusMenu`**: stesso pattern di `PracticeCheckButton` su `currentStatus`.

**Verifica**:
- Con throttling rete Slow 3G, il counter/checkbox cambia istantaneamente al click.
- Forzando un errore (es. disconnettere) il valore torna allo stato precedente con messaggio errore.
- Nessun "doppio click che spara doppia action".

**Effort**: 1-2h (4 componenti).
**Criterio**: latenza percepita azzerata su pratica/reps/status; in caso di errore lo stato non resta inconsistente.

---

### C.8 — `unstable_cache` su catalogo statico

**Pre**: capire bene cosa è user-scoped e cosa no — questo step è il più rischioso per leak fra utenti.
**File toccati**: `lib/queries/skills.ts`, `lib/queries/exam-programs.ts`.

**Cosa cachare** (sicuro, dipende solo da `school_id` o da niente):
- `listSkillsForDiscipline(discipline)` → da rendere `(schoolId, discipline)`
- `listSkillsAtGrade(discipline, gradeValue)` → da rendere `(schoolId, discipline, gradeValue)`
- `listSkillsForExam(examId)` → key `examId` (exam appartiene a una sola school)
- `getSkillById(skillId)` → key `skillId` (immutabile)
- `getExamProgramById`, `getExamProgramRequirements` → key `examId`

**Cosa NON cachare**: tutto in `plan.ts`, `practice-log.ts`, `user-profile.ts`, `training-schedule.ts`, `news.ts`, `calendar.ts` (user-scoped).

**Pattern**:
```ts
// src/lib/queries/skills.ts
import "server-only";
import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export const getSkillById = unstable_cache(
  async (skillId: string) => {
    const supabase = await createClient();
    const { data } = await supabase.from("skills").select("*").eq("id", skillId).maybeSingle();
    return (data as Skill | null) ?? null;
  },
  ["skill-by-id"],
  { revalidate: 3600, tags: ["skills"] },
);

export const listSkillsForExam = unstable_cache(
  async (examId: string) => { /* corpo invariato */ },
  ["skills-for-exam"],
  { revalidate: 3600, tags: ["skills", "exams"] },
);
```

**Invalidazione**: gli SQL seed/migration sono fuori dal flusso runtime, quindi non hanno `revalidateTag`. Aggiungere route admin (futura) o redeploy invalida via build. Per ora: `revalidate: 3600` è la safety net.

**Verifica**:
- Aprire `/library` due volte in 5s → la seconda è ≈istantanea sul catalogo.
- Login con utente A in school S1, poi login con utente B in school S1 → entrambi vedono il proprio plan_items (NON cachato), stesso catalogo (cachato).
- Test multi-tenant (quando arriverà): mai mescolare row di school diverse.

**Effort**: 1-2h.
**Criterio**: query catalogo non compaiono più in Vercel Function logs dopo il primo hit.
**Rollback**: rimuovere `unstable_cache`, lasciare la funzione sincrona.

---

### C.9 — Filtri `school_id` espliciti

**Pre**: idealmente C.8 fatto (il filtro consolida la cache key e abilita indici compositi).
**File toccati**: `lib/queries/skills.ts`, `lib/queries/calendar.ts`, `lib/queries/exam-programs.ts`. Tutte le pagine che chiamano queste funzioni vanno aggiornate per passare `profile.school_id`.

**Esempio**:
```ts
// PRIMA
export async function listSkillsForDiscipline(discipline: Discipline): Promise<Skill[]> { /* ... */ }

// DOPO
export async function listSkillsForDiscipline(
  schoolId: string,
  discipline: Discipline,
): Promise<Skill[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("skills")
    .select("*")
    .eq("school_id", schoolId)
    .eq("discipline", discipline)
    .order("minimum_grade_value", { ascending: false })
    .order("category", { ascending: true })
    .order("display_order", { ascending: true });
  return (data as Skill[] | null) ?? [];
}
```

Call site (es. `library/page.tsx`):
```ts
listSkillsForDiscipline(profile.school_id, discipline),
```

**Per `getSkillById`** è opzionale aggiungere il filtro: in single-tenant è inerte; in multi-tenant è necessario per evitare leak via URL. Se non si vuole rompere la signature ora, almeno verificare lato page che `skill.school_id === profile.school_id` dopo il fetch.

**Verifica**:
- Build + lint verdi.
- TypeScript fa da rete: chi non passa `schoolId` non compila.
- Test su query dal Supabase SQL Editor: `EXPLAIN` mostra index scan invece di seq scan dopo aggiunta indice (C.11).

**Effort**: 1h.
**Criterio**: tutte le funzioni statiche prendono `schoolId` esplicito; nessun callsite rotto.

---

### C.10 — RLS `auth.uid()` → `(select auth.uid())`

**Pre**: nessuno. Step "best practice" senza dipendenza da altri.
**File creati**: `skill-practice/supabase/migrations/0023_rls_subselect_uid.sql`.

**Migration SQL**:
```sql
-- 0023_rls_subselect_uid.sql
-- Wrap auth.uid() in (select ...) per cache InitPlan PostgreSQL.
-- Reference: https://supabase.com/docs/guides/database/postgres/row-level-security#performance

ALTER POLICY "user_profiles_owner_select" ON user_profiles
  USING (id = (select auth.uid()));
ALTER POLICY "user_profiles_owner_update" ON user_profiles
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

ALTER POLICY "user_plan_items_owner" ON user_plan_items
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

ALTER POLICY "practice_logs_owner" ON practice_logs
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Aggiungere qui le policy di training_schedule, weekly_reflections,
-- e altre tabelle dinamiche introdotte in migration successive.
-- Verificare le policy esistenti con:
--   SELECT polname, polqual::text FROM pg_policy
--   WHERE polqual::text LIKE '%auth.uid()%' AND polqual::text NOT LIKE '%select auth.uid()%';
```

**Coordinamento DB**: applicare via Supabase SQL Editor.

**Verifica**:
- Login + interazione standard funziona (no permission denied).
- Query SELECT polname,polqual::text FROM pg_policy in SQL Editor: nessuna policy ha più `auth.uid()` non wrappato.
- `EXPLAIN` su `select * from user_plan_items where user_id = auth.uid()` mostra InitPlan invece di subplan per-row.

**Effort**: 30 min (compresa scoperta di policy aggiunte in migration più recenti).
**Criterio**: zero `auth.uid()` non wrappati in policy active.

---

### C.11 — Indice composito `skills`

**Pre**: V.4 deve aver segnalato seq scan o slow query su `skills`. Senza segnale, non aggiungere.
**File creati**: `skill-practice/supabase/migrations/0024_skills_composite_index.sql`.

**Migration SQL**:
```sql
-- 0024_skills_composite_index.sql
CREATE INDEX IF NOT EXISTS idx_skills_school_disc_grade_order
  ON skills (school_id, discipline, minimum_grade_value DESC, display_order);

-- Opzionale, valutare a seconda dei pattern reali in Query Performance:
-- CREATE INDEX IF NOT EXISTS idx_skills_school_category
--   ON skills (school_id, category);
```

**Coordinamento DB**: Supabase SQL Editor.

**Verifica**:
- `EXPLAIN` su query catalogo (es. `listSkillsForDiscipline` con `school_id` esplicito) mostra `Index Scan using idx_skills_school_disc_grade_order`.
- Query Performance: la query corrispondente esce dalle top-N più lente.

**Effort**: 10 min.
**Criterio**: index scan al posto di seq scan; durata query catalogo < 20ms su Frankfurt.
**Rollback**: `DROP INDEX idx_skills_school_disc_grade_order;`.

---

### Strategia di commit/PR

Una PR per ogni "fase" logica, non una mega-PR:

| PR | Contenuto | Reversibilità |
|----|-----------|---------------|
| `perf/measure-baseline` | C.1 + V.3 baseline doc | Alta |
| `perf/loading-and-parallel` | C.2 + C.4 + C.4b | Alta |
| `perf/auth-cache-render` | C.3 | Alta |
| `perf/progress-aggregates` | C.5 (migration + refactor) | Media (migration) |
| `perf/streaming-suspense` | C.6 | Media (refactor sezioni) |
| `perf/optimistic-ui` | C.7 | Alta |
| `perf/static-cache` | C.8 | Alta |
| `perf/school-id-explicit` | C.9 | Media (signature break) |
| `db/rls-subselect` | C.10 (migration RLS) | Alta |
| `db/skills-composite-index` | C.11 (migration index) | Alta |

Tra le PR ricarica i numeri di V.3 sulla rotta interessata: TTFB, durata function, # query in flight. Stop quando l'utente dice "ok adesso va".

### Test obbligatori prima di ogni merge

1. `npm run lint && npm run build` su `skill-practice/`.
2. Esecuzione manuale della rotta toccata su preview Vercel.
3. Per migration: applicare prima su un branch DB di staging se disponibile; altrimenti rollback SQL pronto in commento del PR.
4. Per modifiche a RLS o `school_id`: smoke test "login + main flow" come utente normale.

