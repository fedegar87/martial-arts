"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { generatePlanItemsFromExam } from "@/lib/plan-manager";
import { getExamProgramRequirements } from "@/lib/queries/exam-programs";

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

  // Recupera l'esame per sapere disciplina e grado
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
    return { error: "L'esame scelto è Shaolin: abilita la disciplina Shaolin" };
  }

  if (exam.discipline === "taichi" && !practicesTaichi) {
    return { error: "L'esame scelto è T'ai Chi: abilita la disciplina T'ai Chi" };
  }

  const profileUpdate: Record<string, unknown> = {
    preparing_exam_id: examId,
    assigned_level_shaolin: assignedLevelShaolin,
    assigned_level_taichi: assignedLevelTaichi,
  };

  const { error: profileError } = await supabase
    .from("user_profiles")
    .update(profileUpdate)
    .eq("id", user.id);
  if (profileError) return { error: profileError.message };

  const requirements = await getExamProgramRequirements(examId);
  const newItems = generatePlanItemsFromExam(user.id, requirements);

  await supabase.from("user_plan_items").delete().eq("user_id", user.id);

  if (newItems.length > 0) {
    const { error: insertError } = await supabase
      .from("user_plan_items")
      .upsert(newItems, { onConflict: "user_id,skill_id" });
    if (insertError) return { error: insertError.message };
  }

  redirect("/today");
}
