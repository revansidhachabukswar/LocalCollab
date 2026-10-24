import { createServerClient } from "@supabase/ssr";
import type { SetAllCookies } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const path = request.nextUrl.pathname;
  const publicRoute = path === "/login" || path.startsWith("/demo/") || path.startsWith("/auth/") || path.startsWith("/_next/") || path === "/favicon.ico";
  if (!url || !key) {
    if (publicRoute) return NextResponse.next();
    const login = new URL("/login", request.url);
    login.searchParams.set("setup", "supabase");
    return NextResponse.redirect(login);
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookies: Parameters<SetAllCookies>[0]) {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !publicRoute) return NextResponse.redirect(new URL("/login", request.url));
  if (!user && path === "/login" && request.nextUrl.searchParams.has("setup")) return NextResponse.redirect(new URL("/login", request.url));
  if (user && path === "/login") return NextResponse.redirect(new URL("/", request.url));
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"] };
