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
