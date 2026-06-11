import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { PASSWORD_UPDATE_COOKIE, PROTECTED_PREFIXES } from "@/lib/auth-validation";

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
    if (isProtected) {
      url.searchParams.set("next", path);
    }
    return NextResponse.redirect(url);
  }

  // Sessione di solo-recovery: finche il cambio password non e completato,
  // l'utente resta confinato alla pagina update-password (no accesso all'app).
  if (user && isProtected && request.cookies.has(PASSWORD_UPDATE_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/update-password";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
