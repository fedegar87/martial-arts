"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getWeekStart } from "@/lib/queries/reflections";

export type ReflectionFormState = { error: string } | { success: true } | null;

export async function saveWeeklyReflection(
  _prev: ReflectionFormState,
  formData: FormData,
): Promise<ReflectionFormState> {
  const prompt1 = String(formData.get("prompt_1_text") ?? "").trim();
  const prompt2 = String(formData.get("prompt_2_text") ?? "").trim();

  if (!prompt1 || !prompt2) {
    return { error: "Compila entrambe le risposte." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessione scaduta" };

  const { error } = await supabase.from("weekly_reflections").upsert(
    {
      user_id: user.id,
      week_start: getWeekStart(),
      prompt_1_text: prompt1,
      prompt_2_text: prompt2,
    },
    { onConflict: "user_id,week_start" },
  );

  if (error) return { error: error.message };

  revalidatePath("/progress");
  return { success: true };
}
