import type { Discipline, PlanStatus, PracticeLog, Skill } from "./types";
import { addDaysToDateKey, dateKeyDaysAgo, localDateKey } from "./date.ts";

export type CurriculumCell = {
  skill: Skill;
  status: PlanStatus | "available" | "locked";
};

export type PracticeDay = {
  date: string;
  count: number;
};

export type CategoryAxis = {
  label: string;
  percent: number;
};

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
        userLevel !== 0 && skill.minimum_grade_value < userLevel
          ? "locked"
          : planBySkillId.get(skill.id) ?? "available",
    }));
}

export function computeCategoryProgress(
  cells: CurriculumCell[],
): CategoryAxis[] {
  const grouped = new Map<string, { total: number; active: number }>();

  for (const cell of cells.filter((item) => item.status !== "locked")) {
    const key = radarCategory(cell.skill);
    const prev = grouped.get(key) ?? { total: 0, active: 0 };
    prev.total += 1;
    if (
      cell.status === "focus" ||
      cell.status === "review" ||
      cell.status === "maintenance"
    ) {
      prev.active += 1;
    }
    grouped.set(key, prev);
  }

  return [...grouped.entries()].map(([label, value]) => ({
    label,
    percent:
      value.total === 0 ? 0 : Math.round((value.active / value.total) * 100),
  }));
}

export function buildPracticeCalendar(
  logs: PracticeLog[],
  today = new Date(),
): PracticeDay[] {
  const counts = new Map<string, number>();
  for (const log of logs) {
    if (!log.completed) continue;
    counts.set(log.date, (counts.get(log.date) ?? 0) + 1);
  }

  return Array.from({ length: 90 }, (_, index) => {
    const key = addDaysToDateKey(localDateKey(today), -(89 - index));
    return { date: key, count: counts.get(key) ?? 0 };
  });
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

function radarCategory(skill: Skill): string {
  if (skill.category === "armi_forma" || skill.category === "armi_combattimento") {
    return "Armi";
  }
  if (skill.category === "chi_kung") return "Forme";
  if (skill.category === "tui_fa") return "Tui Fa";
  if (skill.category === "po_chi") return "Po Chi";
  if (skill.category === "chin_na") return "Chin Na";
  if (skill.category === "tue_shou") return "Tue Shou";
  if (skill.category === "ta_lu") return "Ta Lu";
  return "Forme";
}
