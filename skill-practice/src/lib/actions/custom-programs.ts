"use server";

import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isProgramId, normalizeProgramName } from "@/lib/custom-program-logic";
import type { PlanFormState } from "@/lib/actions/plan";
import type { PlanStatus } from "@/lib/types";

function revalidatePrograms() {
  for (const path of ["/programma", "/plan/custom", "/today", "/calendar", "/progress", "/library", "/sessions/setup", "/profile"]) {
    revalidatePath(path);
  }
}

export async function createCustomProgramFromForm(
  _prev: PlanFormState, formData: FormData,
): Promise<PlanFormState> {
  const tr = await getTranslations("ui");
  const name = normalizeProgramName(formData.get("name"));
  if (!name) return { error: tr("customProgramNameInvalid") };
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: tr("sessionExpired") };
  const { data, error } = await supabase.rpc("create_custom_program", { p_name: name });
  if (error) return { error: error.code === "23505" ? tr("customProgramNameTaken") : error.message };
  if (!isProgramId(data)) return { error: tr("saveUnconfirmed") };
  revalidatePrograms();
  redirect(`/plan/custom?program=${data}`);
}

export async function renameCustomProgramFromForm(
  _prev: PlanFormState, formData: FormData,
): Promise<PlanFormState> {
  const tr = await getTranslations("ui");
  const id = formData.get("program_id");
  const name = normalizeProgramName(formData.get("name"));
  if (!isProgramId(id)) return { error: tr("invalidProgramSelection") };
  if (!name) return { error: tr("customProgramNameInvalid") };
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: tr("sessionExpired") };
  const { error } = await supabase.rpc("rename_custom_program", { p_program_id: id, p_name: name });
  if (error) return { error: error.code === "23505" ? tr("customProgramNameTaken") : error.message };
  revalidatePrograms();
  redirect(`/programma?program=${id}`);
}

export async function deleteCustomProgramFromForm(
  _prev: PlanFormState, formData: FormData,
): Promise<PlanFormState> {
  const tr = await getTranslations("ui");
  const id = formData.get("program_id");
  if (!isProgramId(id)) return { error: tr("invalidProgramSelection") };
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: tr("sessionExpired") };
  const { error } = await supabase.rpc("delete_custom_program", { p_program_id: id });
  if (error) return { error: /active|attivo/i.test(error.message) ? tr("customProgramActiveDelete") : error.message };
  revalidatePrograms();
  redirect("/programma");
}

export async function activateCustomProgramFromForm(formData: FormData): Promise<void> {
  const tr = await getTranslations("ui");
  const id = formData.get("program_id");
  if (!isProgramId(id)) throw new Error(tr("invalidProgramSelection"));
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");
  const { error } = await supabase.rpc("activate_custom_program", { p_program_id: id });
  if (error) throw new Error(error.message);
  revalidatePrograms();
  redirect(`/programma?program=${id}`);
}

export async function updateCustomProgramItemStatus(
  programId: string, skillId: string, status: PlanStatus,
): Promise<PlanFormState> {
  const tr = await getTranslations("ui");
  if (!isProgramId(programId) || !isProgramId(skillId) || !["focus", "maintenance"].includes(status)) {
    return { error: tr("invalidProgramSelection") };
  }
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: tr("sessionExpired") };
  const { error } = await supabase.rpc("update_named_custom_item_status", {
    p_program_id: programId, p_skill_id: skillId, p_status: status,
  });
  if (error) return { error: error.message };
  revalidatePrograms();
  return { success: true };
}
