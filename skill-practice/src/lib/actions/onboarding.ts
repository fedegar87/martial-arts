"use server";
import { getTranslations } from "next-intl/server";

import { nextGradeValue, SHAOLIN_GRADES, TAICHI_GRADES } from "@/lib/grades";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type OnboardingFormState = { error: string } | null;

function isValidGrade(value: number, grades: { value: number }[]): boolean {
  return grades.some((grade) => grade.value === value);
}

export async function selectExam(
  _prev: OnboardingFormState,
  formData: FormData,
): Promise<OnboardingFormState> {
  const tr = await getTranslations("ui");
  const examId = String(formData.get("examId") ?? "");
  if (!examId) return { error: tr("selectExam") };

  const practicesShaolin = formData.get("practicesShaolin") === "on";
  const practicesTaichi = formData.get("practicesTaichi") === "on";
  if (!practicesShaolin && !practicesTaichi) {
    return { error: tr("selectDiscipline") };
  }

  const assignedLevelShaolin = Number(formData.get("assignedLevelShaolin"));
  const assignedLevelTaichi = practicesTaichi
    ? Number(formData.get("assignedLevelTaichi"))
    : 0;

  if (
    !isValidGrade(assignedLevelShaolin, SHAOLIN_GRADES) ||
    !isValidGrade(assignedLevelTaichi, TAICHI_GRADES)
  ) {
    return { error: tr("invalidGrade") };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: tr("sessionExpired") };

  if (await isProfileLocked(supabase, user.id)) {
    return { error: tr("profileManaged") };
  }

  const { data: examRow } = await supabase
    .from("exam_programs")
    .select("id, discipline, grade_value")
    .eq("id", examId)
    .maybeSingle();

  if (!examRow) return { error: tr("examNotFound") };

  const exam = examRow as {
    id: string;
    discipline: "shaolin" | "taichi";
    grade_value: number;
  };

  if (exam.discipline === "shaolin" && !practicesShaolin) {
    return { error: tr("enableShaolin") };
  }

  if (exam.discipline === "taichi" && !practicesTaichi) {
    return { error: tr("enableTaichi") };
  }

  const currentGrade =
    exam.discipline === "shaolin" ? assignedLevelShaolin : assignedLevelTaichi;
  if (nextGradeValue(currentGrade) !== exam.grade_value) {
    return { error: tr("examGradeMismatch") };
  }

  const profileUpdate: Record<string, unknown> = {
    assigned_level_shaolin: assignedLevelShaolin,
    assigned_level_taichi: assignedLevelTaichi,
  };

  const { error: profileError } = await supabase
    .from("user_profiles")
    .update(profileUpdate)
    .eq("id", user.id);
  if (profileError) return { error: profileError.message };

  const { error: planError } = await supabase.rpc("activate_exam_mode", {
    p_exam_shaolin_id: exam.discipline === "shaolin" ? examId : null,
    p_exam_taichi_id: exam.discipline === "taichi" ? examId : null,
  });
  if (planError) return { error: planError.message };

  redirect("/today");
}

export async function finishWithoutExam(formData: FormData): Promise<void> {
  const practicesShaolin = formData.get("practicesShaolin") === "on";
  const practicesTaichi = formData.get("practicesTaichi") === "on";

  const rawShaolin = Number(formData.get("assignedLevelShaolin"));
  const rawTaichi = Number(formData.get("assignedLevelTaichi"));
  // Accetta il valore solo se e un grado reale, altrimenti fallback al default
  // (un valore bogus tipo 999 romperebbe esami/libreria/profilo).
  const assignedLevelShaolin =
    practicesShaolin && isValidGrade(rawShaolin, SHAOLIN_GRADES)
      ? rawShaolin
      : 8;
  const assignedLevelTaichi =
    practicesTaichi && isValidGrade(rawTaichi, TAICHI_GRADES) ? rawTaichi : 0;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (await isProfileLocked(supabase, user.id)) {
    redirect("/hub");
  }

  await supabase
    .from("user_profiles")
    .update({
      assigned_level_shaolin: assignedLevelShaolin,
      assigned_level_taichi: assignedLevelTaichi,
      plan_mode: "custom",
      preparing_exam_id: null,
      preparing_exam_taichi_id: null,
    })
    .eq("id", user.id);

  redirect("/today");
}

async function isProfileLocked(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("user_profiles")
    .select("profile_locked")
    .eq("id", userId)
    .maybeSingle();
  return (data as { profile_locked: boolean } | null)?.profile_locked ?? false;
}
