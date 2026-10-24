import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";

export type CopilotTask = "brief" | "caption" | "voiceover" | "pitch" | "localize" | "results";
type AgentRequest = { task: CopilotTask; prompt: string; locale: string; market: string };
export type AgentRun = { text: string; workflow: string[] };

const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const baseRules = `Do not invent business facts, product claims, discounts, addresses, audience metrics, creator prices, legal requirements, or performance outcomes. Preserve supplied promo codes and deal terms exactly. Make drafts concise and editable. Never send, publish, book, accept, or pay on a user's behalf.`;

const sampleCreators = [
  { name: "Pune Food Blogger", handle: "@pune_food_blogger", instagram: "https://www.instagram.com/pune_food_blogger/", category: "Food creator", market: "Pune, Maharashtra", languages: [], audience: 250400, engagement: 0.27, offers: ["audience_reach"] },
  { name: "Food & Travel Blogger", handle: "@foodie.soulmates", instagram: "https://www.instagram.com/foodie.soulmates/", category: "Food & travel creator", market: "Pune, Maharashtra", languages: [], audience: 92600, engagement: 2.02, offers: ["audience_reach"] },
  { name: "Mrunmai", handle: "@tasteofmiles", instagram: "https://www.instagram.com/tasteofmiles/", category: "Food & travel creator", market: "Pune, Maharashtra", languages: [], audience: 54400, engagement: 1.29, offers: ["audience_reach"] },
  { name: "Dr Ruchi Parekh", handle: "@thevegetarianfoodiee", instagram: "https://www.instagram.com/thevegetarianfoodiee/", category: "Food, travel & lifestyle creator", market: "Pune, Maharashtra", languages: [], audience: 44600, engagement: 0.91, offers: ["audience_reach"] },
  { name: "Samruddha Patil", handle: "@when_in_pune", instagram: "https://www.instagram.com/when_in_pune/", category: "Food & local discovery creator", market: "Pune, Maharashtra", languages: [], audience: 27500, engagement: 0.76, offers: ["audience_reach"] },
];

const findCreators = tool({
  name: "search_public_instagram_creators",
  description: "Search the available public Instagram creator profiles by campaign type, market, and language. Public follower and engagement figures are estimates; fees and languages are not listed and must be verified directly. For UGC, do not present reach creators as UGC makers.",
  parameters: z.object({
    campaignType: z.enum(["audience_reach", "ugc_production"]),
    market: z.string(),
    language: z.string().optional(),
  }),
  execute: async ({ campaignType, market, language }) => {
    const wantedCity = market.toLocaleLowerCase().split(",")[0].trim();
    const sameMarket = sampleCreators.filter(person => person.market.toLocaleLowerCase().includes(wantedCity) || wantedCity === "unspecified");
    const matches = sameMarket.filter(person => {
      if (!person.offers.includes(campaignType)) return false;
      if (language && person.languages.length > 0 && !person.languages.some(item => item.toLocaleLowerCase().startsWith(language.toLocaleLowerCase().slice(0, 2)))) return false;
      return true;
    });
    return JSON.stringify(matches.map(person => ({
      name: person.name, handle: person.handle, instagram: person.instagram, category: person.category, market: person.market, languages: person.languages,
      rateStatus: "Not publicly listed; ask the creator directly.", audience: person.audience, engagement: person.engagement,
      portfolio: "portfolio" in person ? person.portfolio : undefined,
      matchBasis: campaignType === "ugc_production" ? "No verified UGC profiles in the public sample list." : "Public audience and engagement estimates, content category, market, and profile-provided languages when available; rate not provided.",
    })));
  },
});

const localLanguageAgent = new Agent({
  name: "Language & Market Specialist",
  model,
  instructions: `Adapt supplied marketing copy for a stated language and market. Preserve factual details, offer terms, codes, and dates exactly. Use natural language; do not fabricate regional slang, cultural references, legal text, or local claims. If asked to translate, translate rather than summarize. ${baseRules}`,
});

const creatorMatchAgent = new Agent({
  name: "Local Creator Matchmaker",
  model,
  instructions: `Find candidates only by calling search_public_instagram_creators. Explain the fit using the returned fields only. Clearly distinguish audience reach from UGC production. UGC matching must prioritize verified portfolio details; a small follower count is not a disadvantage. Never invent candidates, prices, locations, or metrics. ${baseRules}`,
  tools: [findCreators],
});

const campaignPlannerAgent = new Agent({
  name: "Campaign Planner",
  model,
  instructions: `Turn business inputs and the supplied verifiedCreatorMatches into an actionable, editable local creator campaign plan. Use only supplied candidates and facts. Include the goal, campaign brief, deliverables, budget guidance, creator recommendations with grounded match reasons, a unique offer-code measurement suggestion, and open questions when information is missing. Treat UGC as paid production and specify that usage rights must be agreed. Do not send invitations or publish anything. ${baseRules}`,
});

const creatorStudioAgent = new Agent({
  name: "Creator Studio Writer",
  model,
  instructions: `Help creators write a campaign-specific caption, voiceover, pitch, or short local content draft based on the requested task. Keep the creator's tone natural, use the provided campaign facts, and preserve offer codes exactly. Do not invent personal experience, claims, or campaign terms. Return copy plus a short review reminder about offer code/disclosure when relevant. Localization is applied by the Language & Market Specialist after your draft when needed. ${baseRules}`,
});

const resultsAnalystAgent = new Agent({
  name: "Campaign Results Analyst",
  model,
  instructions: `Summarize only results supplied in the input. Separate recorded code redemptions and sales from estimated reach or engagement. Explain that offer-code attribution misses conversions that do not use the code. Suggest one practical next step without claiming causation beyond the data. ${baseRules}`,
});

function finalText(result: { finalOutput: unknown }): string {
  return typeof result.finalOutput === "string" ? result.finalOutput : JSON.stringify(result.finalOutput);
}

export async function runLocalCollabAgents(request: AgentRequest): Promise<AgentRun> {
  const context = JSON.stringify({ task: request.task, request: request.prompt, language: request.locale, market: request.market });
  if (request.task === "brief") {
    const matches = await run(creatorMatchAgent, JSON.stringify({ ...request, matchType: /ugc|video maker|content production/i.test(request.prompt) ? "ugc_production" : "audience_reach", task: "Find local matches. Use the search tool; do not invent candidates." }));
    const plan = await run(campaignPlannerAgent, JSON.stringify({ ...request, verifiedCreatorMatches: finalText(matches) }));
    const draft = finalText(plan);
    const localized = await run(localLanguageAgent, JSON.stringify({ task: "Adapt this campaign plan to the selected language and local market", language: request.locale, market: request.market, sourceText: draft }));
    return { text: finalText(localized), workflow: ["Local Creator Matchmaker", "Campaign Planner", "Language & Market Specialist"] };
  }
  if (request.task === "localize") {
    const localized = await run(localLanguageAgent, context);
    return { text: finalText(localized), workflow: ["Language & Market Specialist"] };
  }
  if (request.task === "results") {
    const analysis = await run(resultsAnalystAgent, context);
    return { text: finalText(analysis), workflow: ["Campaign Results Analyst"] };
  }

  const written = await run(creatorStudioAgent, context);
  const draft = finalText(written);
  const localized = await run(localLanguageAgent, JSON.stringify({ task: `Review and adapt this ${request.task} for the selected language and local market`, language: request.locale, market: request.market, sourceText: draft }));
  return { text: finalText(localized), workflow: ["Creator Studio Writer", "Language & Market Specialist"] };
}
