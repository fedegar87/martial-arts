import { addDaysToDateKey } from "./date.ts";
import type { ScheduledSession, ItemWithSkill } from "./session-scheduler.ts";
import type {
  FreePracticeItem,
  JournalDayView,
  JournalSkill,
  PracticeLog,
  ScheduledPracticeItem,
} from "./types.ts";

type CalendarRow = { date: string; session: ScheduledSession };
type TrainingSession = Extract<ScheduledSession, { kind: "training" }>;

type BuildJournalDayViewInput = {
  row: CalendarRow | null;
  logs: PracticeLog[];
  skillById: Map<string, JournalSkill>;
  todayKey: string;
  repsPerForm: number;
  hasSchedule: boolean;
  scheduleStart: string | null;
  scheduleEnd: string | null;
};

type BuildJournalDayViewsInRangeInput = Omit<
  BuildJournalDayViewInput,
  "row" | "logs"
> & {
  rows: CalendarRow[];
  logs: PracticeLog[];
};

export type CategorizedDayLogs = {
  scheduledLogs: Map<string, PracticeLog>;
  freePracticeLogs: PracticeLog[];
};

export function buildJournalDayView(
  date: string,
  {
    row,
    logs,
    skillById,
    todayKey,
    repsPerForm,
    hasSchedule,
    scheduleStart,
    scheduleEnd,
  }: BuildJournalDayViewInput,
): JournalDayView {
  const session = row?.session ?? { kind: "no_schedule" as const };
  const isFuture = date > todayKey;
  const canToggle = !isFuture;
  const scheduledItems = session.kind === "training" ? trainingItems(session) : [];
  const scheduledSkillIds = new Set(
    scheduledItems.map((item) => item.skill_id),
  );
  const { scheduledLogs, freePracticeLogs } = categorizeLogsForDay({
    scheduledSkillIds,
    logs: logs.filter(isMeaningfulLog),
  });

  return {
    date,
    isFuture,
    hasSchedule,
    isInScheduleRange:
      scheduleStart !== null &&
      scheduleEnd !== null &&
      date >= scheduleStart &&
      date <= scheduleEnd,
    canToggle,
    sessionKind: session.kind,
    sessionIndex: session.kind === "training" ? session.sessionIndex : null,
    nextTrainingDate: session.kind === "rest_day" ? session.nextTrainingDate : null,
    scheduleEndDate: session.kind === "expired" ? session.endDate : null,
    repsPerForm,
    scheduled: scheduledItems.map((item) =>
      toScheduledPracticeItem({
        item,
        log: scheduledLogs.get(item.skill_id) ?? null,
        repsPerForm,
        canToggle,
      }),
    ),
    freePractice: freePracticeLogs
      .map((log) => toFreePracticeItem({ log, skill: skillById.get(log.skill_id), canToggle }))
      .filter((item): item is FreePracticeItem => item !== null),
    events: [],
  };
}

export function buildJournalDayViewsInRange(
  from: string,
  to: string,
  input: BuildJournalDayViewsInRangeInput,
): JournalDayView[] {
  const rowsByDate = new Map(input.rows.map((row) => [row.date, row]));
  const logsByDate = groupLogsByDate(input.logs);
  const days: JournalDayView[] = [];

  let current = from;
  while (current <= to) {
    days.push(
      buildJournalDayView(current, {
        ...input,
        row: rowsByDate.get(current) ?? null,
        logs: logsByDate.get(current) ?? [],
      }),
    );
    current = addDaysToDateKey(current, 1);
  }

  return days;
}

export function categorizeLogsForDay({
  scheduledSkillIds,
  logs,
}: {
  scheduledSkillIds: Set<string>;
  logs: PracticeLog[];
}): CategorizedDayLogs {
  const scheduledLogs = new Map<string, PracticeLog>();
  const freePracticeLogs: PracticeLog[] = [];

  for (const log of logs) {
    if (scheduledSkillIds.has(log.skill_id)) {
      scheduledLogs.set(log.skill_id, mergeLog(scheduledLogs.get(log.skill_id), log));
    } else {
      freePracticeLogs.push(log);
    }
  }

  return { scheduledLogs, freePracticeLogs };
}

export function isMeaningfulLog(log: PracticeLog): boolean {
  return (
    log.completed ||
    log.reps_done > 0 ||
    (log.personal_note?.trim().length ?? 0) > 0
  );
}

function trainingItems(session: TrainingSession): ItemWithSkill[] {
  return [...session.focus, ...session.maintenance];
}

function toScheduledPracticeItem({
  item,
  log,
  repsPerForm,
  canToggle,
}: {
  item: ItemWithSkill;
  log: PracticeLog | null;
  repsPerForm: number;
  canToggle: boolean;
}): ScheduledPracticeItem {
  const repsTarget = log?.reps_target ?? repsPerForm;
  const repsDone = log?.reps_done ?? 0;

  return {
    planItemId: item.id,
    skill: item.skill,
    status: item.status,
    log,
    done: Boolean(log?.completed),
    repsDone,
    repsTarget,
    canToggle,
  };
}

function toFreePracticeItem({
  log,
  skill,
  canToggle,
}: {
  log: PracticeLog;
  skill: JournalSkill | undefined;
  canToggle: boolean;
}): FreePracticeItem | null {
  if (!skill) return null;

  return {
    skill,
    log,
    done: log.completed,
    hasNote: (log.personal_note?.trim().length ?? 0) > 0,
    canToggle,
  };
}

function groupLogsByDate(logs: PracticeLog[]): Map<string, PracticeLog[]> {
  const out = new Map<string, PracticeLog[]>();
  for (const log of logs) {
    const group = out.get(log.date) ?? [];
    group.push(log);
    out.set(log.date, group);
  }
  return out;
}

function mergeLog(existing: PracticeLog | undefined, next: PracticeLog): PracticeLog {
  if (!existing) return next;
  return {
    ...next,
    completed: existing.completed || next.completed,
    reps_done: Math.max(existing.reps_done, next.reps_done),
    reps_target: existing.reps_target ?? next.reps_target,
    personal_note: existing.personal_note ?? next.personal_note,
  };
}
