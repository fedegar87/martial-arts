import type {
  Discipline,
  PlanMode,
  Skill,
  TrainingSchedule,
  UserPlanItem,
} from "./types";

const MAX_GAP_BETWEEN_TRAINING_DAYS = 7;
const ALL_DISCIPLINES: Discipline[] = ["shaolin", "taichi"];
const FOCUS_WEIGHT = 2;
const MAINTENANCE_WEIGHT = 1;

export type ItemWithSkill = UserPlanItem & { skill: Skill };

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
  const tokens = expandTokens(sortedItems, cycleSize);
  const slots = distributeTokensToSlots(tokens, cycleSize);

  const todays = slots[slotInCycle] ?? [];
  const focus = todays.filter((it) => it.status === "focus");
  const maintenance = todays.filter((it) => it.status === "maintenance");

  return { kind: "training", sessionIndex, focus, maintenance };
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
  const unique = ALL_DISCIPLINES.filter((d) => selected.includes(d));
  return unique.length > 0 ? unique : ALL_DISCIPLINES;
}

function expandTokens(items: ItemWithSkill[], slotCount: number): ItemWithSkill[] {
  const out: ItemWithSkill[] = [];
  for (const it of items) {
    const baseWeight = it.status === "focus" ? FOCUS_WEIGHT : MAINTENANCE_WEIGHT;
    const weight = Math.min(baseWeight, slotCount);
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
