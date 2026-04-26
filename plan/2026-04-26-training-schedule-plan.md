# Schedulazione sessioni di allenamento — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Sostituire l'empty state di `/today` con un setup wizard per definire giorni, durata, cadenza e ripetizioni; calcolare al volo le sessioni nei training day; aggiungere calendario navigabile fino a `end_date` e tracking ripetizioni in `practice_logs`.

**Architecture:** Approccio computed (vedi `plan/2026-04-26-training-schedule-design.md` §1, Q5). Una riga `training_schedule` per utente contiene le regole; la funzione pura `getScheduledSession(date, schedule, items)` distribuisce focus / review / maintenance via bucket deterministico. `practice_logs` estesa con `reps_target`/`reps_done` (snapshot) per il counter ripetizioni.

**Tech Stack:** Next.js 16 App Router, Server Components + Server Actions, Supabase (Postgres + RLS), Tailwind v4 + shadcn/ui (preset Nova). Test con `node --test` (file `.test.ts` accanto al sorgente, vedi `src/lib/practice-logic.test.ts`).

**Convenzioni vincolanti:** vedi `skill-practice/CLAUDE.md`. Niente `any`, niente hooks data-fetch lato client, niente import server in client components, migrazioni numerate `NNNN_*.sql`. Lingua identificatori: inglese. Lingua commit: italiano.

**Prerequisiti:**
- Branch pulito o working copy locale già committata. Esistono molte modifiche pendenti non legate a questa feature: l'esecutore deve **non includerle** nei commit (usare `git add` per file specifici).
- `0011_dual_plan_persistence.sql` esiste già; la nostra migration sarà `0012`.
- Supabase CLI nel PATH per `db reset`. Se non disponibile (vedi `skill-practice/CLAUDE.md` §"Stato attuale"), saltare verifica DB live e validare via `npm run build` + ispezione manuale dell'SQL.

---

## Task 1: Migration `0012_training_schedule.sql`

**Files:**
- Create: `skill-practice/supabase/migrations/0012_training_schedule.sql`

**Step 1: Scrivere la migration**

Contenuto del file:

```sql
-- training_schedule: una riga per utente con le regole di schedulazione
-- delle sessioni. Le sessioni stesse sono calcolate al volo da
-- src/lib/session-scheduler.ts a partire da queste regole + user_plan_items.

BEGIN;

CREATE TABLE training_schedule (
  user_id        uuid PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  weekdays       smallint[] NOT NULL,
  cadence_weeks  smallint NOT NULL,
  reps_per_form  smallint NOT NULL DEFAULT 3,
  start_date     date NOT NULL,
  end_date       date NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ts_weekdays_size CHECK (array_length(weekdays, 1) BETWEEN 1 AND 7),
  CONSTRAINT ts_cadence_valid CHECK (cadence_weeks IN (1, 2, 4)),
  CONSTRAINT ts_reps_range CHECK (reps_per_form BETWEEN 1 AND 10),
  CONSTRAINT ts_dates_order CHECK (end_date > start_date)
);

ALTER TABLE training_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ts_owner" ON training_schedule
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION public.touch_training_schedule()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER training_schedule_touch
  BEFORE UPDATE ON training_schedule
  FOR EACH ROW EXECUTE FUNCTION public.touch_training_schedule();

-- Estensione practice_logs per tracciare le ripetizioni.
-- reps_target è snapshot: si fissa al primo log della giornata e non cambia
-- se l'utente modifica reps_per_form a metà giornata. Resta NULL per i log
-- precedenti alla migration (backward compatible).
ALTER TABLE practice_logs
  ADD COLUMN reps_target smallint,
  ADD COLUMN reps_done   smallint NOT NULL DEFAULT 0;

ALTER TABLE practice_logs
  ADD CONSTRAINT pl_reps_done_nonneg CHECK (reps_done >= 0),
  ADD CONSTRAINT pl_reps_target_range CHECK (reps_target IS NULL OR reps_target BETWEEN 1 AND 10);

COMMIT;
```

**Step 2: Verifica SQL valido**

Run (se Supabase CLI presente):
```
cd skill-practice && supabase db reset
```
Expected: nessun errore, schema applicato.

Se CLI non disponibile: leggere `0001_schema.sql` per confermare che `user_profiles` e `practice_logs` esistono come riferito, e che il pattern RLS è coerente con le altre tabelle (es. `0006_news_reflections.sql`).

**Step 3: Commit**

```
git add skill-practice/supabase/migrations/0012_training_schedule.sql
git commit -m "feat(db): training_schedule + reps tracking su practice_logs"
```

---

## Task 2: Tipi TypeScript

**Files:**
- Modify: `skill-practice/src/lib/types.ts`

**Step 1: Aggiungere `TrainingSchedule`**

In `types.ts` (sezione tipi DB, dopo `WeeklyReflection` o vicino a `UserProfile`):

```ts
export type TrainingSchedule = {
  user_id: string;
  weekdays: number[];           // ISO 1=Lun ... 7=Dom
  cadence_weeks: 1 | 2 | 4;
  reps_per_form: number;
  start_date: string;           // ISO YYYY-MM-DD
  end_date: string;             // ISO YYYY-MM-DD
  created_at: string;
  updated_at: string;
};
```

**Step 2: Estendere `PracticeLog`**

Trovare il tipo esistente:
```ts
export type PracticeLog = {
  id: string;
  user_id: string;
  skill_id: string;
  date: string;
  completed: boolean;
  personal_note: string | null;
  created_at: string;
};
```

Sostituirlo con:
```ts
export type PracticeLog = {
  id: string;
  user_id: string;
  skill_id: string;
  date: string;
  completed: boolean;
  personal_note: string | null;
  reps_target: number | null;   // null = log legacy senza schedule
  reps_done: number;
  created_at: string;
};
```

**Step 3: Verifica build**

Run:
```
cd skill-practice && npm run build
```
Expected: build verde. Se rompe, è perché qualche file usa `PracticeLog` senza i nuovi campi: aggiungerli ai literal e ai mock di test (`practice-logic.test.ts` non usa `PracticeLog` direttamente, dovrebbe essere ok).

**Step 4: Commit**

```
git add skill-practice/src/lib/types.ts
git commit -m "feat(types): TrainingSchedule + reps_target/reps_done su PracticeLog"
```

---

## Task 3: `session-scheduler.ts` — skeleton + caso `no_schedule`

**Files:**
- Create: `skill-practice/src/lib/session-scheduler.ts`
- Create: `skill-practice/src/lib/session-scheduler.test.ts`

**Step 1: Scrivere il primo test**

`session-scheduler.test.ts`:
```ts
import assert from "node:assert/strict";
import test from "node:test";
import { getScheduledSession } from "./session-scheduler.ts";

test("returns no_schedule when schedule is null", () => {
  const result = getScheduledSession("2026-05-01", null, []);
  assert.equal(result.kind, "no_schedule");
});
```

**Step 2: Eseguire e verificare il fallimento**

Run:
```
cd skill-practice && node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test src/lib/session-scheduler.test.ts
```
Expected: errore "Cannot find module './session-scheduler.ts'".

**Step 3: Scrivere lo skeleton**

`session-scheduler.ts`:
```ts
import type { Skill, TrainingSchedule, UserPlanItem } from "./types";

type ItemWithSkill = UserPlanItem & { skill: Skill };

export type ScheduledSession =
  | { kind: "no_schedule" }
  | { kind: "expired"; endDate: string }
  | { kind: "rest_day"; nextTrainingDate: string | null }
  | {
      kind: "training";
      sessionIndex: number;
      focus: ItemWithSkill[];
      review: ItemWithSkill[];
      maintenance: ItemWithSkill[];
    };

export function getScheduledSession(
  date: string,
  schedule: TrainingSchedule | null,
  items: ItemWithSkill[],
): ScheduledSession {
  if (!schedule) return { kind: "no_schedule" };
  // TODO: implementare i casi successivi
  return { kind: "no_schedule" };
}
```

**Step 4: Verificare il test passa**

Run il comando dello Step 2.
Expected: PASS.

**Step 5: Commit**

```
git add skill-practice/src/lib/session-scheduler.ts skill-practice/src/lib/session-scheduler.test.ts
git commit -m "feat(scheduler): skeleton getScheduledSession + caso no_schedule"
```

---

## Task 4: `session-scheduler.ts` — caso `expired`

**Files:**
- Modify: `skill-practice/src/lib/session-scheduler.ts`
- Modify: `skill-practice/src/lib/session-scheduler.test.ts`

**Step 1: Aggiungere il test**

Helper in cima al file di test (riusabile per i task successivi):

```ts
function makeSchedule(over: Partial<import("./types").TrainingSchedule> = {}): import("./types").TrainingSchedule {
  return {
    user_id: "user-1",
    weekdays: [1, 3, 5],
    cadence_weeks: 2,
    reps_per_form: 3,
    start_date: "2026-04-27",
    end_date: "2026-07-26",
    created_at: "2026-04-26T00:00:00.000Z",
    updated_at: "2026-04-26T00:00:00.000Z",
    ...over,
  };
}
```

Test:
```ts
test("returns expired when date is past end_date", () => {
  const schedule = makeSchedule({ end_date: "2026-05-01" });
  const result = getScheduledSession("2026-05-02", schedule, []);
  assert.equal(result.kind, "expired");
  if (result.kind === "expired") assert.equal(result.endDate, "2026-05-01");
});
```

**Step 2: Eseguire test → fail**

Run:
```
cd skill-practice && node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test src/lib/session-scheduler.test.ts
```
Expected: il nuovo test fallisce ("kind === 'no_schedule', expected 'expired'").

**Step 3: Implementare la branch**

In `session-scheduler.ts`, sostituire il `// TODO` con:
```ts
if (date > schedule.end_date) {
  return { kind: "expired", endDate: schedule.end_date };
}
return { kind: "no_schedule" };
```

Nota: confronto string-to-string funziona perché entrambi sono `YYYY-MM-DD` ISO.

**Step 4: Verificare i test passano**

Run il comando Step 2. Expected: 2/2 PASS.

**Step 5: Commit**

```
git add skill-practice/src/lib/session-scheduler.ts skill-practice/src/lib/session-scheduler.test.ts
git commit -m "feat(scheduler): caso expired"
```

---

## Task 5: `session-scheduler.ts` — caso `rest_day`

**Files:**
- Modify: `skill-practice/src/lib/session-scheduler.ts`
- Modify: `skill-practice/src/lib/session-scheduler.test.ts`

**Step 1: Aggiungere i test**

```ts
test("returns rest_day before start_date", () => {
  const schedule = makeSchedule({ start_date: "2026-05-01" });
  const result = getScheduledSession("2026-04-29", schedule, []);
  assert.equal(result.kind, "rest_day");
});

test("returns rest_day when weekday not in weekdays", () => {
  // 2026-04-28 è un martedì (ISO 2). Schedule ha [1,3,5] (Lun/Mer/Ven).
  const schedule = makeSchedule({
    start_date: "2026-04-27",
    weekdays: [1, 3, 5],
  });
  const result = getScheduledSession("2026-04-28", schedule, []);
  assert.equal(result.kind, "rest_day");
  if (result.kind === "rest_day") {
    assert.equal(result.nextTrainingDate, "2026-04-29"); // mercoledì
  }
});
```

**Step 2: Eseguire test → fail**

Run il comando di test del Task 4 Step 2. Expected: i 2 nuovi test falliscono.

**Step 3: Aggiungere helper e branch**

In `session-scheduler.ts` (sopra `getScheduledSession`):

```ts
function isoWeekday(dateStr: string): number {
  // Date(YYYY-MM-DD) viene parsato come UTC; getUTCDay() restituisce 0=Dom...6=Sab.
  // ISO weekday: 1=Lun...7=Dom.
  const d = new Date(`${dateStr}T00:00:00Z`);
  const js = d.getUTCDay();
  return js === 0 ? 7 : js;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function findNextTrainingDate(
  fromExclusive: string,
  schedule: TrainingSchedule,
): string | null {
  for (let offset = 1; offset <= 14; offset++) {
    const candidate = addDays(fromExclusive, offset);
    if (candidate > schedule.end_date) return null;
    if (schedule.weekdays.includes(isoWeekday(candidate))) return candidate;
  }
  return null;
}
```

Aggiornare la funzione principale:
```ts
export function getScheduledSession(
  date: string,
  schedule: TrainingSchedule | null,
  items: ItemWithSkill[],
): ScheduledSession {
  if (!schedule) return { kind: "no_schedule" };
  if (date > schedule.end_date) return { kind: "expired", endDate: schedule.end_date };
  if (date < schedule.start_date) {
    return { kind: "rest_day", nextTrainingDate: findNextTrainingDate(addDays(date, -1), schedule) };
  }
  if (!schedule.weekdays.includes(isoWeekday(date))) {
    return { kind: "rest_day", nextTrainingDate: findNextTrainingDate(date, schedule) };
  }
  // TODO: training day
  return { kind: "rest_day", nextTrainingDate: null };
}
```

**Step 4: Verificare test passano**

Run. Expected: 4/4 PASS. Se "next training date" del primo test rest_day ritorna sbagliato, controllare il calcolo `findNextTrainingDate` da `fromExclusive = date - 1` (perché vogliamo includere `start_date` stesso se è un weekday valido).

Test extra di sanity (aggiungere se utile):
```ts
test("nextTrainingDate skips correctly when start_date is a training weekday", () => {
  const schedule = makeSchedule({ start_date: "2026-05-04", weekdays: [1, 3, 5] }); // 2026-05-04 = lunedì
  const result = getScheduledSession("2026-05-02", schedule, []); // sabato pre-start
  assert.equal(result.kind, "rest_day");
  if (result.kind === "rest_day") assert.equal(result.nextTrainingDate, "2026-05-04");
});
```

**Step 5: Commit**

```
git add skill-practice/src/lib/session-scheduler.ts skill-practice/src/lib/session-scheduler.test.ts
git commit -m "feat(scheduler): caso rest_day + helper isoWeekday/addDays"
```

---

## Task 6: `session-scheduler.ts` — caso `training` con focus

**Files:**
- Modify: `skill-practice/src/lib/session-scheduler.ts`
- Modify: `skill-practice/src/lib/session-scheduler.test.ts`

**Step 1: Aggiungere helper test per gli items**

In `session-scheduler.test.ts`:
```ts
function item(
  id: string,
  status: "focus" | "review" | "maintenance",
): import("./session-scheduler").ItemWithSkill {
  return {
    id: `pi-${id}`,
    user_id: "user-1",
    skill_id: id,
    status,
    source: "manual",
    is_hidden: false,
    last_practiced_at: null,
    added_at: "2026-04-01T00:00:00.000Z",
    skill: {
      id,
      school_id: "school-1",
      name: id,
      name_italian: null,
      category: "forme",
      discipline: "shaolin",
      practice_mode: "solo",
      description: null,
      video_url: "",
      thumbnail_url: null,
      teacher_notes: null,
      estimated_duration_seconds: 180,
      minimum_grade_value: 1,
      display_order: 0,
      created_at: "2026-04-01T00:00:00.000Z",
    },
  };
}
```

Esportare anche `ItemWithSkill` dal modulo principale per il typing del test:
in `session-scheduler.ts`, aggiungere `export` su `type ItemWithSkill`.

Test:
```ts
test("training day returns all focus items", () => {
  const schedule = makeSchedule({ start_date: "2026-04-27", weekdays: [1, 3, 5] });
  const items = [item("a", "focus"), item("b", "focus"), item("c", "review")];
  const result = getScheduledSession("2026-04-27", schedule, items); // lunedì = training day
  assert.equal(result.kind, "training");
  if (result.kind === "training") {
    assert.deepEqual(
      result.focus.map((i) => i.skill_id),
      ["a", "b"],
    );
  }
});
```

**Step 2: Eseguire test → fail**

Run. Expected: il test fallisce con `kind: "rest_day"` (per via del `TODO` in `getScheduledSession`).

**Step 3: Implementare il branch training (focus only, review/maintenance vuoti)**

In `session-scheduler.ts`, sostituire il `// TODO: training day`:

```ts
const sessionIndex = countTrainingDaysInclusive(schedule.start_date, date, schedule.weekdays) - 1;
const focus = items
  .filter((it) => it.status === "focus")
  .sort((a, b) => a.skill.display_order - b.skill.display_order);
return {
  kind: "training",
  sessionIndex,
  focus,
  review: [],
  maintenance: [],
};
```

E aggiungere helper:
```ts
function countTrainingDaysInclusive(
  start: string,
  end: string,
  weekdays: number[],
): number {
  let count = 0;
  let cur = start;
  while (cur <= end) {
    if (weekdays.includes(isoWeekday(cur))) count++;
    cur = addDays(cur, 1);
  }
  return count;
}
```

**Step 4: Verificare test passa**

Run. Expected: tutti i test verdi.

**Step 5: Commit**

```
git add skill-practice/src/lib/session-scheduler.ts skill-practice/src/lib/session-scheduler.test.ts
git commit -m "feat(scheduler): training day con focus + sessionIndex"
```

---

## Task 7: `session-scheduler.ts` — bucket review/maintenance

**Files:**
- Modify: `skill-practice/src/lib/session-scheduler.ts`
- Modify: `skill-practice/src/lib/session-scheduler.test.ts`

**Step 1: Aggiungere i test**

```ts
test("review items distributed evenly across cycle", () => {
  // weekdays=[1,3,5] (3/settimana), cadence_weeks=2 → cycle_size_review = 6
  // 6 review items → 1 per sessione, ognuna compare 1 volta per ciclo
  const schedule = makeSchedule({
    start_date: "2026-04-27",
    weekdays: [1, 3, 5],
    cadence_weeks: 2,
  });
  const reviews = ["r1", "r2", "r3", "r4", "r5", "r6"].map((id) => item(id, "review"));
  const sessionDates = [
    "2026-04-27", // lun, session 0
    "2026-04-29", // mer, session 1
    "2026-05-01", // ven, session 2
    "2026-05-04", // lun, session 3
    "2026-05-06", // mer, session 4
    "2026-05-08", // ven, session 5
  ];
  const seen = new Set<string>();
  for (const d of sessionDates) {
    const r = getScheduledSession(d, schedule, reviews);
    assert.equal(r.kind, "training");
    if (r.kind === "training") {
      for (const it of r.review) seen.add(it.skill_id);
    }
  }
  assert.equal(seen.size, 6); // tutte le 6 sono comparse nel ciclo
});

test("maintenance uses cadence × 2 cycle", () => {
  // cadence=2 → maintenance cycle_size = 4 settimane * 3 giorni = 12 sessioni
  // 12 maintenance → 1 per sessione su 12 sessioni consecutive
  const schedule = makeSchedule({
    start_date: "2026-04-27",
    weekdays: [1, 3, 5],
    cadence_weeks: 2,
  });
  const maint = Array.from({ length: 12 }, (_, i) => item(`m${i}`, "maintenance"));
  const seen = new Set<string>();
  let cur = "2026-04-27";
  for (let i = 0; i < 12; i++) {
    const r = getScheduledSession(cur, schedule, maint);
    if (r.kind === "training") {
      for (const it of r.maintenance) seen.add(it.skill_id);
    }
    // avanza al prossimo training day
    do {
      cur = addDaysForTest(cur, 1);
    } while (![1, 3, 5].includes(isoWeekdayForTest(cur)));
  }
  assert.equal(seen.size, 12);
});
```

Per i test usiamo helper `addDaysForTest`/`isoWeekdayForTest` definiti localmente nel test, per non esportare i privati. Aggiungerli sopra i test:
```ts
function isoWeekdayForTest(d: string): number {
  const dt = new Date(`${d}T00:00:00Z`).getUTCDay();
  return dt === 0 ? 7 : dt;
}
function addDaysForTest(d: string, n: number): string {
  const dt = new Date(`${d}T00:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}
```

**Step 2: Eseguire test → fail**

Run. Expected: 0 review/maintenance distribuite (perché ancora hardcoded `[]`).

**Step 3: Implementare bucket**

In `session-scheduler.ts` aggiungere:
```ts
function bucket<T extends { skill_id: string }>(
  items: T[],
  sessionIndex: number,
  cycleSize: number,
): T[] {
  if (items.length === 0 || cycleSize <= 0) return [];
  const sorted = [...items].sort((a, b) => a.skill_id.localeCompare(b.skill_id));
  const formsPerSession = Math.ceil(sorted.length / cycleSize);
  const slot = ((sessionIndex % cycleSize) + cycleSize) % cycleSize;
  return sorted.slice(slot * formsPerSession, (slot + 1) * formsPerSession);
}
```

Sostituire la ritorno `training` in `getScheduledSession`:
```ts
const reviewItems = items.filter((it) => it.status === "review");
const maintItems = items.filter((it) => it.status === "maintenance");
const cycleReview = schedule.cadence_weeks * schedule.weekdays.length;
const cycleMaint = schedule.cadence_weeks * 2 * schedule.weekdays.length;
return {
  kind: "training",
  sessionIndex,
  focus,
  review: bucket(reviewItems, sessionIndex, cycleReview),
  maintenance: bucket(maintItems, sessionIndex, cycleMaint),
};
```

**Step 4: Verificare**

Run i test. Expected: tutti verdi (6/6 review viste, 12/12 maintenance viste). Se uno fallisce, debug:
- `console.log({ sessionIndex, cycle, slot })` prima del bucket per le date interessate.
- Verificare che `countTrainingDaysInclusive` ritorni i valori attesi.

**Step 5: Commit**

```
git add skill-practice/src/lib/session-scheduler.ts skill-practice/src/lib/session-scheduler.test.ts
git commit -m "feat(scheduler): bucket review/maintenance con cadenza cyclica"
```

---

## Task 8: `listSessionsInRange` per il calendario

**Files:**
- Modify: `skill-practice/src/lib/session-scheduler.ts`
- Modify: `skill-practice/src/lib/session-scheduler.test.ts`

**Step 1: Aggiungere il test**

```ts
test("listSessionsInRange iterates all days and labels training/rest", () => {
  const schedule = makeSchedule({
    start_date: "2026-04-27",
    end_date: "2026-05-03",
    weekdays: [1, 3, 5], // lun mer ven
  });
  const items = [item("a", "focus")];
  const list = listSessionsInRange("2026-04-27", "2026-05-03", schedule, items);
  assert.equal(list.length, 7);
  const trainingDates = list.filter((s) => s.session.kind === "training").map((s) => s.date);
  assert.deepEqual(trainingDates, ["2026-04-27", "2026-04-29", "2026-05-01"]);
});
```

Ricorda di importare `listSessionsInRange` dal modulo.

**Step 2: Eseguire test → fail**

Run. Expected: errore "listSessionsInRange not exported".

**Step 3: Implementare**

In `session-scheduler.ts`:
```ts
export function listSessionsInRange(
  from: string,
  to: string,
  schedule: TrainingSchedule | null,
  items: ItemWithSkill[],
): Array<{ date: string; session: ScheduledSession }> {
  const out: Array<{ date: string; session: ScheduledSession }> = [];
  let cur = from;
  while (cur <= to) {
    out.push({ date: cur, session: getScheduledSession(cur, schedule, items) });
    cur = addDays(cur, 1);
  }
  return out;
}
```

**Step 4: Verificare**

Run. Expected: PASS.

**Step 5: Commit**

```
git add skill-practice/src/lib/session-scheduler.ts skill-practice/src/lib/session-scheduler.test.ts
git commit -m "feat(scheduler): listSessionsInRange per il calendario"
```

---

## Task 9: Query `getTrainingSchedule`

**Files:**
- Create: `skill-practice/src/lib/queries/training-schedule.ts`

**Step 1: Scrivere la query**

```ts
import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { TrainingSchedule } from "@/lib/types";

export async function getTrainingSchedule(
  userId: string,
): Promise<TrainingSchedule | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("training_schedule")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return (data as TrainingSchedule | null) ?? null;
}
```

**Step 2: Verifica build**

Run:
```
cd skill-practice && npm run build
```
Expected: build verde.

**Step 3: Commit**

```
git add skill-practice/src/lib/queries/training-schedule.ts
git commit -m "feat(queries): getTrainingSchedule"
```

---

## Task 10: Action `setupTrainingSchedule`

**Files:**
- Create: `skill-practice/src/lib/actions/training-schedule.ts`

**Step 1: Scrivere l'action**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type FormState = { error: string } | { success: true } | null;

export async function setupTrainingSchedule(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return { error: "Non autenticato." };

  const weekdaysRaw = formData.getAll("weekdays").map((v) => Number(v));
  const cadenceWeeks = Number(formData.get("cadence_weeks"));
  const repsPerForm = Number(formData.get("reps_per_form"));
  const durationWeeks = Number(formData.get("duration_weeks"));

  const weekdays = weekdaysRaw.filter((n) => Number.isInteger(n) && n >= 1 && n <= 7);
  if (weekdays.length === 0) return { error: "Seleziona almeno un giorno." };
  if (![1, 2, 4].includes(cadenceWeeks)) return { error: "Cadenza non valida." };
  if (!(repsPerForm >= 1 && repsPerForm <= 10)) return { error: "Ripetizioni fuori range (1-10)." };
  if (![4, 8, 12, 24].includes(durationWeeks)) return { error: "Durata non valida." };

  const today = new Date();
  const startDate = today.toISOString().slice(0, 10);
  const end = new Date(today);
  end.setUTCDate(end.getUTCDate() + durationWeeks * 7);
  const endDate = end.toISOString().slice(0, 10);

  const { error } = await supabase.from("training_schedule").upsert({
    user_id: auth.user.id,
    weekdays: Array.from(new Set(weekdays)).sort((a, b) => a - b),
    cadence_weeks: cadenceWeeks,
    reps_per_form: repsPerForm,
    start_date: startDate,
    end_date: endDate,
  });

  if (error) return { error: error.message };

  revalidatePath("/today");
  revalidatePath("/sessions/calendar");
  redirect("/today");
}
```

**Step 2: Verifica build**

Run `npm run build`. Expected: verde.

**Step 3: Commit**

```
git add skill-practice/src/lib/actions/training-schedule.ts
git commit -m "feat(actions): setupTrainingSchedule (upsert + redirect)"
```

---

## Task 11: Componenti del setup form

**Files:**
- Create: `skill-practice/src/components/sessions/WeekdayChips.tsx`
- Create: `skill-practice/src/components/sessions/DurationPicker.tsx`
- Create: `skill-practice/src/components/sessions/CadencePicker.tsx`
- Create: `skill-practice/src/components/sessions/RepsStepper.tsx`
- Create: `skill-practice/src/components/sessions/SessionPreview.tsx`
- Create: `skill-practice/src/components/sessions/SetupForm.tsx`

**Step 1: `WeekdayChips.tsx`** (multi-select chip)

```tsx
"use client";

import { cn } from "@/lib/utils";

const LABELS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

type Props = {
  value: number[];
  onChange: (v: number[]) => void;
};

export function WeekdayChips({ value, onChange }: Props) {
  function toggle(day: number) {
    onChange(value.includes(day) ? value.filter((d) => d !== day) : [...value, day].sort((a, b) => a - b));
  }
  return (
    <div className="flex flex-wrap gap-2">
      {LABELS.map((label, i) => {
        const day = i + 1;
        const active = value.includes(day);
        return (
          <button
            key={day}
            type="button"
            onClick={() => toggle(day)}
            className={cn(
              "min-h-11 rounded-full border px-4 text-sm transition",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {label}
          </button>
        );
      })}
      {value.map((d) => (
        <input key={d} type="hidden" name="weekdays" value={d} />
      ))}
    </div>
  );
}
```

**Step 2: `DurationPicker.tsx`** (4 pill)

```tsx
"use client";

import { cn } from "@/lib/utils";

const OPTIONS: Array<{ weeks: 4 | 8 | 12 | 24; label: string }> = [
  { weeks: 4, label: "1 mese" },
  { weeks: 8, label: "2 mesi" },
  { weeks: 12, label: "3 mesi" },
  { weeks: 24, label: "6 mesi" },
];

type Props = {
  value: 4 | 8 | 12 | 24;
  onChange: (w: 4 | 8 | 12 | 24) => void;
};

export function DurationPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.weeks}
          type="button"
          onClick={() => onChange(opt.weeks)}
          className={cn(
            "min-h-11 rounded-full border px-4 text-sm",
            value === opt.weeks
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
      <input type="hidden" name="duration_weeks" value={value} />
    </div>
  );
}
```

**Step 3: `CadencePicker.tsx`** (3 radio)

```tsx
"use client";

import { cn } from "@/lib/utils";

const OPTIONS: Array<{ value: 1 | 2 | 4; label: string }> = [
  { value: 1, label: "Ogni settimana" },
  { value: 2, label: "Ogni 2 settimane" },
  { value: 4, label: "Ogni mese" },
];

type Props = { value: 1 | 2 | 4; onChange: (v: 1 | 2 | 4) => void };

export function CadencePicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {OPTIONS.map((opt) => (
        <label
          key={opt.value}
          className={cn(
            "border-border bg-card flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-4 text-sm",
            value === opt.value && "border-primary",
          )}
        >
          <input
            type="radio"
            name="cadence_weeks"
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
  );
}
```

**Step 4: `RepsStepper.tsx`**

```tsx
"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { value: number; onChange: (n: number) => void };

export function RepsStepper({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        size="icon"
        variant="outline"
        onClick={() => onChange(Math.max(1, value - 1))}
        aria-label="Diminuisci"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="min-w-8 text-center text-lg font-semibold tabular-nums">{value}</span>
      <Button
        type="button"
        size="icon"
        variant="outline"
        onClick={() => onChange(Math.min(10, value + 1))}
        aria-label="Aumenta"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <input type="hidden" name="reps_per_form" value={value} />
    </div>
  );
}
```

**Step 5: `SessionPreview.tsx`**

```tsx
type Props = {
  formCount: number;
  reps: number;
};

export function SessionPreview({ formCount, reps }: Props) {
  // stima ~3 minuti per ripetizione
  const minutes = Math.max(1, Math.round((formCount * reps * 3) / 1));
  return (
    <p className="text-muted-foreground text-sm">
      Sessione tipo: ~{minutes} minuti, {formCount} forme × {reps} ripetizioni.
    </p>
  );
}
```

(Approssimato, nessun calcolo esatto con `estimated_duration_seconds`. Sufficiente per l'anteprima.)

**Step 6: `SetupForm.tsx`** (orchestratore)

```tsx
"use client";

import { useActionState, useState } from "react";
import { setupTrainingSchedule } from "@/lib/actions/training-schedule";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeekdayChips } from "./WeekdayChips";
import { DurationPicker } from "./DurationPicker";
import { CadencePicker } from "./CadencePicker";
import { RepsStepper } from "./RepsStepper";
import { SessionPreview } from "./SessionPreview";
import type { TrainingSchedule } from "@/lib/types";

type Props = {
  current: TrainingSchedule | null;
  programLabel: string;
  approxFormCount: number;
};

export function SetupForm({ current, programLabel, approxFormCount }: Props) {
  const [state, action, pending] = useActionState(setupTrainingSchedule, null);
  const [weekdays, setWeekdays] = useState<number[]>(current?.weekdays ?? [1, 3, 5]);
  const [duration, setDuration] = useState<4 | 8 | 12 | 24>(12);
  const [cadence, setCadence] = useState<1 | 2 | 4>(current?.cadence_weeks ?? 2);
  const [reps, setReps] = useState<number>(current?.reps_per_form ?? 3);

  const canSubmit = weekdays.length > 0;
  const endDate = new Date();
  endDate.setUTCDate(endDate.getUTCDate() + duration * 7);
  const endLabel = endDate.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });

  return (
    <form action={action} className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Programma attivo</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{programLabel}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Giorni di allenamento</CardTitle></CardHeader>
        <CardContent>
          <WeekdayChips value={weekdays} onChange={setWeekdays} />
          {weekdays.length === 0 && (
            <p className="text-muted-foreground mt-2 text-xs">Seleziona almeno un giorno.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Durata</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <DurationPicker value={duration} onChange={setDuration} />
          <p className="text-muted-foreground text-xs">Fino al {endLabel}.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Cadenza ripasso</CardTitle></CardHeader>
        <CardContent>
          <CadencePicker value={cadence} onChange={setCadence} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Ripetizioni per forma</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <RepsStepper value={reps} onChange={setReps} />
          <SessionPreview formCount={approxFormCount} reps={reps} />
        </CardContent>
      </Card>

      {state && "error" in state && (
        <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>
      )}

      <Button type="submit" className="w-full" disabled={pending || !canSubmit}>
        {pending ? "Salvataggio..." : "Genera sessioni"}
      </Button>
    </form>
  );
}
```

**Step 7: Verifica build**

Run `npm run build`. Expected: verde.

**Step 8: Commit**

```
git add skill-practice/src/components/sessions/
git commit -m "feat(sessions): componenti setup form (Weekday/Duration/Cadence/Reps/Preview/SetupForm)"
```

---

## Task 12: Pagina `/sessions/setup`

**Files:**
- Create: `skill-practice/src/app/(app)/sessions/setup/page.tsx`

**Step 1: Scrivere la pagina**

```tsx
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { getTrainingSchedule } from "@/lib/queries/training-schedule";
import { getUserPlanItems } from "@/lib/queries/plan";
import { SetupForm } from "@/components/sessions/SetupForm";

export default async function SetupPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const schedule = await getTrainingSchedule(profile.id);
  const sourceFilter = profile.plan_mode === "custom" ? "manual" : "exam_program";
  const items = await getUserPlanItems(profile.id, undefined, sourceFilter);

  const programLabel =
    profile.plan_mode === "custom"
      ? `Selezione personalizzata: ${items.length} forme`
      : `Programma esame attivo · ${items.length} forme`;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Sessioni di allenamento</h1>
        <p className="text-muted-foreground text-sm">
          Definisci giorni, durata e ripasso. Le sessioni vengono generate dal programma attivo.
        </p>
      </header>
      <SetupForm
        current={schedule}
        programLabel={programLabel}
        approxFormCount={Math.max(1, Math.min(items.length, 6))}
      />
    </div>
  );
}
```

**Step 2: Smoke test manuale**

```
cd skill-practice && npm run dev
```
Aprire `/sessions/setup`. Verificare che il form si carichi, i 5 pannelli siano interagibili, "Genera sessioni" mostri pending state.

**Step 3: Commit**

```
git add "skill-practice/src/app/(app)/sessions/setup/page.tsx"
git commit -m "feat(sessions): route /sessions/setup"
```

---

## Task 13: Aggiornare `TodayEmptyState` per i 3 stati

**Files:**
- Modify: `skill-practice/src/components/today/TodayEmptyState.tsx`

**Step 1: Sostituire il file**

```tsx
import Link from "next/link";
import { CalendarPlus, Library, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";

type Props = {
  reason: "no_schedule" | "expired" | "no_plan";
  customMode?: boolean;
};

export function TodayEmptyState({ reason, customMode = false }: Props) {
  if (reason === "no_schedule") {
    return (
      <EmptyState
        icon={<CalendarPlus className="h-10 w-10" />}
        title="Definisci le tue sessioni"
        description="Scegli giorni, durata e cadenza. Distribuiamo noi le forme sulle tue settimane."
        action={
          <Button asChild>
            <Link href="/sessions/setup">Definisci sessioni</Link>
          </Button>
        }
      />
    );
  }

  if (reason === "expired") {
    return (
      <EmptyState
        icon={<Sparkles className="h-10 w-10" />}
        title="Le tue sessioni sono terminate"
        description="Aggiorna durata e cadenza per ripartire."
        action={
          <Button asChild>
            <Link href="/sessions/setup">Rinnova sessioni</Link>
          </Button>
        }
      />
    );
  }

  if (customMode) {
    return (
      <EmptyState
        icon={<Library className="h-10 w-10" />}
        title="Nessuna forma selezionata"
        description="Apri la selezione libera e scegli forme e tecniche da praticare."
        action={
          <Button asChild>
            <Link href="/plan/custom">Apri selezione</Link>
          </Button>
        }
      />
    );
  }

  return (
    <EmptyState
      icon={<Library className="h-10 w-10" />}
      title="Nessun contenuto nel tuo piano"
      description="Attiva un programma esame oppure passa alla selezione libera."
      action={
        <Button asChild>
          <Link href="/plan/exam">Programma esame</Link>
        </Button>
      }
    />
  );
}
```

**Step 2: Verifica build**

Run `npm run build`. Expected: rompe (perché `today/page.tsx` usa la vecchia API). Lasciare rotto, sarà fixato in Task 15.

**Step 3: NON committare ancora** (lo committiamo insieme al Task 15 che rimette in piedi today).

---

## Task 14: Componente `RestDayCard`

**Files:**
- Create: `skill-practice/src/components/today/RestDayCard.tsx`

**Step 1: Scrivere il componente**

```tsx
import { Moon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  nextTrainingDate: string | null;
};

export function RestDayCard({ nextTrainingDate }: Props) {
  const label = nextTrainingDate
    ? new Date(`${nextTrainingDate}T00:00:00Z`).toLocaleDateString("it-IT", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Moon className="h-4 w-4" /> Giorno di riposo
        </CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">
        {label ? <p>Prossima sessione: {label}.</p> : <p>Nessuna sessione futura programmata.</p>}
      </CardContent>
    </Card>
  );
}
```

**Step 2: Build**

Build resta rotta dal Task 13. Continuare al Task 15.

---

## Task 15: Today integrato con schedule

**Files:**
- Modify: `skill-practice/src/app/(app)/today/page.tsx`

**Step 1: Riscrivere la pagina**

Sostituire interamente con:

```tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Flame, Repeat, Wrench } from "lucide-react";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { getUserPlanItems } from "@/lib/queries/plan";
import { getThisWeekLogs } from "@/lib/queries/practice-log";
import { getUnreadNewsCount } from "@/lib/queries/news";
import { getTrainingSchedule } from "@/lib/queries/training-schedule";
import { getScheduledSession } from "@/lib/session-scheduler";
import { localDateKey } from "@/lib/date";
import { TodaySkillCard } from "@/components/today/TodaySkillCard";
import { TodayEmptyState } from "@/components/today/TodayEmptyState";
import { RestDayCard } from "@/components/today/RestDayCard";
import { NewsBanner } from "@/components/news/NewsBanner";
import { Button } from "@/components/ui/button";
import { MetricStrip } from "@/components/shared/MetricStrip";
import { DISCIPLINE_LABELS } from "@/lib/labels";
import { gradeLabelForDiscipline } from "@/lib/grades";

export default async function TodayPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const sourceFilter = profile.plan_mode === "custom" ? "manual" : "exam_program";
  const [items, logs, unreadNewsCount, schedule] = await Promise.all([
    getUserPlanItems(profile.id, undefined, sourceFilter),
    getThisWeekLogs(profile.id),
    getUnreadNewsCount(profile),
    getTrainingSchedule(profile.id),
  ]);

  const todayStr = localDateKey();
  const session = getScheduledSession(todayStr, schedule, items);

  // 1) No plan → empty state come prima
  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <NewsBanner unreadCount={unreadNewsCount} />
        <TodayEmptyState reason="no_plan" customMode={profile.plan_mode === "custom"} />
      </div>
    );
  }

  // 2) No schedule → CTA al setup
  if (session.kind === "no_schedule") {
    return (
      <div className="space-y-6">
        <NewsBanner unreadCount={unreadNewsCount} />
        <TodayEmptyState reason="no_schedule" />
      </div>
    );
  }

  // 3) Schedule scaduta → CTA al setup
  if (session.kind === "expired") {
    return (
      <div className="space-y-6">
        <NewsBanner unreadCount={unreadNewsCount} />
        <TodayEmptyState reason="expired" />
      </div>
    );
  }

  // 4) Riposo
  if (session.kind === "rest_day") {
    return (
      <div className="space-y-6">
        <NewsBanner unreadCount={unreadNewsCount} />
        <RestDayCard nextTrainingDate={session.nextTrainingDate} />
      </div>
    );
  }

  // 5) Training day
  const dailyItems = [...session.focus, ...session.review, ...session.maintenance];
  const dailyCount = dailyItems.length;
  const estimatedMinutes = Math.max(
    1,
    Math.round(
      dailyItems.reduce(
        (total, item) => total + (item.skill.estimated_duration_seconds ?? 180),
        0,
      ) / 60,
    ),
  );

  const doneTodaySkillIds = new Set(
    logs.filter((l) => l.date === todayStr && l.completed).map((l) => l.skill_id),
  );
  const repsByLog = new Map(
    logs.filter((l) => l.date === todayStr).map((l) => [l.skill_id, l]),
  );

  const dayName = new Date().toLocaleDateString("it-IT", { weekday: "long" });
  const weekDoneCount = new Set(logs.filter((l) => l.completed).map((l) => l.date)).size;

  return (
    <div className="space-y-6">
      <header className="material-bar sticky top-0 z-30 -mx-4 space-y-4 border-b border-border px-4 py-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-sm">Ciao {profile.display_name}</p>
            <h1 className="text-2xl font-semibold capitalize">Oggi - {dayName}</h1>
            <p className="text-muted-foreground text-sm">
              {DISCIPLINE_LABELS.shaolin}{" "}
              {gradeLabelForDiscipline("shaolin", profile.assigned_level_shaolin)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="icon" aria-label="Calendario sessioni">
              <Link href="/sessions/calendar"><CalendarDays className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/sessions/setup">Modifica sessioni</Link>
            </Button>
          </div>
        </div>

        <MetricStrip
          metrics={[
            { label: "Oggi", value: dailyCount },
            { label: "Tempo", value: `${estimatedMinutes}m` },
            { label: "Cadenza", value: cadenceLabel(schedule!.cadence_weeks) },
            { label: "Settimana", value: weekDoneCount },
          ]}
        />
      </header>

      <NewsBanner unreadCount={unreadNewsCount} />

      <div className="space-y-6">
        {session.focus.length > 0 && (
          <Section icon={<Flame className="text-primary h-4 w-4" />} title="Focus">
            {session.focus.map((it) => (
              <TodaySkillCard
                key={it.id}
                skill={it.skill}
                status={it.status}
                alreadyDoneToday={doneTodaySkillIds.has(it.skill.id)}
                repsTarget={schedule!.reps_per_form}
                repsDone={repsByLog.get(it.skill.id)?.reps_done ?? 0}
              />
            ))}
          </Section>
        )}
        {session.review.length > 0 && (
          <Section icon={<Repeat className="h-4 w-4 text-[var(--status-warning)]" />} title="Ripasso">
            {session.review.map((it) => (
              <TodaySkillCard
                key={it.id}
                skill={it.skill}
                status={it.status}
                alreadyDoneToday={doneTodaySkillIds.has(it.skill.id)}
                repsTarget={schedule!.reps_per_form}
                repsDone={repsByLog.get(it.skill.id)?.reps_done ?? 0}
              />
            ))}
          </Section>
        )}
        {session.maintenance.length > 0 && (
          <Section icon={<Wrench className="text-muted-foreground h-4 w-4" />} title="Mantenimento">
            {session.maintenance.map((it) => (
              <TodaySkillCard
                key={it.id}
                skill={it.skill}
                status={it.status}
                alreadyDoneToday={doneTodaySkillIds.has(it.skill.id)}
                repsTarget={schedule!.reps_per_form}
                repsDone={repsByLog.get(it.skill.id)?.reps_done ?? 0}
              />
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 font-medium">{icon}{title}</h2>
      {children}
    </section>
  );
}

function cadenceLabel(weeks: number): string {
  if (weeks === 1) return "1 sett";
  if (weeks === 2) return "2 sett";
  return "1 mese";
}
```

Note:
- `repsTarget`/`repsDone` sono passati al `TodaySkillCard` ma il componente sarà esteso al Task 17. Per ora la build potrebbe rompere su props non riconosciute — lo prevediamo.
- Disciplina filter rimosso temporaneamente (era basato su `searchParams`); se in seguito serve, riaggiungerlo passando `discipline` a `getUserPlanItems`.

**Step 2: Verifica build**

Run `npm run build`. Expected: build potrebbe lamentare props non note di `TodaySkillCard`. È accettabile fino al Task 17. Se proprio rompe il deploy locale: temporaneamente non passare `repsTarget`/`repsDone`, li riaggiungiamo al Task 17.

**Step 3: Commit (incluso Task 13 e 14)**

```
git add skill-practice/src/components/today/TodayEmptyState.tsx \
        skill-practice/src/components/today/RestDayCard.tsx \
        "skill-practice/src/app/(app)/today/page.tsx"
git commit -m "feat(today): branca empty/expired/rest_day/training su training_schedule"
```

---

## Task 16: Action `incrementRep`/`decrementRep`

**Files:**
- Modify: `skill-practice/src/lib/actions/practice.ts`
- Create: `skill-practice/src/components/today/RepsCounter.tsx`

**Step 1: Leggere `practice.ts`** per allinearsi alle convenzioni esistenti.

```
cat skill-practice/src/lib/actions/practice.ts
```

**Step 2: Aggiungere le action**

Append a `practice.ts` (o sostituire `markPracticeDone` se più semplice e backward-compatible):

```ts
"use server";

// ... (manteniamo l'action esistente markPracticeDone per fallback)

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function incrementRep(skillId: string, dateKey: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return { error: "Non autenticato" };

  // Leggi schedule per il target di ripetizioni
  const { data: schedule } = await supabase
    .from("training_schedule")
    .select("reps_per_form")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  const target = schedule?.reps_per_form ?? 1;

  // Upsert atomico via RPC (richiede funzione SQL) oppure check-then-insert.
  // Usiamo check-then-insert/update — RLS garantisce ownership.
  const { data: existing } = await supabase
    .from("practice_logs")
    .select("id, reps_done, reps_target")
    .eq("user_id", auth.user.id)
    .eq("skill_id", skillId)
    .eq("date", dateKey)
    .maybeSingle();

  if (existing) {
    const newDone = Math.min((existing.reps_done ?? 0) + 1, existing.reps_target ?? target);
    await supabase
      .from("practice_logs")
      .update({
        reps_done: newDone,
        completed: newDone >= (existing.reps_target ?? target),
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("practice_logs").insert({
      user_id: auth.user.id,
      skill_id: skillId,
      date: dateKey,
      reps_target: target,
      reps_done: 1,
      completed: 1 >= target,
    });
  }

  await supabase
    .from("user_plan_items")
    .update({ last_practiced_at: new Date().toISOString() })
    .eq("user_id", auth.user.id)
    .eq("skill_id", skillId);

  revalidatePath("/today");
  return { success: true as const };
}

export async function decrementRep(skillId: string, dateKey: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return { error: "Non autenticato" };

  const { data: existing } = await supabase
    .from("practice_logs")
    .select("id, reps_done, reps_target")
    .eq("user_id", auth.user.id)
    .eq("skill_id", skillId)
    .eq("date", dateKey)
    .maybeSingle();

  if (!existing) return { success: true as const };

  const newDone = Math.max(0, (existing.reps_done ?? 0) - 1);
  await supabase
    .from("practice_logs")
    .update({
      reps_done: newDone,
      completed: existing.reps_target !== null && newDone >= existing.reps_target,
    })
    .eq("id", existing.id);

  revalidatePath("/today");
  return { success: true as const };
}
```

**Step 3: `RepsCounter.tsx`**

```tsx
"use client";

import { useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { incrementRep, decrementRep } from "@/lib/actions/practice";

type Props = {
  skillId: string;
  dateKey: string;
  repsDone: number;
  repsTarget: number;
};

export function RepsCounter({ skillId, dateKey, repsDone, repsTarget }: Props) {
  const [pending, startTransition] = useTransition();
  const completed = repsDone >= repsTarget;

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="icon"
        variant="outline"
        disabled={pending || repsDone === 0}
        onClick={() => startTransition(() => { decrementRep(skillId, dateKey); })}
        aria-label="Annulla ripetizione"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="min-w-12 text-center text-sm tabular-nums">
        {repsDone} / {repsTarget}
      </span>
      <Button
        type="button"
        size="sm"
        disabled={pending || completed}
        onClick={() => startTransition(() => { incrementRep(skillId, dateKey); })}
      >
        <Plus className="mr-1 h-4 w-4" />
        {completed ? "Completata" : "Ripetizione"}
      </Button>
    </div>
  );
}
```

**Step 4: Verifica build**

Run `npm run build`. Expected: verde se `practice.ts` non ha collisioni.

**Step 5: Commit**

```
git add skill-practice/src/lib/actions/practice.ts skill-practice/src/components/today/RepsCounter.tsx
git commit -m "feat(today): incrementRep/decrementRep + RepsCounter"
```

---

## Task 17: Integrare `RepsCounter` in `TodaySkillCard`

**Files:**
- Modify: `skill-practice/src/components/today/TodaySkillCard.tsx`

**Step 1: Leggere il file esistente**

```
cat skill-practice/src/components/today/TodaySkillCard.tsx
```

**Step 2: Aggiungere props opzionali**

Aggiungere alle Props:
```ts
repsTarget?: number;
repsDone?: number;
```

Sostituire il bottone "Fatto" con:
```tsx
{typeof repsTarget === "number" && typeof repsDone === "number" ? (
  <RepsCounter
    skillId={skill.id}
    dateKey={localDateKey()}
    repsDone={repsDone}
    repsTarget={repsTarget}
  />
) : (
  /* fallback al PracticeCheckButton esistente */
)}
```

Importare `RepsCounter` e `localDateKey` se non già presenti.

**Step 3: Verifica build**

Run `npm run build`. Expected: verde.

**Step 4: Smoke test manuale**

`npm run dev`, andare su `/today` con uno schedule attivo: vedere counter `0/3`, tap → 1/3, ripetere fino a "Completata", tap "−" decrementa.

**Step 5: Commit**

```
git add skill-practice/src/components/today/TodaySkillCard.tsx
git commit -m "feat(today): TodaySkillCard usa RepsCounter quando reps_target è presente"
```

---

## Task 18: Componenti calendario

**Files:**
- Create: `skill-practice/src/components/sessions/CalendarMonth.tsx`
- Create: `skill-practice/src/components/sessions/SessionDetailSheet.tsx`

**Step 1: `CalendarMonth.tsx`** (Server Component, riceve dati pre-computati)

```tsx
import { Moon, Dumbbell } from "lucide-react";
import type { ScheduledSession } from "@/lib/session-scheduler";

type Row = { date: string; session: ScheduledSession };
type Props = { monthLabel: string; rows: Row[] };

export function CalendarMonth({ monthLabel, rows }: Props) {
  return (
    <section className="space-y-2">
      <h3 className="text-muted-foreground sticky top-16 bg-background py-1 text-xs font-medium uppercase tracking-wide">
        {monthLabel}
      </h3>
      <ul className="border-border divide-y divide-border rounded-lg border">
        {rows.map((row) => (
          <CalendarRow key={row.date} row={row} />
        ))}
      </ul>
    </section>
  );
}

function CalendarRow({ row }: { row: Row }) {
  const date = new Date(`${row.date}T00:00:00Z`);
  const label = date.toLocaleDateString("it-IT", { weekday: "short", day: "numeric" });
  const isTraining = row.session.kind === "training";
  const formCount = isTraining
    ? row.session.focus.length + row.session.review.length + row.session.maintenance.length
    : 0;
  return (
    <li className="flex items-center justify-between px-3 py-2 text-sm">
      <span className="capitalize">{label}</span>
      {isTraining ? (
        <span className="flex items-center gap-2 text-foreground">
          <Dumbbell className="h-3.5 w-3.5" />
          {formCount} forme
        </span>
      ) : (
        <span className="text-muted-foreground flex items-center gap-2">
          <Moon className="h-3.5 w-3.5" />
          riposo
        </span>
      )}
    </li>
  );
}
```

(Il `SessionDetailSheet` lo aggiungiamo solo se necessario — per il primo cut, niente drill-down. Skippabile per evitare over-engineering. Annotato in design §4.5 ma non bloccante.)

**Step 2: Build**

Run `npm run build`. Expected: verde.

**Step 3: Commit**

```
git add skill-practice/src/components/sessions/CalendarMonth.tsx
git commit -m "feat(sessions): CalendarMonth (lista training/riposo per mese)"
```

---

## Task 19: Pagina `/sessions/calendar`

**Files:**
- Create: `skill-practice/src/app/(app)/sessions/calendar/page.tsx`

**Step 1: Scrivere la pagina**

```tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { Pencil } from "lucide-react";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { getTrainingSchedule } from "@/lib/queries/training-schedule";
import { getUserPlanItems } from "@/lib/queries/plan";
import { listSessionsInRange } from "@/lib/session-scheduler";
import { localDateKey } from "@/lib/date";
import { CalendarMonth } from "@/components/sessions/CalendarMonth";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function CalendarPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const [schedule, items] = await Promise.all([
    getTrainingSchedule(profile.id),
    getUserPlanItems(
      profile.id,
      undefined,
      profile.plan_mode === "custom" ? "manual" : "exam_program",
    ),
  ]);

  if (!schedule) {
    return (
      <EmptyState
        title="Nessuna sessione programmata"
        description="Definisci prima i giorni e la durata."
        action={
          <Button asChild>
            <Link href="/sessions/setup">Definisci sessioni</Link>
          </Button>
        }
      />
    );
  }

  const today = localDateKey();
  const from = today < schedule.start_date ? schedule.start_date : today;
  const rows = listSessionsInRange(from, schedule.end_date, schedule, items);
  const monthGroups = groupByMonth(rows);

  const totalSessions = rows.filter((r) => r.session.kind === "training").length;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Calendario sessioni</h1>
            <p className="text-muted-foreground text-sm">
              Dal {fmtDate(from)} al {fmtDate(schedule.end_date)} · {totalSessions} sessioni
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/sessions/setup"><Pencil className="mr-2 h-3.5 w-3.5" />Modifica</Link>
          </Button>
        </div>
      </header>

      <div className="space-y-6">
        {monthGroups.map((group) => (
          <CalendarMonth key={group.label} monthLabel={group.label} rows={group.rows} />
        ))}
      </div>
    </div>
  );
}

function groupByMonth(rows: Array<{ date: string; session: import("@/lib/session-scheduler").ScheduledSession }>) {
  const groups = new Map<string, typeof rows>();
  for (const row of rows) {
    const key = row.date.slice(0, 7); // YYYY-MM
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }
  return Array.from(groups.entries()).map(([key, rows]) => ({
    label: new Date(`${key}-01T00:00:00Z`).toLocaleDateString("it-IT", { month: "long", year: "numeric" }),
    rows,
  }));
}

function fmtDate(d: string): string {
  return new Date(`${d}T00:00:00Z`).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}
```

**Step 2: Smoke test manuale**

`/sessions/calendar` con uno schedule attivo: vedere lista per mesi, training/riposo correttamente etichettati, header con count totale corretto.

**Step 3: Commit**

```
git add "skill-practice/src/app/(app)/sessions/calendar/page.tsx"
git commit -m "feat(sessions): route /sessions/calendar"
```

---

## Task 20: Link da Profilo

**Files:**
- Modify: `skill-practice/src/app/(app)/profile/page.tsx`

**Step 1: Leggere il file esistente**

```
cat "skill-practice/src/app/(app)/profile/page.tsx"
```

**Step 2: Aggiungere una sezione "Allenamento"**

Sotto le sezioni esistenti, aggiungere una `Card` con due link:

```tsx
import { CalendarDays, CalendarPlus } from "lucide-react";

// ... dentro il return:

<Card>
  <CardHeader><CardTitle className="text-base">Allenamento</CardTitle></CardHeader>
  <CardContent className="space-y-2">
    <Button asChild variant="outline" className="w-full justify-start">
      <Link href="/sessions/setup">
        <CalendarPlus className="mr-2 h-4 w-4" />
        Modifica sessioni
      </Link>
    </Button>
    <Button asChild variant="outline" className="w-full justify-start">
      <Link href="/sessions/calendar">
        <CalendarDays className="mr-2 h-4 w-4" />
        Calendario sessioni
      </Link>
    </Button>
  </CardContent>
</Card>
```

**Step 3: Build + smoke**

Run `npm run build`. Expected: verde. Aprire `/profile`, verificare i due link funzionino.

**Step 4: Commit**

```
git add "skill-practice/src/app/(app)/profile/page.tsx"
git commit -m "feat(profile): link a setup e calendario sessioni"
```

---

## Task 21: Edge case + verifica finale

**Files:**
- Vari (solo se emergono regressioni)

**Step 1: Checklist scenari**

Ognuno deve funzionare in `npm run dev`:

1. **Utente nuovo, nessuno schedule** → `/today` mostra `TodayEmptyState reason=no_schedule`. Click → `/sessions/setup`.
2. **Setup con tutti i campi default + pochi giorni selezionati** → submit → redirect `/today`, vedere training day o rest day a seconda di oggi.
3. **Setup con 0 giorni selezionati** → bottone disabled lato client + errore lato server se bypassato.
4. **Schedule attiva, oggi è weekday del piano** → sessione popolata con focus + review + maintenance distribuiti.
5. **Schedule attiva, oggi NON è weekday del piano** → `RestDayCard` con `nextTrainingDate` corretto.
6. **Schedule scaduta** (forzare `end_date < today` da Supabase dashboard, oppure attendere la data) → `TodayEmptyState reason=expired`.
7. **Reps counter**: 0/3 → tap "+1" tre volte → "Completata". Tap "−": decrementa, riabilita "+1".
8. **Calendario**: `/sessions/calendar` mostra tutti i giorni da oggi a `end_date`, raggruppati per mese, training vs riposo correttamente etichettati.
9. **Plan attivo cambiato**: l'utente cambia da `exam` a `custom` dopo aver creato uno schedule → Today mostra le forme del nuovo plan filtro `manual`. Schedule resta valido (non si rigenera). Se non ci sono manual items → empty state `no_plan` (priorità su `no_schedule`).
10. **Cambio gradi**: l'utente promuove il proprio livello shaolin → il piano esame si rigenera (logica esistente in `activate_exam_mode`), schedule resta valido.

**Step 2: Lint + build finali**

```
cd skill-practice && npm run lint && npm run build
```
Expected: entrambi verdi.

**Step 3: Test session-scheduler completi**

```
cd skill-practice && npm test
```
Expected: tutti i test passano (inclusi i nuovi di `session-scheduler.test.ts`). Nota: il `package.json` del progetto elenca esplicitamente i file di test in `npm test` — aggiornare lo script per includere `session-scheduler.test.ts`:

In `skill-practice/package.json` cambiare:
```json
"test": "node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test --test-isolation=none src/lib/youtube.test.ts src/lib/practice-logic.test.ts src/lib/progress-logic.test.ts src/lib/session-scheduler.test.ts"
```

**Step 4: Commit**

```
git add skill-practice/package.json
git commit -m "chore: registra session-scheduler.test.ts in npm test"
```

---

## Task 22: Aggiornare `plan/current-plan.md`

**Files:**
- Modify: `plan/current-plan.md`

**Step 1: Editare le sezioni elencate nel design §8**

- §4.2 — aggiungere `TrainingSchedule` ai tipi dinamici, estendere `PracticeLog` con `reps_target: number | null` e `reps_done: number`.
- §5 — aggiungere `(app)/sessions/setup/`, `(app)/sessions/calendar/`, `components/sessions/`.
- §6 — nuovo §6.4 "Schedulazione sessioni":
  > Quando l'utente completa il setup, una riga in `training_schedule` definisce giorni, durata, cadenza e ripetizioni. La funzione pura `getScheduledSession(date, schedule, items)` distribuisce le forme: focus ogni sessione, review/maintenance via bucket deterministico (cycle = `cadence_weeks * weekdays.length`, maintenance = doppio). Vedi `plan/2026-04-26-training-schedule-design.md` per i dettagli.
- §7.2 — sostituire il wireframe di Today con uno aggiornato che include il counter `2/3` per le ripetizioni e annotare il nuovo header "Modifica sessioni" + icona calendario.
- §9 — aggiungere alla lista degli sprint operativi:
  > **1.9 — Schedulazione sessioni:** `0012_training_schedule.sql`, route `/sessions/setup` e `/sessions/calendar`, algoritmo `lib/session-scheduler.ts`, reps tracking su `practice_logs`. Design: `plan/2026-04-26-training-schedule-design.md`.

**Step 2: Commit**

```
git add plan/current-plan.md
git commit -m "docs(plan): registra Sprint 1.9 (schedulazione sessioni)"
```

---

## Out-of-scope (esplicito)

Non fare in questa esecuzione:

- Materializzazione delle sessioni in DB (approccio 1).
- Editing per-singola-sessione (sposta forme, salta giorno, note di sessione).
- Notifiche push o reminder.
- Modifiche a `getTodayPractice` legacy (resta come fallback se `training_schedule == null` — di fatto non più usato in `today/page.tsx` ma ancora presente nel codice; rimozione futura).
- Drill-down sul calendario (`SessionDetailSheet` non implementato in questo cut).
- Filtro disciplina su Today (rimosso temporaneamente in Task 15 per semplicità — riaggiungerlo in un follow-up se serve).
- Dashboard di "completamento programma" su `/progress`.

## Verifica finale del piano

A lavoro completato:
- `npm run lint && npm run build && npm test` tutti verdi.
- `git log --oneline` mostra ~22 commit atomici (uno per task).
- `plan/current-plan.md` aggiornato con Sprint 1.9.
