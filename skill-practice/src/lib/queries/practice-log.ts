import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { PracticeLog } from "@/lib/types";

function toDateString(d: Date): string {
  return d.toISOString().split("T")[0];
}

export async function getThisWeekLogs(userId: string): Promise<PracticeLog[]> {
  const supabase = await createClient();
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Dom, 1=Lun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  const { data } = await supabase
    .from("practice_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("date", toDateString(monday))
    .order("date", { ascending: false });
  return (data as PracticeLog[] | null) ?? [];
}

export async function getRecentLogsForUser(
  userId: string,
  days = 30,
): Promise<PracticeLog[]> {
  const supabase = await createClient();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const { data } = await supabase
    .from("practice_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("date", toDateString(cutoff))
    .order("date", { ascending: false });
  return (data as PracticeLog[] | null) ?? [];
}
