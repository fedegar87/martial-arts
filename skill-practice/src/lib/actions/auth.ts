"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { resolveLandingDestination } from "@/lib/landing";
import { getCurrentProfile } from "@/lib/queries/user-profile";

export type AuthFormState = { error: string } | null;

export async function login(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email e password sono obbligatorie" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  // Sblocco esplicito: salta la landing e vai direttamente alla destination corretta.
  const profile = await getCurrentProfile();
  redirect(resolveLandingDestination(profile));
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
