"use server";
import type { UiTranslator } from "@/lib/i18n/config";
import { getTranslations } from "next-intl/server";

import { isSelectableExamGrade, nextGradeValue } from "@/lib/grades";
import { isProgramId } from "@/lib/custom-program-logic";
import { getActiveCustomProgramId, getCustomProgram } from "@/lib/queries/custom-programs";
import { createClient } from "@/lib/supabase/server";
import type { Discipline, PlanStatus, UserProfile } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type PlanFormState = { error: string } | { success: true } | null;

export async function addSkillToPlan(
  skillId: string,
  status: PlanStatus = "maintenance",
): Promise<PlanFormState> {
  const tr = await getTranslations("ui");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: tr("sessionExpired") };

  const { error } = await supabase.rpc("add_skill_to_custom_program", {
    p_skill_id: skillId, p_status: status,
  });
  if (error) return { error: error.message };

  revalidatePath("/today");
  revalidatePath(`/skill/${skillId}`);
  revalidatePath("/programma");
  revalidatePath("/library");
  revalidatePath("/progress");
  revalidatePath("/calendar");
  revalidatePath("/sessions/setup");
  return { success: true };
}

export async function removeSkillFromPlan(
  skillId: string,
): Promise<PlanFormState> {
  const tr = await getTranslations("ui");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: tr("sessionExpired") };

  const programId = await getActiveCustomProgramId(user.id);
  if (!programId) return { error: tr("customProgramNotFound") };
  const { error } = await supabase
    .from("user_plan_items")
    .delete()
    .eq("user_id", user.id)
    .eq("skill_id", skillId)
    .eq("source", "manual")
    .eq("custom_program_id", programId);
  if (error) return { error: error.message };

  revalidatePath("/today");
  revalidatePath(`/skill/${skillId}`);
  revalidatePath("/programma");
  revalidatePath("/library");
  revalidatePath("/progress");
  revalidatePath("/calendar");
  revalidatePath("/sessions/setup");
  return { success: true };
}

export async function activateExamModeFromForm(
  _prev: PlanFormState,
  formData: FormData,
): Promise<PlanFormState> {
  const tr = await getTranslations("ui");
  const examShaolinId = optionalUuid(formData.get("examShaolinId"));
  const examTaichiId = optionalUuid(formData.get("examTaichiId"));

  if (!examShaolinId && !examTaichiId) {
    return { error: tr("selectAtLeastOneExam") };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: tr("sessionExpired") };

  const { data: profileData, error: profileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) return { error: profileError.message };
  if (!profileData) return { error: tr("profileNotFound") };

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
  revalidatePath("/calendar");
  revalidatePath("/sessions/setup");
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
  revalidatePath("/calendar");
  revalidatePath("/sessions/setup");
  return { success: true };
}

export async function activateExamFromProfile(): Promise<PlanFormState> {
  const tr = await getTranslations("ui");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: tr("sessionExpired") };

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
  revalidatePath("/calendar");
  revalidatePath("/sessions/setup");
    redirect("/programma?t=exam");
  }

  const { data: profileData, error: profileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) return { error: profileError.message };
  if (!profileData) return { error: tr("profileNotFound") };

  const profile = profileData as UserProfile;
  const nextShaolin = nextGradeValue(profile.assigned_level_shaolin);
  const nextTaichi =
    profile.assigned_level_taichi === 0
      ? null
      : nextGradeValue(profile.assigned_level_taichi);

  if (nextShaolin === null && nextTaichi === null) {
    return { error: tr("noPreparingExam") };
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
      : (exams.find(
          (e) => e.discipline === "shaolin" && e.grade_value === nextShaolin,
        )?.id ?? null);
  const examTaichiId =
    nextTaichi === null
      ? null
      : (exams.find(
          (e) => e.discipline === "taichi" && e.grade_value === nextTaichi,
        )?.id ?? null);

  if (!examShaolinId && !examTaichiId) {
    return { error: tr("noNextGradeExams") };
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
  revalidatePath("/calendar");
  revalidatePath("/sessions/setup");
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
  revalidatePath("/calendar");
  revalidatePath("/sessions/setup");
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
  const tr = await getTranslations("ui");
  const programId = formData.get("program_id");
  if (!isProgramId(programId)) return { error: tr("invalidProgramSelection") };
  const disciplineRaw = String(formData.get("discipline") ?? "shaolin");
  if (!["shaolin", "taichi"].includes(disciplineRaw)) return { error: tr("invalidProgramSelection") };
  const discipline: Discipline =
    disciplineRaw === "taichi" ? "taichi" : "shaolin";
  const skillIds = formData
    .getAll("skillIds")
    .map((value) => String(value))
    .filter(Boolean);
  if (skillIds.some((id) => !isProgramId(id))) return { error: tr("invalidProgramSelection") };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: tr("sessionExpired") };
  const { error } = await supabase.rpc("save_named_custom_selection", {
    p_program_id: programId,
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
  revalidatePath("/calendar");
  revalidatePath("/sessions/setup");
  redirect(`/programma?d=${discipline}&program=${programId}`);
}

export async function deleteCustomSelection(programId?: string): Promise<PlanFormState> {
  const tr = await getTranslations("ui");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: tr("sessionExpired") };

  const id = programId ?? await getActiveCustomProgramId(user.id);
  if (!isProgramId(id) || !await getCustomProgram(user.id, id)) {
    return { error: tr("customProgramNotFound") };
  }
  const { error } = await supabase
    .from("user_plan_items")
    .delete()
    .eq("user_id", user.id)
    .eq("source", "manual")
    .eq("custom_program_id", id);

  if (error) return { error: error.message };

  revalidatePath("/today");
  revalidatePath("/profile");
  revalidatePath("/plan/custom");
  revalidatePath("/programma");
  revalidatePath("/library");
  revalidatePath("/progress");
  revalidatePath("/calendar");
  revalidatePath("/sessions/setup");
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
  revalidatePath("/programma");
  revalidatePath("/library");
  revalidatePath("/progress");
  revalidatePath("/calendar");
  revalidatePath("/sessions/setup");
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
  revalidatePath("/programma");
  revalidatePath("/library");
  revalidatePath("/progress");
  revalidatePath("/calendar");
  revalidatePath("/sessions/setup");
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
  const tr = await getTranslations("ui");
  const examIds = [examShaolinId, examTaichiId].filter(
    (id): id is string => id !== null,
  );
  const { data, error } = await supabase
    .from("exam_programs")
    .select("id, discipline, grade_value, grade_from")
    .in("id", examIds);

  if (error) return error.message;

  const examsById = new Map(
    (
      (data ?? []) as Array<{
        id: string;
        discipline: Discipline;
        grade_value: number;
        grade_from: string | null;
      }>
    ).map((exam) => [exam.id, exam]),
  );

  const shaolinError = validateExamForDiscipline(
    tr,
    examsById,
    examShaolinId,
    "shaolin",
    profile.assigned_level_shaolin,
  );
  if (shaolinError) return shaolinError;

  const taichiError = validateExamForDiscipline(
    tr,
    examsById,
    examTaichiId,
    "taichi",
    profile.assigned_level_taichi,
  );
  if (taichiError) return taichiError;

  return null;
}

function validateExamForDiscipline(
  tr: UiTranslator,
  examsById: Map<
    string,
    {
      id: string;
      discipline: Discipline;
      grade_value: number;
      grade_from: string | null;
    }
  >,
  examId: string | null,
  discipline: Discipline,
  currentGrade: number,
): string | null {
  if (!examId) return null;

  const exam = examsById.get(examId);
  if (!exam || exam.discipline !== discipline) {
    return tr("invalidDisciplineExam");
  }

  if (
    exam.grade_from === null ||
    !isSelectableExamGrade(currentGrade, exam.grade_value)
  ) {
    return tr("examNotAvailable");
  }

  return null;
}
