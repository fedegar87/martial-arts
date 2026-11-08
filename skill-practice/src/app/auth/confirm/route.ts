import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { PASSWORD_UPDATE_COOKIE } from "@/lib/auth-validation";
import { NextResponse } from "next/server";
import { createPasswordUpdateGrant, PASSWORD_UPDATE_MAX_AGE } from "@/lib/password-update-grant";

const ALLOWED_CONFIRM_TYPES = new Set<EmailOtpType>(["invite", "recovery"]);

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = getConfirmType(searchParams.get("type"));

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${origin}/login?error=link_invalid`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error || !data.session) {
    return NextResponse.redirect(`${origin}/login?error=link_invalid`);
  }

  const claims = await supabase.auth.getClaims(data.session.access_token);
  const grant = !claims.error && claims.data
    ? createPasswordUpdateGrant(claims.data.claims)
    : null;
  if (!grant) return NextResponse.redirect(`${origin}/login?error=link_invalid`);

  const response = NextResponse.redirect(`${origin}/auth/update-password`);
  response.cookies.set(PASSWORD_UPDATE_COOKIE, grant, {
    httpOnly: true,
    maxAge: PASSWORD_UPDATE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

function getConfirmType(type: string | null): EmailOtpType | null {
  if (!type) return null;
  if (!ALLOWED_CONFIRM_TYPES.has(type as EmailOtpType)) return null;
  return type as EmailOtpType;
}
