"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { buildManualPlanItem } from "@/lib/plan-manager";
import type { Discipline, PlanStatus } from "@/lib/types";

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

export async function activateExamModeFromForm(
  _prev: PlanFormState,
  formData: FormData,
): Promise<PlanFormState> {
  const examShaolinId = optionalUuid(formData.get("examShaolinId"));
  const examTaichiId = optionalUuid(formData.get("examTaichiId"));

  const supabase = await createClient();
  const { error } = await supabase.rpc("activate_exam_mode", {
    p_exam_shaolin_id: examShaolinId,
    p_exam_taichi_id: examTaichiId,
  });

  if (error) return { error: error.message };

  revalidatePath("/today");
  revalidatePath("/profile");
  revalidatePath("/plan/exam");
  return { success: true };
}

export async function switchToCustomMode(): Promise<PlanFormState> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("switch_to_custom_mode");

  if (error) return { error: error.message };

  revalidatePath("/today");
  revalidatePath("/profile");
  revalidatePath("/plan/custom");
  return { success: true };
}

export async function saveCustomSelectionFromForm(
  _prev: PlanFormState,
  formData: FormData,
): Promise<PlanFormState> {
  const discipline = String(formData.get("discipline") ?? "shaolin") as Discipline;
  const skillIds = formData
    .getAll("skillIds")
    .map((value) => String(value))
    .filter(Boolean);

  const supabase = await createClient();
  const { error } = await supabase.rpc("save_custom_selection", {
    p_skill_ids: skillIds,
    p_discipline: discipline,
  });

  if (error) return { error: error.message };

  revalidatePath("/today");
  revalidatePath("/profile");
  revalidatePath("/plan/custom");
  return { success: true };
}

export async function updatePlanItemStatus(
  skillId: string,
  status: PlanStatus,
): Promise<PlanFormState> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_plan_item_status", {
    p_skill_id: skillId,
    p_status: status,
  });

  if (error) return { error: error.message };

  revalidatePath("/today");
  revalidatePath(`/skill/${skillId}`);
  return { success: true };
}

export async function hidePlanItem(skillId: string): Promise<PlanFormState> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("hide_plan_item", {
    p_skill_id: skillId,
  });

  if (error) return { error: error.message };

  revalidatePath("/today");
  revalidatePath(`/skill/${skillId}`);
  return { success: true };
}

function optionalUuid(value: FormDataEntryValue | null): string | null {
  const raw = String(value ?? "");
  return raw.length > 0 ? raw : null;
}
