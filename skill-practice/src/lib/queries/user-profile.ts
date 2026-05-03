import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/lib/types";

export type CurrentProfileAccount = UserProfile & {
  email: string | null;
  school_name: string | null;
};

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

export async function getCurrentProfileAccount(): Promise<CurrentProfileAccount | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("user_profiles")
    .select("*, school:schools(name)")
    .eq("id", user.id)
    .maybeSingle();

  const row = data as
    | (UserProfile & { school?: { name: string | null } | null })
    | null;
  if (!row) return null;

  const { school, ...profile } = row;
  return {
    ...profile,
    email: user.email ?? null,
    school_name: school?.name ?? null,
  };
}
