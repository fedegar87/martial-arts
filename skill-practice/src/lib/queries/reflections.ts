import "server-only";
import { createClient } from "@/lib/supabase/server";
import { localWeekday, weekStartDateKey } from "@/lib/date";
import type { WeeklyReflection } from "@/lib/types";

export function getWeekStart(date = new Date()): string {
  return weekStartDateKey(date);
}

export function shouldPromptWeeklyReflection(date = new Date()): boolean {
  const dayOfWeek = localWeekday(date);
  return dayOfWeek === 0 || dayOfWeek === 1;
}

export async function getCurrentWeekReflection(
  userId: string,
): Promise<WeeklyReflection | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("weekly_reflections")
    .select("*")
    .eq("user_id", userId)
    .eq("week_start", getWeekStart())
    .maybeSingle();

  if (error) return null;
  return (data as WeeklyReflection | null) ?? null;
}
