import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/lib/types";

export async function getCurrentProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (data as UserProfile | null) ?? null;
}
