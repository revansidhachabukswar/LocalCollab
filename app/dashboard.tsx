"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";

type Role = "business" | "creator";
type NavKey = "overview" | "campaigns" | "discover" | "results" | "opportunities" | "studio" | "earnings";
type Creator = { name: string; handle: string; avatar: string; category: string; location: string; language: string; followers: string; engagement: string; rate: string; fit: number; kind: "reach" | "ugc"; blurb: string; color: string };
type Campaign = { title: string; location: string; code: string; budget: number; stage: string; uses: number; kind: string };

const creators: Creator[] = [
  { name: "Maya Chen", handle: "@mayamakesit", avatar: "MC", category: "Food & drink", location: "Portland · 2 mi", language: "English · Mandarin", followers: "8.2k", engagement: "7.8%", rate: "$140", fit: 96, kind: "reach", blurb: "Seasonal bites, independent cafés, and neighborhood favorites.", color: "peach" },
  { name: "Jordan Wells", handle: "@weekendwithj", avatar: "JW", category: "Local life", location: "Portland · 3 mi", language: "English", followers: "12k", engagement: "6.2%", rate: "$180", fit: 91, kind: "reach", blurb: "A warm, editorial eye for the people and places that make a city.", color: "blue" },
  { name: "Sam Rivera", handle: "@madebysam", avatar: "SR", category: "UGC video maker", location: "Beaverton · 7 mi", language: "English · Spanish", followers: "620", engagement: "—", rate: "$95 / video", fit: 98, kind: "ugc", blurb: "Clean product demos and natural café videos. 14 portfolio samples.", color: "sage" },
  { name: "Priya Nair", handle: "@pdxcrumbs", avatar: "PN", category: "UGC video maker", location: "Portland · 2 mi", language: "English · Hindi", followers: "310", engagement: "—", rate: "$80 / video", fit: 94, kind: "ugc", blurb: "Food close-ups, voiceovers, and short-form recipe edits.", color: "lilac" },
];

const initialCampaigns: Campaign[] = [
  { title: "Fall feels at Juniper & Moss", location: "Portland, OR", code: "COZYLOCAL", budget: 650, stage: "Live", uses: 78, kind: "Creator reach" },
  { title: "Saturday market mornings", location: "Portland, OR", code: "MARKET10", budget: 400, stage: "2 pitches", uses: 0, kind: "Creator reach" },
  { title: "Bring a friend, share a treat", location: "Beaverton, OR", code: "FRIENDTREAT", budget: 320, stage: "Completed", uses: 48, kind: "UGC + reach" },
];

const businessNav: { key: NavKey; label: string; icon: string }[] = [
  { key: "overview", label: "Overview", icon: "⌂" }, { key: "campaigns", label: "Campaigns", icon: "▤" },
  { key: "discover", label: "Find creators", icon: "◎" }, { key: "results", label: "Results", icon: "▥" },
];
const creatorNav: { key: NavKey; label: string; icon: string }[] = [
  { key: "overview", label: "Overview", icon: "⌂" }, { key: "opportunities", label: "Opportunities", icon: "✳" },
  { key: "studio", label: "Creator studio", icon: "✎" }, { key: "earnings", label: "Earnings & codes", icon: "↗" },
];

export default function Dashboard({ role, displayName, city, region, email }: { role: Role; displayName: string; city: string; region: string; email: string }) {
  const [nav, setNav] = useState<NavKey>("overview");
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState("");
  const [matchType, setMatchType] = useState<"reach" | "ugc">("reach");
  const [campaignName, setCampaignName] = useState("");
  const [campaignLocation, setCampaignLocation] = useState("Portland, OR");
  const [campaignLanguage, setCampaignLanguage] = useState("English (US)");
  const [campaignGoal, setCampaignGoal] = useState("Bring more people in-store");
  const [campaignBudget, setCampaignBudget] = useState("500");
  const [copilotDraft, setCopilotDraft] = useState("");
  const [copilotWorkflow, setCopilotWorkflow] = useState<string[]>([]);
  const [studioTask, setStudioTask] = useState<"caption" | "voiceover" | "localize" | "pitch">("caption");
  const [studioInput, setStudioInput] = useState("");
  const [studioMarket, setStudioMarket] = useState("Portland, Oregon");
  const [studioLanguage, setStudioLanguage] = useState("English (US)");
  const [studioOutput, setStudioOutput] = useState("");
  const [studioDemo, setStudioDemo] = useState(false);
  const [studioWorkflow, setStudioWorkflow] = useState<string[]>([]);
  const [studioBusy, setStudioBusy] = useState(false);
  const [redemptions, setRedemptions] = useState(126);
  const navItems = role === "business" ? businessNav : creatorNav;

  const pageTitle = useMemo(() => {
    const labels: Record<NavKey, string> = { overview: "Overview", campaigns: "Campaigns", discover: "Find creators", results: "Results", opportunities: "Opportunities", studio: "Creator studio", earnings: "Earnings & codes" };
    return labels[nav];
  }, [nav]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  async function generateContent() {
    if (!studioInput.trim()) { notify("Add your campaign or content idea first."); return; }
    setStudioBusy(true);
    try {
      const response = await fetch("/api/copilot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ task: studioTask, prompt: studioInput, locale: studioLanguage, market: studioMarket }) });
      const data = await response.json() as { text?: string; error?: string; demo?: boolean; workflow?: string[] };
      if (!response.ok) throw new Error(data.error || "Please try again.");
      setStudioOutput(data.text || "");
      setStudioDemo(Boolean(data.demo));
      setStudioWorkflow(data.workflow || []);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Could not generate content.");
    } finally {
      setStudioBusy(false);
    }
  }

  function addCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = campaignName.trim();
    if (!title) return;
    const code = title.toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 9) || "LOCAL10";
    setCampaigns([{ title, location: campaignLocation, code, budget: Number(campaignBudget) || 0, stage: "Brief ready", uses: 0, kind: "Creator reach" }, ...campaigns]);
    setModal(false);
    setCampaignName("");
    setNav("campaigns");
    notify("Brief drafted. Review it before sharing with creators.");
  }

  async function askCopilot() {
    const prompt = `${campaignGoal}. Promote ${campaignName || "our local business"}. Budget $${campaignBudget}.`;
    try {
      const response = await fetch("/api/copilot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ task: "brief", prompt, locale: campaignLanguage, market: campaignLocation }) });
      const data = await response.json() as { text?: string; error?: string; workflow?: string[] };
      if (!response.ok) throw new Error(data.error || "Could not prepare a brief.");
      setCopilotDraft(data.text || "");
      setCopilotWorkflow(data.workflow || []);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Could not prepare a brief.");
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">↗</span><span>localcollab<span className="brand-period">.</span></span></div>
        <div className="side-label">WORKSPACE</div>
        <div className="account-kind"><span>{role === "business" ? "▰" : "✳"}</span>{role === "business" ? "Business workspace" : "Creator workspace"}</div>
        <div className="side-label nav-label">{role === "business" ? "BUSINESS SPACE" : "CREATOR SPACE"}</div>
        <nav className="side-nav">
          {navItems.map(item => <button key={item.key} className={nav === item.key ? "nav-active" : ""} onClick={() => setNav(item.key)}><span className="nav-icon">{item.icon}</span>{item.label}</button>)}
        </nav>
        <div className="market-card"><span className="market-icon">⌖</span><div><small>YOUR LOCAL MARKET</small><b>{[city, region].filter(Boolean).join(", ") || "Add your market"}</b></div><span className="chevron">⌄</span></div>
        <div className="sidebar-bottom"><div className="user-avatar">{displayName.split(/\s+/).map(part => part[0]).join("").slice(0,2).toUpperCase()}</div><div className="user-lines"><b>{displayName}</b><span>{email}</span></div><form action="/auth/signout" method="post"><button className="dots" aria-label="Sign out" title="Sign out">↗</button></form></div>
      </aside>

      <main className="main-area">
        <header className="topbar"><div className="breadcrumb"><span>Workspace</span><b>/</b><strong>{pageTitle}</strong></div><div className="top-actions"><span className="market-pill"><i></i> {[city, region].filter(Boolean).join(", ")}</span><button className="icon-btn" aria-label="Notifications" onClick={() => notify("You’re all caught up")}>♧<span className="notification-dot"></span></button><div className="header-avatar" aria-label={displayName}>{displayName.split(/\s+/).map(part => part[0]).join("").slice(0,2).toUpperCase()}</div><form action="/auth/signout" method="post" className="top-signout"><button className="icon-btn" aria-label="Sign out" title="Sign out">↗</button></form></div></header>
        <div className="page-content">
          {role === "business" && nav === "overview" && <BusinessOverview campaigns={campaigns} redemptions={redemptions} onCreate={() => setModal(true)} onNavigate={setNav} onNotify={notify} />}
          {role === "business" && nav === "campaigns" && <Campaigns campaigns={campaigns} onCreate={() => setModal(true)} />}
          {role === "business" && nav === "discover" && <CreatorDiscovery matchType={matchType} setMatchType={setMatchType} onInvite={name => notify(`Invitation draft ready for ${name}`)} />}
          {role === "business" && nav === "results" && <BusinessResults campaigns={campaigns} redemptions={redemptions} onAdd={() => { setRedemptions(value => value + 1); notify("Sample offer-code redemption recorded"); }} onNotify={notify} />}
          {role === "creator" && nav === "overview" && <CreatorOverview onNavigate={setNav} onNotify={notify} />}
          {role === "creator" && nav === "opportunities" && <Opportunities onPitch={name => { setStudioTask("pitch"); setStudioInput(`Campaign: ${name}. My creator style is authentic local finds. Help me draft a short, specific pitch and ask any questions needed before making claims.`); setNav("studio"); }} />}
          {role === "creator" && nav === "studio" && <CreatorStudio task={studioTask} setTask={setStudioTask} input={studioInput} setInput={setStudioInput} market={studioMarket} setMarket={setStudioMarket} language={studioLanguage} setLanguage={setStudioLanguage} output={studioOutput} demo={studioDemo} workflow={studioWorkflow} busy={studioBusy} onGenerate={generateContent} onNotify={notify} />}
          {role === "creator" && nav === "earnings" && <CreatorEarnings onNotify={notify} />}
        </div>
      </main>

      {modal && <div className="modal-scrim" onMouseDown={event => { if (event.target === event.currentTarget) setModal(false); }}><form className="campaign-modal" onSubmit={addCampaign}><div className="modal-heading"><div><span className="eyebrow">CAMPAIGN COPILOT</span><h2>Start with a local idea</h2><p>Share the basics. Your brief stays editable until you approve it.</p></div><button type="button" className="close-btn" onClick={() => setModal(false)}>×</button></div><label>What are you promoting?<input value={campaignName} onChange={event => setCampaignName(event.target.value)} placeholder="e.g. Our new fall brunch menu" required /></label><div className="form-row"><label>Campaign goal<select value={campaignGoal} onChange={event => setCampaignGoal(event.target.value)}><option>Bring more people in-store</option><option>Build local awareness</option><option>Promote a new product</option><option>Get authentic UGC videos</option></select></label><label>Budget (USD)<select value={campaignBudget} onChange={event => setCampaignBudget(event.target.value)}><option value="250">Up to $250</option><option value="500">$250–$500</option><option value="1000">$500–$1,000</option></select></label></div><div className="form-row"><label>City or neighborhood<input value={campaignLocation} onChange={event => setCampaignLocation(event.target.value)} /></label><label>Campaign language<select value={campaignLanguage} onChange={event => setCampaignLanguage(event.target.value)}><option>English (US)</option><option>Español (US)</option><option>English (Canada)</option><option>Français (Canada)</option></select></label></div><div className="modal-tip">✦ &nbsp;Copilot can suggest creators, deliverables, and a unique offer code for tracking results.</div>{copilotDraft && <div className="copilot-draft"><b>Copilot draft · review and edit before sharing</b>{copilotWorkflow.length > 0 && <div className="agent-flow">{copilotWorkflow.map(name => <span key={name}>{name}</span>)}</div>}<textarea value={copilotDraft} onChange={event => setCopilotDraft(event.target.value)} rows={5}/></div>}<div className="modal-actions"><button type="button" className="button-quiet" onClick={askCopilot}>✦ Ask Copilot</button><button type="submit" className="button-primary">Create draft <span>→</span></button></div></form></div>}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function PageIntro({ eyebrow, title, description, action, actionText }: { eyebrow: string; title: ReactNode; description: string; action?: () => void; actionText?: string }) {
  return <div className="page-intro"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action && <button className="button-primary" onClick={action}>{actionText || "＋ Create campaign"}</button>}</div>;
}

function BusinessOverview({ campaigns, redemptions, onCreate, onNavigate, onNotify }: { campaigns: Campaign[]; redemptions: number; onCreate: () => void; onNavigate: (key: NavKey) => void; onNotify: (message: string) => void }) {
  return <>
    <PageIntro eyebrow="SATURDAY, OCTOBER 24 · PORTLAND, OR" title={<>Good morning, Juniper team <span className="sun-mark">✳</span></>} description="Your neighborhood is talking. Here’s how your partnerships are doing." action={onCreate} actionText="＋ Create a campaign" />
    <div className="stat-grid"><StatCard icon="▤" label="Active campaigns" value="3" note="1 brief ready to share" /><StatCard icon="◎" label="Creator reach" value="42.8k" note="↑ 18% this month" /><StatCard icon="⌁" label="Offer-code uses" value={String(redemptions)} note="↑ 32 this week" /><StatCard icon="♡" label="Avg. engagement" value="6.4%" note="↑ 1.2% above local avg." /></div>
    <div className="dashboard-grid"><section className="panel campaign-panel"><div className="panel-heading"><div><h2>Campaigns in motion</h2><p>Your local partnerships at a glance.</p></div><button className="text-link" onClick={() => onNavigate("campaigns")}>All campaigns <span>→</span></button></div>{campaigns.slice(0, 3).map((campaign, i) => <CampaignRow key={`${campaign.code}-${i}`} campaign={campaign} />)}</section>
      <section className="panel match-panel"><div className="panel-heading"><div><h2>Creator matches</h2><p>Thoughtful fits for your next brief.</p></div><button className="text-link" onClick={() => onNavigate("discover")}>Explore <span>→</span></button></div>{creators.slice(0, 3).map((creator, i) => <CreatorLine key={creator.name} creator={creator} />)}<div className="match-note">✦ &nbsp;Matched to your location, audience & style</div></section>
      <section className="panel activity-panel"><div className="panel-heading"><div><h2>Recent activity</h2><p>Fresh from your creator community.</p></div><button className="text-link" onClick={() => onNotify("Showing latest activity")}>View all <span>→</span></button></div><Activity icon="✦" title="Maya Chen sent a pitch" detail="Saturday market mornings · $120 proposed" time="12 min ago" /><Activity icon="↗" title="COZYLOCAL was used 8 times" detail="Attributed to Fall feels at Juniper & Moss" time="Today" /><Activity icon="✓" title="Sam Rivera delivered a video draft" detail="Fall menu UGC · Ready for your review" time="Yesterday" /></section>
      <section className="insight-card"><span className="insight-spark">✳</span><span className="eyebrow">LOCAL INSIGHT · PORTLAND</span><h3>Good stories travel a few blocks.</h3><p>Neighborhood businesses are seeing strong response from creators who make useful, save-worthy local guides.</p><button onClick={() => onNavigate("discover")}>See local creators <span>→</span></button></section>
    </div>
  </>;
}

function StatCard({ icon, label, value, note }: { icon: string; label: string; value: string; note: string }) {
  return <div className="stat-card"><div className="stat-card-top"><span>{label}</span><i>{icon}</i></div><strong>{value}</strong><small>{note}</small></div>;
}

function CampaignRow({ campaign }: { campaign: Campaign }) {
  const state = campaign.stage === "Live" ? "live" : campaign.stage === "Completed" ? "complete" : "review";
  return <article className="campaign-row"><div className="campaign-row-head"><div className="campaign-icon">{campaign.kind.includes("UGC") ? "▣" : "✳"}</div><div className="campaign-title"><h3>{campaign.title}</h3><p>{campaign.kind} · {campaign.location}</p></div><span className={`status status-${state}`}>{campaign.stage}</span></div><div className="campaign-data"><span>Offer code <b>{campaign.code}</b></span><span>Budget <b>${campaign.budget}</b></span><span>Code uses <b>{campaign.uses}</b></span></div>{campaign.stage === "Live" && <div className="progress"><span style={{ width: "72%" }} /></div>}</article>;
}

function CreatorLine({ creator }: { creator: Creator }) {
  return <div className="creator-line"><div className={`creator-avatar ${creator.color}`}>{creator.avatar}</div><div className="creator-copy"><b>{creator.name}</b><span>{creator.category} · {creator.location}</span></div><span className="fit-score">{creator.fit}% fit</span></div>;
}

function Activity({ icon, title, detail, time }: { icon: string; title: string; detail: string; time: string }) {
  return <div className="activity-row"><span className="activity-icon">{icon}</span><div><b>{title}</b><p>{detail}</p><small>{time}</small></div></div>;
}

function Campaigns({ campaigns, onCreate }: { campaigns: Campaign[]; onCreate: () => void }) {
  return <><PageIntro eyebrow="YOUR PARTNERSHIPS" title="Campaigns" description="Every brief, creator, deliverable, and result in one place." action={onCreate} actionText="＋ Create campaign"/><div className="panel table-panel"><div className="panel-heading"><div><h2>All campaigns</h2><p>{campaigns.length} campaigns across your workspace.</p></div><span className="subtle-pill">All statuses⌄</span></div>{campaigns.map((campaign, i) => <CampaignRow key={`${campaign.code}-${i}`} campaign={campaign}/>)}</div></>;
}

function CreatorDiscovery({ matchType, setMatchType, onInvite }: { matchType: "reach" | "ugc"; setMatchType: (type: "reach" | "ugc") => void; onInvite: (name: string) => void }) {
  const filtered = creators.filter(creator => creator.kind === matchType);
  return <><PageIntro eyebrow="LOCAL PEOPLE, GREAT STORIES" title="Find your creator match" description="Choose whether you need local audience reach or great content production."/><div className="match-toggle"><button className={matchType === "reach" ? "active" : ""} onClick={() => setMatchType("reach")}>◎ &nbsp;Creator reach <small>Audience, community & influence</small></button><button className={matchType === "ugc" ? "active" : ""} onClick={() => setMatchType("ugc")}>▣ &nbsp;UGC makers <small>Content quality & price, any audience size</small></button></div><div className="filters-row"><span>⌖ &nbsp;Within 10 miles</span><span>⌘ &nbsp;All categories</span><span>◉ &nbsp;English · Spanish</span><span className="result-count">{filtered.length} local matches</span></div><div className="creator-grid">{filtered.map(creator => <article className="creator-card" key={creator.name}><div className="creator-card-top"><div className={`creator-avatar large ${creator.color}`}>{creator.avatar}</div><span className="fit-score">{creator.fit}% fit</span></div><h3>{creator.name}</h3><span className="creator-handle">{creator.handle} · {creator.location}</span><p>{creator.blurb}</p><div className="creator-meta"><span>{matchType === "ugc" ? "Portfolio" : "Audience"}<b>{matchType === "ugc" ? "14 samples" : creator.followers}</b></span><span>Languages<b>{creator.language}</b></span><span>{matchType === "ugc" ? "Starting at" : "Engagement"}<b>{matchType === "ugc" ? creator.rate : creator.engagement}</b></span></div><div className="why-fit">✦ {matchType === "ugc" ? "Portfolio quality and rate fit your brief" : "Nearby audience and content fit"}</div><button className="button-primary full-button" onClick={() => onInvite(creator.name)}>Invite to campaign <span>→</span></button></article>)}</div></>;
}

function BusinessResults({ campaigns, redemptions, onAdd, onNotify }: { campaigns: Campaign[]; redemptions: number; onAdd: () => void; onNotify: (message: string) => void }) {
  const [analysis, setAnalysis] = useState("");
  const [agentWorkflow, setAgentWorkflow] = useState<string[]>([]);
  const [demo, setDemo] = useState(false);
  const [busy, setBusy] = useState(false);
  async function summarize() {
    setBusy(true);
    try {
      const prompt = JSON.stringify({ campaigns: campaigns.map(campaign => ({ title: campaign.title, code: campaign.code, recordedUses: campaign.uses })), totalRecordedOfferUses: redemptions, estimatedReach: 42810, estimatedEngagement: "6.4%", sampleAttributedSales: 2460 });
      const response = await fetch("/api/copilot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ task: "results", prompt, locale: "English (US)", market: "Portland, Oregon" }) });
      const data = await response.json() as { text?: string; error?: string; workflow?: string[]; demo?: boolean };
      if (!response.ok) throw new Error(data.error || "Could not prepare a results recap.");
      setAnalysis(data.text || "");
      setAgentWorkflow(data.workflow || []);
      setDemo(Boolean(data.demo));
    } catch (error) {
      onNotify(error instanceof Error ? error.message : "Could not prepare a results recap.");
    } finally {
      setBusy(false);
    }
  }
  return <><PageIntro eyebrow="MEASURE THE GOOD YOU DO" title="Campaign results" description="See which local stories brought customers through your door."/><div className="results-tools"><button className="button-primary" onClick={summarize} disabled={busy}>{busy ? "Reviewing results…" : "✦ Ask Results Analyst"}</button><button className="button-quiet" onClick={onAdd}>＋ Record sample use</button></div><div className="stat-grid results-stats"><StatCard icon="⌁" label="Tracked offer uses" value={String(redemptions)} note="Across 3 campaign codes"/><StatCard icon="$" label="Attributed sales" value="$2,460" note="Based on recorded sample data"/><StatCard icon="◎" label="Estimated reach" value="42.8k" note="Creator-reported estimate"/><StatCard icon="↗" label="Return on spend" value="2.8×" note="Attribution is an estimate"/></div>{analysis && <section className="panel analyst-panel"><div className="panel-heading"><div><h2>Campaign Results Analyst</h2><p>{demo ? "Sample agent response · simulated" : "AI-assisted recap · review before relying on it"}</p></div></div><div className="agent-flow">{agentWorkflow.map(name => <span key={name}>{name}</span>)}</div><textarea className="output-text analyst-output" value={analysis} onChange={event => setAnalysis(event.target.value)} aria-label="Editable results analysis" /></section>}<div className="dashboard-grid results-layout"><section className="panel"><div className="panel-heading"><div><h2>Offer-code performance</h2><p>Sample redemptions by campaign. Code use is one attribution signal.</p></div><span className="subtle-pill">Last 30 days⌄</span></div>{campaigns.map((campaign, i) => <div className="result-row" key={`${campaign.code}-${i}`}><div><b>{campaign.title}</b><span>{campaign.code} · {campaign.location}</span></div><strong>{campaign.uses}<small> uses</small></strong></div>)}</section><section className="panel"><div className="panel-heading"><div><h2>Attribution note</h2><p>What these numbers mean.</p></div></div><div className="attribution-box"><span>⌁</span><h3>Unique codes make impact easier to see.</h3><p>Each creator receives a distinct offer code. Recorded redemptions are attributed to that code. Some visits and purchases may happen without using a code.</p><small>In a live version, businesses connect their POS or booking records for stronger sales attribution.</small></div></section></div></>;
}

function CreatorOverview({ onNavigate, onNotify }: { onNavigate: (key: NavKey) => void; onNotify: (message: string) => void }) {
  return <><PageIntro eyebrow="YOUR CREATOR SPACE · BEAVERTON, OR" title={<>Make good work. Find good partners. <span className="sun-mark">✳</span></>} description="Local opportunities, clear terms, and a little help making your next great post." action={() => onNavigate("opportunities")} actionText="Browse opportunities"/><div className="stat-grid"><StatCard icon="✳" label="Open opportunities" value="12" note="Within 15 miles of you"/><StatCard icon="▣" label="UGC briefs" value="5" note="Follower count not required"/><StatCard icon="⌁" label="Offer-code uses" value="34" note="Across your live campaigns"/><StatCard icon="$" label="This month" value="$480" note="$90 performance bonus"/></div><div className="dashboard-grid"><section className="panel"><div className="panel-heading"><div><h2>Picked for your portfolio</h2><p>Local briefs that fit your style and languages.</p></div><button className="text-link" onClick={() => onNavigate("opportunities")}>All briefs <span>→</span></button></div><OpportunityRow title="Fall menu, honest first bite" business="Juniper & Moss · Portland · 2.1 mi" compensation="$140 + hosted brunch" type="Creator reach"/><OpportunityRow title="Three cozy café clips" business="Mosslight Coffee · Beaverton · 1.4 mi" compensation="$95 / video · usage included" type="UGC maker"/><OpportunityRow title="Neighborhood weekend guide" business="Saturday Market · Portland · 6.8 mi" compensation="$120 fixed + MARKET10 bonus" type="Creator reach"/></section><section className="panel studio-promo"><span className="studio-icon">✎</span><span className="eyebrow">YOUR CREATOR STUDIO</span><h2>Words can sound like you.</h2><p>Draft captions, shape a voiceover, and adapt your post for a local audience—all from the campaign brief.</p><button className="button-primary" onClick={() => onNavigate("studio")}>Open creator studio <span>→</span></button><div className="language-tags"><span>English</span><span>Español</span><span>Local tone</span></div></section><section className="panel activity-panel"><div className="panel-heading"><div><h2>Campaign tracker</h2><p>Keep your agreements and results close.</p></div><button className="text-link" onClick={() => onNavigate("earnings")}>Offer codes <span>→</span></button></div><Activity icon="✓" title="Fall menu video · Draft due" detail="Juniper & Moss · Due Oct 26" time="2 days left"/><Activity icon="⌁" title="COZYLOCAL · 18 uses" detail="Your attributed code activity" time="Updated today"/></section><section className="local-card"><span className="eyebrow">LOCALIZED FOR YOU</span><h3>Work in the language your community uses.</h3><p>Your profile lists English and Spanish. We’ll surface briefs where those languages are a plus.</p><button onClick={() => onNotify("Language preferences are ready to update")}>Edit language preferences →</button></section></div></>;
}

function OpportunityRow({ title, business, compensation, type }: { title: string; business: string; compensation: string; type: string }) {
  return <article className="opportunity-row"><div className="opportunity-mark">{type === "UGC maker" ? "▣" : "✳"}</div><div className="opportunity-copy"><span className="type-label">{type}</span><h3>{title}</h3><p>{business}</p></div><div className="opportunity-pay"><b>{compensation}</b><span>Brief is open</span></div></article>;
}

function Opportunities({ onPitch }: { onPitch: (name: string) => void }) {
  return <><PageIntro eyebrow="LOCAL PAID WORK" title="Opportunities for you" description="Clear briefs from nearby businesses. Pitch only when it feels right."/><div className="filters-row"><span>⌖ &nbsp;Within 15 miles</span><span>◉ &nbsp;English · Spanish</span><span>☷ &nbsp;All opportunity types</span></div><div className="opportunity-list">{[{ title: "Fall menu, honest first bite", biz: "Juniper & Moss · Portland · 2.1 mi", pay: "$140 fixed + hosted brunch", tag: "Creator reach", desc: "Share an authentic first look at the new fall menu. One short video, caption, and unique code. English or Spanish welcome." }, { title: "Three cozy café clips", biz: "Mosslight Coffee · Beaverton · 1.4 mi", pay: "$95 per finished video", tag: "UGC · no audience needed", desc: "Create three vertical café clips for the brand’s social channels. Portfolio quality matters; follower count does not. Usage: 90 days." }, { title: "Neighborhood weekend guide", biz: "Saturday Market · Portland · 6.8 mi", pay: "$120 + code-use bonus", tag: "Creator reach", desc: "Make a save-worthy guide to weekend market finds, with a tracked offer code and clear disclosure." }].map(item => <article className="opportunity-card" key={item.title}><div className="opportunity-card-top"><span className="type-label">{item.tag}</span><span className="distance">⌖ {item.biz.split(" · ")[2]}</span></div><h2>{item.title}</h2><p className="opportunity-business">{item.biz}</p><p className="opportunity-desc">{item.desc}</p><div className="opportunity-card-foot"><div><b>{item.pay}</b><span>Terms shown upfront · Local offer tracking</span></div><button className="button-primary" onClick={() => onPitch(item.title)}>Draft a pitch <span>→</span></button></div></article>)}</div></>;
}

function CreatorStudio({ task, setTask, input, setInput, market, setMarket, language, setLanguage, output, demo, workflow, busy, onGenerate, onNotify }: { task: "caption" | "voiceover" | "localize" | "pitch"; setTask: (value: "caption" | "voiceover" | "localize" | "pitch") => void; input: string; setInput: (value: string) => void; market: string; setMarket: (value: string) => void; language: string; setLanguage: (value: string) => void; output: string; demo: boolean; workflow: string[]; busy: boolean; onGenerate: () => void; onNotify: (message: string) => void }) {
  function dictate() {
    const w = window as Window & { SpeechRecognition?: new () => { lang: string; interimResults: boolean; onresult: (event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void; onerror: () => void; start: () => void }; webkitSpeechRecognition?: new () => { lang: string; interimResults: boolean; onresult: (event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void; onerror: () => void; start: () => void } };
    const Recognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Recognition) { onNotify("Voice input isn’t supported in this browser. You can type your idea instead."); return; }
    const recognition = new Recognition();
    recognition.lang = language.startsWith("Español") ? "es-US" : language.startsWith("Français") ? "fr-CA" : "en-US";
    recognition.interimResults = false;
    recognition.onresult = event => setInput(`${input}${input ? " " : ""}${event.results[0][0].transcript}`);
    recognition.onerror = () => onNotify("Couldn’t hear that clearly. Try again or type your idea.");
    recognition.start();
    onNotify("Listening… speak your content idea.");
  }
  function readAloud() {
    if (!output || !("speechSynthesis" in window)) { onNotify("Read-aloud is not available here."); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(output);
    utterance.lang = language.startsWith("Español") ? "es-US" : language.startsWith("Français") ? "fr-CA" : "en-US";
    window.speechSynthesis.speak(utterance);
  }
  return <><PageIntro eyebrow="CREATOR CONTENT STUDIO" title="Make it yours." description="Turn a campaign brief into words, voice, and content that feel local."/><div className="studio-layout"><section className="panel studio-controls"><div className="panel-heading"><div><h2>Start with a campaign idea</h2><p>Generated content stays editable. Check offer and disclosure details.</p></div><span className="ai-badge">✦ Copilot</span></div><div className="studio-tabs"><button className={task === "caption" ? "active" : ""} onClick={() => setTask("caption")}>✎ Caption</button><button className={task === "voiceover" ? "active" : ""} onClick={() => setTask("voiceover")}>◖ Voiceover</button><button className={task === "pitch" ? "active" : ""} onClick={() => setTask("pitch")}>↗ Pitch</button><button className={task === "localize" ? "active" : ""} onClick={() => setTask("localize")}>⌖ Localize</button></div><label className="studio-label">Your idea or campaign brief<textarea value={input} onChange={event => setInput(event.target.value)} placeholder="Tell us what you’re making, the offer, and what you want people to do…" rows={5}/></label><div className="studio-actions"><button className="button-quiet" onClick={dictate}>◉ &nbsp;Dictate idea</button><div className="studio-selects"><label>Language<select value={language} onChange={event => setLanguage(event.target.value)}><option>English (US)</option><option>Español (US)</option><option>English (Canada)</option><option>Français (Canada)</option></select></label><label>Local market<input value={market} onChange={event => setMarket(event.target.value)} /></label></div></div><button className="button-primary generate-button" disabled={busy} onClick={onGenerate}>{busy ? "Preparing your draft…" : "✦ Generate a draft"}</button><p className="privacy-note">Your browser’s voice input is only used to fill the text box. You approve and publish every asset.</p></section><section className="panel output-panel"><div className="panel-heading"><div><h2>Your draft</h2><p>{output ? "Review, edit, and make it sound like you." : "Your draft will appear here."}</p></div>{output && <button className="text-link" onClick={readAloud}>◖ Listen</button>}</div>{output ? <><textarea className="output-text" defaultValue={output} key={output} aria-label="Generated editable draft"/><div className="output-footer"><span>{demo ? "Demo suggestion · AI not connected" : "AI suggestion · Please review before posting"}</span><button className="button-quiet" onClick={() => { navigator.clipboard?.writeText(output); onNotify("Draft copied"); }}>▢ Copy text</button></div>{workflow.length > 0 && <div className="agent-workflow"><b>{demo ? "Sample workflow · simulated" : "Agent workflow · live"}</b><div className="agent-flow">{workflow.map(name => <span key={name}>{name}</span>)}</div></div>}</> : <div className="empty-output"><span>✎</span><b>Good content starts with your point of view.</b><p>We’ll help shape your idea while keeping the local details and offer clear.</p></div>}<div className="asset-checks"><b>Before you post</b><span>□ Confirm offer code and dates</span><span>□ Add agreed disclosure</span><span>□ Check local names and pronunciation</span></div></section></div></>;
}

function CreatorEarnings({ onNotify }: { onNotify: (message: string) => void }) {
  return <><PageIntro eyebrow="CLEAR TERMS, VISIBLE RESULTS" title="Earnings & offer codes" description="See the fixed fees and results bonuses you agreed to, in one place."/><div className="stat-grid"><StatCard icon="$" label="Fixed fees agreed" value="$390" note="Across 3 active briefs"/><StatCard icon="↗" label="Performance bonus" value="$90" note="Based on sample code uses"/><StatCard icon="⌁" label="Offer-code uses" value="34" note="COZYLOCAL · 18 uses"/><StatCard icon="◷" label="Pending review" value="$140" note="Due after approved delivery"/></div><div className="panel table-panel"><div className="panel-heading"><div><h2>Your campaign terms</h2><p>Compensation and attribution are shown as recorded sample data.</p></div><span className="subtle-pill">All campaigns⌄</span></div><div className="result-row"><div><b>Fall menu, honest first bite</b><span>Juniper & Moss · Code COZYLOCAL · 18 uses</span></div><strong>$140<small> fixed + bonus</small></strong></div><div className="result-row"><div><b>Three cozy café clips</b><span>Mosslight Coffee · UGC · 90-day usage</span></div><strong>$190<small> fixed</small></strong></div><div className="result-row"><div><b>Neighborhood weekend guide</b><span>Saturday Market · Code MARKET10 · 16 uses</span></div><strong>$60<small> fixed + bonus</small></strong></div><div className="payout-note">ⓘ &nbsp;Offer-code counts are attribution signals. Payment shown here is sample data; LocalCollab does not process payouts in this demo.</div><button className="button-quiet" onClick={() => onNotify("Your payment terms are ready to review")}>Review agreed terms →</button></div></>;
}
