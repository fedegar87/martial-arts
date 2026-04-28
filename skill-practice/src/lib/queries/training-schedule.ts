import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { TrainingSchedule } from "@/lib/types";

export async function getTrainingSchedule(
  userId: string,
): Promise<TrainingSchedule | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("training_schedule")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return (data as TrainingSchedule | null) ?? null;
}
