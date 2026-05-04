# PlanStatus Simplification Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ridurre `PlanStatus` da 3 a 2 livelli (`focus | maintenance`), sostituire la rotazione per categoria con una distribuzione deterministica pesata 2:1, e aggiungere alla pagina `/sessions/setup` una sezione per assegnare focus/mantenimento via toggle.

**Architecture:** Una sola formula deterministica governa la distribuzione: ogni skill in focus appare 2 volte nel ciclo, ogni skill in mantenimento 1 volta. La somma delle occorrenze diviso il numero di sessioni del ciclo dà le forme/sessione (ceil). L'algoritmo round-robin Bresenham-like distribuisce le occorrenze nelle sessioni evitando cluster e duplicati. UI: 2 sezioni invece di 3 ovunque, nuovo componente `PlanFormsSection` nel setup.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Supabase Postgres + RLS, Vitest, Tailwind + shadcn/ui.

**Reference design:** [plan/2026-05-04-plan-status-simplification-design.md](2026-05-04-plan-status-simplification-design.md)

---

## Convenzioni di esecuzione

- **DB workflow**: la CLI Supabase non è in PATH. Per ogni migration: salva il file SQL nel repo, poi presenta SQL copia-incolla all'utente per il SQL Editor Supabase, attendi conferma "applicata" prima di proseguire con task che ne dipendono.
- **Lint/build**: dopo ogni gruppo di 2-3 task `cd skill-practice && npm run lint && npm run build`. Se rompe, fixare prima di proseguire.
- **Commit**: 1 commit per task chiuso, messaggio in italiano, formato `tipo(scope): descrizione` (`refactor`, `feat`, `fix`, `test`, ecc.).
- **TDD**: per logica pura (`practice-logic`, `session-scheduler`) test prima dell'implementazione. UI: test manuale dopo ogni gruppo.

---

## Task 1: Migration SQL `0019_simplify_plan_status.sql`

**Files:**
- Create: `skill-practice/supabase/migrations/0019_simplify_plan_status.sql`

**Step 1: Crea il file migration**

```sql
-- 0019_simplify_plan_status.sql
-- Collassa enum plan_status da 3 a 2 valori: 'focus' | 'maintenance'.
-- Tutti i record con status='review' diventano 'maintenance' (scelta conservativa).
-- Postgres non supporta DROP VALUE su enum: ricreazione del tipo.

BEGIN;

-- 1. Migra dati: review -> maintenance
UPDATE user_plan_items
SET status = 'maintenance'
WHERE status = 'review';

UPDATE exam_skill_requirements
SET default_status = 'maintenance'
WHERE default_status = 'review';

-- 2. Casta colonne a text per detach dall'enum
ALTER TABLE user_plan_items
  ALTER COLUMN status TYPE text USING status::text;
ALTER TABLE exam_skill_requirements
  ALTER COLUMN default_status TYPE text USING default_status::text;

-- 3. Drop & ricrea enum con i 2 valori
DROP TYPE plan_status;
CREATE TYPE plan_status AS ENUM ('focus', 'maintenance');

-- 4. Re-applica enum alle colonne
ALTER TABLE user_plan_items
  ALTER COLUMN status TYPE plan_status USING status::plan_status;
ALTER TABLE exam_skill_requirements
  ALTER COLUMN default_status TYPE plan_status USING default_status::plan_status;

COMMIT;
```

**Step 2: Avvisa l'utente e fornisci SQL per il SQL Editor**

Output all'utente:

> Migration `0019_simplify_plan_status.sql` creata. La CLI Supabase non è disponibile localmente: copia lo SQL nel SQL Editor Supabase (progetto attuale) ed eseguilo. Conferma quando applicato per procedere.

Attendi conferma prima del prossimo task.

**Step 3: Commit**

```bash
git add skill-practice/supabase/migrations/0019_simplify_plan_status.sql
git commit -m "feat(db): collassa plan_status a focus|maintenance (migration 0019)"
```

---

## Task 2: Update `PlanStatus` in `lib/types.ts`

**Files:**
- Modify: `skill-practice/src/lib/types.ts` (linea 21)

**Step 1: Modifica il tipo**

```ts
// Prima
export type PlanStatus = "focus" | "review" | "maintenance";

// Dopo
export type PlanStatus = "focus" | "maintenance";
```

**Step 2: Lancia type check**

Run: `cd skill-practice && npx tsc --noEmit`
Expected: errori in tutti i file che ancora referenziano `"review"`. È previsto, vengono fixati nei task seguenti.

**Step 3: Commit (incluso nel task seguente per restare consistente)**

Non committare ora; il commit avviene a fine Task 3 perché senza i fix non compila.

---

## Task 3: TDD `practice-logic.ts` — semplificazione

**Files:**
- Modify: `skill-practice/src/lib/practice-logic.test.ts`
- Modify: `skill-practice/src/lib/practice-logic.ts`

**Step 1: Aggiorna i test esistenti**

Apri `practice-logic.test.ts`. Per ogni occorrenza `"review"` decidi:
- Se il test verifica "review come categoria distinta" → rimuovi il test (non ha più senso)
- Se il test usa `"review"` come dato di esempio → cambia in `"maintenance"`

Aggiungi un nuovo test:

```ts
test("non distingue più review: tutte le non-focus sono maintenance", () => {
  const items: TestItem[] = [
    item("focus-1", "focus", null),
    item("maint-1", "maintenance", null),
  ];
  const result = getTodayPractice(items);
  expect(result.focus.map((i) => i.id)).toEqual(["focus-1"]);
  expect(result.maintenance.map((i) => i.id)).toEqual(["maint-1"]);
  // Non c'è più una proprietà "review"
  expect("review" in result).toBe(false);
});
```

**Step 2: Run tests — devono fallire**

Run: `cd skill-practice && npx vitest run src/lib/practice-logic.test.ts`
Expected: FAIL — `DailyPractice.review` esiste ancora.

**Step 3: Aggiorna `practice-logic.ts`**

Sostituisci file con:

```ts
import type { Discipline, UserPlanItem } from "./types";

export type DailyPractice<T extends UserPlanItem = UserPlanItem> = {
  focus: T[];
  maintenance: T[];
};

const MAINTENANCE_PER_DAY = 4;

export function getTodayPractice<
  T extends UserPlanItem & { skill?: { discipline?: Discipline } },
>(items: T[], discipline?: Discipline): DailyPractice<T> {
  const visible = items.filter((item) => {
    if (item.is_hidden) return false;
    if (!discipline) return true;
    return item.skill?.discipline === discipline;
  });

  const focus = visible.filter((item) => item.status === "focus");
  const maintenance = sortByOldestPractice(
    visible.filter((item) => item.status === "maintenance"),
  ).slice(0, MAINTENANCE_PER_DAY);

  return { focus, maintenance };
}

function sortByOldestPractice<T extends UserPlanItem>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aTime = a.last_practiced_at
      ? new Date(a.last_practiced_at).getTime()
      : 0;
    const bTime = b.last_practiced_at
      ? new Date(b.last_practiced_at).getTime()
      : 0;
    return aTime - bTime;
  });
}
```

> Nota: `practice-logic` resta come fallback per chi non ha schedule attivo. La distribuzione "vera" sta in `session-scheduler` (Task 4). Qui tieniamo semplice: focus tutte, mantenimento le 4 meno praticate.

**Step 4: Run tests — passano**

Run: `cd skill-practice && npx vitest run src/lib/practice-logic.test.ts`
Expected: PASS.

**Step 5: Commit (insieme al Task 2)**

```bash
git add skill-practice/src/lib/types.ts \
  skill-practice/src/lib/practice-logic.ts \
  skill-practice/src/lib/practice-logic.test.ts
git commit -m "refactor(types): rimuovi review da PlanStatus e semplifica practice-logic"
```

---

## Task 4: TDD `session-scheduler.ts` — nuova distribuzione 2:1

**Files:**
- Modify: `skill-practice/src/lib/session-scheduler.test.ts`
- Modify: `skill-practice/src/lib/session-scheduler.ts`

**Step 1: Aggiorna helper `item` nel test**

Cambia firma da `status: "focus" | "review" | "maintenance"` a `status: "focus" | "maintenance"`. Sostituisci tutti i `"review"` esistenti con `"maintenance"`.

**Step 2: Aggiungi test per le nuove invarianti**

```ts
describe("nuova distribuzione pesata 2:1", () => {
  test("ogni focus skill compare 2 volte nel ciclo, ogni maint 1 volta", () => {
    const schedule: TrainingSchedule = makeSchedule({
      weekdays: [1, 2, 3, 4, 5],
      cadence_weeks: 1,
    });
    const items = [
      item("f1", "focus"),
      item("f2", "focus"),
      item("m1", "maintenance"),
      item("m2", "maintenance"),
      item("m3", "maintenance"),
    ];
    const counts = countOccurrencesInCycle(schedule, items);
    expect(counts.get("f1")).toBe(2);
    expect(counts.get("f2")).toBe(2);
    expect(counts.get("m1")).toBe(1);
    expect(counts.get("m2")).toBe(1);
    expect(counts.get("m3")).toBe(1);
  });

  test("forme per sessione = ceil(occorrenze_totali / giorni_pratica_ciclo)", () => {
    const schedule = makeSchedule({ weekdays: [1, 3, 5], cadence_weeks: 2 });
    const items = [
      ...range(4).map((i) => item(`f${i}`, "focus")),
      ...range(6).map((i) => item(`m${i}`, "maintenance")),
    ];
    // 4*2 + 6*1 = 14 occ; giorni = 3*2 = 6; ceil(14/6) = 3
    const session = getScheduledSession("2026-05-04", schedule, items);
    if (session.kind !== "training") throw new Error("expected training");
    const total = session.focus.length + session.maintenance.length;
    expect(total).toBeLessThanOrEqual(3);
    expect(total).toBeGreaterThanOrEqual(2);
  });

  test("la stessa skill non compare due volte nella stessa sessione", () => {
    const schedule = makeSchedule({ weekdays: [1, 2, 3, 4, 5], cadence_weeks: 1 });
    const items = [
      item("f1", "focus"),
      item("f2", "focus"),
      item("m1", "maintenance"),
    ];
    for (let day = 0; day < 5; day++) {
      const date = addDaysIso(schedule.start_date, day);
      const s = getScheduledSession(date, schedule, items);
      if (s.kind !== "training") continue;
      const ids = [...s.focus, ...s.maintenance].map((i) => i.skill_id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

function countOccurrencesInCycle(
  schedule: TrainingSchedule,
  items: ItemWithSkill[],
): Map<string, number> {
  const counts = new Map<string, number>();
  const totalDays = schedule.weekdays.length * schedule.cadence_weeks;
  let cur = schedule.start_date;
  let scheduled = 0;
  while (scheduled < totalDays) {
    const s = getScheduledSession(cur, schedule, items);
    if (s.kind === "training") {
      [...s.focus, ...s.maintenance].forEach((it) => {
        counts.set(it.skill_id, (counts.get(it.skill_id) ?? 0) + 1);
      });
      scheduled++;
    }
    cur = addDaysIso(cur, 1);
  }
  return counts;
}
```

(Helper `makeSchedule`, `addDaysIso`, `range` da estrarre/creare se non esistono — fattorizzare se duplicano logica già presente nel test file.)

**Step 2b: Run — fail**

Run: `cd skill-practice && npx vitest run src/lib/session-scheduler.test.ts`
Expected: FAIL su `counts.get(...)` perché vecchio algoritmo distribuisce con due cicli diversi.

**Step 3: Riscrivi `session-scheduler.ts`**

Sostituisci la sezione che calcola `focus`/`review`/`maintenance` con:

```ts
const FOCUS_WEIGHT = 2;
const MAINTENANCE_WEIGHT = 1;

export type ScheduledSession =
  | { kind: "no_schedule" }
  | { kind: "expired"; endDate: string }
  | { kind: "rest_day"; nextTrainingDate: string | null }
  | {
      kind: "training";
      sessionIndex: number;
      focus: ItemWithSkill[];
      maintenance: ItemWithSkill[];
    };

export function getScheduledSession(
  date: string,
  schedule: TrainingSchedule | null,
  items: ItemWithSkill[],
): ScheduledSession {
  if (schedule == null) return { kind: "no_schedule" };
  if (date > schedule.end_date) return { kind: "expired", endDate: schedule.end_date };
  if (date < schedule.start_date) {
    return {
      kind: "rest_day",
      nextTrainingDate: findNextTrainingDate(addDays(schedule.start_date, -1), schedule),
    };
  }
  if (!schedule.weekdays.includes(isoWeekday(date))) {
    return { kind: "rest_day", nextTrainingDate: findNextTrainingDate(date, schedule) };
  }

  const sessionIndex =
    countTrainingDaysInclusive(schedule.start_date, date, schedule.weekdays) - 1;
  const cycleSize = schedule.cadence_weeks * schedule.weekdays.length;
  const slotInCycle = ((sessionIndex % cycleSize) + cycleSize) % cycleSize;

  const sortedItems = [...items].sort(stableItemOrder);
  const tokens = expandTokens(sortedItems); // [skillRef, skillRef, ...] secondo peso
  const slots = distributeTokensToSlots(tokens, cycleSize);

  const todays = slots[slotInCycle] ?? [];
  const focus = todays.filter((it) => it.status === "focus");
  const maintenance = todays.filter((it) => it.status === "maintenance");

  return { kind: "training", sessionIndex, focus, maintenance };
}

function expandTokens(items: ItemWithSkill[]): ItemWithSkill[] {
  const out: ItemWithSkill[] = [];
  for (const it of items) {
    const weight = it.status === "focus" ? FOCUS_WEIGHT : MAINTENANCE_WEIGHT;
    for (let i = 0; i < weight; i++) out.push(it);
  }
  return out;
}

function distributeTokensToSlots(
  tokens: ItemWithSkill[],
  slotCount: number,
): ItemWithSkill[][] {
  const slots: ItemWithSkill[][] = Array.from({ length: slotCount }, () => []);
  if (tokens.length === 0 || slotCount === 0) return slots;
  // Bresenham-like: token i va a slot floor(i * slotCount / tokens.length).
  // Se quel slot ha già la stessa skill, prova lo slot successivo (rotazione)
  // per evitare duplicati nella stessa sessione.
  for (let i = 0; i < tokens.length; i++) {
    const ideal = Math.floor((i * slotCount) / tokens.length);
    let target = ideal;
    let attempts = 0;
    while (
      attempts < slotCount &&
      slots[target].some((s) => s.skill_id === tokens[i].skill_id)
    ) {
      target = (target + 1) % slotCount;
      attempts++;
    }
    slots[target].push(tokens[i]);
  }
  return slots;
}

function stableItemOrder(a: ItemWithSkill, b: ItemWithSkill): number {
  if (a.skill.discipline !== b.skill.discipline) {
    return a.skill.discipline.localeCompare(b.skill.discipline);
  }
  if (a.skill.category !== b.skill.category) {
    return a.skill.category.localeCompare(b.skill.category);
  }
  if (a.skill.display_order !== b.skill.display_order) {
    return a.skill.display_order - b.skill.display_order;
  }
  return a.skill_id.localeCompare(b.skill_id);
}
```

> Rimuovi la vecchia funzione `bucket` se non più usata.

**Step 4: Run tests — passano**

Run: `cd skill-practice && npx vitest run src/lib/session-scheduler.test.ts`
Expected: PASS tutti.

**Step 5: Commit**

```bash
git add skill-practice/src/lib/session-scheduler.ts \
  skill-practice/src/lib/session-scheduler.test.ts
git commit -m "refactor(scheduler): distribuzione pesata 2:1 al posto di rotazioni separate"
```

---

## Task 5: Aggiorna `lib/marker-visuals.ts`

**Files:**
- Modify: `skill-practice/src/lib/marker-visuals.ts`

**Step 1: Rimuovi la chiave `review`**

Elimina linee 19-26 (blocco `review: { ... }`). Il record `Record<PlanStatus, PlanStatusVisual>` resta valido perché `PlanStatus` ora ha solo 2 valori.

**Step 2: Type check**

Run: `cd skill-practice && npx tsc --noEmit src/lib/marker-visuals.ts`
Expected: nessun errore in questo file.

**Step 3: Commit**

```bash
git add skill-practice/src/lib/marker-visuals.ts
git commit -m "refactor(visuals): rimuovi voce review da PLAN_STATUS_VISUALS"
```

---

## Task 6: Aggiorna `lib/progress-logic.ts`

**Files:**
- Modify: `skill-practice/src/lib/progress-logic.ts:187`
- Modify: `skill-practice/src/lib/progress-logic.test.ts:103`

**Step 1: Rimuovi caso review**

Linea 187 (`if (status === "review") return 0.75;`): cancella. Verifica che il calcolo del progresso resti coerente; se `0.75` era usato per indicare "stato intermedio", il mantenimento ne erediterà il peso (probabilmente già 0.5 o simile — leggi contesto).

Aggiorna `progress-logic.test.ts:103`: sostituisci `"review" as const` con `"maintenance" as const` o rimuovi il test se ridondante.

**Step 2: Run tests**

Run: `cd skill-practice && npx vitest run src/lib/progress-logic.test.ts`
Expected: PASS.

**Step 3: Commit**

```bash
git add skill-practice/src/lib/progress-logic.ts \
  skill-practice/src/lib/progress-logic.test.ts
git commit -m "refactor(progress): rimuovi caso review dal calcolo"
```

---

## Task 7: Aggiorna `lib/actions/plan.ts`

**Files:**
- Modify: `skill-practice/src/lib/actions/plan.ts:14`

**Step 1: Cambia default**

```ts
// Prima
status: PlanStatus = "review",

// Dopo
status: PlanStatus = "maintenance",
```

**Step 2: Type check**

Run: `cd skill-practice && npx tsc --noEmit`
Expected: nessun errore in questo file.

**Step 3: Commit**

```bash
git add skill-practice/src/lib/actions/plan.ts
git commit -m "refactor(actions): default status maintenance per addSkillToPlan"
```

---

## Task 8: UI components — rimuovi review (gruppo)

**Files:**
- Modify: `skill-practice/src/components/today/SkillStatusMenu.tsx:31` (`STATUS_OPTIONS`)
- Modify: `skill-practice/src/components/sessions/GeneratedPlanCalendar.tsx:395` e `:486`
- Modify: `skill-practice/src/components/skill/AddToPlanButton.tsx:28`
- Modify: `skill-practice/src/components/skill/PlanStatusLegend.tsx`
- Modify: `skill-practice/src/components/progress/CurriculumMap.tsx:50,63,73`

**Step 1: SkillStatusMenu**

```ts
const STATUS_OPTIONS: PlanStatus[] = ["focus", "maintenance"];
```

**Step 2: GeneratedPlanCalendar**

- Linea 395: `(["focus", "review", "maintenance"] as PlanStatus[])` → `(["focus", "maintenance"] as PlanStatus[])`
- Linea 486: rimuovi `<SessionSection status="review" items={row.session.review} />`

Verifica che `row.session` sia tipizzata coerentemente con la nuova `ScheduledSession`.

**Step 3: AddToPlanButton**

```ts
await addSkillToPlan(skillId, "maintenance");
```

**Step 4: PlanStatusLegend**

Apri il file. Rimuovi la riga di legenda `review`. Tieni solo focus + maintenance.

**Step 5: CurriculumMap**

- Linea 50: rimuovi clausola `cell.status === "review" ||`
- Linea 63: rimuovi `if (status === "review") return PLAN_STATUS_VISUALS.review.mapClassName;`
- Linea 73: rimuovi `if (status === "review") return PLAN_STATUS_VISUALS.review.label;`

**Step 6: Type check + lint**

Run: `cd skill-practice && npm run lint && npx tsc --noEmit`
Expected: zero errori sui file toccati. Se ci sono altri usage di `"review"` non listati, fixali coerentemente.

**Step 7: Commit**

```bash
git add skill-practice/src/components/today/SkillStatusMenu.tsx \
  skill-practice/src/components/sessions/GeneratedPlanCalendar.tsx \
  skill-practice/src/components/skill/AddToPlanButton.tsx \
  skill-practice/src/components/skill/PlanStatusLegend.tsx \
  skill-practice/src/components/progress/CurriculumMap.tsx
git commit -m "refactor(ui): rimuovi stato review da menu, calendario e mappa curriculum"
```

---

## Task 9: Crea `components/sessions/PlanFormsSection.tsx`

**Files:**
- Create: `skill-practice/src/components/sessions/PlanFormsSection.tsx`

**Step 1: Implementa il componente**

```tsx
"use client";

import { useTransition, useOptimistic } from "react";
import { updatePlanItemStatus } from "@/lib/actions/plan";
import { DISCIPLINE_LABELS } from "@/lib/labels";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Discipline, PlanStatus, Skill, UserPlanItem } from "@/lib/types";

type ItemWithSkill = UserPlanItem & { skill: Skill };

type Props = {
  items: ItemWithSkill[];
  scope: "both" | Discipline;
  onCountsChange?: (counts: { focus: number; maintenance: number }) => void;
};

export function PlanFormsSection({ items, scope, onCountsChange }: Props) {
  const [optimistic, setOptimistic] = useOptimistic(
    items,
    (state, update: { skillId: string; status: PlanStatus }) =>
      state.map((it) =>
        it.skill_id === update.skillId ? { ...it, status: update.status } : it,
      ),
  );
  const [, startTransition] = useTransition();

  const filtered = optimistic.filter(
    (it) => scope === "both" || it.skill.discipline === scope,
  );
  const focusCount = filtered.filter((i) => i.status === "focus").length;
  const maintCount = filtered.filter((i) => i.status === "maintenance").length;

  // Notifica il parent del cambiamento per ricalcolare il preview
  if (onCountsChange) {
    queueMicrotask(() =>
      onCountsChange({ focus: focusCount, maintenance: maintCount }),
    );
  }

  const grouped = groupByDisciplineAndCategory(filtered);

  function toggle(item: ItemWithSkill) {
    const next: PlanStatus = item.status === "focus" ? "maintenance" : "focus";
    startTransition(async () => {
      setOptimistic({ skillId: item.skill_id, status: next });
      await updatePlanItemStatus(item.skill_id, next);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Forme nel piano</CardTitle>
        <p className="text-muted-foreground text-xs">
          {filtered.length} forme · {focusCount} focus · {maintCount} mantenimento
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {grouped.map((group) => (
          <div key={group.discipline} className="space-y-2">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">
              {DISCIPLINE_LABELS[group.discipline]} ({group.items.length})
            </h3>
            {group.categories.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground/70">
                  {cat.category}
                </p>
                <ul className="divide-border bg-card divide-y rounded-lg border">
                  {cat.items.map((it) => (
                    <li
                      key={it.id}
                      className="flex items-center justify-between gap-3 px-3 py-2"
                    >
                      <span className="text-sm">{it.skill.name}</span>
                      <button
                        type="button"
                        onClick={() => toggle(it)}
                        className={cn(
                          "rounded-md border px-2 py-1 text-xs font-medium",
                          it.status === "focus"
                            ? "border-primary text-primary"
                            : "border-border text-muted-foreground",
                        )}
                        aria-label={`Cambia stato di ${it.skill.name}`}
                      >
                        {it.status === "focus" ? "Focus" : "Mantenimento"}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Nessuna forma nel piano per l'ambito selezionato.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function groupByDisciplineAndCategory(items: ItemWithSkill[]) {
  const byDisc = new Map<Discipline, ItemWithSkill[]>();
  for (const it of items) {
    const arr = byDisc.get(it.skill.discipline) ?? [];
    arr.push(it);
    byDisc.set(it.skill.discipline, arr);
  }
  return Array.from(byDisc.entries()).map(([discipline, list]) => {
    const byCat = new Map<string, ItemWithSkill[]>();
    for (const it of list) {
      const arr = byCat.get(it.skill.category) ?? [];
      arr.push(it);
      byCat.set(it.skill.category, arr);
    }
    return {
      discipline,
      items: list,
      categories: Array.from(byCat.entries())
        .map(([category, items]) => ({
          category,
          items: [...items].sort(
            (a, b) => a.skill.display_order - b.skill.display_order,
          ),
        }))
        .sort((a, b) => a.category.localeCompare(b.category)),
    };
  });
}
```

**Step 2: Type check**

Run: `cd skill-practice && npx tsc --noEmit`
Expected: nessun errore in questo file.

**Step 3: Commit**

```bash
git add skill-practice/src/components/sessions/PlanFormsSection.tsx
git commit -m "feat(sessions): nuovo componente PlanFormsSection con toggle focus/mantenimento"
```

---

## Task 10: Integra `PlanFormsSection` in `SetupForm`

**Files:**
- Modify: `skill-practice/src/components/sessions/SetupForm.tsx`
- Modify: `skill-practice/src/app/(app)/sessions/setup/page.tsx`

**Step 1: Passa `items` al `SetupForm`**

In `setup/page.tsx`, aggiungi `items` ai props passati a `SetupForm`:

```tsx
<SetupForm
  current={schedule}
  programLabel={programLabel}
  planMode={profile.plan_mode}
  disciplineCounts={disciplineCounts}
  items={items}
/>
```

**Step 2: Aggiorna `SetupForm` props + state**

In `SetupForm.tsx`:

- Aggiungi `items: Array<UserPlanItem & { skill: Skill }>` a `Props`
- Aggiungi nuovo state per i counts:

```tsx
const initialFocus = items.filter(
  (it) => it.status === "focus" && (
    examScope === "both" || it.skill.discipline === examScope
  ),
).length;
const initialMaint = items.length - initialFocus;
const [planCounts, setPlanCounts] = useState({
  focus: initialFocus,
  maintenance: initialMaint,
});
```

- Inserisci `<PlanFormsSection items={items} scope={examScope} onCountsChange={setPlanCounts} />` come 5ª card, fra `<Card>Frequenza del ripasso</Card>` e `<Card>Ripetizioni per forma</Card>`.

**Step 3: Aggiorna `previewCount` con la nuova formula**

Sostituisci:

```tsx
const previewCount = Math.max(1, Math.min(selectedItemCount, 6));
```

con:

```tsx
const totalOcc = planCounts.focus * 2 + planCounts.maintenance * 1;
const cycleDays = weekdays.length * cadence;
const previewCount = cycleDays > 0
  ? Math.max(1, Math.ceil(totalOcc / cycleDays))
  : 1;
```

**Step 4: Type check + smoke test manuale**

Run: `cd skill-practice && npm run lint && npx tsc --noEmit`
Expected: zero errori.

Avvia dev server e visita `/sessions/setup`:
- Toggle uno status, verifica che il count "X focus · Y mantenimento" si aggiorni
- Verifica che il preview "Ripetizioni per forma" rifletta il nuovo calcolo
- Verifica che cambiando ambito esame la lista si filtri

**Step 5: Commit**

```bash
git add skill-practice/src/app/\(app\)/sessions/setup/page.tsx \
  skill-practice/src/components/sessions/SetupForm.tsx
git commit -m "feat(sessions): integra PlanFormsSection nel setup con preview reattivo"
```

---

## Task 11: Rinomina label "Frequenza del ripasso" → "Lunghezza ciclo"

**Files:**
- Modify: `skill-practice/src/components/sessions/SetupForm.tsx:151`
- Modify: `skill-practice/src/components/sessions/CadencePicker.tsx` (se contiene copy obsoleta)

**Step 1: Cambia il titolo della card**

```tsx
<CardTitle className="text-base">Lunghezza ciclo</CardTitle>
```

Aggiungi sotto, dentro `<CardContent>`:

```tsx
<p className="text-muted-foreground mb-2 text-xs">
  Entro questo intervallo tutte le forme vengono praticate almeno una volta.
</p>
```

**Step 2: Verifica copy in `CadencePicker`**

Apri `CadencePicker.tsx`. Se contiene copy del tipo "ogni N settimane ripassa", aggiorna in qualcosa di neutrale come "Ciclo di N settimana/e".

**Step 3: Commit**

```bash
git add skill-practice/src/components/sessions/SetupForm.tsx \
  skill-practice/src/components/sessions/CadencePicker.tsx
git commit -m "ux(sessions): rinomina frequenza ripasso in lunghezza ciclo"
```

---

## Task 12: Aggiorna `today` page per 2 sezioni

**Files:**
- Modify: `skill-practice/src/app/(app)/today/page.tsx`
- Modify: `skill-practice/src/components/today/*.tsx` (verifica usage `review`)

**Step 1: Cerca usage residui**

Run: `cd skill-practice && grep -rn '"review"\|review:' src/app/\(app\)/today src/components/today src/components/sessions`
Expected: zero match (tutti già fixati nei task precedenti).

Se restano: fixali. La struttura `today` page deve mostrare due sezioni (`Focus` / `Mantenimento`) usando l'output di `getScheduledSession` (o `getTodayPractice` per fallback).

**Step 2: Test manuale**

Avvia dev server, visita `/today`. Verifica:
- Mostra 2 sezioni
- Badge skill con 2 stati corretti
- Numero forme/sessione coerente

**Step 3: Commit (se ci sono fix)**

```bash
git add <file modificati>
git commit -m "ux(today): adatta visualizzazione a 2 stati"
```

Se non ci sono modifiche, salta.

---

## Task 13: Aggiorna `programma` chip filter

**Files:**
- Modify: `skill-practice/src/app/(app)/programma/page.tsx`

**Step 1: Trova e aggiorna chip filter**

Apri il file, cerca filtri/tabs su `PlanStatus`. Riduci a 2 valori (`focus | maintenance`).

**Step 2: Smoke test**

Visita `/programma`, verifica che i chip mostrino solo 2 stati e filtrino correttamente.

**Step 3: Commit**

```bash
git add skill-practice/src/app/\(app\)/programma/page.tsx
git commit -m "ux(programma): chip stato a 2 valori"
```

---

## Task 14: Aggiorna `plan/current-plan.md`

**Files:**
- Modify: `plan/current-plan.md`

**Step 1: Aggiorna sezioni**

- §4.1 (`ExamSkillRequirement.defaultStatus`): cambia il tipo a `"focus" | "maintenance"`
- §4.2 (`UserPlanItem.status`): cambia il tipo a `"focus" | "maintenance"`
- §6.1 (`practice-logic.ts`): sostituisci la descrizione algoritmo con quella nuova (focus tutte / mantenimento le 4 meno praticate, fallback senza schedule)
- §6.4 (`session-scheduler.ts`): sostituisci con descrizione della distribuzione 2:1 deterministica. Linka il design doc.
- §12.2 (seed esami TS): rimappa tutti i `defaultStatus: "review"` a `"maintenance"`. Lascia nota che i seed reali in `0004_seed_fesk.sql` non usano review.
- §2.2 D5: aggiungi nota che i 3 livelli sono stati semplificati a 2 (rimando al design doc), SRS reale resta come decisione futura
- §9 Sprint 1.x: aggiungi voce "1.12 — Semplificazione PlanStatus" con link al design e a questo plan

**Step 2: Commit**

```bash
git add plan/current-plan.md
git commit -m "docs(plan): aggiorna current-plan per semplificazione PlanStatus"
```

---

## Task 15: Build finale + smoke test integrato

**Files:** nessuno

**Step 1: Build**

Run: `cd skill-practice && npm run lint && npm run build`
Expected: PASS, niente warning nuovi.

**Step 2: Test suite**

Run: `cd skill-practice && npx vitest run`
Expected: PASS tutti.

**Step 3: Smoke test manuale (golden path)**

Avvia dev server. Verifica:
1. `/programma` mostra chip a 2 stati e filtra
2. `/skill/[id]` da una skill non in piano: "Aggiungi al piano" → la mette in mantenimento (default)
3. `/sessions/setup`:
   - Card "Forme nel piano" appare nella posizione corretta
   - Toggle cambia stato e si vede subito
   - Counts e preview si aggiornano
   - Lunghezza ciclo (1/2/4 settimane) cambia il preview
4. `/sessions/calendar` (dopo "Genera sessioni"): forme/giorno coerenti con la formula
5. `/today`: 2 sezioni focus/mantenimento, conteggio coerente
6. `/progress`: mappa curriculum non rompe, stati visualizzati a 2 colori

**Step 4: Commit eventuali rifiniture**

Se emergono micro-fix di copy/styling, commit separato:

```bash
git add <file>
git commit -m "polish(ui): rifiniture copy dopo smoke test"
```

---

## Definition of Done

- [ ] Migration `0019` applicata su Supabase
- [ ] `PlanStatus` ha 2 valori in `lib/types.ts`
- [ ] Test passano (`practice-logic`, `session-scheduler`, `progress-logic`)
- [ ] `npm run lint && npm run build` puliti
- [ ] Nessuna occorrenza residua di `"review"` come valore in src/ (controllo: `grep -rn '"review"' skill-practice/src` → 0)
- [ ] `/sessions/setup` mostra `PlanFormsSection`, toggle funziona, preview reattivo
- [ ] `/today`, `/programma`, `/skill`, `/progress` smoke test ok
- [ ] `plan/current-plan.md` aggiornato
- [ ] Tutti i commit atomici, messaggi chiari
