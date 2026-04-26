"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markNewsAsSeen(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("user_profiles")
    .update({ last_news_seen_at: new Date().toISOString() })
    .eq("id", user.id);

  revalidatePath("/today");
  revalidatePath("/news");
}
