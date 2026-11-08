export const PASSWORD_UPDATE_COOKIE = "auth_password_update";

export function configuredAppOrigin(
  siteUrl: string | undefined,
  appOrigin: string | undefined,
  production: boolean,
): string | null {
  const value = siteUrl?.trim() || appOrigin?.trim();
  if (!value) return production ? null : "http://localhost:3000";
  try {
    const url = new URL(value);
    const local = !production && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if ((url.protocol !== "https:" && !(local && url.protocol === "http:")) ||
      url.username || url.password || url.pathname !== "/" || url.search || url.hash) return null;
    return url.origin;
  } catch {
    return null;
  }
}

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

export const PROTECTED_PREFIXES = [
  "/hub",
  "/today",
  "/programma",
  "/library",
  "/skill",
  "/plan",
  "/profile",
  "/onboarding",
  "/news",
  "/progress",
  "/calendar",
  "/sessions",
];

const ALLOWED_NEXT_PATHS = new Set([
  "/hub",
  "/onboarding",
  "/auth/update-password",
]);

/**
 * Valida un parametro `next` per il redirect post-login: solo path interni
 * assoluti che puntano a una route protetta nota. Previene open-redirect.
 */
export function safeRedirectPath(
  next: string | null | undefined,
): string | null {
  if (!next) return null;
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  const path = next.split("?")[0].split("#")[0];
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(prefix + "/"),
  );
  return isProtected ? next : null;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ValidationResult = { valid: boolean; error?: string };

export function validatePasswordStrength(
  password: string,
  tr?: UiTranslator,
): ValidationResult {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      error: tr
        ? tr("passwordMinLength", { p0: MIN_PASSWORD_LENGTH })
        : `La password deve avere almeno ${MIN_PASSWORD_LENGTH} caratteri.`,
    };
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    return {
      valid: false,
      error: tr
        ? tr("passwordMaxLength", { p0: MAX_PASSWORD_LENGTH })
        : `La password non può superare ${MAX_PASSWORD_LENGTH} caratteri.`,
    };
  }

  return { valid: true };
}

export function validatePasswordMatch(
  password: string,
  confirm: string,
  tr?: UiTranslator,
): ValidationResult {
  if (password !== confirm) {
    return {
      valid: false,
      error: tr ? tr("passwordMismatch") : "Le password non coincidono.",
    };
  }

  return { valid: true };
}

export function validateEmail(
  email: string,
  tr?: UiTranslator,
): ValidationResult {
  const trimmed = email.trim();

  if (!trimmed) {
    return {
      valid: false,
      error: tr ? tr("emailRequired") : "Email obbligatoria.",
    };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: tr ? tr("invalidEmailFormat") : "Formato email non valido.",
    };
  }

  return { valid: true };
}

export function isAllowedNextPath(next: string | null): string {
  if (!next) return "/hub";
  if (ALLOWED_NEXT_PATHS.has(next)) return next;
  return "/hub";
}
import type { UiTranslator } from "./i18n/config";
