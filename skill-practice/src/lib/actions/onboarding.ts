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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessione scaduta" };

  const { error: profileError } = await supabase
    .from("user_profiles")
    .update({ preparing_exam_id: examId })
    .eq("id", user.id);
  if (profileError) return { error: profileError.message };

  const requirements = await getExamProgramRequirements(examId);
  const newItems = generatePlanItemsFromExam(user.id, requirements);

  if (newItems.length > 0) {
    const { error: insertError } = await supabase
      .from("user_plan_items")
      .upsert(newItems, { onConflict: "user_id,skill_id" });
    if (insertError) return { error: insertError.message };
  }

  redirect("/today");
}
