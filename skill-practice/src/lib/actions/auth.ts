"use server";
import type { UiTranslator } from "@/lib/i18n/config";
import { getTranslations } from "next-intl/server";

import {
  PASSWORD_UPDATE_COOKIE,
  safeRedirectPath,
  validateEmail,
  validatePasswordMatch,
  validatePasswordStrength,
} from "@/lib/auth-validation";
import { createClient } from "@/lib/supabase/server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export type AuthFormState = { error: string } | { success: string } | null;

export async function login(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const tr = await getTranslations("ui");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = safeRedirectPath(String(formData.get("next") ?? ""));

  if (!email || !password) {
    return { error: tr("credentialsRequired") };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: loginErrorMessage(tr, error.message) };
  }

  redirect(next ?? "/hub");
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
  const tr = await getTranslations("ui");
  const email = String(formData.get("email") ?? "").trim();
  const emailCheck = validateEmail(email, tr);

  if (!emailCheck.valid) {
    return { error: emailCheck.error ?? tr("invalidEmail") };
  }

  const failureMessage = tr("requestFailed");

  try {
    const origin = await getAppOrigin();
    const redirectTo = `${origin}/auth/callback?next=/auth/update-password`;
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    // Un account assente deve ricevere la stessa risposta di uno registrato.
    if (error && error.code !== "user_not_found") {
      return {
        error: error.status === 429 ? tr("tooManyRequests") : failureMessage,
      };
    }
  } catch {
    return { error: failureMessage };
  }

  return {
    success: tr("resetEmailSent"),
  };
}

export async function updatePassword(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const tr = await getTranslations("ui");
  const cookieStore = await cookies();

  if (!cookieStore.has(PASSWORD_UPDATE_COOKIE)) {
    return {
      error: tr("expiredPasswordLink"),
    };
  }

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  const strengthCheck = validatePasswordStrength(password, tr);
  if (!strengthCheck.valid) {
    return { error: strengthCheck.error ?? tr("invalidPassword") };
  }

  const matchCheck = validatePasswordMatch(password, confirm, tr);
  if (!matchCheck.valid) {
    return { error: matchCheck.error ?? tr("passwordMismatch") };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  cookieStore.set(PASSWORD_UPDATE_COOKIE, "", {
    maxAge: 0,
    path: "/",
  });

  redirect("/hub");
}

export async function changePassword(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const tr = await getTranslations("ui");
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword) {
    return { error: tr("currentPasswordRequired") };
  }

  const strengthCheck = validatePasswordStrength(newPassword, tr);
  if (!strengthCheck.valid) {
    return { error: strengthCheck.error ?? tr("invalidPassword") };
  }

  if (newPassword === currentPassword) {
    return { error: tr("passwordMustDiffer") };
  }

  const matchCheck = validatePasswordMatch(newPassword, confirm, tr);
  if (!matchCheck.valid) {
    return { error: matchCheck.error ?? tr("passwordMismatch") };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    current_password: currentPassword,
    password: newPassword,
  });

  if (error) {
    const message = error.message.toLowerCase();
    // Solo l'errore esplicito di password attuale errata; non mascherare errori generici.
    if (message.includes("current")) {
      return { error: tr("wrongCurrentPassword") };
    }
    return { error: error.message };
  }

  return { success: tr("passwordUpdated") };
}

function loginErrorMessage(tr: UiTranslator, message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) {
    return tr("wrongCredentials");
  }
  if (normalized.includes("email not confirmed")) {
    return tr("confirmInviteEmail");
  }
  if (normalized.includes("rate") || normalized.includes("too many")) {
    return tr("tooManyAttempts");
  }
  return tr("loginFailed");
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
