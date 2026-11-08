import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { PASSWORD_UPDATE_COOKIE, PROTECTED_PREFIXES } from "@/lib/auth-validation";
import { verifyPasswordUpdateGrant } from "@/lib/password-update-grant";

const AUTHENTICATED_ONLY = ["/auth/update-password"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run logic between createServerClient and getUser.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(prefix + "/"),
  );
  const requiresAuth = AUTHENTICATED_ONLY.some(
    (prefix) => path === prefix || path.startsWith(prefix + "/"),
  );

  if (!user && (isProtected || requiresAuth)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    if (isProtected) {
      url.searchParams.set("next", path + request.nextUrl.search);
    }
    const response = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
    return response;
  }

  const marker = request.cookies.get(PASSWORD_UPDATE_COOKIE)?.value;
  if (user && (isProtected || requiresAuth) && marker) {
    const { data, error } = await supabase.auth.getClaims();
    const valid = !error && data && verifyPasswordUpdateGrant(marker, data.claims);
    if (valid && isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/update-password";
      url.search = "";
      const response = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
      return response;
    }
    if (!valid) {
      request.cookies.delete(PASSWORD_UPDATE_COOKIE);
      const refreshed = NextResponse.next({ request });
      supabaseResponse.cookies.getAll().forEach((cookie) => refreshed.cookies.set(cookie));
      refreshed.cookies.set(PASSWORD_UPDATE_COOKIE, "", { maxAge: 0, path: "/" });
      return refreshed;
    }
  }

  return supabaseResponse;
}
