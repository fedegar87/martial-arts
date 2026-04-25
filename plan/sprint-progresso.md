# Sprint 1.8 — Tab "Progresso"

**Status:** Implemented in code — richiede seed FESK e walkthrough reale
**Versione:** v1
**Ultimo aggiornamento:** 2026-04-25
**Sostituisce:** task #14 di Sprint 2 in `current-plan.md` (versione minimale "progresso settimanale + countdown esame")
**Dipende da:** `plan/sprint-curriculum-fesk.md` (schema 0003 + seed 0004 applicati, `lib/grades.ts`, `lib/labels.ts`, doppia disciplina)
**Compatibile con:** `plan/sprint-video-player.md` (1.6) — indipendente, ma se 1.6 è chiuso prima si riusa `VideoPlayer` (non strettamente necessario qui)

---

## 0. CONTESTO IN UNA FRASE

Aggiungere una **quarta tab "Progresso"** alla bottom navigation: una pagina singola scrollabile che mostra all'allievo, in cinque sezioni impilate, lo stato del suo percorso (esame in preparazione, pratica recente, copertura curriculum, bilanciamento competenze, posizione nel viaggio dei gradi). Niente librerie chart, niente gamification, niente analytics.

---

## 1. PROBLEMA E OBIETTIVO

### 1.1 Problema

Oggi l'allievo ha solo:
- "Oggi": cosa fare adesso
- "Libreria": cosa esiste
- "Profilo": chi sono

Manca la **vista d'insieme**: "a che punto sono?". Senza di essa l'allievo non sa se sta avanzando, dove ha buchi, quanto è coperto del curriculum FESK, quanto manca all'esame. Il rischio è che la pratica diventi meccanica e perda motivazione.

### 1.2 Obiettivo

- Fornire 5 viste motivanti e leggibili a colpo d'occhio
- Zero ansia: niente streak rotti, niente confronto con altri, niente analytics
- Visualizzazioni in **SVG puro** (nessuna libreria chart aggiunta)
- Pagina **scrollabile**, ogni sezione autonoma, niente sotto-rotte
- Server Components per tutti i fetch (zero hook client per query)

---

## 2. POSIZIONAMENTO RISPETTO AGLI ALTRI PIANI

### 2.1 Cosa cambia

| Area | Modifica |
|------|----------|
| Bottom navigation | Da 3 a **4 tab** (`Oggi`, `Libreria`, `Progresso`, `Profilo`) |
| Rotta nuova | `src/app/(app)/progress/page.tsx` |
| Componenti nuovi | 5 in `src/components/progress/` |
| Query nuove | `src/lib/queries/progress.ts` |

### 2.2 Cosa NON cambia

- Schema DB: **nessuna nuova tabella o colonna**. Si legge solo da `skills`, `exam_programs`, `exam_skill_requirements`, `user_profiles`, `user_plan_items`, `practice_logs` (già tutti in 0001 + 0003).
- RLS, auth, middleware/`proxy.ts`, server actions
- `practice-logic.ts`, `plan-manager.ts`
- PWA setup, security headers, deploy
- Le altre 3 tab (`Oggi`, `Libreria`, `Profilo`) restano identiche

### 2.3 Cosa va sistemato in altre pagine

Solo `src/app/(app)/layout.tsx` (la BottomNav), per aggiungere la quarta voce e ripartire lo spazio in modo equilibrato (4 tab da 25%).

---

## 3. DECISIONI CHIUSE

| # | Decisione | Risoluzione |
|---|-----------|-------------|
| **P1** | Toggle disciplina nei 3 componenti che lo prevedono (`CurriculumMap`, `CompetenceRadar`, `JourneyTimeline`) | **Client-side state** (`useState` nel componente client). Il Server Component genitore (`progress/page.tsx`) pre-fetcha i dati per **entrambe** le discipline (se l'utente le pratica entrambe) e li passa via prop. Lo switch è istantaneo, niente refetch. Niente URL search param: il deep-link a "progress?d=taichi" non aggiunge valore reale e complica il routing |
| **P2** | Disciplina di default mostrata nei toggle | La disciplina con `assigned_level` "più avanzato" tra le due (numero più basso). Tie → Shaolin. Se l'utente pratica solo una disciplina (`assigned_level_taichi == 0`) → toggle nascosto, mostra direttamente Shaolin |
| **P3** | Categorie radar | **Shaolin:** Forme, Tui Fa, Po Chi, Chin Na, Armi (somma di `armi_forma` + `armi_combattimento`). **T'ai Chi:** Forme (somma di `forme` + `chi_kung`), Tue Shou, Ta Lu, Chin Na, Armi (somma di `armi_forma` + `armi_combattimento`). Mapping in `lib/queries/progress.ts` come funzione pura testabile |
| **P4** | Definizione streak | Streak = numero di giorni consecutivi con `>=1` skill completata, terminando con **oggi** se oggi ha almeno una skill, altrimenti con **ieri** (così non si "rompe" alle 00:01 se l'utente non ha ancora praticato). Streak = 0 solo se nemmeno ieri ha praticato. Streak migliore = massimo storico tra tutti i giorni del log |
| **P5** | ExamProgress quando nessun esame in preparazione | **Sezione nascosta** (non rendering). Niente CTA "Scegli un esame" — quella vive nel profilo. Mantiene la pagina pulita e non ridondante |
| **P6** | Pesi di calcolo "in_plan" vs "consolidated" | Coerenti col prompt: ExamProgress usa **50/50**, CompetenceRadar usa **60/40** (più peso a "in piano" perché il radar deve premiare la copertura più della maturazione). Costanti chiamate `EXAM_WEIGHT_IN_PLAN` / `EXAM_WEIGHT_CONSOLIDATED` ecc. in `lib/queries/progress.ts` per renderle scoperte |
| **P7** | Skeleton per ogni sezione | Ogni sezione è dentro il proprio `<Suspense fallback={...}>` e ha uno skeleton specifico (cerchio per ExamProgress, griglia grigia per Calendar/Map, pentagono outline per Radar, lista lineare per Timeline). Permette streaming progressivo senza bloccare la pagina |
| **P8** | Animazioni | Solo CSS (`@keyframes` + `transition`), niente Framer Motion. Tre animazioni totali: ring fill (ExamProgress), radar scale-in (CompetenceRadar), pulse (nodo "current" di JourneyTimeline). Durata ≤400ms, `prefers-reduced-motion: reduce` le disabilita |
| **P9** | Niente nuove dipendenze | Confermato: tutto SVG `<svg>` + Tailwind. Nessun `recharts`, `chart.js`, `d3`, `nivo`, `framer-motion`. Solo `lucide-react` (già installato) per icone header sezione |
| **P10** | Performance CurriculumMap con 137 skill | 137 celle CSS grid, una `<a>` per cella verso `/skill/[id]`. Niente virtualizzazione: 137 nodi sono rapidi in qualunque mobile. Misurare in DevTools per conferma in §15 |
| **P11** | Tap su cella mappa | `<Link href="/skill/[id]">` Next.js. Niente onClick JS, naviga server-side. Le celle "locked" (skill oltre il livello) **non sono link** — solo `<div>` con `cursor-not-allowed`, aria-disabled |
| **P12** | Posizione tab "Progresso" in BottomNav | **Terza posizione** tra `Libreria` e `Profilo`: `[Oggi] [Libreria] [Progresso] [Profilo]`. Logica: "cosa pratico oggi → cosa esiste → a che punto sono → chi sono". Identità (`Profilo`) resta ultima a destra |
| **P13** | Header sezione | Ogni sezione ha `<h2>` con icona Lucide + titolo italiano + (se applicabile) toggle/badge a destra. Pattern: `<SectionHeader icon={Calendar} title="Pratica" right={…}>` come componente shared |

---

## 4. DECISIONI APERTE

| # | Decisione | Note | Priorità |
|---|-----------|------|----------|
| **P14** | Tooltip on tap su cella calendario / mappa | Ora previsto come "title HTML" nativo (mostrato hover desktop). Su mobile serve un piccolo popover custom? Decisione rimandata: prima vedere come reagisce l'allievo all'uso reale | 🟢 Dopo 30 giorni di uso |
| **P15** | Cache delle query (Next.js `unstable_cache` o `revalidate`) | Le query sono per-utente e hanno cardinalità bassa. Per ora niente cache: tutto fetch on-demand su Server Component. Riconsiderare se TTI > 1s | 🟢 Solo se metriche reali lo giustificano |
| **P16** | "Skill mancanti" in ExamProgress | Mostriamo lista di tutte le skill non in piano. Se sono >5, il blocco diventa lungo. Possibile collapse "Mostra tutte" oltre 5? Implementare semplice con `<details>` HTML nativo | 🟡 Includere già in v1, soluzione `<details>` |
| **P17** | Locale data formatting | `toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })`. Adeguato. Niente lib `date-fns` | 🟢 Confermato |

---

## 5. STRUTTURA NUOVA

### 5.1 File creati

```
skill-practice/
├── src/
│   ├── app/
│   │   └── (app)/
│   │       └── progress/
│   │           └── page.tsx                   # Server Component, composizione 5 sezioni
│   ├── components/
│   │   └── progress/
│   │       ├── ExamProgress.tsx               # Ring chart prossimo esame
│   │       ├── PracticeCalendar.tsx           # Contribution graph 90gg
│   │       ├── CurriculumMap.tsx              # Griglia skill per categoria (client)
│   │       ├── CompetenceRadar.tsx            # Spider chart 5 assi (client)
│   │       ├── JourneyTimeline.tsx            # Timeline verticale gradi (client)
│   │       ├── SectionHeader.tsx              # Header riusabile per le 5 sezioni
│   │       └── skeletons.tsx                  # Skeleton di ogni sezione
│   └── lib/
│       └── queries/
│           └── progress.ts                    # Tutte le query + funzioni pure di aggregazione
```

### 5.2 File modificati

```
skill-practice/
├── src/
│   └── app/
│       └── (app)/
│           └── layout.tsx                     # BottomNav: 3→4 tab
```

### 5.3 Convenzioni

- **Componenti server di default.** Solo `CurriculumMap`, `CompetenceRadar`, `JourneyTimeline` sono `"use client"` perché contengono toggle disciplina con stato locale.
- **`progress/page.tsx`** fa fetch parallelo (Promise.all) di tutte le query e passa i dati ai 5 componenti via prop. Niente fetch dentro i componenti.
- **`lib/queries/progress.ts`** esporta sia query asincrone (con Supabase server client) sia **funzioni pure di aggregazione** (es. `aggregateByCategory`, `computeExamProgress`) — testabili in isolamento, niente DB.
- **Niente hook custom:** lo stato locale dei toggle è gestito con `useState` direttamente nel componente.

---

## 6. SPECIFICA SEZIONE 1 — ExamProgress

### 6.1 File: `src/components/progress/ExamProgress.tsx`

Server Component (presentazionale puro, riceve `data`).

### 6.2 Visibilità

Render solo se `user_profiles.preparing_exam_id IS NOT NULL`. Altrimenti il componente ritorna `null` e la sezione non occupa spazio (decisione P5).

### 6.3 Struttura visiva

```
┌─────────────────────────────────┐
│  📝 Prossimo esame              │
│  5° Chi Shaolin                 │
│                                 │
│         ┌─────────┐             │
│        ╱    75%    ╲            │
│       │             │           │
│        ╲           ╱            │
│         └─────────┘             │
│                                 │
│  6 / 8 skill in piano           │
│  4 skill in ripasso o superiore │
│  2 skill ancora in focus        │
│                                 │
│  Skill mancanti:                │
│  · Tui Fa 5° — non nel piano    │
│  · Tui Fa 6° — non nel piano    │
│                                 │
│  Esame: 1° → 5° Chi             │
└─────────────────────────────────┘
```

> Nota: il countdown "esame tra X giorni" del prompt sorgente richiede una data esame. Lo schema **non** ha colonne per la data dell'esame e questo sprint non aggiunge schema (vedi §2.2). Quindi: **niente countdown** in questa versione. La voce "Esame: 1° → 5° Chi" usa `grade_from`/`grade_to` di `exam_programs`. Countdown rinviato a quando si modellerà una data esame in profilo (decisione futura non in questo sprint).

### 6.4 Ring SVG

```svg
<svg viewBox="0 0 100 100" class="-rotate-90">
  <circle cx="50" cy="50" r="45" stroke="hsl(var(--muted))" stroke-width="8" fill="none" />
  <circle
    cx="50" cy="50" r="45"
    stroke="hsl(var(--primary))" stroke-width="8" fill="none"
    stroke-linecap="round"
    stroke-dasharray={2 * Math.PI * 45}
    stroke-dashoffset={2 * Math.PI * 45 * (1 - percent / 100)}
    class="transition-[stroke-dashoffset] duration-700 ease-out"
  />
</svg>
```

Centro del ring (HTML, non SVG): `<div class="text-3xl font-bold">75%</div>` posizionato con `position: absolute` o usando un wrapper `relative`.

### 6.5 Calcolo (`lib/queries/progress.ts`)

```typescript
export async function getExamProgressData(userId: string, examId: string) {
  // Query 1: requirements esame
  const requirements = await supabase
    .from('exam_skill_requirements')
    .select('skill_id, default_status, skills(id, name, name_italian, minimum_grade_value)')
    .eq('exam_id', examId)

  // Query 2: piano utente
  const plan = await supabase
    .from('user_plan_items')
    .select('skill_id, status, is_hidden')
    .eq('user_id', userId)
    .eq('is_hidden', false)

  return computeExamProgress(requirements.data, plan.data)
}

// Funzione pura testabile
export function computeExamProgress(
  requirements: ExamRequirement[],
  plan: UserPlanItem[]
) {
  const total = requirements.length
  const planSkillIds = new Set(plan.map(p => p.skill_id))
  const inPlan = requirements.filter(r => planSkillIds.has(r.skill_id))
  const consolidated = inPlan.filter(r => {
    const item = plan.find(p => p.skill_id === r.skill_id)!
    return item.status === 'review' || item.status === 'maintenance'
  })
  const stillFocus = inPlan.length - consolidated.length
  const missing = requirements.filter(r => !planSkillIds.has(r.skill_id))

  const percent = Math.round(
    (inPlan.length / total) * EXAM_WEIGHT_IN_PLAN +
    (consolidated.length / total) * EXAM_WEIGHT_CONSOLIDATED
  )

  return { total, inPlanCount: inPlan.length, consolidatedCount: consolidated.length, stillFocus, missing, percent }
}

export const EXAM_WEIGHT_IN_PLAN = 50
export const EXAM_WEIGHT_CONSOLIDATED = 50
```

### 6.6 Lista "skill mancanti"

Se `missing.length <= 5`: lista piena.
Se `missing.length > 5`: usa `<details>` HTML nativo (zero JS, accessibile):

```tsx
<details>
  <summary className="cursor-pointer">{missing.length} skill mancanti</summary>
  <ul>{missing.map(...)}</ul>
</details>
```

---

## 7. SPECIFICA SEZIONE 2 — PracticeCalendar

### 7.1 File: `src/components/progress/PracticeCalendar.tsx`

Server Component.

### 7.2 Struttura visiva

Griglia tipo GitHub contribution. **90 giorni** in colonne settimanali (7 righe = giorni della settimana, ~13 colonne). Mese label sopra le colonne quando inizia un nuovo mese.

```
┌─────────────────────────────────┐
│  📅 Pratica                     │
│                                 │
│  Feb       Mar      Apr         │
│  ░░░░█░░ ░░██░░░ ░█░██░█        │
│  ░░░░░░░ ░░░█░░░ ░░░█░░░        │
│  ░░█░░░░ ░░░░█░░ ░█░░░██        │
│  ░░░░░░░ ░░░░░░░ ░░░░█░░        │
│  ...7 righe...                  │
│                                 │
│  Streak attuale: 3 giorni       │
│  Streak migliore: 12 giorni     │
│  Giorni totali praticati: 34    │
│                                 │
│  Legenda: ░ ▒ ▓ █               │
└─────────────────────────────────┘
```

### 7.3 Logica

```typescript
export async function getPracticeHistory(userId: string, days = 90) {
  const start = subDays(new Date(), days - 1)
  const { data } = await supabase
    .from('practice_logs')
    .select('date, skill_id')
    .eq('user_id', userId)
    .eq('completed', true)
    .gte('date', start.toISOString().slice(0, 10))

  return aggregatePracticeHistory(data, start, days)
}

// Funzione pura
export function aggregatePracticeHistory(
  logs: { date: string; skill_id: string }[],
  start: Date,
  days: number
) {
  // Conta DISTINCT skill per date
  const byDate = new Map<string, Set<string>>()
  for (const l of logs) {
    if (!byDate.has(l.date)) byDate.set(l.date, new Set())
    byDate.get(l.date)!.add(l.skill_id)
  }

  // Costruisci array di N giorni, in ordine cronologico
  const cells = Array.from({ length: days }, (_, i) => {
    const d = addDays(start, i)
    const key = d.toISOString().slice(0, 10)
    const count = byDate.get(key)?.size ?? 0
    return { date: key, skillCount: count, level: bucketLevel(count) }
  })

  return {
    cells,
    currentStreak: computeCurrentStreak(cells),
    bestStreak: computeBestStreak(cells),
    totalDays: cells.filter(c => c.skillCount > 0).length,
  }
}

function bucketLevel(count: number): 0 | 1 | 2 | 3 {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 4) return 2
  return 3
}
```

`computeCurrentStreak`: scorre dalla fine; se ultima cella ha `skillCount > 0` partendo da oggi, oppure parte da ieri (decisione P4); conta consecutivi.
`computeBestStreak`: scorre tutte le celle, traccia run massimo.

### 7.4 Colori (dark theme, varianti del primary `--primary: 0 65% 45%`)

```typescript
const LEVEL_COLOR = [
  'hsl(0, 0%, 12%)',   // 0: bg-muted-darker
  'hsl(0, 65%, 25%)',  // 1: primary -50%
  'hsl(0, 65%, 35%)',  // 2: primary -25%
  'hsl(0, 65%, 45%)',  // 3: primary
]
```

### 7.5 Markup griglia

```tsx
<div className="grid grid-flow-col grid-rows-7 gap-1">
  {cells.map(c => (
    <div
      key={c.date}
      title={`${formatItalianDate(c.date)} — ${c.skillCount} skill praticate`}
      className="h-3 w-3 rounded-sm"
      style={{ backgroundColor: LEVEL_COLOR[c.level] }}
    />
  ))}
</div>
```

`title` è il tooltip nativo HTML (decisione P14: niente popover custom in v1).

---

## 8. SPECIFICA SEZIONE 3 — CurriculumMap

### 8.1 File: `src/components/progress/CurriculumMap.tsx`

**Client Component** (toggle disciplina).

### 8.2 Struttura visiva

```
┌─────────────────────────────────┐
│  🗺 Mappa curriculum            │
│                                 │
│  [ Shaolin ]  [ T'ai Chi ]      │
│                                 │
│  Forme                          │
│  🟩🟩🟨🟨🟥⬜⬜⬜⬜⬜⬜⬜       │
│  ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛           │
│                                 │
│  Tui Fa                         │
│  🟩🟩🟩🟩🟨🟨🟥🟥⬜⬜⬜⬜⬜⬜⬜  │
│                                 │
│  ...una sezione per categoria...│
│                                 │
│  ──────────────────────         │
│  🟩 Mantenimento  🟨 Ripasso    │
│  🟥 Focus         ⬜ Non iniziata│
│  ⬛ Non accessibile (livello)   │
│                                 │
│  Shaolin: 15 / 48 accessibili   │
│  (8 mantenimento, 4 ripasso, 3 focus) │
└─────────────────────────────────┘
```

### 8.3 Logica `getCurriculumMapData` (Server, in `progress.ts`)

```typescript
export async function getCurriculumMapData(userId: string) {
  const profile = await getUserProfile(userId)
  const skills = await supabase.from('skills').select('*').order('order')
  const plan = await supabase
    .from('user_plan_items')
    .select('skill_id, status')
    .eq('user_id', userId)
    .eq('is_hidden', false)

  return {
    shaolin: buildMap(skills.data.filter(s => s.discipline === 'shaolin'), plan.data, profile.assigned_level_shaolin),
    taichi: profile.assigned_level_taichi > 0
      ? buildMap(skills.data.filter(s => s.discipline === 'taichi'), plan.data, profile.assigned_level_taichi)
      : null,
  }
}

// Pura
export function buildMap(skills: Skill[], plan: UserPlanItem[], userLevel: number) {
  const planById = new Map(plan.map(p => [p.skill_id, p]))
  const byCategory = groupBy(skills, s => s.category)

  return Object.entries(byCategory).map(([category, list]) => ({
    category,
    skills: list.map(s => ({
      id: s.id,
      name: s.name_italian ?? s.name,
      status: classifySkillStatus(s, planById.get(s.id), userLevel),
    })),
  }))
}

export function classifySkillStatus(
  s: Skill,
  planItem: UserPlanItem | undefined,
  userLevel: number
): 'locked' | 'not_started' | 'focus' | 'review' | 'maintenance' {
  // Convenzione FESK: numero più alto = grado più basso
  // skill di prerequisito superiore al livello allievo → locked
  if (s.minimum_grade_value < userLevel) return 'locked'
  if (!planItem) return 'not_started'
  return planItem.status
}
```

### 8.4 Colori cella

```typescript
const STATUS_COLOR = {
  maintenance:  'hsl(140, 60%, 40%)',  // verde
  review:       'hsl(45, 90%, 55%)',   // giallo/ambra (matcha --accent)
  focus:        'hsl(0, 65%, 50%)',    // rosso primary
  not_started:  'hsl(0, 0%, 25%)',     // grigio
  locked:       'hsl(0, 0%, 12%)',     // grigio scuro quasi invisibile
}
```

### 8.5 Markup griglia per categoria

```tsx
<section>
  <h3 className="text-sm font-medium text-muted-foreground mb-1">{categoryLabel(category)}</h3>
  <div className="grid grid-cols-[repeat(auto-fill,minmax(20px,1fr))] gap-1">
    {skills.map(s => s.status === 'locked' ? (
      <div
        key={s.id}
        aria-disabled
        title={`${s.name} — non accessibile al tuo livello`}
        className="h-4 w-4 rounded-sm cursor-not-allowed opacity-50"
        style={{ backgroundColor: STATUS_COLOR.locked }}
      />
    ) : (
      <Link
        key={s.id}
        href={`/skill/${s.id}`}
        title={`${s.name} — ${statusLabel(s.status)}`}
        className="h-4 w-4 rounded-sm hover:ring-2 hover:ring-foreground/40"
        style={{ backgroundColor: STATUS_COLOR[s.status] }}
        aria-label={`${s.name}, stato: ${statusLabel(s.status)}`}
      />
    ))}
  </div>
</section>
```

> Touch target: la cella è 16×16 (20×20 con gap), MA il `<Link>` è cliccabile in tutta l'area incluso il padding. Per arrivare a 48px reali si può aggiungere `padding: 16px` invisibile, ma su griglia densa rovina il layout. **Soluzione adottata:** cella 20×20 visibile, link gestito senza padding. Per accessibilità touch confidare che gli utenti tappino con precisione (è una mappa visuale, non un tasto principale). In alternativa, passare alla skill detail anche con tap multiplo via `<a>` nativo basta a non perdere l'utente: se tappa un vicino, va comunque a una skill, non in un vicolo cieco. Decisione: **accettato come compromesso**, rivalutare dopo uso reale.

### 8.6 Toggle disciplina

`<button>` con due opzioni. Se `data.taichi === null`, il toggle è **nascosto** e si mostra direttamente `data.shaolin`.

### 8.7 Statistiche sotto la mappa

```typescript
function buildStats(map: MapData) {
  const accessible = map.flatMap(c => c.skills).filter(s => s.status !== 'locked')
  const inPlan = accessible.filter(s => s.status !== 'not_started')
  const byStatus = countBy(inPlan, s => s.status)
  return {
    accessibleTotal: accessible.length,
    inPlanCount: inPlan.length,
    maintenance: byStatus.maintenance ?? 0,
    review: byStatus.review ?? 0,
    focus: byStatus.focus ?? 0,
  }
}
```

---

## 9. SPECIFICA SEZIONE 4 — CompetenceRadar

### 9.1 File: `src/components/progress/CompetenceRadar.tsx`

**Client Component**.

### 9.2 Struttura visiva

```
┌─────────────────────────────────┐
│  🎯 Competenze                  │
│                                 │
│  [ Shaolin ]  [ T'ai Chi ]      │
│                                 │
│          Forme                  │
│           /\                    │
│          /  \                   │
│    Armi /    \ Tui Fa           │
│         \    /                  │
│          \  /                   │
│    Chin Na  Po Chi              │
│                                 │
│  Forme:    ████████░░ 80%       │
│  Tui Fa:   ██████░░░░ 60%       │
│  Po Chi:   ███░░░░░░░ 30%       │
│  Chin Na:  ░░░░░░░░░░  0%       │
│  Armi:     ██░░░░░░░░ 20%       │
└─────────────────────────────────┘
```

### 9.3 Categorie radar (decisione P3)

```typescript
const RADAR_AXES_SHAOLIN = [
  { key: 'forme',  label: 'Forme',   includes: ['forme'] },
  { key: 'tui_fa', label: 'Tui Fa',  includes: ['tui_fa'] },
  { key: 'po_chi', label: 'Po Chi',  includes: ['po_chi'] },
  { key: 'chin_na',label: 'Chin Na', includes: ['chin_na'] },
  { key: 'armi',   label: 'Armi',    includes: ['armi_forma', 'armi_combattimento'] },
]

const RADAR_AXES_TAICHI = [
  { key: 'forme',   label: 'Forme',    includes: ['forme', 'chi_kung'] },
  { key: 'tue_shou',label: 'Tue Shou', includes: ['tue_shou'] },
  { key: 'ta_lu',   label: 'Ta Lu',    includes: ['ta_lu'] },
  { key: 'chin_na', label: 'Chin Na',  includes: ['chin_na'] },
  { key: 'armi',    label: 'Armi',     includes: ['armi_forma', 'armi_combattimento'] },
]
```

### 9.4 Logica

```typescript
export function getCategoryProgress(
  skills: Skill[],
  plan: UserPlanItem[],
  userLevel: number,
  axes: RadarAxis[],
  discipline: Discipline
) {
  const accessible = skills.filter(s =>
    s.discipline === discipline &&
    s.minimum_grade_value >= userLevel
  )
  const planById = new Map(plan.map(p => [p.skill_id, p]))

  return axes.map(axis => {
    const inAxis = accessible.filter(s => axis.includes.includes(s.category))
    const total = inAxis.length
    if (total === 0) return { key: axis.key, label: axis.label, percent: 0 }
    const inPlan = inAxis.filter(s => planById.has(s.id))
    const consolidated = inPlan.filter(s => {
      const i = planById.get(s.id)!
      return i.status === 'review' || i.status === 'maintenance'
    })
    const percent = Math.round(
      (inPlan.length / total) * RADAR_WEIGHT_IN_PLAN +
      (consolidated.length / total) * RADAR_WEIGHT_CONSOLIDATED
    )
    return { key: axis.key, label: axis.label, percent }
  })
}

export const RADAR_WEIGHT_IN_PLAN = 60
export const RADAR_WEIGHT_CONSOLIDATED = 40
```

### 9.5 Markup SVG (pentagono regolare)

```tsx
const CENTER = 100
const RADIUS = 80
const ANGLES = [-90, -18, 54, 126, 198].map(deg => deg * Math.PI / 180)

function pointAt(percent: number, idx: number) {
  const r = RADIUS * (percent / 100)
  return {
    x: CENTER + r * Math.cos(ANGLES[idx]),
    y: CENTER + r * Math.sin(ANGLES[idx]),
  }
}

const polygonPoints = data.map((d, i) => pointAt(d.percent, i))
  .map(p => `${p.x},${p.y}`).join(' ')

// Outline a 100% (riferimento)
const outlinePoints = data.map((_, i) => pointAt(100, i))
  .map(p => `${p.x},${p.y}`).join(' ')
```

```tsx
<svg viewBox="0 0 200 200" className="w-full max-w-[280px] mx-auto">
  {/* Anelli concentrici 25/50/75/100 */}
  {[25, 50, 75, 100].map(level => (
    <polygon
      key={level}
      points={data.map((_, i) => pointAt(level, i)).map(p => `${p.x},${p.y}`).join(' ')}
      fill="none"
      stroke="hsl(var(--border))"
      strokeWidth="0.5"
    />
  ))}
  {/* Assi */}
  {ANGLES.map((a, i) => (
    <line
      key={i}
      x1={CENTER} y1={CENTER}
      x2={CENTER + RADIUS * Math.cos(a)}
      y2={CENTER + RADIUS * Math.sin(a)}
      stroke="hsl(var(--border))"
      strokeWidth="0.5"
    />
  ))}
  {/* Poligono dati */}
  <polygon
    points={polygonPoints}
    fill="hsl(var(--primary) / 0.3)"
    stroke="hsl(var(--primary))"
    strokeWidth="2"
    className="origin-center scale-0 animate-radar-in"
  />
  {/* Label assi */}
  {data.map((d, i) => {
    const p = pointAt(115, i)
    return (
      <text
        key={d.key} x={p.x} y={p.y}
        textAnchor="middle" dominantBaseline="middle"
        className="fill-muted-foreground text-xs"
      >
        {d.label}
      </text>
    )
  })}
</svg>
```

Animazione (CSS):

```css
@keyframes radar-in {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.animate-radar-in {
  animation: radar-in 400ms ease-out forwards;
}
@media (prefers-reduced-motion: reduce) {
  .animate-radar-in { animation: none; transform: scale(1); opacity: 1; }
}
```

### 9.6 Barre orizzontali sotto

Per chi preferisce leggere percentuali:

```tsx
{data.map(d => (
  <div key={d.key} className="flex items-center gap-2 text-sm">
    <span className="w-20 text-muted-foreground">{d.label}</span>
    <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
      <div className="h-full bg-primary transition-[width] duration-500" style={{ width: `${d.percent}%` }} />
    </div>
    <span className="w-10 text-right tabular-nums">{d.percent}%</span>
  </div>
))}
```

---

## 10. SPECIFICA SEZIONE 5 — JourneyTimeline

### 10.1 File: `src/components/progress/JourneyTimeline.tsx`

**Client Component**.

### 10.2 Struttura visiva

Linea verticale con i gradi dal più avanzato (alto, gradi negativi alti) al principiante (basso, 8° Chi). Nodo "current" pulsa.

```
┌─────────────────────────────────┐
│  🛤 Il tuo percorso Shaolin     │
│                                 │
│  [ Shaolin ]  [ T'ai Chi ]      │
│                                 │
│  2° Mezza Luna  ○               │
│  1° Mezza Luna  ○               │
│  5° Chieh       ○               │
│  4° Chieh       ○               │
│  3° Chieh       ○               │
│  2° Chieh       ○               │
│  1° Chieh       ○   ← 28 skill  │
│  ──── cintura nera ────         │
│  1° Chi         ○   ← 22 skill  │
│  2° Chi         ○   ← 16 skill  │
│  3° Chi         ○   ← 12 skill  │
│  4° Chi         ●   ← TU SEI QUI│
│                 │   8/10 skill  │
│  5° Chi         ●●  ← 8 skill   │
│  6° Chi         ●●  ← 6 skill   │
│  7° Chi         ●●  ← 4 skill   │
│  8° Chi         ●●  ← inizio    │
│                                 │
│  ●● completato  ● attuale       │
│  ○  futuro                      │
└─────────────────────────────────┘
```

### 10.3 Logica

```typescript
export async function getJourneyData(userId: string, discipline: Discipline) {
  const skills = await supabase.from('skills')
    .select('id, minimum_grade_value, discipline')
    .eq('discipline', discipline)
  const profile = await getUserProfile(userId)
  const userLevel = discipline === 'shaolin'
    ? profile.assigned_level_shaolin
    : profile.assigned_level_taichi

  const grades = discipline === 'shaolin' ? SHAOLIN_GRADES : TAICHI_GRADES.filter(g => g.value !== 0)

  const skillsByGrade = groupBy(skills.data, s => s.minimum_grade_value)

  return grades.map(g => ({
    gradeValue: g.value,
    gradeLabel: g.label,
    status: classifyGrade(g.value, userLevel),
    skillCount: skillsByGrade[g.value]?.length ?? 0,
  }))
}

export function classifyGrade(gradeValue: number, userLevel: number): 'completed' | 'current' | 'future' {
  // Convenzione FESK: numero più alto = principiante, numero più basso = avanzato
  // Allievo a "userLevel". Gradi con value > userLevel sono già stati superati (più principianti).
  // Gradi con value === userLevel sono il grado in cui si trova ora.
  // Gradi con value < userLevel sono futuri (più avanzati).
  if (gradeValue > userLevel) return 'completed'
  if (gradeValue === userLevel) return 'current'
  return 'future'
}
```

### 10.4 Markup

```tsx
<ol className="space-y-3">
  {journey.toReversed().map((g, idx, arr) => (   // Ordine: dall'alto (avanzato, value più basso) al basso (principiante)
    <li key={g.gradeValue} className="flex items-center gap-3">
      <Node status={g.status} />
      <span className="flex-1">{g.gradeLabel}</span>
      <span className="text-sm text-muted-foreground tabular-nums">
        {g.skillCount > 0 ? `${g.skillCount} skill` : ''}
      </span>
      {/* Separatore "cintura nera" tra Chieh e Chi */}
      {g.gradeValue === -1 && idx < arr.length - 1 && (
        <hr className="border-t border-foreground/40 col-span-full my-2" />
      )}
    </li>
  ))}
</ol>
```

`Node`:
- `completed`: cerchio pieno `bg-primary`
- `current`: cerchio bordato + animazione pulse
- `future`: cerchio outline grigio

```css
@keyframes node-pulse {
  0%, 100% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0.5); }
  50% { box-shadow: 0 0 0 8px hsl(var(--primary) / 0); }
}
.node-current {
  animation: node-pulse 2s infinite;
}
@media (prefers-reduced-motion: reduce) {
  .node-current { animation: none; }
}
```

### 10.5 Linea di connessione

Linea verticale `<span className="w-px h-full bg-border" />` posizionata absolutely tra i nodi, oppure usando un `border-l` sul container. Stile a piacere ma deve essere sottile e neutra.

---

## 11. PAGINA PROGRESS — composizione

### 11.1 File: `src/app/(app)/progress/page.tsx`

```tsx
import { Suspense } from 'react'
import { getCurrentUserOrRedirect } from '@/lib/supabase/server'
import {
  getExamProgressData,
  getPracticeHistory,
  getCurriculumMapData,
  getCompetenceRadarData,
  getJourneyDataBoth,
  getUserProfile,
} from '@/lib/queries/progress'
import { ExamProgress } from '@/components/progress/ExamProgress'
import { PracticeCalendar } from '@/components/progress/PracticeCalendar'
import { CurriculumMap } from '@/components/progress/CurriculumMap'
import { CompetenceRadar } from '@/components/progress/CompetenceRadar'
import { JourneyTimeline } from '@/components/progress/JourneyTimeline'
import * as Skeletons from '@/components/progress/skeletons'

export default async function ProgressPage() {
  const user = await getCurrentUserOrRedirect()
  const profile = await getUserProfile(user.id)

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-4 pb-24 pt-6">
      <h1 className="text-2xl font-bold">Progresso</h1>

      <Suspense fallback={<Skeletons.ExamProgress />}>
        {profile.preparing_exam_id && (
          <ExamProgressSection userId={user.id} examId={profile.preparing_exam_id} />
        )}
      </Suspense>

      <Suspense fallback={<Skeletons.Calendar />}>
        <PracticeCalendarSection userId={user.id} />
      </Suspense>

      <Suspense fallback={<Skeletons.Map />}>
        <CurriculumMapSection userId={user.id} />
      </Suspense>

      <Suspense fallback={<Skeletons.Radar />}>
        <CompetenceRadarSection userId={user.id} />
      </Suspense>

      <Suspense fallback={<Skeletons.Timeline />}>
        <JourneyTimelineSection userId={user.id} />
      </Suspense>
    </main>
  )
}

async function ExamProgressSection({ userId, examId }: { userId: string; examId: string }) {
  const data = await getExamProgressData(userId, examId)
  return <ExamProgress data={data} />
}
// ...analoghi per le altre sezioni
```

### 11.2 BottomNav aggiornata

In `src/app/(app)/layout.tsx` la voce `Progress` va inserita tra `Library` e `Profile`:

```tsx
const TABS = [
  { href: '/today',    label: 'Oggi',      icon: Home },
  { href: '/library',  label: 'Libreria',  icon: Library },
  { href: '/progress', label: 'Progresso', icon: BarChart3 },  // NEW
  { href: '/profile',  label: 'Profilo',   icon: User },
]
```

Layout: `grid grid-cols-4` invece di `grid-cols-3`.

---

## 12. DESIGN

- Dark theme, coerente con il resto
- Stati skill colori (consistenti in tutta l'app):
  - Focus: `hsl(0, 65%, 50%)` (rosso primary)
  - Ripasso: `hsl(45, 90%, 55%)` (giallo/ambra)
  - Mantenimento: `hsl(140, 60%, 40%)` (verde)
  - Non iniziata: `hsl(0, 0%, 25%)` (grigio chiaro)
  - Locked: `hsl(0, 0%, 12%)` (grigio scuro quasi invisibile)
- Tutti i grafici **SVG puro**
- Animazioni: ring fill (700ms), radar scale-in (400ms), node-pulse (2s loop). `prefers-reduced-motion` le disabilita
- Touch target ≥ 48px solo dove sensato (toggle, link sezione). Per CurriculumMap il compromesso è esplicitato in §8.5
- Skeleton sezione per sezione (§7 file `skeletons.tsx`)

---

## 13. COSA NON FARE

| Cosa | Perché NO |
|------|-----------|
| Librerie chart (Recharts/Chart.js/d3/nivo) | SVG puro basta, niente bundle inutile |
| Framer Motion / lottie | CSS animations sono sufficienti |
| Gamification (badge, achievement, punti, livelli XP) | Fuori scope, distrae |
| Confronto con altri allievi (leaderboard) | Single-user MVP, fuori scope |
| Notifiche tipo "hai rotto lo streak" | Ansia inutile |
| Statistiche su tempo di pratica | Non lo tracciamo, l'allievo segna solo "fatto" |
| Medie / mediane / deviazioni | Non è un dashboard analytics |
| Export dati / PDF report | Non serve per MVP |
| Countdown esame con data esatta | Schema non ha colonna data esame; non si modifica schema in questo sprint |
| Filtri data custom (range arbitrario) | Calendario è 90gg fissi |
| Heatmap esame futuro / proiezioni | YAGNI |

---

## 14. TASK ATOMICI

| # | Task | Deliverable | Tipo agent | Acceptance criteria |
|---|------|-------------|------------|---------------------|
| 1 | Query layer | `src/lib/queries/progress.ts` con tutte le query Supabase + le funzioni pure di aggregazione (`computeExamProgress`, `aggregatePracticeHistory`, `buildMap`, `classifySkillStatus`, `getCategoryProgress`, `classifyGrade`, ecc.) | general-purpose | Tipi corretti rispetto a §5.6 di FESK; `npm run build` passa; almeno un test unitario per `classifySkillStatus`, `classifyGrade`, `computeExamProgress` |
| 2 | Skeletons | `src/components/progress/skeletons.tsx` con 5 skeleton specifici | general-purpose | 5 export `<ExamProgress />`, `<Calendar />`, `<Map />`, `<Radar />`, `<Timeline />` — solo div animati `animate-pulse` |
| 3 | SectionHeader | `src/components/progress/SectionHeader.tsx` riusabile (icon + title + opzionale right slot) | general-purpose | Accetta `icon: LucideIcon`, `title: string`, `right?: ReactNode`. Render `<h2>` semantico |
| 4 | ExamProgress component | `src/components/progress/ExamProgress.tsx` (Server Component) | frontend-design | Render condizionale (sezione assente se nessun esame); ring SVG con animazione fill 700ms; lista "skill mancanti" usa `<details>` se >5 |
| 5 | PracticeCalendar component | `src/components/progress/PracticeCalendar.tsx` (Server Component) | frontend-design | Griglia 7×N celle responsive; tooltip nativo su hover; legenda 4 livelli; statistiche streak attuale/migliore/giorni totali |
| 6 | CurriculumMap component | `src/components/progress/CurriculumMap.tsx` (Client Component) | frontend-design | Toggle disciplina (nascosto se solo Shaolin praticato); celle linkate via `<Link>` Next.js (eccetto locked); statistiche per disciplina sotto la mappa; legenda |
| 7 | CompetenceRadar component | `src/components/progress/CompetenceRadar.tsx` (Client Component) | frontend-design | SVG pentagono con anelli 25/50/75/100; poligono dati con `fill: primary/30%`, animazione scale-in 400ms; barre orizzontali con percentuali sotto |
| 8 | JourneyTimeline component | `src/components/progress/JourneyTimeline.tsx` (Client Component) | frontend-design | Lista verticale ordinata (avanzato in alto, principiante in basso); separatore "cintura nera" tra `1° Chieh` e `1° Chi`; nodo current con animazione pulse |
| 9 | Pagina `/progress` | `src/app/(app)/progress/page.tsx` con composizione + 5 Suspense | general-purpose | Server Component; ogni sezione ha proprio Suspense con skeleton; `Promise.all` non necessario perché Suspense streama in parallelo |
| 10 | BottomNav 4 tab | Aggiornare `src/app/(app)/layout.tsx` | frontend-design | `grid-cols-4`; tab `Progresso` tra `Libreria` e `Profilo`; icona `BarChart3` di Lucide; active state corretto |
| 11 | Verifica end-to-end | Walk-through manuale | general-purpose | Vedi §15 |

### 14.1 Dipendenze critiche

- 4-8 dipendono da 1, 2, 3
- 9 dipende da 4-8
- 10 indipendente, ma deve essere in piedi prima del walk-through
- 11 dipende da tutti

---

## 15. ACCEPTANCE CRITERIA (walk-through manuale, task 11)

1. Login → bottom nav mostra **4 tab**, ordine `Oggi / Libreria / Progresso / Profilo`. Active state si aggiorna spostandosi
2. Apertura `/progress`: in <1s appare l'header "Progresso" + skeleton di tutte le 5 sezioni; le sezioni si popolano progressivamente
3. **ExamProgress:**
   - Se l'utente ha `preparing_exam_id`, sezione visibile col ring chart che si riempie animato dallo 0% al valore reale
   - Se non ce l'ha, sezione **assente** (no titolo, no spazio bianco)
   - Lista skill mancanti corretta (skill nell'esame ma non in piano)
4. **PracticeCalendar:**
   - 7×N celle, copre 90 giorni
   - Streak attuale = giorni consecutivi con almeno 1 skill, dalla fine del periodo (vedi P4)
   - Tooltip al passaggio mouse: data IT + numero skill
5. **CurriculumMap:**
   - Tutte le 137 skill rese se utente ha entrambe le discipline; ~95 se solo Shaolin (8° Chi)
   - Toggle Shaolin/T'ai Chi switcha senza ricaricare la pagina
   - Tap su una cella non-locked → naviga a `/skill/[id]`
   - Cella locked: cursor `not-allowed`, niente navigazione
   - Conteggi sotto la mappa coincidono con il colore delle celle
6. **CompetenceRadar:**
   - Pentagono con 5 etichette (Forme, Tui Fa, Po Chi, Chin Na, Armi per Shaolin)
   - Animazione scale-in al primo render
   - Barre orizzontali coincidono coi vertici del poligono
7. **JourneyTimeline:**
   - Shaolin: 15 gradi (8° Chi → 2° Mezza Luna), separatore "cintura nera" tra 1° Chieh e 1° Chi
   - T'ai Chi: 12 gradi (5° Chi → 2° Mezza Luna), nessun separatore (T'ai Chi non ha cintura nera nel programma FESK come da seed)
   - Nodo "current" pulsa
   - Numero skill per grado coincide con `count(*) FROM skills WHERE discipline=? AND minimum_grade_value=?`
8. `prefers-reduced-motion: reduce` su DevTools → animazioni disabilitate
9. `npm run lint` e `npm run build` passano senza warning
10. `grep -r "recharts\|chart.js\|d3\|framer-motion" skill-practice/package.json` → 0 risultati
11. DevTools Network: navigare a `/progress` non scarica librerie aggiuntive oltre lo standard Next.js

---

## 16. RISCHI E MITIGAZIONI

| Rischio | Mitigazione |
|---------|-------------|
| Sprint 1.5 FESK non chiuso → schema vecchio (`assigned_level`, niente `discipline`) | Bloccante. Lo sprint 1.8 deve aspettare. Verificare colonna `discipline` su `skills` prima di iniziare task 1 |
| Performance pagina con 137 skill in CurriculumMap | Misurare con DevTools Performance: TTI atteso <1.5s. Se >2s su mobile mid-tier, valutare paginazione per categoria con `<details>` collassabile |
| `getCurrentStreak`/`getBestStreak` su 90 giorni hanno bug off-by-one | Test unitari espliciti (task 1) con casi: vuoto, oggi-only, ieri-only, gap singolo, run lungo. Test minimi 5 |
| Convenzione gradi confusa (numero alto = principiante) inverte la logica | Centralizzare in `classifySkillStatus` e `classifyGrade` (entrambe pure, testate). Niente confronti grezzi dispersi nei componenti |
| Toggle disciplina rompe ordering quando utente pratica solo T'ai Chi | `getCurriculumMapData` ritorna `taichi: null` se `assigned_level_taichi === 0`; il client component nasconde il toggle e mostra solo Shaolin. Test esplicito di questo caso |
| Skeleton screens lampeggiano su rete veloce (FOIT) | Suspense streama solo quando il fetch è lento; su Vercel local dev la pagina può apparire senza skeleton. Non è un bug |
| BottomNav `grid-cols-4` rende tab più strette su mobile piccolo (320px) | Verificare che ogni tab resti almeno 44×48 px. Se label "Progresso" si sovrappone all'icona, usare label "Progr." o solo icona sotto 360px (usare `text-[10px] sm:text-xs`) |
| `<Link>` su 137 celle può aumentare il bundle | Misurare: i `<Link>` sono client refs, ma 137 elementi sono trascurabili. Se si nota lag, sostituire con `<a href>` puro |
| Animazioni cumulative su tutta la pagina possono saturare GPU mobile | 3 animazioni totali, di cui solo `node-pulse` è continua (2s loop). Trascurabile |

---

## 17. DEFINITION OF DONE

Lo Sprint 1.8 è chiuso quando:

1. Tab "Progresso" visibile in bottom nav come 3° tab tra Libreria e Profilo
2. Pagina `/progress` scrollabile con tutte e 5 le sezioni nell'ordine `ExamProgress → PracticeCalendar → CurriculumMap → CompetenceRadar → JourneyTimeline`
3. ExamProgress nascosto quando nessun esame in preparazione
4. PracticeCalendar mostra griglia 90 giorni con colori basati sui `practice_logs` reali (verifica SQL coincide con render)
5. CurriculumMap mostra tutte le skill accessibili colorate per stato + locked grigio scuro per quelle oltre il livello, con toggle disciplina (se applicabile)
6. CompetenceRadar mostra pentagono SVG con 5 assi corretti per disciplina
7. JourneyTimeline mostra tutti i gradi della disciplina selezionata con stato corretto e separatore "cintura nera" Shaolin
8. Tap su cella CurriculumMap (non locked) apre `/skill/[id]`
9. **Tutti i grafici sono SVG puro**, `package.json` non contiene `recharts/chart.js/d3/framer-motion/nivo`
10. Walk-through manuale di §15 completato senza errori console o 500
11. `npm run lint && npm run build` passano
12. Aggiornati `current-plan.md` (BottomNav 4 tab, struttura cartelle, sprint plan §9) come da §18

---

## 18. AGGIORNAMENTI A `current-plan.md` DOPO QUESTO SPRINT

- §5: aggiungere `app/(app)/progress/page.tsx` e `components/progress/*` nella struttura cartelle; aggiungere `lib/queries/progress.ts`
- §7.1 Bottom navigation: passare da 3 a 4 tab `[Oggi] [Libreria] [Progresso] [Profilo]`
- §9 Sprint 2 task #14 ("Progresso settimanale + countdown esame"): segnare come **sostituito da Sprint 1.8**, citare questo file
- §9: aggiungere riga "1.8 — Tab Progresso ✅" alla lista degli sprint completati
- §17.5 Runbook: aggiungere riga "Vedere progresso utente: `/progress` da app, oppure SQL su `practice_logs` + `user_plan_items` per analisi backend"

---

## 19. RIASSUNTO ESECUTIVO

**Cosa fai:** aggiungi una quarta tab "Progresso" con 5 viste in SVG puro: ring chart esame, calendario pratica 90gg, mappa curriculum, radar competenze, timeline percorso.

**Quando:** dopo Sprint 1.5 FESK (richiede schema con `discipline`, `assigned_level_<D>`, categorie FESK).

**Costo stimato:** 1.5-2 giorni di lavoro per agent ben istruito. Il grosso è UI (5 componenti + skeleton). Le query sono lineari, le funzioni pure di aggregazione testabili in isolamento.

**Beneficio:** l'allievo ha finalmente vista d'insieme. Capisce a colpo d'occhio dov'è, cosa gli manca, quanto del curriculum ha esplorato.

**Cosa NON fai:** gamification, leaderboard, notifiche, analytics, librerie chart, modifiche schema, countdown data esame.

**Da fare prima di considerare chiuso:** walk-through §15, build verde, aggiornare `current-plan.md` come da §18.
