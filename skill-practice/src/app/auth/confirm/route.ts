import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { PASSWORD_UPDATE_COOKIE } from "@/lib/auth-validation";
import { NextResponse } from "next/server";

const ALLOWED_CONFIRM_TYPES = new Set<EmailOtpType>(["invite", "recovery"]);

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = getConfirmType(searchParams.get("type"));

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${origin}/login?error=link_invalid`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=link_invalid`);
  }

  // Recovery/invite creano una sessione completa: confina alla pagina di
  // impostazione password (ignora next) e marca lo stato con cookie path "/",
  // cosi il middleware blocca l'accesso al resto dell'app finche non e fatta.
  const response = NextResponse.redirect(`${origin}/auth/update-password`);
  response.cookies.set(PASSWORD_UPDATE_COOKIE, "1", {
    httpOnly: true,
    maxAge: 60 * 15,
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
