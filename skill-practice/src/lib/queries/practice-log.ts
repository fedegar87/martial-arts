import "server-only";
import { createClient } from "@/lib/supabase/server";
import { dateKeyDaysAgo, weekStartDateKey } from "@/lib/date";
import type { PracticeLog } from "@/lib/types";

export async function getThisWeekLogs(userId: string): Promise<PracticeLog[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("practice_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("date", weekStartDateKey())
    .order("date", { ascending: false });
  return (data as PracticeLog[] | null) ?? [];
}

export async function getRecentLogsForUser(
  userId: string,
  days = 30,
): Promise<PracticeLog[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("practice_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("date", dateKeyDaysAgo(days))
    .order("date", { ascending: false });
  return (data as PracticeLog[] | null) ?? [];
}

export async function getPersonalNotesForSkill(
  userId: string,
  skillId: string,
  limit = 8,
): Promise<PracticeLog[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("practice_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("skill_id", skillId)
    .not("personal_note", "is", null)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  return ((data as PracticeLog[] | null) ?? []).filter(
    (log) => log.personal_note && log.personal_note.trim().length > 0,
  );
}
