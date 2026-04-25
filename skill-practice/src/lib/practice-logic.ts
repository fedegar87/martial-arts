import type { UserPlanItem } from "./types";

export type DailyPractice<T extends UserPlanItem = UserPlanItem> = {
  focus: T[];
  review: T[];
  maintenance: T[];
};

const REVIEW_PER_DAY = 3;
const MAINTENANCE_PER_DAY = 1;

/**
 * Algoritmo "oggi fai questo".
 * - Focus: tutte ogni giorno
 * - Review: 2-3 in rotazione (le meno praticate di recente)
 * - Maintenance: 1 in rotazione (la meno praticata)
 *
 * Generic su T per preservare campi joinati (es. UserPlanItemWithSkill).
 * Sprint 3 (D5): sostituire con SRS reale (intervalli crescenti).
 */
export function getTodayPractice<T extends UserPlanItem>(
  items: T[],
): DailyPractice<T> {
  const visible = items.filter((item) => !item.is_hidden);

  const focus = visible.filter((item) => item.status === "focus");

  const review = sortByOldestPractice(
    visible.filter((item) => item.status === "review"),
  ).slice(0, REVIEW_PER_DAY);

  const maintenance = sortByOldestPractice(
    visible.filter((item) => item.status === "maintenance"),
  ).slice(0, MAINTENANCE_PER_DAY);

  return { focus, review, maintenance };
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
