import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const oauthError = searchParams.get("error_description") || searchParams.get("error");
  if (oauthError) {
    const login = new URL("/login", origin);
    login.searchParams.set("error", "auth");
    login.searchParams.set("message", oauthError.slice(0, 240));
    return NextResponse.redirect(login);
  }
  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(next.startsWith("/") && !next.startsWith("//") ? next : "/", origin));
      const login = new URL("/login", origin);
      login.searchParams.set("error", "auth");
      login.searchParams.set("message", error.message.slice(0, 240));
      return NextResponse.redirect(login);
    } catch (error) {
      const login = new URL("/login", origin);
      login.searchParams.set("error", "auth");
      login.searchParams.set("message", error instanceof Error ? error.message.slice(0, 240) : "Session exchange failed");
      return NextResponse.redirect(login);
    }
  }
  return NextResponse.redirect(new URL("/login?error=auth", origin));
}
