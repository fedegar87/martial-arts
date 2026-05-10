import type { PracticeLog } from "./types";
import { addDaysToDateKey, localDateKey } from "./date.ts";
import type { SessionProgressStatus } from "./session-progress.ts";

export type PracticeDay = {
  date: string;
  practiced: boolean;
};

export type PracticeActivityLog = Pick<
  PracticeLog,
  "date" | "skill_id" | "completed" | "reps_done"
>;

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

export function isPracticeActivityLog(log: PracticeActivityLog): boolean {
  return log.completed || (log.reps_done ?? 0) > 0;
}

export function countPracticeDays(logs: PracticeActivityLog[]): number {
  return new Set(
    logs.filter(isPracticeActivityLog).map((log) => log.date),
  ).size;
}

export function computeCurrentStreakFromLogs(
  logs: PracticeActivityLog[],
  today = new Date(),
): number {
  const activeDates = activeDateSet(logs);
  const todayKey = localDateKey(today);
  let cursor = activeDates.has(todayKey) ? todayKey : addDaysToDateKey(todayKey, -1);

  let streak = 0;
  while (activeDates.has(cursor)) {
    streak += 1;
    cursor = addDaysToDateKey(cursor, -1);
  }
  return streak;
}

export type SessionRowForCount = {
  date: string;
  status: SessionProgressStatus;
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

function activeDateSet(logs: PracticeActivityLog[]): Set<string> {
  return new Set(
    logs.filter(isPracticeActivityLog).map((log) => log.date),
  );
}
