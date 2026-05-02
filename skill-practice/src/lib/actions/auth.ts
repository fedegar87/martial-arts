"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { resolveLandingDestination } from "@/lib/landing";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import {
  PASSWORD_UPDATE_COOKIE,
  validateEmail,
  validatePasswordMatch,
  validatePasswordStrength,
} from "@/lib/auth-validation";

export type AuthFormState = { error: string } | { success: string } | null;

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

export async function requestPasswordReset(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const emailCheck = validateEmail(email);

  if (!emailCheck.valid) {
    return { error: emailCheck.error ?? "Email non valida." };
  }

  const origin = await getAppOrigin();
  const redirectTo = `${origin}/auth/callback?next=/auth/update-password`;
  const supabase = await createClient();

  await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  return {
    success:
      "Se l'email è registrata, riceverai un link per reimpostare la password.",
  };
}

export async function updatePassword(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const cookieStore = await cookies();

  if (!cookieStore.has(PASSWORD_UPDATE_COOKIE)) {
    return {
      error:
        "Il link non è valido o è scaduto. Richiedi un nuovo reset password.",
    };
  }

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  const strengthCheck = validatePasswordStrength(password);
  if (!strengthCheck.valid) {
    return { error: strengthCheck.error ?? "Password non valida." };
  }

  const matchCheck = validatePasswordMatch(password, confirm);
  if (!matchCheck.valid) {
    return { error: matchCheck.error ?? "Le password non coincidono." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  cookieStore.set(PASSWORD_UPDATE_COOKIE, "", {
    maxAge: 0,
    path: "/auth/update-password",
  });

  const profile = await getCurrentProfile();
  redirect(resolveLandingDestination(profile));
}

export async function changePassword(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword) {
    return { error: "Password attuale obbligatoria." };
  }

  const strengthCheck = validatePasswordStrength(newPassword);
  if (!strengthCheck.valid) {
    return { error: strengthCheck.error ?? "Password non valida." };
  }

  if (newPassword === currentPassword) {
    return { error: "La nuova password deve essere diversa da quella attuale." };
  }

  const matchCheck = validatePasswordMatch(newPassword, confirm);
  if (!matchCheck.valid) {
    return { error: matchCheck.error ?? "Le password non coincidono." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    current_password: currentPassword,
    password: newPassword,
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("current") || message.includes("invalid")) {
      return { error: "Password attuale errata." };
    }
    return { error: error.message };
  }

  return { success: "Password aggiornata." };
}

async function getAppOrigin(): Promise<string> {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.APP_ORIGIN;

  if (configuredOrigin) {
    return configuredOrigin.replace(/\/+$/, "");
  }

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");

  if (!host) {
    return "http://localhost:3000";
  }

  const proto =
    headerList.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");

  return `${proto}://${host}`;
}
