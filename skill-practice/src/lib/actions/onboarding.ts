"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { nextGradeValue } from "@/lib/grades";

export type OnboardingFormState = { error: string } | null;

export async function selectExam(
  _prev: OnboardingFormState,
  formData: FormData,
): Promise<OnboardingFormState> {
  const examId = String(formData.get("examId") ?? "");
  if (!examId) return { error: "Seleziona un esame" };

  const practicesShaolin = formData.get("practicesShaolin") === "on";
  const practicesTaichi = formData.get("practicesTaichi") === "on";
  if (!practicesShaolin && !practicesTaichi) {
    return { error: "Seleziona almeno una disciplina" };
  }

  const assignedLevelShaolin = Number(formData.get("assignedLevelShaolin"));
  const assignedLevelTaichi = practicesTaichi
    ? Number(formData.get("assignedLevelTaichi"))
    : 0;

  if (
    !Number.isFinite(assignedLevelShaolin) ||
    !Number.isFinite(assignedLevelTaichi)
  ) {
    return { error: "Grado non valido" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessione scaduta" };

  const { data: examRow } = await supabase
    .from("exam_programs")
    .select("id, discipline, grade_value")
    .eq("id", examId)
    .maybeSingle();

  if (!examRow) return { error: "Esame non trovato" };

  const exam = examRow as {
    id: string;
    discipline: "shaolin" | "taichi";
    grade_value: number;
  };

  if (exam.discipline === "shaolin" && !practicesShaolin) {
    return { error: "L'esame scelto e Shaolin: abilita la disciplina Shaolin" };
  }

  if (exam.discipline === "taichi" && !practicesTaichi) {
    return { error: "L'esame scelto e T'ai Chi: abilita la disciplina T'ai Chi" };
  }

  const currentGrade =
    exam.discipline === "shaolin" ? assignedLevelShaolin : assignedLevelTaichi;
  if (nextGradeValue(currentGrade) !== exam.grade_value) {
    return { error: "L'esame scelto non corrisponde al prossimo grado" };
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

  redirect("/hub");
}
