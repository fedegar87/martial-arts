import "server-only";
import { getLocale } from "next-intl/server";
import { localizeSkill } from "@/lib/content-localization";
import { getActiveCustomProgramId } from "@/lib/queries/custom-programs";
import { createClient } from "@/lib/supabase/server";
import type {
  Discipline,
  PlanItemSource,
  Skill,
  UserPlanItem,
} from "@/lib/types";

export type UserPlanItemWithSkill = UserPlanItem & { skill: Skill };

export async function getUserPlanItems(
  userId: string,
  discipline?: Discipline,
  source?: PlanItemSource,
  customProgramId?: string | null,
): Promise<UserPlanItemWithSkill[]> {
  const programId = await resolveProgramId(userId, source, customProgramId);
  if (source === "manual" && !programId) return [];
  const supabase = await createClient();
  let query = supabase
    .from("user_plan_items")
    .select("*, skill:skills(*)")
    .eq("user_id", userId)
    .eq("is_hidden", false);

  if (source) {
    query = query.eq("source", source);
  }
  if (source === "manual") query = query.eq("custom_program_id", programId);
  if (!source) query = programId
    ? query.or(`source.eq.exam_program,custom_program_id.eq.${programId}`)
    : query.eq("source", "exam_program");

  const { data, error } = await query;

  if (error) {
    throw new Error("Impossibile caricare gli esercizi del piano", {
      cause: error,
    });
  }

  const locale = await getLocale();
  return ((data ?? []) as UserPlanItemWithSkill[])
    .filter((item) => {
      if (!item.skill) return false;
      if (!discipline) return true;
      return item.skill.discipline === discipline;
    })
    .map((item) => ({ ...item, skill: localizeSkill(item.skill, locale) }));
}

export async function getUserPlanItemBySkill(
  userId: string,
  skillId: string,
): Promise<UserPlanItem | null> {
  const items = await getUserPlanItemsBySkill(userId, skillId);
  return (
    items.find((i) => i.source === "manual" && !i.is_hidden) ??
    items.find((i) => !i.is_hidden) ??
    items.find((i) => i.source === "manual") ??
    items[0] ??
    null
  );
}

export async function getUserPlanItemsBySkill(
  userId: string,
  skillId: string,
): Promise<UserPlanItem[]> {
  const programId = await getActiveCustomProgramId(userId);
  const supabase = await createClient();
  let query = supabase
    .from("user_plan_items")
    .select("*")
    .eq("user_id", userId)
    .eq("skill_id", skillId);
  query = programId
    ? query.or(`source.eq.exam_program,custom_program_id.eq.${programId}`)
    : query.eq("source", "exam_program");
  const { data, error } = await query;
  if (error) {
    throw new Error("Impossibile caricare l'esercizio nel piano", {
      cause: error,
    });
  }
  return (data as UserPlanItem[] | null) ?? [];
}

export async function getUserPlanCount(
  userId: string,
  source?: PlanItemSource,
  customProgramId?: string | null,
): Promise<number> {
  const programId = await resolveProgramId(userId, source, customProgramId);
  if (source === "manual" && !programId) return 0;
  const supabase = await createClient();
  let query = supabase
    .from("user_plan_items")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_hidden", false);

  if (source) {
    query = query.eq("source", source);
  }
  if (source === "manual") query = query.eq("custom_program_id", programId);
  if (!source) query = programId
    ? query.or(`source.eq.exam_program,custom_program_id.eq.${programId}`)
    : query.eq("source", "exam_program");

  const { count, error } = await query;
  if (error) {
    throw new Error("Impossibile contare gli esercizi del piano", {
      cause: error,
    });
  }
  return count ?? 0;
}

export async function getSelectedSkillIds(
  userId: string,
  source?: PlanItemSource,
  customProgramId?: string | null,
): Promise<Set<string>> {
  const programId = await resolveProgramId(userId, source, customProgramId);
  if (source === "manual" && !programId) return new Set();
  const supabase = await createClient();
  let query = supabase
    .from("user_plan_items")
    .select("skill_id")
    .eq("user_id", userId)
    .eq("is_hidden", false);

  if (source) {
    query = query.eq("source", source);
  }
  if (source === "manual") query = query.eq("custom_program_id", programId);
  if (!source) query = programId
    ? query.or(`source.eq.exam_program,custom_program_id.eq.${programId}`)
    : query.eq("source", "exam_program");

  const { data, error } = await query;
  if (error) {
    throw new Error("Impossibile caricare la selezione personale", {
      cause: error,
    });
  }
  return new Set(
    ((data ?? []) as Array<{ skill_id: string }>).map((r) => r.skill_id),
  );
}

async function resolveProgramId(
  userId: string,
  source: PlanItemSource | undefined,
  customProgramId: string | null | undefined,
): Promise<string | null> {
  if (source === "exam_program") return null;
  return customProgramId === undefined
    ? getActiveCustomProgramId(userId)
    : customProgramId;
}
