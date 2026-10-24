"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type SocialLink = { platform: string; url: string };
const platforms = ["Instagram", "TikTok", "YouTube", "Facebook"];

export default function OnboardingForm({ email }: { email: string }) {
  const router = useRouter();
  const [role, setRole] = useState<"business" | "creator">("business");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [website, setWebsite] = useState("");
  const [bio, setBio] = useState("");
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState("English");
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function addSocial(platform: string) {
    if (socials.some(link => link.platform === platform)) return;
    setSocials([...socials, { platform, url: "" }]);
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const normalizeUrl = (value: string) => value && !/^https?:\/\//i.test(value) ? `https://${value}` : value;
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Your Google session expired. Sign in again.");
      const websiteUrl = normalizeUrl(website.trim());
      if (role === "business" && websiteUrl && !/^https?:\/\//i.test(websiteUrl)) throw new Error("Enter a valid website link.");
      const { error: profileError } = await supabase.from("profiles").upsert({ id: user.id, role, display_name: name.trim(), preferred_language: language, city: city.trim(), region: region.trim(), website_url: role === "business" ? websiteUrl || null : null }, { onConflict: "id" });
      if (profileError) throw profileError;
      if (role === "creator") {
        const { error: creatorError } = await supabase.from("creator_profiles").upsert({ user_id: user.id, bio: bio.trim(), languages: [language], categories: category ? [category.trim()] : [], accepts_ugc: true }, { onConflict: "user_id" });
        if (creatorError) throw creatorError;
        const validSocials = socials.filter(link => link.url.trim()).map(link => ({ user_id: user.id, platform: link.platform.toLowerCase(), profile_url: normalizeUrl(link.url.trim()), connection_type: "profile_link" }));
        if (validSocials.length) {
          const { error: socialError } = await supabase.from("social_accounts").upsert(validSocials, { onConflict: "user_id,platform" });
          if (socialError) throw socialError;
        }
      }
      router.replace("/"); router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save your profile."); setBusy(false);
    }
  }

  return <main className="onboarding-shell"><form className="onboarding-card" onSubmit={save}><div className="brand"><span className="brand-mark">↗</span><span>localcollab<span className="brand-period">.</span></span></div><span className="eyebrow">YOUR LOCALCOLLAB PROFILE</span><h1>Let’s set up your workspace.</h1><p>Signed in as {email}</p><div className="role-pick"><button type="button" className={role === "business" ? "active" : ""} onClick={() => setRole("business")}><span>▰</span><b>Business</b><small>I want to work with local creators</small></button><button type="button" className={role === "creator" ? "active" : ""} onClick={() => setRole("creator")}><span>✳</span><b>Creator</b><small>I create content for local brands</small></button></div><div className="onboarding-fields"><label>{role === "business" ? "Business name" : "Your name or creator name"}<input value={name} onChange={e => setName(e.target.value)} required placeholder={role === "business" ? "e.g. Juniper & Moss" : "e.g. Sam Rivera"}/></label><div className="form-row"><label>City<input value={city} onChange={e => setCity(e.target.value)} required placeholder="Mumbai"/></label><label>State / region<input value={region} onChange={e => setRegion(e.target.value)} required placeholder="Maharashtra"/></label></div><label>Preferred content language<select value={language} onChange={e => setLanguage(e.target.value)}><option>English</option><option>Español</option><option>Français</option><option>हिन्दी</option><option>中文</option><option>العربية</option></select></label>{role === "business" ? <label>Business website<input value={website} onChange={e => setWebsite(e.target.value)} type="url" placeholder="https://yourbusiness.com"/><small>Used to understand your brand during campaign planning.</small></label> : <><label>Creator category<input value={category} onChange={e => setCategory(e.target.value)} placeholder="Food, beauty, local lifestyle…"/></label><label>Short creator bio<textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="What do you like making? What makes your local perspective special?"/></label><div className="social-section"><div><b>Social profiles</b><small>Connect public profile links only. This does not grant access to private account analytics. Audience size is optional; UGC briefs focus on content quality.</small></div><div className="social-buttons">{platforms.map(platform => <button type="button" key={platform} disabled={socials.some(link => link.platform === platform)} onClick={() => addSocial(platform)}>＋ Connect {platform}</button>)}</div>{socials.map((link, index) => <label key={link.platform}>{link.platform} public profile link<input type="url" value={link.url} onChange={e => setSocials(socials.map((item, i) => i === index ? { ...item, url: e.target.value } : item))} placeholder={`https://${link.platform.toLowerCase()}.com/yourprofile`}/></label>)}</div></>}</div>{error && <p className="form-error" role="alert">{error}</p>}<button className="button-primary full-button" disabled={busy}>{busy ? "Saving your profile…" : "Save profile & continue →"}</button></form></main>;
}
