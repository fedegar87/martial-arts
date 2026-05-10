import type {
  Discipline,
  PlanItemSource,
  PlanMode,
  PlanStatus,
  PracticeLog,
  Skill,
} from "./types";
import { addDaysToDateKey, dateKeyDaysAgo, localDateKey } from "./date.ts";

export type CurriculumCell = {
  skill: Skill;
  status: PlanStatus | "available" | "locked";
};

export type PracticeDay = {
  date: string;
  count: number;
};

export type PracticeActivityLog = Pick<
  PracticeLog,
  "date" | "skill_id" | "completed" | "reps_done"
>;

export type PlanProgressSummary = {
  discipline: Discipline;
  mode: PlanMode;
  title: string;
  readinessPercent: number;
  practicedRecent: number;
  practicedTotal: number;
  covered: number;
  total: number;
  missing: Skill[];
  statusCounts: Record<PlanStatus, number>;
};

type ComputePlanProgressInput = {
  discipline: Discipline;
  mode: PlanMode;
  title: string;
  requiredSkills: Skill[];
  planBySkillId: Map<string, PlanStatus>;
  logs: PracticeActivityLog[];
  today?: Date;
};

export function activePlanSource(planMode: PlanMode): PlanItemSource {
  return planMode === "custom" ? "manual" : "exam_program";
}

export function buildCurriculumCells(
  skills: Skill[],
  planBySkillId: Map<string, PlanStatus>,
  discipline: Discipline,
  userLevel: number,
): CurriculumCell[] {
  return skills
    .filter((skill) => skill.discipline === discipline)
    .map((skill) => ({
      skill,
      status:
        planBySkillId.get(skill.id) ??
        (userLevel !== 0 && skill.minimum_grade_value < userLevel
          ? "locked"
          : "available"),
    }));
}

export function computePlanProgress({
  discipline,
  mode,
  title,
  requiredSkills,
  planBySkillId,
  logs,
  today = new Date(),
}: ComputePlanProgressInput): PlanProgressSummary {
  const total = requiredSkills.length;
  const recentCutoff = dateDaysAgo(29, today);
  const requiredIds = new Set(requiredSkills.map((skill) => skill.id));
  const practicedLogs = logs.filter(
    (log) => isPracticeActivityLog(log) && requiredIds.has(log.skill_id),
  );
  const practicedSkillIds = new Set(practicedLogs.map((log) => log.skill_id));
  const recentPracticedSkillIds = new Set(
    practicedLogs
      .filter((log) => log.date >= recentCutoff)
      .map((log) => log.skill_id),
  );

  const statusCounts: Record<PlanStatus, number> = {
    focus: 0,
    maintenance: 0,
  };
  let maturityScore = 0;
  const covered: Skill[] = [];
  const missing: Skill[] = [];

  for (const skill of requiredSkills) {
    const status = planBySkillId.get(skill.id);
    if (!status) {
      missing.push(skill);
      continue;
    }

    covered.push(skill);
    statusCounts[status] += 1;
    maturityScore += statusMaturityScore(status);
  }

  const recentCoverage = total === 0 ? 0 : recentPracticedSkillIds.size / total;
  const statusMaturity = total === 0 ? 0 : maturityScore / total;
  const requirementPresence = total === 0 ? 0 : covered.length / total;

  return {
    discipline,
    mode,
    title,
    readinessPercent:
      total === 0
        ? 0
        : Math.round(
            (recentCoverage * 0.4 +
              statusMaturity * 0.4 +
              requirementPresence * 0.2) *
              100,
          ),
    practicedRecent: recentPracticedSkillIds.size,
    practicedTotal: practicedSkillIds.size,
    covered: covered.length,
    total,
    missing,
    statusCounts,
  };
}

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

export function countGlobalFormReps(
  skills: Array<Pick<Skill, "id" | "category">>,
  logs: Array<{ skill_id: string; reps_done: number | null }>,
): number {
  const formSkillIds = new Set(
    skills
      .filter((skill) => skill.category === "forme" || skill.category === "armi_forma")
      .map((skill) => skill.id),
  );

  return logs.reduce(
    (sum, log) =>
      formSkillIds.has(log.skill_id) ? sum + (log.reps_done ?? 0) : sum,
    0,
  );
}

export function isPracticeActivityLog(log: PracticeActivityLog): boolean {
  return log.completed || (log.reps_done ?? 0) > 0;
}

export function countPracticeDays(logs: PracticeActivityLog[]): number {
  return new Set(
    logs.filter(isPracticeActivityLog).map((log) => log.date),
  ).size;
}

export function countPracticedSkills(logs: PracticeActivityLog[]): number {
  return new Set(
    logs.filter(isPracticeActivityLog).map((log) => log.skill_id),
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

export function computeBestStreakFromLogs(logs: PracticeActivityLog[]): number {
  const dates = Array.from(activeDateSet(logs)).sort();
  if (dates.length === 0) return 0;

  let best = 1;
  let current = 1;
  for (let index = 1; index < dates.length; index += 1) {
    if (dates[index] === addDaysToDateKey(dates[index - 1], 1)) {
      current += 1;
    } else {
      current = 1;
    }
    best = Math.max(best, current);
  }
  return best;
}

export function computeCurrentStreak(days: PracticeDay[]): number {
  let index = days.length - 1;
  if (days[index]?.count === 0) index -= 1;

  let streak = 0;
  for (let i = index; i >= 0; i -= 1) {
    if (days[i].count === 0) break;
    streak += 1;
  }
  return streak;
}

export function computeBestStreak(days: PracticeDay[]): number {
  let best = 0;
  let current = 0;
  for (const day of days) {
    if (day.count > 0) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
}

export function dateDaysAgo(days: number, today = new Date()): string {
  return dateKeyDaysAgo(days, today);
}

export function toDateString(date: Date): string {
  return localDateKey(date);
}

function statusMaturityScore(status: PlanStatus): number {
  if (status === "maintenance") return 1;
  return 0.35;
}

function activeDateSet(logs: PracticeActivityLog[]): Set<string> {
  return new Set(
    logs.filter(isPracticeActivityLog).map((log) => log.date),
  );
}
