# LocalCollab Campaign Coach

## Product overview

LocalCollab Campaign Coach is a unified platform that helps local businesses and emerging creators plan, agree on, run, and measure paid collaborations.

A business describes its marketing goal, location, budget, promotion, and timing. The platform helps shape that information into a campaign brief, find suitable local creators, review pitches, coordinate agreed work, and track basic results. Creators can discover opportunities, understand expectations, submit stronger pitches, and follow the campaign through completion.

Creators can also use tools to draft captions, prepare voiceovers, transcribe or adapt spoken content, and localize their copy for the intended audience. Businesses can hire creators for audience reach or for content production alone, including user-generated content (UGC) from creators with small or no established following.

The hackathon prototype uses sample business and creator profiles. Its main demonstration is the complete journey from campaign setup to results review, including creator content support, localized recommendations, and promo-code attribution.

## Users

### Local businesses

Businesses need an affordable, clear way to promote a product, service, or event with creators in their area. They may have limited marketing experience and want practical guidance on campaign goals, budgets, creator fit, deliverables, and measurement.

### Emerging creators

Creators need local paid opportunities with clear expectations. They want to find campaigns suited to their location and content, understand compensation and deliverables, and present a relevant pitch to a business.

Creators also need affordable tools to produce campaign-ready content, adapt it to different languages and local audiences, and understand whether they are being paid for content creation, audience reach, or tracked results.

## Core platform features

### 1. Campaign setup and AI-assisted brief

Businesses provide their campaign goal, promotion, location, budget, timing, and any requirements or brand notes. The platform turns those inputs into an editable brief with:

- Campaign objective and target audience
- Suggested creator profile and location radius
- Proposed content deliverables and timeline
- Budget guidance and potential compensation structure
- A trackable promo code or call to action
- Business notes, restrictions, and success measures

The business reviews and edits the brief before publishing it.

### 2. Campaign Copilot agent

The Campaign Copilot helps a business move from an idea to a reviewable campaign plan. It should:

1. Clarify or summarize the business’s goal and constraints.
2. Draft a campaign brief from the information provided.
3. Search the sample creator profiles for suitable candidates.
4. Explain why each suggested creator may fit.
5. Suggest a practical budget split, deliverables, and timeline.
6. Prepare an invitation message for the business to review.

The Copilot presents its recommendations and reasoning in the campaign workspace. The business must approve the brief, creator selection, and invitation before those actions are treated as final. The prototype should not imply that an invitation was sent unless a send action is explicitly implemented.

### 3. Local creator discovery and matching

Businesses can browse and filter sample creators and UGC makers by service area, content category, content style, production quality, availability, and price. The platform supports two clear matching paths:

- **Audience campaigns:** discover creators whose audience, location, engagement, and content are relevant to the business.
- **UGC production:** discover local video makers based on portfolio quality, production capabilities, turnaround time, usage rights, and price. Follower count is not required and should not penalize a creator in this path.

Matching recommendations consider:

- Distance or service area relative to the campaign location
- Audience and content relevance
- Engagement and audience size for audience campaigns
- Content quality, portfolio examples, production style, and price for UGC campaigns
- Creator availability or stated interest, when sample data provides it
- Fit with the campaign’s budget and requested deliverables

Each recommendation includes a short “Why this creator?” explanation and makes the match path visible (audience reach or UGC production). Fit scores are guidance, not guarantees of campaign performance. UGC pricing and content usage rights should be presented separately and clearly.

### 4. Creator opportunity view and pitch assistance

Creators can review campaign briefs that include the business, objective, location, expected deliverables, budget or compensation range, timing, and application requirements.

A Creator Pitch Assistant helps a creator draft a tailored pitch using their profile and the campaign brief. It can suggest a pitch structure and highlight relevant experience or content examples. Creators review and edit their pitch before submitting it.

### 5. Creator content studio: captions and voice tools

Creators can use an AI-assisted content studio to prepare campaign assets from the approved brief. Tools include:

- **Caption writer:** drafts platform-ready captions with a selected tone, length, call to action, offer code, and required campaign details.
- **Caption variations:** suggests alternate hooks, short and long versions, and options for different social platforms.
- **Voice-to-caption:** transcribes a creator’s spoken idea or recording into editable text, then formats it as a caption or post description.
- **Voiceover and talking-point writer:** creates a natural-sounding voiceover script, shot outline, or talking points that reflect the creator’s style and campaign requirements.
- **Voice transcription and cleanup:** turns spoken drafts into readable copy while preserving the creator’s intended meaning; creators can edit the result.
- **Disclosure and brief checks:** reminds creators to include agreed disclosures, offer details, location information, and calls to action.

Generated text and scripts are editable suggestions. The creator approves every asset before use. The prototype does not clone a person’s voice or publish content automatically.

### 6. Pitch review, agreement, and campaign coordination

Businesses can review creator pitches and compare each proposal with the brief. A Brief-to-Pitch Fit Check highlights whether a pitch addresses the campaign goal, requested deliverables, timing, and budget.

When both sides agree, the platform records the collaboration terms in a shared campaign agreement, including:

- Compensation and any hosted product or service
- Content format, quantity, and posting channels
- Key dates and review deadlines
- Promo code or call to action
- Disclosure or brand requirements
- Any agreed revisions

A shared Deliverable Checklist turns those terms into milestones that both sides can track, such as pitch accepted, content in progress, draft submitted, approved, published, and results recorded. Campaign content may include captions, voiceover scripts, or UGC assets, with agreed review and usage rights recorded alongside each deliverable.

### 7. Pay for results: unique offer codes and attribution

Each creator or UGC campaign can receive a unique offer code or trackable link. Businesses can record or import visits, leads, bookings, or sales associated with each code and see which creator or campaign drove the result. The results view should distinguish attributed outcomes from estimates, show the measurement period, and explain that code-based attribution may miss conversions that occur through other paths.

Campaign agreements can define a fixed content fee, a results-based bonus, or a combination. The agreed compensation model, attribution rule, payout threshold, and any cap must be visible to both parties before they accept. The prototype may demonstrate attribution with sample redemptions and simulated payouts; it should not imply that real payments are processed unless implemented.

### 8. Results tracking and campaign learning

Businesses can record simple outcomes such as unique-code redemptions, attributed visits or sales, estimated reach, engagement, and campaign spend. The results view summarizes performance by campaign and, where sample data allows, by creator or UGC asset.

The platform can provide a short, plain-language campaign recap, such as which goals were met, which tracked outcomes were strongest, and what the business might try next time. Results should be presented as estimates or recorded metrics, with their source made clear.

### 9. Localization for local audiences

Localization applies throughout the platform, not only to creator search. Campaigns and creator tools should account for:

- Country, region, city, neighborhood, and service radius
- Preferred language and regional language variants
- Local currency, number/date formats, and time zone
- Local holidays, events, seasons, and business hours where relevant
- Locally meaningful phrases, tone, spelling, and calls to action
- Offer terms, units, and location details that make sense in the selected market

Businesses can set the campaign’s target location and language preferences. Creators can identify the languages, regions, and communities they serve. The Copilot and content studio can adapt briefs, captions, scripts, and invitations for those settings while preserving required brand and offer details. Translations and cultural adaptations are suggestions for human review; they should not invent local claims, slang, or legal terms.

## Agent roles and boundaries

The prototype uses a unified Campaign Copilot experience with focused agent capabilities:

- **Campaign planning:** drafts and improves the business brief.
- **Creator matching:** searches sample profiles and explains recommendations.
- **Creator pitch assistance:** helps creators write a campaign-specific pitch.
- **Creator content assistance:** drafts captions, hooks, voiceovers, talking points, and voice-to-text edits from the brief.
- **Localization assistance:** adapts campaign copy and creator content to selected languages and local conventions.
- **Pitch fit review:** compares a submitted pitch with the agreed brief.
- **Campaign coordination:** turns agreed deliverables and dates into a checklist.
- **Results recap and attribution:** summarizes recorded metrics and unique-code outcomes, and suggests possible next steps.

These capabilities can be separate steps or modes within the platform; they do not need to be implemented as multiple autonomous agents for the hackathon. The prototype should make clear when a result is AI-generated, let users edit it, and require user confirmation before publishing a campaign, accepting a pitch, or sending an invitation.

## Primary demonstration flow

1. A business enters a goal, promotion, location, language, budget, and timing.
2. The Campaign Copilot creates an editable, localized brief and recommends audience creators or no-followers-needed UGC makers with clear match explanations.
3. The business reviews the plan, creator type, compensation model, and tracking setup, then publishes the campaign.
4. A creator views the opportunity, drafts a tailored pitch, and uses caption or voice tools to prepare content in the campaign’s language and style.
5. The business reviews the pitch and its fit against the brief.
6. Both sides confirm terms, including deliverables, usage rights, fixed or results-based compensation, offer code, and attribution rules; the platform creates a shared checklist.
7. The creator submits and publishes the agreed work; both sides track milestone progress.
8. The business records or reviews attributed code uses, visits, sales, and engagement, then reviews a campaign recap.

## Hackathon prototype scope

The prototype should prioritize a coherent end-to-end demonstration using sample profiles and campaign data. Core interactions should show campaign creation, localized creator recommendations, audience and UGC matching paths, caption or voice content assistance, pitch drafting and review, agreement details, unique-code setup, checklist progress, and results entry.

Agent behavior may use a connected model if one is already available. If the prototype uses preset or simulated responses, label them as examples rather than implying that a live agent or external action ran. The scope does not require production payments, identity verification, social-platform integrations, live creator data, or automatic outreach. Results-based compensation and code attribution can be demonstrated with sample data without processing real transactions.

## Prototype technology stack

- **Frontend and server endpoints:** Next.js App Router, React, and TypeScript.
- **Agent runtime:** OpenAI Agents SDK for TypeScript, invoked by server-side Next.js route handlers. API keys stay on the server.
- **Persistence and identity:** Supabase Auth and PostgreSQL with Row Level Security. The first demo may use sample data while the Supabase project is being configured.
- **Hosting:** Vercel for the Next.js app and server routes; Supabase hosts the database and authentication.

The Business and Creator dashboards are separate role-based views within one application. The demo role switch is for presentation only and is not authentication or access control.

## Agent implementation plan

The Campaign Copilot API routes work to focused specialists:

1. **Campaign Planner:** turns business inputs into a structured, editable plan and relies on profile data supplied by the matching step.
2. **Local Creator Matchmaker:** calls a local profile search tool and returns sample candidates grounded in their listed location, languages, portfolio, audience, engagement, and fees. UGC selection uses portfolio and fee, not follower count.
3. **Creator Studio Writer:** drafts captions, voiceovers, and creator pitches from campaign context.
4. **Language & Market Specialist:** adapts briefs and creator content to the selected language and local market, preserving offer details for human review.
5. **Campaign Results Analyst:** summarizes recorded offer-code outcomes separately from estimated reach and engagement.

The server orchestrator runs the appropriate agent sequence for each task. For a campaign plan, it runs matching first, passes those verified sample matches to the planner, and runs localization when a non-English language is selected. Drafting agents do not send outreach, publish content, or process payment. With no API key, the prototype returns sample responses and labels the workflow as simulated.
