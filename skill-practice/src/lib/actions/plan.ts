"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { buildManualPlanItem } from "@/lib/plan-manager";
import type { PlanStatus } from "@/lib/types";

export type PlanFormState = { error: string } | { success: true } | null;

export async function addSkillToPlan(
  skillId: string,
  status: PlanStatus = "review",
): Promise<PlanFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessione scaduta" };

  const item = buildManualPlanItem(user.id, skillId, status);
  const { error } = await supabase
    .from("user_plan_items")
    .upsert(item, { onConflict: "user_id,skill_id" });
  if (error) return { error: error.message };

  revalidatePath("/today");
  revalidatePath(`/skill/${skillId}`);
  return { success: true };
}

export async function removeSkillFromPlan(
  skillId: string,
): Promise<PlanFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessione scaduta" };

  const { error } = await supabase
    .from("user_plan_items")
    .delete()
    .eq("user_id", user.id)
    .eq("skill_id", skillId);
  if (error) return { error: error.message };

  revalidatePath("/today");
  revalidatePath(`/skill/${skillId}`);
  return { success: true };
}
