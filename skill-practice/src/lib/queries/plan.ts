import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Skill, UserPlanItem } from "@/lib/types";

export type UserPlanItemWithSkill = UserPlanItem & { skill: Skill };

export async function getUserPlanItems(
  userId: string,
): Promise<UserPlanItemWithSkill[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_plan_items")
    .select("*, skill:skills(*)")
    .eq("user_id", userId)
    .eq("is_hidden", false);

  return ((data ?? []) as UserPlanItemWithSkill[]).filter((item) => item.skill);
}

export async function getUserPlanItemBySkill(
  userId: string,
  skillId: string,
): Promise<UserPlanItem | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_plan_items")
    .select("*")
    .eq("user_id", userId)
    .eq("skill_id", skillId)
    .maybeSingle();
  return (data as UserPlanItem | null) ?? null;
}
