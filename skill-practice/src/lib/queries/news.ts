import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { NewsItem, UserProfile } from "@/lib/types";

export async function listNewsForSchool(
  schoolId: string,
  limit = 50,
): Promise<NewsItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("news_items")
    .select("*")
    .eq("school_id", schoolId)
    .lte("published_at", new Date().toISOString())
    .order("pinned", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(limit);

  return (data as NewsItem[] | null) ?? [];
}

export async function getUnreadNewsCount(
  profile: UserProfile,
): Promise<number> {
  const supabase = await createClient();
  const lastSeen = profile.last_news_seen_at ?? "1970-01-01T00:00:00.000Z";

  const { count } = await supabase
    .from("news_items")
    .select("id", { count: "exact", head: true })
    .eq("school_id", profile.school_id)
    .lte("published_at", new Date().toISOString())
    .gt("published_at", lastSeen);

  return count ?? 0;
}
