import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Discipline, PlanItemSource, Skill, UserPlanItem } from "@/lib/types";

export type UserPlanItemWithSkill = UserPlanItem & { skill: Skill };

export async function getUserPlanItems(
  userId: string,
  discipline?: Discipline,
  source?: PlanItemSource,
): Promise<UserPlanItemWithSkill[]> {
  const supabase = await createClient();
  let query = supabase
    .from("user_plan_items")
    .select("*, skill:skills(*)")
    .eq("user_id", userId)
    .eq("is_hidden", false);

  if (source) {
    query = query.eq("source", source);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Impossibile caricare gli esercizi del piano", { cause: error });
  }

  return ((data ?? []) as UserPlanItemWithSkill[]).filter((item) => {
    if (!item.skill) return false;
    if (!discipline) return true;
    return item.skill.discipline === discipline;
  });
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
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_plan_items")
    .select("*")
    .eq("user_id", userId)
    .eq("skill_id", skillId);
  if (error) {
    throw new Error("Impossibile caricare l'esercizio nel piano", { cause: error });
  }
  return (data as UserPlanItem[] | null) ?? [];
}

export async function getUserPlanCount(
  userId: string,
  source?: PlanItemSource,
): Promise<number> {
  const supabase = await createClient();
  let query = supabase
    .from("user_plan_items")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_hidden", false);

  if (source) {
    query = query.eq("source", source);
  }

  const { count, error } = await query;
  if (error) {
    throw new Error("Impossibile contare gli esercizi del piano", { cause: error });
  }
  return count ?? 0;
}

export async function getSelectedSkillIds(
  userId: string,
  source?: PlanItemSource,
): Promise<Set<string>> {
  const supabase = await createClient();
  let query = supabase
    .from("user_plan_items")
    .select("skill_id")
    .eq("user_id", userId)
    .eq("is_hidden", false);

  if (source) {
    query = query.eq("source", source);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error("Impossibile caricare la selezione personale", { cause: error });
  }
  return new Set(((data ?? []) as Array<{ skill_id: string }>).map((r) => r.skill_id));
}
