# LocalCollab Campaign Coach

LocalCollab helps neighborhood businesses and creators plan local collaborations, prepare campaign content, and track offer-code results. The prototype includes separate Business and Creator dashboards, AI-assisted writing/localization, and sample campaign data.

## Stack

- Next.js App Router, React, and TypeScript for the website and backend routes.
- Supabase Auth and PostgreSQL for Google sign-in, profiles, social profile links, and the campaign data model.
- OpenAI Agents SDK for server-side campaign and creator writing workflows.
- Vercel for hosting the app; Supabase is hosted separately.

## Run locally

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example`. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, apply `supabase/schema.sql` in the Supabase SQL Editor, and enable Google in Supabase Auth with a Google OAuth client ID and secret. Configure the Supabase Auth redirect allow list for `http://localhost:3000/auth/callback` and `http://127.0.0.1:3000/auth/callback`. In Google OAuth settings, add the callback URL shown in the Supabase Google provider settings. Add the deployed callback URL to both providers when hosting.

Set `OPENAI_API_KEY` to enable live AI agent runs. `OPENAI_MODEL` is optional and defaults to `gpt-4.1-mini`. Keep secrets server-side and never commit `.env.local`.

## Authentication and onboarding

Only Google-authenticated Supabase users can access the platform and its Copilot endpoint. `proxy.ts` refreshes Supabase sessions and redirects unauthenticated requests to `/login`; server-rendered pages also verify identity and profile completion. After sign-in, users choose a Business or Creator workspace. Business onboarding saves the website and local-market details. Creator onboarding saves their bio, category, language, and public social profile URLs. Creator “Connect” controls add a URL for the selected platform; they do not request account OAuth or private analytics access.

## Current prototype boundaries

- Account identity, onboarding profiles, and creator public profile links use Supabase and Row Level Security.
- Campaign and dashboard interactions still use sample data held in browser state.
- Creator account OAuth, live social analytics, invitations, publishing, contracts, and payouts are not connected.
- Without `OPENAI_API_KEY`, Copilot returns clearly labeled deterministic sample responses.

## Useful files

- `app/login/page.tsx` — Google sign-in entry screen.
- `app/onboarding/` — Business and Creator account setup.
- `app/dashboard.tsx` — role-specific dashboard views.
- `app/api/copilot/route.ts` — authenticated AI request handler.
- `proxy.ts` — session refresh and route gate.
- `supabase/schema.sql` — account, profile, campaign, and RLS schema.
