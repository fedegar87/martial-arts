"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildManualPlanItem } from "@/lib/plan-manager";
import { nextGradeValue } from "@/lib/grades";
import type { Discipline, PlanStatus, UserProfile } from "@/lib/types";

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
    .upsert(item, { onConflict: "user_id,skill_id,source" });
  if (error) return { error: error.message };

  revalidatePath("/today");
  revalidatePath(`/skill/${skillId}`);
  revalidatePath("/programma");
  revalidatePath("/library");
  revalidatePath("/progress");
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
    .eq("skill_id", skillId)
    .eq("source", "manual");
  if (error) return { error: error.message };

  revalidatePath("/today");
  revalidatePath(`/skill/${skillId}`);
  revalidatePath("/programma");
  revalidatePath("/library");
  revalidatePath("/progress");
  return { success: true };
}

export async function activateExamModeFromForm(
  _prev: PlanFormState,
  formData: FormData,
): Promise<PlanFormState> {
  const examShaolinId = optionalUuid(formData.get("examShaolinId"));
  const examTaichiId = optionalUuid(formData.get("examTaichiId"));

  if (!examShaolinId && !examTaichiId) {
    return { error: "Seleziona almeno un esame" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessione scaduta" };

  const { data: profileData, error: profileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) return { error: profileError.message };
  if (!profileData) return { error: "Profilo non trovato" };

  const profile = profileData as UserProfile;
  const validationError = await validateSelectedExams(
    supabase,
    profile,
    examShaolinId,
    examTaichiId,
  );
  if (validationError) return { error: validationError };

  const { error } = await supabase.rpc("activate_exam_mode", {
    p_exam_shaolin_id: examShaolinId,
    p_exam_taichi_id: examTaichiId,
  });

  if (error) return { error: error.message };

  revalidatePath("/today");
  revalidatePath("/profile");
  revalidatePath("/plan/exam");
  revalidatePath("/programma");
  revalidatePath("/library");
  revalidatePath("/progress");
  redirect("/programma?t=exam");
}

export async function switchToCustomMode(): Promise<PlanFormState> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("switch_to_custom_mode");

  if (error) return { error: error.message };

  revalidatePath("/today");
  revalidatePath("/profile");
  revalidatePath("/plan/custom");
  revalidatePath("/programma");
  revalidatePath("/library");
  revalidatePath("/progress");
  return { success: true };
}

export async function activateExamFromProfile(): Promise<PlanFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessione scaduta" };

  const { count: existingExamItems } = await supabase
    .from("user_plan_items")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("source", "exam_program");

  if ((existingExamItems ?? 0) > 0) {
    const { error } = await supabase.rpc("switch_to_exam_mode");
    if (error) return { error: error.message };

    revalidatePath("/today");
    revalidatePath("/profile");
    revalidatePath("/programma");
    revalidatePath("/library");
    revalidatePath("/progress");
    redirect("/programma?t=exam");
  }

  const { data: profileData, error: profileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) return { error: profileError.message };
  if (!profileData) return { error: "Profilo non trovato" };

  const profile = profileData as UserProfile;
  const nextShaolin = nextGradeValue(profile.assigned_level_shaolin);
  const nextTaichi =
    profile.assigned_level_taichi === 0
      ? null
      : nextGradeValue(profile.assigned_level_taichi);

  if (nextShaolin === null && nextTaichi === null) {
    return { error: "Nessun esame in preparazione" };
  }

  const { data: examsData } = await supabase
    .from("exam_programs")
    .select("id, discipline, grade_value")
    .eq("school_id", profile.school_id);

  const exams = (examsData ?? []) as Array<{
    id: string;
    discipline: Discipline;
    grade_value: number;
  }>;

  const examShaolinId =
    nextShaolin === null
      ? null
      : exams.find(
          (e) => e.discipline === "shaolin" && e.grade_value === nextShaolin,
        )?.id ?? null;
  const examTaichiId =
    nextTaichi === null
      ? null
      : exams.find(
          (e) => e.discipline === "taichi" && e.grade_value === nextTaichi,
        )?.id ?? null;

  if (!examShaolinId && !examTaichiId) {
    return { error: "Esami non trovati per il prossimo grado" };
  }

  const { error } = await supabase.rpc("activate_exam_mode", {
    p_exam_shaolin_id: examShaolinId,
    p_exam_taichi_id: examTaichiId,
  });
  if (error) return { error: error.message };

  revalidatePath("/today");
  revalidatePath("/profile");
  revalidatePath("/programma");
  revalidatePath("/library");
  revalidatePath("/progress");
  redirect("/programma?t=exam");
}

export async function activateCustomFromProfile(): Promise<PlanFormState> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("switch_to_custom_mode");
  if (error) return { error: error.message };

  revalidatePath("/today");
  revalidatePath("/profile");
  revalidatePath("/programma");
  revalidatePath("/library");
  revalidatePath("/progress");
  redirect("/programma?t=custom");
}

export async function activateExamFormAction(): Promise<void> {
  const result = await activateExamFromProfile();
  if (result && "error" in result) throw new Error(result.error);
}

export async function activateCustomFormAction(): Promise<void> {
  const result = await activateCustomFromProfile();
  if (result && "error" in result) throw new Error(result.error);
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
  revalidatePath("/programma");
  revalidatePath("/library");
  revalidatePath("/progress");
  redirect(`/programma?d=${discipline}&t=custom`);
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
  revalidatePath("/library");
  revalidatePath("/progress");
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
  revalidatePath("/library");
  revalidatePath("/progress");
  return { success: true };
}

function optionalUuid(value: FormDataEntryValue | null): string | null {
  const raw = String(value ?? "");
  return raw.length > 0 ? raw : null;
}

async function validateSelectedExams(
  supabase: Awaited<ReturnType<typeof createClient>>,
  profile: UserProfile,
  examShaolinId: string | null,
  examTaichiId: string | null,
): Promise<string | null> {
  const examIds = [examShaolinId, examTaichiId].filter(
    (id): id is string => id !== null,
  );
  const { data, error } = await supabase
    .from("exam_programs")
    .select("id, discipline, grade_value")
    .in("id", examIds);

  if (error) return error.message;

  const examsById = new Map(
    ((data ?? []) as Array<{
      id: string;
      discipline: Discipline;
      grade_value: number;
    }>).map((exam) => [exam.id, exam]),
  );

  const shaolinError = validateExamForDiscipline(
    examsById,
    examShaolinId,
    "shaolin",
    profile.assigned_level_shaolin,
  );
  if (shaolinError) return shaolinError;

  const taichiError = validateExamForDiscipline(
    examsById,
    examTaichiId,
    "taichi",
    profile.assigned_level_taichi,
  );
  if (taichiError) return taichiError;

  return null;
}

function validateExamForDiscipline(
  examsById: Map<
    string,
    { id: string; discipline: Discipline; grade_value: number }
  >,
  examId: string | null,
  discipline: Discipline,
  currentGrade: number,
): string | null {
  if (!examId) return null;

  const exam = examsById.get(examId);
  if (!exam || exam.discipline !== discipline) {
    return "Esame non valido per la disciplina selezionata";
  }

  const nextGrade = nextGradeValue(currentGrade);
  if (nextGrade === null || exam.grade_value !== nextGrade) {
    return "L'esame selezionato non corrisponde al prossimo grado";
  }

  return null;
}
