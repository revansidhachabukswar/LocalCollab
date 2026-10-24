import { NextResponse } from "next/server";
import { runLocalCollabAgents, type CopilotTask } from "@/lib/agents/orchestrator";
import { createClient } from "@/lib/supabase/server";

type RequestBody = { task?: CopilotTask; prompt?: string; locale?: string; market?: string };

const demoResponses: Record<CopilotTask, (body: RequestBody) => string> = {
  brief: body => `CAMPAIGN PLAN\n\nGoal: ${body.prompt || "Bring more local customers in"}\nMarket: ${body.market || "your neighborhood"}\nLanguage: ${body.locale || "English (US)"}\n\nSuggested next steps\n• Choose whether you need creator audience reach or UGC production.\n• Invite 2–3 local creators with clear deliverables and a confirmed fee.\n• Give each creator a unique offer code and track redemptions.\n\nThis is a sample plan. Review and edit all details before sharing.`,
  caption: body => `A little local goodness in ${body.market || "your neighborhood"} 🌿\n\n${body.prompt}\n\nCome by, bring a friend, and use your offer code at checkout.\n\n#ShopLocal #LocalFinds`,
  voiceover: body => `VOICEOVER IDEA\n\n“Looking for your next neighborhood favorite? Come visit us in ${body.market || "the neighborhood"}. We’ve got something special waiting for you. Mention your offer code when you stop by!”\n\nAdjust the wording to sound like you, and confirm the offer details before recording.`,
  pitch: () => `Hi! I’d love to collaborate on this campaign. My content focuses on authentic local finds, and I can create a short video with a clear call to action. I’m available to discuss the deliverables, timing, and usage rights.`,
  localize: body => `LOCALIZED DRAFT · ${body.locale || "selected language"} · ${body.market || "selected market"}\n\n${body.prompt}\n\nPlease review the local wording, offer terms, and business details before publishing.`,
  results: body => `RESULTS REVIEW\n\n${body.prompt}\n\nUse unique offer codes to record attributed redemptions. Code use is one signal; purchases without a code may not be counted. Keep recorded outcomes separate from estimated reach and engagement.`,
};

const workflow: Record<CopilotTask, string[]> = {
  brief: ["Local Creator Matchmaker", "Campaign Planner", "Language & Market Specialist"],
  caption: ["Creator Studio Writer", "Language & Market Specialist"],
  voiceover: ["Creator Studio Writer", "Language & Market Specialist"],
  pitch: ["Creator Studio Writer", "Language & Market Specialist"],
  localize: ["Language & Market Specialist"],
  results: ["Campaign Results Analyst"],
};
const acceptedTasks = new Set<CopilotTask>(["brief", "caption", "voiceover", "pitch", "localize", "results"]);

export async function POST(request: Request) {
  let supabase;
  try { supabase = await createClient(); } catch { return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 }); }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in with Google to use LocalCollab." }, { status: 401 });
  let body: RequestBody;
  try {
    body = await request.json() as RequestBody;
  } catch {
    return NextResponse.json({ error: "Please send a valid request." }, { status: 400 });
  }

  const task = body.task ?? "caption";
  const prompt = body.prompt?.trim();
  if (!acceptedTasks.has(task)) return NextResponse.json({ error: "That assistant task is not supported." }, { status: 400 });
  if (!prompt) return NextResponse.json({ error: "Add a little campaign context first." }, { status: 400 });
  if (prompt.length > 8000) return NextResponse.json({ error: "Please shorten the request to 8,000 characters or fewer." }, { status: 413 });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ text: demoResponses[task](body), demo: true, workflow: workflow[task] });
  }

  try {
    const result = await runLocalCollabAgents({ task, prompt, locale: body.locale || "English (US)", market: body.market || "unspecified" });
    return NextResponse.json({ text: result.text, demo: false, workflow: result.workflow });
  } catch (error) {
    console.error("LocalCollab agent run failed", error);
    return NextResponse.json({ error: "The agent team could not complete this draft. Please try again." }, { status: 502 });
  }
}
