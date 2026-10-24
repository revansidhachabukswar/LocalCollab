"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [needsSetup, setNeedsSetup] = useState(false);
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    setNeedsSetup(query.get("setup") === "supabase");
    if (query.get("error") === "auth") setError(query.get("message") || "Google sign-in did not finish. Check your Supabase and Google OAuth settings, then try again.");
  }, []);

  async function signIn() {
    setBusy(true); setError("");
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (authError) throw authError;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Google sign-in could not start.");
      setBusy(false);
    }
  }

  return <main className="auth-shell"><section className="auth-card"><div className="brand auth-brand"><span className="brand-mark">↗</span><span>localcollab<span className="brand-period">.</span></span></div><div className="auth-copy"><span className="eyebrow">A BETTER WAY TO COLLABORATE LOCALLY</span><h1>Good work starts<br/><span>close to home.</span></h1><p>Plan local campaigns, find creator partners, and make the results easier to see.</p></div>{needsSetup && <div className="auth-notice"><b>Supabase isn’t connected yet.</b><span>Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> to <code>.env.local</code>. Then enable Google under Supabase → Authentication → Sign-in providers and add this site’s <code>/auth/callback</code> URL to the redirect allow list.</span></div>}<button className="google-button" onClick={signIn} disabled={busy}><GoogleMark />{busy ? "Connecting to Google…" : "Continue with Google"}</button>{error && <p className="auth-error" role="alert">{error}</p>}<div className="demo-access"><span>Just exploring?</span><div><Link className="demo-button" href="/demo/business">Business demo <span>→</span></Link><Link className="demo-button" href="/demo/creator">Creator demo <span>→</span></Link></div></div><small>Google sign-in is required for a private workspace. Demo accounts use sample data.</small></section><aside className="auth-aside"><div className="auth-quote">“The best local partnerships feel like they already belong in the neighborhood.”</div><div><span className="auth-aside-mark">✳</span><b>Local voices. Real results.</b><p>Clear campaign terms and creator-led stories, all in one place.</p></div></aside></main>;
}

function GoogleMark() { return <svg width="20" height="20" viewBox="0 0 48 48" role="img" aria-label="Google"><path fill="#4285F4" d="M43.6 24.5c0-1.5-.1-3-.4-4.4H24v8.3h11a9.4 9.4 0 0 1-4.1 6.2v5.2h6.7c3.9-3.6 6-8.9 6-15.3Z"/><path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.7-5.2c-1.8 1.2-4 1.9-6.8 1.9-5.2 0-9.6-3.5-11.2-8.2H5.9v5.3A20 20 0 0 0 24 44Z"/><path fill="#FBBC05" d="M12.8 27.6a12 12 0 0 1 0-7.2v-5.3H5.9a20 20 0 0 0 0 17.8l6.9-5.3Z"/><path fill="#EA4335" d="M24 12.2c3 0 5.7 1.1 7.8 3.2l5.9-5.9C34.1 6.1 29.5 4 24 4A20 20 0 0 0 5.9 15.1l6.9 5.3c1.6-4.7 6-8.2 11.2-8.2Z"/></svg>; }
