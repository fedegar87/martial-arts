export const PASSWORD_UPDATE_COOKIE = "auth_password_update";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

const ALLOWED_NEXT_PATHS = new Set([
  "/hub",
  "/onboarding",
  "/auth/update-password",
]);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ValidationResult = { valid: boolean; error?: string };

export function validatePasswordStrength(password: string): ValidationResult {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      error: `La password deve avere almeno ${MIN_PASSWORD_LENGTH} caratteri.`,
    };
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    return {
      valid: false,
      error: `La password non può superare ${MAX_PASSWORD_LENGTH} caratteri.`,
    };
  }

  return { valid: true };
}

export function validatePasswordMatch(
  password: string,
  confirm: string,
): ValidationResult {
  if (password !== confirm) {
    return {
      valid: false,
      error: "Le password non coincidono.",
    };
  }

  return { valid: true };
}

export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();

  if (!trimmed) {
    return { valid: false, error: "Email obbligatoria." };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: "Formato email non valido." };
  }

  return { valid: true };
}

export function isAllowedNextPath(next: string | null): string {
  if (!next) return "/hub";
  if (ALLOWED_NEXT_PATHS.has(next)) return next;
  return "/hub";
}
