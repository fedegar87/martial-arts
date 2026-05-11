# Top contenuti più praticati — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Esporre in `/progress` una sezione "I contenuti più praticati" con i 5 contenuti per cui l'utente ha più giorni distinti di pratica.

**Architecture:** RPC SQL `top_practiced_skills(p_user_id, p_limit)` aggrega `practice_logs` (filtro `completed OR reps_done>0`) con `JOIN skills`, ritorna 5 righe ordinate per `practice_days DESC`. Query layer in `lib/queries/progress.ts` mappa snake→camel. UI: split server `TopPracticedSection` + presentazionale `TopPracticedList` (pattern già usato per le altre sezioni `/progress`).

**Tech Stack:** Next.js 14 App Router · TypeScript strict · Supabase (Postgres + RLS + RPC) · Tailwind + shadcn/ui · lucide-react

**Design di riferimento:** [plan/2026-05-11-top-practiced-skills-design.md](2026-05-11-top-practiced-skills-design.md)

**Nota su TDD:** il design esplicita "niente test unitari" — il lavoro è puro SQL + mapping di shape + UI; non c'è logica JS pura da coprire. La verifica è `npm run lint && npm run build` + smoke test SQL + accettazione manuale UI (coerente con `skill-practice/CLAUDE.md`).

**Workflow DB:** la migration NON va applicata via Supabase CLI (non in PATH). Va eseguita manualmente nel SQL Editor della dashboard Supabase. L'engineer riceverà l'SQL copia-incolla nel Task 6.

---

### Task 1: Migration `0025_top_practiced_skills.sql`

**Files:**
- Create: `skill-practice/supabase/migrations/0025_top_practiced_skills.sql`

**Step 1: Creare il file migration**

Contenuto completo:

```sql
-- 0025 — RPC top_practiced_skills: classifica per giorni distinti di pratica.
-- Stessa convenzione di "log meaningful" di 0022: completed=true OPPURE reps_done>0.
-- Non aggiunge colonne o tabelle: aggregato derivato da practice_logs.
-- Indice esistente practice_logs_user_skill_date_key (da 0021) supporta
-- WHERE user_id=X GROUP BY skill_id nativamente.

CREATE OR REPLACE FUNCTION public.top_practiced_skills(
  p_user_id UUID,
  p_limit   INT DEFAULT 5
)
RETURNS TABLE (
  skill_id              UUID,
  skill_name            TEXT,
  skill_name_italian    TEXT,
  discipline            discipline,
  category              skill_category,
  practice_days         INT,
  last_practiced_date   DATE
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    s.id              AS skill_id,
    s.name            AS skill_name,
    s.name_italian    AS skill_name_italian,
    s.discipline,
    s.category,
    COUNT(*)::INT     AS practice_days,
    MAX(pl.date)      AS last_practiced_date
  FROM practice_logs pl
  INNER JOIN skills s ON s.id = pl.skill_id
  WHERE pl.user_id = p_user_id
    AND (pl.completed = true OR pl.reps_done > 0)
  GROUP BY s.id, s.name, s.name_italian, s.discipline, s.category
  ORDER BY practice_days DESC, last_practiced_date DESC, s.name ASC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 5), 50));
$$;

GRANT EXECUTE ON FUNCTION public.top_practiced_skills(UUID, INT) TO authenticated;
```

**Step 2: Verificare numerazione**

Run: `ls skill-practice/supabase/migrations/ | tail -5`
Expected: include `0025_top_practiced_skills.sql` come ultima riga. Le precedenti `0023_rls_subselect_uid.sql`, `0024_skills_composite_index.sql` devono già esistere — se non ci sono fermati e chiedi.

**Step 3: Commit**

```bash
git add skill-practice/supabase/migrations/0025_top_practiced_skills.sql
git commit -m "feat(db): RPC top_practiced_skills per /progress

Aggrega practice_logs per giorni distinti, filtro stesso di 0022.
Da applicare manualmente nel SQL Editor Supabase (Task 6)."
```

---

### Task 2: Query layer in `progress.ts`

**Files:**
- Modify: `skill-practice/src/lib/queries/progress.ts`

**Step 1: Verificare che `Discipline` e `SkillCategory` siano esportati**

Run: `grep -n "export type Discipline\|export type SkillCategory" skill-practice/src/lib/types.ts`
Expected: due match. Se manca uno dei due, aggiungerlo come `export type` sulla riga della relativa definizione (sono enum DB già presenti).

**Step 2: Aggiungere import e tipi**

In testa al file, sotto gli import esistenti, aggiungere:

```ts
import type { Discipline, SkillCategory } from "@/lib/types";
```

Subito dopo `export type ActiveCycleProgress = { ... }`, aggiungere:

```ts
export type TopPracticedSkill = {
  skillId: string;
  skillName: string;
  skillNameItalian: string | null;
  discipline: Discipline;
  category: SkillCategory;
  practiceDays: number;
  lastPracticedDate: string;
};
```

**Step 3: Aggiungere la funzione**

In fondo al file, prima di `function fmtDate(...)`, aggiungere:

```ts
type TopPracticedSkillRow = {
  skill_id: string;
  skill_name: string;
  skill_name_italian: string | null;
  discipline: Discipline;
  category: SkillCategory;
  practice_days: number;
  last_practiced_date: string;
};

export async function getTopPracticedSkills(
  userId: string,
  limit = 5,
): Promise<TopPracticedSkill[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("top_practiced_skills", {
    p_user_id: userId,
    p_limit: limit,
  });

  if (error) {
    throw new Error(`Errore in top_practiced_skills: ${error.message}`);
  }

  return ((data ?? []) as TopPracticedSkillRow[]).map((row) => ({
    skillId: row.skill_id,
    skillName: row.skill_name,
    skillNameItalian: row.skill_name_italian,
    discipline: row.discipline,
    category: row.category,
    practiceDays: row.practice_days,
    lastPracticedDate: row.last_practiced_date,
  }));
}
```

**Step 4: Verifica lint + build**

Run: `cd skill-practice && npm run lint`
Expected: zero errori.

Run: `cd skill-practice && npm run build`
Expected: build passa. Se Supabase typegen non conosce ancora la RPC, il cast a `TopPracticedSkillRow[]` la fa passare comunque.

**Step 5: Commit**

```bash
git add skill-practice/src/lib/queries/progress.ts
git commit -m "feat(progress): getTopPracticedSkills query wrapper

Chiama RPC top_practiced_skills e mappa snake_case → camelCase.
Tipo TopPracticedSkillRow esplicito sulla row per evitare any."
```

---

### Task 3: Componente presentazionale `TopPracticedList`

**Files:**
- Create: `skill-practice/src/components/progress/TopPracticedList.tsx`

**Step 1: Creare il file**

Contenuto completo:

```tsx
import Link from "next/link";
import { ListOrdered } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/progress/SectionHeader";
import type { TopPracticedSkill } from "@/lib/queries/progress";

type Props = { items: TopPracticedSkill[] };

export function TopPracticedList({ items }: Props) {
  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
      <SectionHeader
        icon={ListOrdered}
        title="I contenuti più praticati"
        right={<span className="text-xs text-muted-foreground">da sempre</span>}
      />
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.skillId}>
            <Link
              href={`/skill/${item.skillId}`}
              className="flex items-center justify-between gap-3 rounded-md px-3 py-2 hover:bg-muted/50"
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm">{item.skillName}</span>
                {item.skillNameItalian && (
                  <span className="truncate text-xs text-muted-foreground">
                    {item.skillNameItalian}
                  </span>
                )}
              </span>
              <Badge variant="secondary" className="shrink-0">
                {item.practiceDays} {item.practiceDays === 1 ? "giorno" : "giorni"}
              </Badge>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

**Step 2: Verifica disponibilità `Badge`**

Run: `ls skill-practice/src/components/ui/badge.tsx`
Expected: il file esiste (shadcn). Se manca, generare con `npx shadcn-ui@latest add badge` dentro `skill-practice/`.

**Step 3: Verifica build**

Run: `cd skill-practice && npm run build`
Expected: build passa. Il componente non è ancora referenziato altrove, ma il typecheck lo include.

**Step 4: Commit**

```bash
git add skill-practice/src/components/progress/TopPracticedList.tsx
git commit -m "feat(progress): TopPracticedList presentational component

Shell <section> + SectionHeader (coerente con le altre sezioni progress).
Nome tecnico primario, italiano secondario, link a /skill/{id}."
```

---

### Task 4: Server wrapper `TopPracticedSection`

**Files:**
- Create: `skill-practice/src/components/progress/sections/TopPracticedSection.tsx`

**Step 1: Creare il file**

Contenuto completo:

```tsx
import "server-only";
import { getTopPracticedSkills } from "@/lib/queries/progress";
import { TopPracticedList } from "@/components/progress/TopPracticedList";

export async function TopPracticedSection({ userId }: { userId: string }) {
  const items = await getTopPracticedSkills(userId, 5);
  if (items.length === 0) return null;
  return <TopPracticedList items={items} />;
}
```

**Step 2: Verifica build**

Run: `cd skill-practice && npm run build`
Expected: build passa.

**Step 3: Commit**

```bash
git add skill-practice/src/components/progress/sections/TopPracticedSection.tsx
git commit -m "feat(progress): TopPracticedSection server wrapper

Fetcha top 5 e ritorna null se nessun log (empty state implicito)."
```

---

### Task 5: Integrazione in `/progress` page

**Files:**
- Modify: `skill-practice/src/app/(app)/progress/page.tsx`

**Step 1: Aggiungere import**

Subito sotto `import { PracticeCalendarSection } from ...`, aggiungere:

```ts
import { TopPracticedSection } from "@/components/progress/sections/TopPracticedSection";
```

**Step 2: Aggiungere quarta `Suspense` block**

Dopo il blocco `<Suspense>` che renderizza `<PracticeCalendarSection />`, prima del `</div>` di chiusura, aggiungere:

```tsx
<Suspense fallback={<ProgressSectionSkeleton heightClass="h-56" />}>
  <TopPracticedSection userId={profile.id} />
</Suspense>
```

**Step 3: Verifica lint + build**

Run: `cd skill-practice && npm run lint && npm run build`
Expected: entrambi passano.

**Step 4: Commit**

```bash
git add skill-practice/src/app/(app)/progress/page.tsx
git commit -m "feat(progress): integra TopPracticedSection come quarta sezione

Ordine pagina: ciclo attivo → statistiche → calendario 90gg → top lifetime."
```

---

### Task 6: Applicazione migration + accettazione manuale

**Files:**
- Modify (state-only): `plan/current-plan.md` §11 stato

**Step 1: Avvisare l'utente e fornire SQL copia-incolla**

Messaggio all'utente con il contenuto di `0025_top_practiced_skills.sql` da incollare nel SQL Editor Supabase. Indicare:
- Aprire Supabase Dashboard → Project → SQL Editor → New query
- Incollare l'intero file
- Run
- Verifica: `select proname from pg_proc where proname = 'top_practiced_skills';` → 1 riga

**Step 2: Smoke test SQL**

L'utente esegue nel SQL Editor:

```sql
select * from top_practiced_skills(
  (select id from auth.users where email = 'letis87@gmail.com'),
  5
);
```

Expected: 0-5 righe. Se l'utente ha pratica registrata, le righe sono ordinate per `practice_days DESC`.

**Step 3: Accettazione UI (vera verifica RLS)**

L'utente:
- Avvia `cd skill-practice && npm run dev`
- Login con il proprio account
- Naviga su `/progress`
- Verifica:
  - Quarta sezione "I contenuti più praticati" presente (se ha log) o assente (se nessun log)
  - Top 5 ordinata per giorni decrescenti
  - Nome cinese primario, italiano sotto in muted (se presente)
  - Click su una riga → apre `/skill/{id}`
  - Mobile: nomi lunghi non rompono il layout

**Step 4: Aggiornare stato in `current-plan.md`**

Nella §11 (stato attuale), aggiungere una bullet alla data odierna:

```
- 2026-05-11: Sezione "I contenuti più praticati" in /progress (migration 0025).
  Top 5 per giorni distinti di pratica, lifetime.
```

**Step 5: Commit finale**

```bash
git add plan/current-plan.md
git commit -m "docs(plan): registra sezione top contenuti praticati in /progress

Migration 0025 applicata manualmente in Supabase, accettazione UI ok."
```

---

## Checklist finale

- [ ] `0025_top_practiced_skills.sql` creato e committato
- [ ] `getTopPracticedSkills` + tipi in `progress.ts`
- [ ] `TopPracticedList.tsx` creato
- [ ] `TopPracticedSection.tsx` creato
- [ ] `progress/page.tsx` integra la quarta `Suspense`
- [ ] `npm run lint && npm run build` passano
- [ ] Migration applicata nel SQL Editor (manuale)
- [ ] Smoke test SQL ok
- [ ] UI verificata da `/progress` dopo login
- [ ] `current-plan.md` §11 aggiornato
