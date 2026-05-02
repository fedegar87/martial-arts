import { createClient } from "@/lib/supabase/server";
import {
  isAllowedNextPath,
  PASSWORD_UPDATE_COOKIE,
} from "@/lib/auth-validation";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextRaw = searchParams.get("next");
  const next = nextRaw ? isAllowedNextPath(nextRaw) : "/auth/update-password";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`);

      if (next === "/auth/update-password") {
        response.cookies.set(PASSWORD_UPDATE_COOKIE, "1", {
          httpOnly: true,
          maxAge: 60 * 15,
          path: "/auth/update-password",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });
      }

      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=link_invalid`);
}
