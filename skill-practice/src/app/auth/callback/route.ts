import { createClient } from "@/lib/supabase/server";
import { PASSWORD_UPDATE_COOKIE } from "@/lib/auth-validation";
import { NextResponse } from "next/server";
import { createPasswordUpdateGrant, PASSWORD_UPDATE_MAX_AGE } from "@/lib/password-update-grant";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.session) {
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
  }

  return NextResponse.redirect(`${origin}/login?error=link_invalid`);
}
