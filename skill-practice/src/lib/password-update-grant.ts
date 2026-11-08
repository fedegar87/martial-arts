import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

type Identity = { sub: string; session_id: string };

export const PASSWORD_UPDATE_MAX_AGE = 15 * 60;

function signature(payload: string, secret: string): Buffer {
  return createHmac("sha256", secret)
    .update(`practice/password-update/v1:${payload}`)
    .digest();
}

export function createPasswordUpdateGrant(
  identity: Identity,
  secret = process.env.SUPABASE_SERVICE_ROLE_KEY,
  now = Date.now(),
): string | null {
  if (!secret || !identity.sub || !identity.session_id) return null;
  const payload = Buffer.from(
    JSON.stringify({
      sub: identity.sub,
      session_id: identity.session_id,
      expiresAt: Math.floor(now / 1000) + PASSWORD_UPDATE_MAX_AGE,
    }),
  ).toString("base64url");
  return `${payload}.${signature(payload, secret).toString("base64url")}`;
}

export function verifyPasswordUpdateGrant(
  value: string | undefined,
  identity: Identity,
  secret = process.env.SUPABASE_SERVICE_ROLE_KEY,
  now = Date.now(),
): boolean {
  if (!secret || !value || value.length > 1024) return false;
  const [payload, mac, extra] = value.split(".");
  if (!payload || !mac || extra !== undefined || !/^[\w-]{43}$/.test(mac)) {
    return false;
  }
  if (!timingSafeEqual(Buffer.from(mac, "base64url"), signature(payload, secret))) {
    return false;
  }
  try {
    const grant: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof grant !== "object" || grant === null) return false;
    const fields = grant as Record<string, unknown>;
    return (
      fields.sub === identity.sub &&
      fields.session_id === identity.session_id &&
      typeof fields.expiresAt === "number" &&
      Number.isInteger(fields.expiresAt) &&
      fields.expiresAt > Math.floor(now / 1000)
    );
  } catch {
    return false;
  }
}
