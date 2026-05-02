import type {
  Discipline,
  PlanMode,
  Skill,
  TrainingSchedule,
  UserPlanItem,
} from "./types";

const MAX_GAP_BETWEEN_TRAINING_DAYS = 7;
const ALL_DISCIPLINES: Discipline[] = ["shaolin", "taichi"];

export type ItemWithSkill = UserPlanItem & { skill: Skill };

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
  if (schedule == null) return { kind: "no_schedule" };

  if (date > schedule.end_date) {
    return { kind: "expired", endDate: schedule.end_date };
  }

  if (date < schedule.start_date) {
    return {
      kind: "rest_day",
      nextTrainingDate: findNextTrainingDate(addDays(schedule.start_date, -1), schedule),
    };
  }

  if (!schedule.weekdays.includes(isoWeekday(date))) {
    return {
      kind: "rest_day",
      nextTrainingDate: findNextTrainingDate(date, schedule),
    };
  }

  const sessionIndex =
    countTrainingDaysInclusive(schedule.start_date, date, schedule.weekdays) - 1;

  const focus = items
    .filter((i) => i.status === "focus")
    .sort((a, b) => a.skill.display_order - b.skill.display_order);

  const cycleSizeReview = schedule.cadence_weeks * schedule.weekdays.length;
  const review = bucket(
    items.filter((i) => i.status === "review"),
    sessionIndex,
    cycleSizeReview,
  );

  const cycleSizeMaintenance =
    schedule.cadence_weeks * 2 * schedule.weekdays.length;
  const maintenance = bucket(
    items.filter((i) => i.status === "maintenance"),
    sessionIndex,
    cycleSizeMaintenance,
  );

  return { kind: "training", sessionIndex, focus, review, maintenance };
}

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

export function getScheduledPlanItems(
  items: ItemWithSkill[],
  schedule: TrainingSchedule,
  planMode: PlanMode,
): ItemWithSkill[] {
  if (planMode !== "exam") return items;

  const allowedDisciplines = new Set(normalizeExamDisciplines(schedule));
  return items.filter((item) => allowedDisciplines.has(item.skill.discipline));
}

function normalizeExamDisciplines(schedule: TrainingSchedule): Discipline[] {
  const selected = schedule.exam_disciplines ?? ALL_DISCIPLINES;
  const unique = ALL_DISCIPLINES.filter((discipline) =>
    selected.includes(discipline),
  );
  return unique.length > 0 ? unique : ALL_DISCIPLINES;
}

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

function isoWeekday(dateStr: string): number {
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
  for (let offset = 1; offset <= MAX_GAP_BETWEEN_TRAINING_DAYS; offset++) {
    const candidate = addDays(fromExclusive, offset);
    if (candidate > schedule.end_date) return null;
    if (schedule.weekdays.includes(isoWeekday(candidate))) return candidate;
  }
  return null;
}

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
