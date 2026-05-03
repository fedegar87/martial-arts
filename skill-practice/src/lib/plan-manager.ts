import type { PlanStatus, UserPlanItem } from "./types";

export type NewPlanItem = Pick<
  UserPlanItem,
  "user_id" | "skill_id" | "status" | "source" | "is_hidden"
>;

/**
 * Costruisce un nuovo plan item manuale aggiunto dall'allievo.
 */
export function buildManualPlanItem(
  userId: string,
  skillId: string,
  status: PlanStatus,
): NewPlanItem {
  return {
    user_id: userId,
    skill_id: skillId,
    status,
    source: "manual",
    is_hidden: false,
  };
}
