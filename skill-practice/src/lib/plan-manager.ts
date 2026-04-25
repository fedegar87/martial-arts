import type { ExamSkillRequirement, PlanStatus, UserPlanItem } from "./types";

export type NewPlanItem = Pick<
  UserPlanItem,
  "user_id" | "skill_id" | "status" | "source" | "is_hidden"
>;

/**
 * Genera UserPlanItem (pre-insert) a partire dai requirements di un esame.
 * Lo status di partenza è il defaultStatus dichiarato nel programma d'esame.
 */
export function generatePlanItemsFromExam(
  userId: string,
  requirements: ExamSkillRequirement[],
): NewPlanItem[] {
  return requirements.map((req) => ({
    user_id: userId,
    skill_id: req.skill_id,
    status: req.default_status,
    source: "exam_program",
    is_hidden: false,
  }));
}

/**
 * Costruisce un nuovo plan item "manuale" aggiunto a piacere dall'allievo.
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
