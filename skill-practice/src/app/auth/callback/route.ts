import { createClient } from "@/lib/supabase/server";
import { PASSWORD_UPDATE_COOKIE } from "@/lib/auth-validation";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Questo callback serve solo il flusso reset password: confina alla pagina
      // update-password (ignora next, no open-redirect a /hub) e marca lo stato
      // con cookie path "/" per il blocco lato middleware.
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
  }

  return NextResponse.redirect(`${origin}/login?error=link_invalid`);
}
