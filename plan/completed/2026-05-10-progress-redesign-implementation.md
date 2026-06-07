# Progress Redesign - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Rifattorizzare `/progress` per mostrare solo 3 blocchi semplici (ciclo, storico, calendario binario), eliminando metriche secondarie e componenti curriculum/copertura piano.

**Architecture:** Solo lavoro lato Next.js (no schema changes). Si snellisce `progress-logic.ts`, si semplifica la shape di `getProgressData` in `queries/progress.ts`, si riducono i 3 componenti rimasti a 2 metriche secche, si eliminano componenti morti.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Supabase, `node:test` (test runner integrato), Tailwind, shadcn/ui.

**Design source of truth:** `plan/completed/2026-05-10-progress-redesign-design.md`.

---

## Convenzioni di lavoro

- Tutti i path sono relativi a `c:\martial-arts\skill-practice\` (la dir del progetto Next.js).
- Comandi shell vanno eseguiti dentro `skill-practice/`.
- Commit atomici, messaggio in italiano, no emoji.
- Ogni task termina con un commit. Non passare al task successivo se non hai committato.
- Verifica `npm test && npm run lint` dopo ogni task che tocca codice. Verifica `npm run build` solo nei task indicati per non rallentare.

---

## Task 0: Preflight - baseline verde

**Scopo:** assicurarsi che `npm test`, `npm run lint`, `npm run build` partano già verdi prima di toccare nulla. Se qualcosa è rosso ora, va sistemato (o segnalato all'utente) prima di proseguire.

**Files:** nessuno modificato.

**Step 1: Verificare working tree**

Run: `git status`
Expected: working tree pulito (le modifiche locali viste in apertura sono state committate o saranno gestite in Task 1). Se non lo è, fermarsi.

**Step 2: Run test suite**

Run: `cd skill-practice && npm test`
Expected: tutti i test passano.

**Step 3: Run lint**

Run: `cd skill-practice && npm run lint`
Expected: nessun errore (warning ammessi ma annotare).

**Step 4: Run build**

Run: `cd skill-practice && npm run build`
Expected: build completata con successo.

Se uno di questi fallisce, NON procedere. Riportare all'utente.

---

## Task 1: Resettare modifiche UI locali superate dal redesign

**Scopo:** I file `CurriculumMap.tsx`, `GeneralProgressSummary.tsx`, `PracticeCalendar.tsx` hanno modifiche locali (ritocchi label/legenda) che vengono superate dal redesign. Riportiamoli alla versione di `HEAD` per partire da una base pulita.

**Files:**
- Reset: `src/components/progress/CurriculumMap.tsx`
- Reset: `src/components/progress/GeneralProgressSummary.tsx`
- Reset: `src/components/progress/PracticeCalendar.tsx`

**Step 1: Verificare cosa c'è in working tree**

Run: `git status -- skill-practice/src/components/progress/`
Expected: vedere i 3 file modificati elencati.

**Step 2: Reset dei 3 file**

Run:
```bash
git checkout HEAD -- skill-practice/src/components/progress/CurriculumMap.tsx skill-practice/src/components/progress/GeneralProgressSummary.tsx skill-practice/src/components/progress/PracticeCalendar.tsx
```
Expected: il comando ritorna senza output, i file tornano alla versione HEAD.

**Step 3: Verificare working tree pulito**

Run: `git status`
Expected: "nothing to commit, working tree clean".

**Step 4: Niente commit qui** (era solo un reset).

---

## Task 2: Test rosso - `buildPracticeCalendar` restituisce `{date, practiced: boolean}`

**Scopo:** TDD per il cambio di shape di `PracticeDay`. Prima scriviamo il test, lo vediamo rosso, poi implementiamo.

**Files:**
- Modify: `src/lib/progress-logic.test.ts`

**Step 1: Aggiornare il test esistente "practice activity metrics count partial reps but not notes alone"**

Localizzare nel file (intorno a riga 162):

```ts
test("practice activity metrics count partial reps but not notes alone", () => {
  ...
  assert.deepEqual(calendar.slice(-2), [
    { date: "2026-04-21", count: 1 },
    { date: "2026-04-22", count: 1 },
  ]);
});
```

Sostituire l'assert finale con:

```ts
  assert.deepEqual(calendar.slice(-2), [
    { date: "2026-04-21", practiced: true },
    { date: "2026-04-22", practiced: true },
  ]);
```

**Step 2: Aggiungere un nuovo test che verifica un giorno senza pratica**

In coda al file (prima della funzione helper `function log(...)`), aggiungere:

```ts
test("practice calendar marks days without practice as practiced=false", () => {
  const today = new Date("2026-04-25T12:00:00.000Z");
  const calendar = buildPracticeCalendar([log("2026-04-25")], today);

  assert.equal(calendar.length, 90);
  assert.equal(calendar.at(-1)?.practiced, true);
  assert.equal(calendar.at(-2)?.practiced, false);
});
```

**Step 3: Run test, verificare ROSSO**

Run: `cd skill-practice && npm test`
Expected: i 2 test toccati falliscono perché `buildPracticeCalendar` ancora restituisce `{date, count}`.

**Step 4: Niente commit qui** (test ancora rossi).

---

## Task 3: Implementare nuovo `PracticeDay` binario

**Scopo:** Cambiare `PracticeDay` e `buildPracticeCalendar` per restituire `{date, practiced: boolean}`. Aggiornare i consumer interni per non rompere il build.

**Files:**
- Modify: `src/lib/progress-logic.ts`

**Step 1: Cambiare il tipo `PracticeDay`**

In `src/lib/progress-logic.ts`, riga ~16:

```ts
export type PracticeDay = {
  date: string;
  count: number;
};
```

Sostituire con:

```ts
export type PracticeDay = {
  date: string;
  practiced: boolean;
};
```

**Step 2: Riscrivere `buildPracticeCalendar`**

In `src/lib/progress-logic.ts`, riga ~139:

```ts
export function buildPracticeCalendar(
  logs: PracticeActivityLog[],
  today = new Date(),
): PracticeDay[] {
  const counts = new Map<string, number>();
  for (const log of logs) {
    if (!isPracticeActivityLog(log)) continue;
    counts.set(log.date, (counts.get(log.date) ?? 0) + 1);
  }

  return Array.from({ length: 90 }, (_, index) => {
    const key = addDaysToDateKey(localDateKey(today), -(89 - index));
    return { date: key, count: counts.get(key) ?? 0 };
  });
}
```

Sostituire con:

```ts
export function buildPracticeCalendar(
  logs: PracticeActivityLog[],
  today = new Date(),
): PracticeDay[] {
  const practicedDates = new Set(
    logs.filter(isPracticeActivityLog).map((log) => log.date),
  );

  return Array.from({ length: 90 }, (_, index) => {
    const key = addDaysToDateKey(localDateKey(today), -(89 - index));
    return { date: key, practiced: practicedDates.has(key) };
  });
}
```

**Step 3: Run test, verificare verde sui 2 toccati**

Run: `cd skill-practice && npm test`
Expected: i 2 test del Task 2 ora passano. Altri test su `computeCurrentStreak` / `computeBestStreak` (che usano `count`) potrebbero fallire — verranno gestiti nei task successivi rimuovendo quelle funzioni.

**Step 4: Verificare quali altri test falliscono**

Annotare l'output: probabilmente "practice calendar computes current and best streak" fallisce perché `computeCurrentStreak`/`computeBestStreak` legacy si appoggiano a `count`. Quei due helper li elimineremo nel Task 11; il test va aggiornato/rimosso lì.

**Step 5: Niente commit qui** (test ancora parzialmente rossi). Procedere con Task 4 senza fermarsi.

---

## Task 4: Aggiornare `PracticeCalendar.tsx` a render binario

**Scopo:** Componente UI riflette nuovo `PracticeDay`. Niente più gradiente di intensità, solo cella piena/vuota.

**Files:**
- Modify: `src/components/progress/PracticeCalendar.tsx`

**Step 1: Riscrivere il componente**

Sostituire l'intero contenuto del file con:

```tsx
import { CalendarDays } from "lucide-react";
import { SectionHeader } from "@/components/progress/SectionHeader";
import type { PracticeDay } from "@/lib/queries/progress";

type Props = {
  days: PracticeDay[];
};

export function PracticeCalendar({ days }: Props) {
  const weeks = buildWeeks(days);
  const practicedCount = days.filter((day) => day.practiced).length;

  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
      <SectionHeader
        icon={CalendarDays}
        title="Calendario pratica"
        right={<span className="text-xs text-muted-foreground">ultimi 90 giorni</span>}
      />
      <div className="grid grid-cols-[1.25rem_1fr] gap-2">
        <div className="grid grid-rows-7 gap-1 text-center text-[0.62rem] leading-none text-muted-foreground">
          {WEEKDAY_LABELS.map((label, index) => (
            <span key={`${label}-${index}`} className="flex items-center justify-center">
              {label}
            </span>
          ))}
        </div>
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
        >
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-rows-7 gap-1">
              {week.map((day, dayIndex) =>
                day ? (
                  <div
                    key={day.date}
                    title={`${formatDate(day.date)}: ${day.practiced ? "praticato" : "non praticato"}`}
                    aria-label={`${formatDate(day.date)}: ${day.practiced ? "praticato" : "non praticato"}`}
                    className={`aspect-square min-h-2 rounded-sm border ${cellStyle(day.practiced)}`}
                  />
                ) : (
                  <div
                    key={`blank-${weekIndex}-${dayIndex}`}
                    aria-hidden
                    className="aspect-square min-h-2 rounded-sm border border-transparent"
                  />
                ),
              )}
            </div>
          ))}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        {practicedCount} giorni con pratica negli ultimi 90.
      </p>
    </section>
  );
}

const WEEKDAY_LABELS = ["L", "M", "M", "G", "V", "S", "D"];

type CalendarCell = PracticeDay | null;

function buildWeeks(days: PracticeDay[]): CalendarCell[][] {
  const weeks: CalendarCell[][] = [];
  let currentWeek: CalendarCell[] = Array.from({ length: 7 }, () => null);

  for (const day of days) {
    const index = isoWeekday(day.date) - 1;
    if (index === 0 && currentWeek.some(Boolean)) {
      weeks.push(currentWeek);
      currentWeek = Array.from({ length: 7 }, () => null);
    }
    currentWeek[index] = day;
  }

  if (currentWeek.some(Boolean)) weeks.push(currentWeek);
  return weeks;
}

function isoWeekday(dateKey: string): number {
  const day = new Date(`${dateKey}T00:00:00Z`).getUTCDay();
  return day === 0 ? 7 : day;
}

function cellStyle(practiced: boolean): string {
  if (practiced) {
    return "border-[color:var(--status-success)] bg-[var(--status-success)]";
  }
  return "border-border/70 bg-background";
}

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
}
```

**Step 2: Niente commit ancora** — il build potrebbe rompersi finché non aggiorniamo la query nel Task 6.

---

## Task 5: Test rosso - helper `countRespectedSessionsUpTo`

**Scopo:** TDD per la nuova funzione che calcola "sessioni rispettate fino a una data". Sarà usata in `getActiveCycleProgress` per ottenere `respectedUntilToday` e `respectedTotal`.

**Files:**
- Modify: `src/lib/progress-logic.test.ts`

**Step 1: Aggiungere il test**

In coda al file (prima della funzione helper `function log(...)`), aggiungere:

```ts
test("countRespectedSessionsUpTo conta solo righe completed entro la data limite", () => {
  const rows = [
    { date: "2026-05-01", status: "completed" as const },
    { date: "2026-05-02", status: "partial" as const },
    { date: "2026-05-03", status: "completed" as const },
    { date: "2026-05-10", status: "completed" as const },
  ];

  assert.equal(countRespectedSessionsUpTo(rows, "2026-05-05"), 2);
  assert.equal(countRespectedSessionsUpTo(rows, "2026-05-10"), 3);
  assert.equal(countRespectedSessionsUpTo(rows, "2026-04-30"), 0);
});

test("countSessionsUpTo conta tutte le righe entro la data limite", () => {
  const rows = [
    { date: "2026-05-01", status: "completed" as const },
    { date: "2026-05-02", status: "partial" as const },
    { date: "2026-05-10", status: "not_started" as const },
  ];

  assert.equal(countSessionsUpTo(rows, "2026-05-05"), 2);
  assert.equal(countSessionsUpTo(rows, "2026-05-15"), 3);
});
```

**Step 2: Aggiornare l'import nel test**

In testa al file `progress-logic.test.ts` (riga ~3-15), aggiungere `countRespectedSessionsUpTo` e `countSessionsUpTo` all'import:

```ts
import {
  ...esistenti...,
  countRespectedSessionsUpTo,
  countSessionsUpTo,
} from "./progress-logic.ts";
```

**Step 3: Run test, verificare ROSSO**

Run: `cd skill-practice && npm test`
Expected: errori di import / "function not defined".

**Step 4: Niente commit ancora.**

---

## Task 6: Implementare `countRespectedSessionsUpTo` e `countSessionsUpTo`

**Files:**
- Modify: `src/lib/progress-logic.ts`

**Step 1: Aggiungere le due funzioni**

In coda al file (prima dell'helper `activeDateSet`), aggiungere:

```ts
export type SessionRowForCount = {
  date: string;
  status: "completed" | "partial" | "not_started" | "future";
};

export function countRespectedSessionsUpTo(
  rows: SessionRowForCount[],
  upToDate: string,
): number {
  return rows.filter((row) => row.date <= upToDate && row.status === "completed")
    .length;
}

export function countSessionsUpTo(
  rows: SessionRowForCount[],
  upToDate: string,
): number {
  return rows.filter((row) => row.date <= upToDate).length;
}
```

**Step 2: Run test, verificare i 2 nuovi test verdi**

Run: `cd skill-practice && npm test`
Expected: i 2 nuovi test passano. Altri potrebbero ancora fallire (gestiti nei task successivi).

**Step 3: Niente commit ancora.**

---

## Task 7: Semplificare `queries/progress.ts`

**Scopo:** ridurre `ProgressData` a `{ generalProgress, activeCycleProgress }` con le shape semplificate del design. Rimuovere query Supabase non più necessarie.

**Files:**
- Modify: `src/lib/queries/progress.ts`

**Step 1: Sostituire l'intero contenuto del file con:**

```ts
import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  buildPracticeCalendar,
  computeCurrentStreakFromLogs,
  countPracticeDays,
  countRespectedSessionsUpTo,
  countSessionsUpTo,
  type PracticeActivityLog,
  type PracticeDay,
} from "@/lib/progress-logic";
import {
  getScheduledPlanItems,
  listSessionsInRange,
  type ItemWithSkill,
} from "@/lib/session-scheduler";
import { buildSessionPeriodProgress } from "@/lib/session-progress";
import { addDaysToDateKey, localDateKey } from "@/lib/date";
import type { PracticeLog, TrainingSchedule, UserProfile } from "@/lib/types";

export type { PracticeDay } from "@/lib/progress-logic";

export type GeneralProgress = {
  practicedDaysTotal: number;
  currentStreak: number;
  calendar: PracticeDay[];
};

export type ActiveCycleProgress = {
  periodLabel: string;
  respectedUntilToday: number;
  dueUntilToday: number;
  respectedTotal: number;
  sessionTotal: number;
};

export type ProgressData = {
  generalProgress: GeneralProgress;
  activeCycleProgress: ActiveCycleProgress | null;
};

export async function getProgressData(
  userId: string,
  profile: UserProfile,
): Promise<ProgressData> {
  const supabase = await createClient();

  const [recentLogsResult, activityLogsResult, scheduleResult] = await Promise.all([
    supabase
      .from("practice_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("date", dateKeyDaysAgo(89))
      .order("date", { ascending: true }),
    supabase
      .from("practice_logs")
      .select("date, skill_id, completed, reps_done")
      .eq("user_id", userId)
      .order("date", { ascending: true }),
    supabase
      .from("training_schedule")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const recentLogs = expectData<PracticeLog[]>(recentLogsResult, "practice_logs recenti") ?? [];
  const activityLogs =
    expectData<PracticeActivityLog[]>(activityLogsResult, "practice_logs storici") ?? [];
  const schedule = expectMaybeData<TrainingSchedule>(scheduleResult, "training_schedule");

  return {
    generalProgress: {
      practicedDaysTotal: countPracticeDays(activityLogs),
      currentStreak: computeCurrentStreakFromLogs(activityLogs),
      calendar: buildPracticeCalendar(recentLogs),
    },
    activeCycleProgress: await getActiveCycleProgress({ userId, profile, schedule }),
  };
}

async function getActiveCycleProgress({
  userId,
  profile,
  schedule,
}: {
  userId: string;
  profile: UserProfile;
  schedule: TrainingSchedule | null;
}): Promise<ActiveCycleProgress | null> {
  const todayKey = localDateKey();
  if (!schedule || todayKey < schedule.start_date || todayKey > schedule.end_date) {
    return null;
  }

  const supabase = await createClient();
  const [logsResult, planItemsResult] = await Promise.all([
    supabase
      .from("practice_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("date", schedule.start_date)
      .lte("date", schedule.end_date)
      .order("date", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("user_plan_items")
      .select("*, skill:skills(*)")
      .eq("user_id", userId)
      .eq("is_hidden", false)
      .eq("source", profile.plan_mode === "custom" ? "manual" : "exam_program"),
  ]);

  const logs = expectData<PracticeLog[]>(logsResult, "practice_logs ciclo") ?? [];
  const planItems = (expectData<ItemWithSkill[]>(planItemsResult, "user_plan_items") ?? [])
    .filter((item) => item.skill);
  const scheduledItems = getScheduledPlanItems(planItems, schedule, profile.plan_mode);
  const rows = listSessionsInRange(
    schedule.start_date,
    schedule.end_date,
    schedule,
    scheduledItems,
  );
  const summary = buildSessionPeriodProgress({
    rows,
    logs,
    from: schedule.start_date,
    to: schedule.end_date,
    repsPerForm: schedule.reps_per_form,
  });

  const trainingRows = summary.rows.map((row) => ({ date: row.date, status: row.status }));

  return {
    periodLabel: `${fmtDate(schedule.start_date)} - ${fmtDate(schedule.end_date)}`,
    respectedUntilToday: countRespectedSessionsUpTo(trainingRows, todayKey),
    dueUntilToday: countSessionsUpTo(trainingRows, todayKey),
    respectedTotal: summary.sessionCompleted,
    sessionTotal: summary.sessionTotal,
  };
}

function dateKeyDaysAgo(days: number, today = new Date()): string {
  return addDaysToDateKey(localDateKey(today), -days);
}

function expectData<T>(
  result: { data: unknown; error: { message: string } | null },
  label: string,
): T | null {
  if (result.error) {
    throw new Error(`Errore nel caricamento di ${label}: ${result.error.message}`);
  }
  return result.data as T | null;
}

function expectMaybeData<T>(
  result: { data: unknown; error: { message: string; code?: string } | null },
  label: string,
): T | null {
  if (result.error) {
    throw new Error(`Errore nel caricamento di ${label}: ${result.error.message}`);
  }
  return result.data as T | null;
}

function fmtDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
}
```

**Step 2: NON eseguire build/lint ancora** — i componenti consumer (page, GeneralProgressSummary, ActiveCycleProgress) ancora usano la vecchia shape. Procedi a Task 8.

---

## Task 8: Aggiornare `GeneralProgressSummary.tsx`

**Files:**
- Modify: `src/components/progress/GeneralProgressSummary.tsx`

**Step 1: Sostituire l'intero contenuto**

```tsx
import { Activity } from "lucide-react";
import { MetricStrip } from "@/components/shared/MetricStrip";
import { SectionHeader } from "@/components/progress/SectionHeader";
import type { GeneralProgress } from "@/lib/queries/progress";

type Props = {
  progress: GeneralProgress;
};

export function GeneralProgressSummary({ progress }: Props) {
  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
      <SectionHeader icon={Activity} title="Statistiche generali" />
      <MetricStrip
        metrics={[
          { label: "Giorni di pratica", value: progress.practicedDaysTotal },
          { label: "Streak attuale", value: progress.currentStreak },
        ]}
      />
      <p className="text-xs text-muted-foreground">
        Conta qualsiasi pratica registrata, anche fuori dal ciclo.
      </p>
    </section>
  );
}
```

---

## Task 9: Aggiornare `ActiveCycleProgress.tsx`

**Files:**
- Modify: `src/components/progress/ActiveCycleProgress.tsx`

**Step 1: Sostituire l'intero contenuto**

```tsx
import { CalendarCheck2 } from "lucide-react";
import { MetricStrip } from "@/components/shared/MetricStrip";
import { SectionHeader } from "@/components/progress/SectionHeader";
import type { ActiveCycleProgress as ActiveCycleProgressData } from "@/lib/queries/progress";

type Props = {
  progress: ActiveCycleProgressData;
};

export function ActiveCycleProgress({ progress }: Props) {
  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
      <SectionHeader
        icon={CalendarCheck2}
        title="Ciclo sessioni attivo"
        right={<span className="text-xs text-muted-foreground">{progress.periodLabel}</span>}
      />
      <MetricStrip
        metrics={[
          {
            label: "Fino a oggi",
            value: `${progress.respectedUntilToday} / ${progress.dueUntilToday}`,
          },
          {
            label: "Totale ciclo",
            value: `${progress.respectedTotal} / ${progress.sessionTotal}`,
          },
        ]}
      />
    </section>
  );
}
```

---

## Task 10: Semplificare `progress/page.tsx`

**Files:**
- Modify: `src/app/(app)/progress/page.tsx`

**Step 1: Sostituire l'intero contenuto**

```tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { getProgressData } from "@/lib/queries/progress";
import { ActiveCycleProgress } from "@/components/progress/ActiveCycleProgress";
import { GeneralProgressSummary } from "@/components/progress/GeneralProgressSummary";
import { PracticeCalendar } from "@/components/progress/PracticeCalendar";
import { Button } from "@/components/ui/button";

export default async function ProgressPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const data = await getProgressData(profile.id, profile);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Progresso</h1>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/calendar">
            <CalendarDays className="mr-2 h-3.5 w-3.5" />
            Apri calendario
          </Link>
        </Button>
      </header>

      {data.activeCycleProgress && (
        <ActiveCycleProgress progress={data.activeCycleProgress} />
      )}
      <GeneralProgressSummary progress={data.generalProgress} />
      <PracticeCalendar days={data.generalProgress.calendar} />
    </div>
  );
}
```

**Step 2: Run build per validare la pipeline finora**

Run: `cd skill-practice && npm run build`
Expected: build passa. Se fallisce per import morti (es. `ProgressDisciplineSections` ancora referenziato da qualcosa), proseguire al Task 11 per pulire.

---

## Task 11: Eliminare componenti orfani

**Scopo:** rimuovere fisicamente i file dei componenti non più referenziati.

**Files:**
- Delete: `src/components/progress/ProgressDisciplineSections.tsx`
- Delete: `src/components/progress/CurriculumMap.tsx`
- Delete: `src/components/progress/PlanProgress.tsx`
- Delete: `src/components/progress/WeeklyReflectionCard.tsx`

**Step 1: Verificare che non siano importati da nessuna parte**

Run (uno per file):
```bash
grep -r "ProgressDisciplineSections" skill-practice/src
grep -r "CurriculumMap" skill-practice/src
grep -r "PlanProgress" skill-practice/src
grep -r "WeeklyReflectionCard" skill-practice/src
```
Expected: ogni grep trova solo il file stesso (la sua dichiarazione). Se trova altri import, fermarsi e capire.

**Step 2: Eliminare i 4 file**

Run:
```bash
rm skill-practice/src/components/progress/ProgressDisciplineSections.tsx skill-practice/src/components/progress/CurriculumMap.tsx skill-practice/src/components/progress/PlanProgress.tsx skill-practice/src/components/progress/WeeklyReflectionCard.tsx
```

**Step 3: Run build**

Run: `cd skill-practice && npm run build`
Expected: build passa.

---

## Task 12: Pulire dead code da `progress-logic.ts`

**Scopo:** rimuovere funzioni e tipi non più usati (rilevati da grep).

**Files:**
- Modify: `src/lib/progress-logic.ts`

**Step 1: Identificare cosa è ancora usato**

Run:
```bash
grep -rn "buildCurriculumCells\|computePlanProgress\|computeBestStreakFromLogs\|countPracticedSkills\|countGlobalFormReps\|computeBestStreak\|computeCurrentStreak\b\|activePlanSource\|CurriculumCell\|PlanProgressSummary\|dateDaysAgo\|toDateString" skill-practice/src
```
Expected: nessun risultato fuori da `progress-logic.ts` e `progress-logic.test.ts`. Se qualcuno è ancora usato altrove, NON rimuoverlo.

Probabili candidati alla rimozione (se grep conferma): tutti quelli sopra.

**Step 2: Rimuovere le funzioni e i tipi morti dal file**

In `progress-logic.ts`, rimuovere:
- type `CurriculumCell`
- type `PlanProgressSummary`
- type `ComputePlanProgressInput`
- function `activePlanSource` (se non usata altrove)
- function `buildCurriculumCells`
- function `computePlanProgress`
- function `computeBestStreakFromLogs`
- function `countPracticedSkills`
- function `countGlobalFormReps`
- function `computeCurrentStreak` (versione legacy che usa `count`)
- function `computeBestStreak` (versione legacy)
- function `dateDaysAgo` (se non usata altrove)
- function `toDateString` (se non usata altrove)
- function `statusMaturityScore` (helper interno)
- import non più usati: `Discipline`, `PlanItemSource`, `PlanMode`, `PlanStatus`, `Skill`

Rimangono:
- type `PracticeDay` (binario)
- type `PracticeActivityLog`
- type `SessionRowForCount`
- function `buildPracticeCalendar`
- function `isPracticeActivityLog`
- function `countPracticeDays`
- function `computeCurrentStreakFromLogs`
- function `countRespectedSessionsUpTo`
- function `countSessionsUpTo`
- helper interno `activeDateSet`
- import: `addDaysToDateKey`, `localDateKey` (e `PracticeLog` per `PracticeActivityLog`)

**Step 3: Run build per validare**

Run: `cd skill-practice && npm run build`
Expected: build passa.

---

## Task 13: Pulire test obsoleti

**Files:**
- Modify: `src/lib/progress-logic.test.ts`

**Step 1: Rimuovere i test che testano funzioni eliminate**

Eliminare dal file `progress-logic.test.ts`:
- `test("buildCurriculumCells marks future grades as locked", ...)`
- `test("buildCurriculumCells keeps active next-grade plan items unlocked", ...)`
- `test("activePlanSource follows the same active plan rule as the app", ...)`
- `test("computePlanProgress is not complete just because an exam plan exists", ...)`
- `test("computePlanProgress rewards recent practice and mature statuses", ...)`
- `test("computePlanProgress counts partial repetition logs as practice", ...)`
- `test("practice calendar computes current and best streak", ...)` (usa `computeCurrentStreak`/`computeBestStreak` legacy)
- `test("countGlobalFormReps sums all form repetition logs", ...)`
- in `test("historical streaks are computed from all practice activity logs", ...)`: rimuovere l'assert su `computeBestStreakFromLogs`, lasciare solo quello su `computeCurrentStreakFromLogs`

Rimuovere anche dagli import in testa al file le funzioni eliminate. Restano:
```ts
import {
  buildPracticeCalendar,
  computeCurrentStreakFromLogs,
  countPracticeDays,
  countRespectedSessionsUpTo,
  countSessionsUpTo,
} from "./progress-logic.ts";
import type { Skill } from "./types.ts";
```
(Anche `Skill` può sparire se nessun test rimasto lo usa — verificare.)

La funzione helper `function skill(...)` può essere rimossa se nessun test rimasto la chiama.

**Step 2: Run test**

Run: `cd skill-practice && npm test`
Expected: tutti i test rimasti passano.

---

## Task 14: Rimuovere helper `reflections` non più usati da `/progress`

**Scopo:** `getCurrentWeekReflection` e `shouldPromptWeeklyReflection` erano usati solo da `progress/page.tsx`. Verifichiamo e rimuoviamo se davvero orfani.

**Files:**
- Modify (probabile): `src/lib/queries/reflections.ts`

**Step 1: Verificare uso residuo**

Run:
```bash
grep -rn "getCurrentWeekReflection\|shouldPromptWeeklyReflection" skill-practice/src
```
Expected: nessuna occorrenza fuori da `lib/queries/reflections.ts`. Se ce ne sono, NON rimuovere.

**Step 2: Se orfani, rimuoverli da `reflections.ts`**

Aprire il file e rimuovere le due funzioni. Lasciare nel file il resto (potrebbe contenere altre query usate da actions o export route).

**Step 3: Run build**

Run: `cd skill-practice && npm run build`
Expected: build passa.

---

## Task 15: Verifica finale e commit unico

**Scopo:** verificare end-to-end che lint/test/build siano tutti verdi, poi committare l'intero refactor in un singolo commit (è una modifica coerente).

**Files:** tutti quelli modificati nei task 2–14.

**Step 1: Run test**

Run: `cd skill-practice && npm test`
Expected: verde.

**Step 2: Run lint**

Run: `cd skill-practice && npm run lint`
Expected: verde.

**Step 3: Run build**

Run: `cd skill-practice && npm run build`
Expected: verde.

**Step 4: Smoke test manuale (opzionale ma consigliato)**

Avviare `npm run dev` e aprire `/progress` in browser. Verificare:
- Header "Progresso" visibile
- Sezione "Ciclo sessioni attivo" visibile (se hai uno schedule attivo) con 2 metriche
- Sezione "Statistiche generali" con 2 metriche + nota
- Calendario binario con celle piene/vuote, conteggio "X giorni con pratica" sotto

Se hai uno schedule attivo, controllare a mano che `respectedUntilToday/dueUntilToday` corrispondano alle sessioni completate fino a oggi.

**Step 5: Verificare git status**

Run: `git status`
Expected: vedere modifiche su:
- `skill-practice/src/lib/progress-logic.ts`
- `skill-practice/src/lib/progress-logic.test.ts`
- `skill-practice/src/lib/queries/progress.ts`
- `skill-practice/src/lib/queries/reflections.ts` (se Task 14 ha modificato)
- `skill-practice/src/components/progress/GeneralProgressSummary.tsx`
- `skill-practice/src/components/progress/ActiveCycleProgress.tsx`
- `skill-practice/src/components/progress/PracticeCalendar.tsx`
- `skill-practice/src/app/(app)/progress/page.tsx`
- file deleted: `ProgressDisciplineSections.tsx`, `CurriculumMap.tsx`, `PlanProgress.tsx`, `WeeklyReflectionCard.tsx`

**Step 6: Commit**

Run:
```bash
git add skill-practice/src/lib/progress-logic.ts skill-practice/src/lib/progress-logic.test.ts skill-practice/src/lib/queries/progress.ts skill-practice/src/lib/queries/reflections.ts skill-practice/src/components/progress/ skill-practice/src/app/\(app\)/progress/page.tsx
```

Poi:
```bash
git commit -m "$(cat <<'EOF'
refactor(progress): semplifica /progress a 3 blocchi (ciclo, storico, calendario binario)

Rimuove curriculum, copertura esame e riflessione settimanale dalla pagina.
Storico generale ridotto a "giorni di pratica" + "streak attuale" calcolati
con la regola "almeno un esercizio praticato". Ciclo attivo ridotto a "fino
a oggi" + "totale ciclo" basati su sessioni completate al 100%. Calendario
diventa binario (praticato sì/no), allineato alla stessa regola dello storico.

Cancella componenti morti: ProgressDisciplineSections, CurriculumMap,
PlanProgress, WeeklyReflectionCard. Pulisce funzioni non più usate in
progress-logic.ts (computePlanProgress, buildCurriculumCells,
computeBestStreakFromLogs, countPracticedSkills, countGlobalFormReps,
computeCurrentStreak/computeBestStreak legacy basati su count).

Vedi plan/completed/2026-05-10-progress-redesign-design.md per il design.
EOF
)"
```

**Step 7: Verificare commit creato**

Run: `git log --oneline -1`
Expected: il nuovo commit in cima.

---

## Note finali

- Se durante l'esecuzione emerge che una funzione "morta" è in realtà usata altrove, NON rimuoverla: aggiornare il piano e documentare la deviazione nel commit message.
- Se uno smoke test manuale rivela un comportamento sbagliato (es. "fino a oggi" mostra numeri inattesi), aprire un sottotask di debug usando `superpowers:systematic-debugging`. Non patchare a caso.
- Schema DB intatto: zero migrations.
