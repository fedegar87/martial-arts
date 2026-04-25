"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type PracticeFormState = { error: string } | { success: true } | null;

export async function markPracticeDone(
  skillId: string,
): Promise<PracticeFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessione scaduta" };

  const today = new Date().toISOString().split("T")[0];
  const now = new Date().toISOString();

  const { error: logError } = await supabase.from("practice_logs").insert({
    user_id: user.id,
    skill_id: skillId,
    date: today,
    completed: true,
  });
  if (logError) return { error: logError.message };

  const { error: planError } = await supabase
    .from("user_plan_items")
    .update({ last_practiced_at: now })
    .eq("user_id", user.id)
    .eq("skill_id", skillId);
  if (planError) return { error: planError.message };

  revalidatePath("/today");
  revalidatePath(`/skill/${skillId}`);
  return { success: true };
}
