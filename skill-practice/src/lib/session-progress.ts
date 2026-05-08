import type { ScheduledSession } from "./session-scheduler";
import type { PracticeLog, SkillCategory } from "./types";
import { localDateKey } from "./date.ts";

export type SessionProgressStatus =
  | "future"
  | "not_started"
  | "partial"
  | "completed";

export type SessionProgressRow = {
  date: string;
  sessionNumber: number;
  exerciseCompleted: number;
  exerciseTotal: number;
  repsDone: number;
  repsTarget: number;
  focusCompleted: number;
  focusTotal: number;
  maintenanceCompleted: number;
  maintenanceTotal: number;
  status: SessionProgressStatus;
};

export type SessionPeriodProgress = {
  rows: SessionProgressRow[];
  sessionCompleted: number;
  sessionTotal: number;
  exerciseCompleted: number;
  exerciseTotal: number;
  repsDone: number;
  repsTarget: number;
  completionPercent: number;
};

type CalendarRow = { date: string; session: ScheduledSession };
type TrainingSession = Extract<ScheduledSession, { kind: "training" }>;
type TrainingCalendarRow = { date: string; session: TrainingSession };

type BuildSessionPeriodProgressInput = {
  rows: CalendarRow[];
  logs: PracticeLog[];
  from: string;
  to: string;
  repsPerForm: number;
  today?: Date;
};

type NormalizedLog = {
  completed: boolean;
  repsDone: number;
  repsTarget: number | null;
};

export function buildSessionPeriodProgress({
  rows,
  logs,
  from,
  to,
  repsPerForm,
  today = new Date(),
}: BuildSessionPeriodProgressInput): SessionPeriodProgress {
  const logsByDateAndSkill = groupLogsByDateAndSkill(logs);
  const todayKey = localDateKey(today);
  const progressRows = rows
    .filter(
      (row): row is TrainingCalendarRow =>
        row.date >= from &&
        row.date <= to &&
        isTrainingRow(row),
    )
    .map((row) =>
      buildSessionProgressRow(
        row,
        logsByDateAndSkill,
        repsPerForm,
        todayKey,
      ),
    );

  const exerciseCompleted = sum(progressRows, (row) => row.exerciseCompleted);
  const exerciseTotal = sum(progressRows, (row) => row.exerciseTotal);

  return {
    rows: progressRows,
    sessionCompleted: progressRows.filter((row) => row.status === "completed").length,
    sessionTotal: progressRows.length,
    exerciseCompleted,
    exerciseTotal,
    repsDone: sum(progressRows, (row) => row.repsDone),
    repsTarget: sum(progressRows, (row) => row.repsTarget),
    completionPercent:
      exerciseTotal > 0 ? Math.round((exerciseCompleted / exerciseTotal) * 100) : 0,
  };
}

function buildSessionProgressRow(
  row: TrainingCalendarRow,
  logsByDateAndSkill: Map<string, NormalizedLog>,
  repsPerForm: number,
  todayKey: string,
): SessionProgressRow {
  const focusStats = countCompleted(row.date, row.session.focus, logsByDateAndSkill);
  const maintenanceStats = countCompleted(
    row.date,
    row.session.maintenance,
    logsByDateAndSkill,
  );
  const allItems = [...row.session.focus, ...row.session.maintenance];
  const formItems = allItems.filter((item) => isFormCategory(item.skill.category));
  const repsStats = formItems.reduce(
    (acc, item) => {
      const log = logsByDateAndSkill.get(logKey(row.date, item.skill_id));
      const target = log?.repsTarget ?? repsPerForm;
      return {
        done: acc.done + Math.min(log?.repsDone ?? 0, target),
        target: acc.target + target,
      };
    },
    { done: 0, target: 0 },
  );
  const exerciseCompleted = focusStats.completed + maintenanceStats.completed;
  const exerciseTotal = allItems.length;

  return {
    date: row.date,
    sessionNumber: row.session.sessionIndex + 1,
    exerciseCompleted,
    exerciseTotal,
    repsDone: repsStats.done,
    repsTarget: repsStats.target,
    focusCompleted: focusStats.completed,
    focusTotal: row.session.focus.length,
    maintenanceCompleted: maintenanceStats.completed,
    maintenanceTotal: row.session.maintenance.length,
    status: sessionStatus({
      date: row.date,
      todayKey,
      exerciseCompleted,
      exerciseTotal,
      repsDone: repsStats.done,
    }),
  };
}

function countCompleted(
  date: string,
  items: TrainingSession["focus"],
  logsByDateAndSkill: Map<string, NormalizedLog>,
): { completed: number } {
  return {
    completed: items.filter((item) => {
      const log = logsByDateAndSkill.get(logKey(date, item.skill_id));
      return Boolean(log?.completed);
    }).length,
  };
}

function groupLogsByDateAndSkill(logs: PracticeLog[]): Map<string, NormalizedLog> {
  const out = new Map<string, NormalizedLog>();
  for (const log of logs) {
    const key = logKey(log.date, log.skill_id);
    const current = out.get(key);
    out.set(key, {
      completed: Boolean(current?.completed || log.completed),
      repsDone: Math.max(current?.repsDone ?? 0, log.reps_done ?? 0),
      repsTarget: current?.repsTarget ?? log.reps_target ?? null,
    });
  }
  return out;
}

function isTrainingRow(row: CalendarRow): row is TrainingCalendarRow {
  return row.session.kind === "training";
}

function sessionStatus({
  date,
  todayKey,
  exerciseCompleted,
  exerciseTotal,
  repsDone,
}: {
  date: string;
  todayKey: string;
  exerciseCompleted: number;
  exerciseTotal: number;
  repsDone: number;
}): SessionProgressStatus {
  if (exerciseTotal > 0 && exerciseCompleted >= exerciseTotal) return "completed";
  if (exerciseCompleted > 0 || repsDone > 0) return "partial";
  if (date > todayKey) return "future";
  return "not_started";
}

function isFormCategory(category: SkillCategory): boolean {
  return category === "forme" || category === "armi_forma";
}

function logKey(date: string, skillId: string): string {
  return `${date}:${skillId}`;
}

function sum<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((total, item) => total + selector(item), 0);
}
