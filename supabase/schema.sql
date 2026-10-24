-- Initial LocalCollab data model. Apply using the Supabase SQL Editor.
create extension if not exists pgcrypto;

do $$ begin
  create type public.account_role as enum ('business', 'creator', 'both');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.campaign_status as enum ('draft', 'published', 'in_progress', 'completed', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.match_path as enum ('audience_reach', 'ugc_production');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.account_role not null default 'business',
  display_name text not null,
  preferred_language text not null default 'en-US',
  country_code text not null default 'US',
  currency_code text not null default 'USD',
  timezone text not null default 'America/Los_Angeles',
  city text,
  region text,
  website_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.creator_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  bio text not null default '',
  languages text[] not null default array['en-US'],
  service_area jsonb not null default '{}'::jsonb,
  categories text[] not null default '{}',
  portfolio_urls text[] not null default '{}',
  audience_size integer not null default 0,
  engagement_rate numeric(5,2),
  ugc_rate_cents integer,
  ugc_usage_terms jsonb not null default '{}'::jsonb,
  accepts_ugc boolean not null default false,
  is_discoverable boolean not null default true
);

-- Public profile URLs only. OAuth tokens are never stored in this table.
create table if not exists public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.creator_profiles(user_id) on delete cascade,
  platform text not null check (platform in ('instagram', 'tiktok', 'youtube', 'facebook')),
  profile_url text not null,
  connection_type text not null default 'profile_link' check (connection_type in ('profile_link', 'oauth_connected')),
  created_at timestamptz not null default now(),
  unique (user_id, platform)
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  goal text not null,
  brief text not null default '',
  match_path public.match_path not null default 'audience_reach',
  city text not null,
  region text,
  country_code text not null default 'US',
  language text not null default 'en-US',
  currency_code text not null default 'USD',
  budget_cents integer not null default 0 check (budget_cents >= 0),
  status public.campaign_status not null default 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.pitches (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  pitch_text text not null,
  proposed_fee_cents integer check (proposed_fee_cents >= 0),
  status text not null default 'submitted' check (status in ('submitted', 'accepted', 'declined', 'withdrawn')),
  created_at timestamptz not null default now(),
  unique (campaign_id, creator_id)
);

create table if not exists public.deliverables (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  format text not null,
  due_at timestamptz,
  usage_terms jsonb not null default '{}'::jsonb,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'submitted', 'approved', 'published'))
);

create table if not exists public.offer_codes (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  code text not null unique,
  fixed_fee_cents integer not null default 0 check (fixed_fee_cents >= 0),
  bonus_per_redemption_cents integer not null default 0 check (bonus_per_redemption_cents >= 0),
  bonus_cap_cents integer check (bonus_cap_cents is null or bonus_cap_cents >= 0),
  attribution_terms text not null default 'code_redemption',
  created_at timestamptz not null default now(),
  unique (campaign_id, creator_id)
);

create table if not exists public.offer_redemptions (
  id uuid primary key default gen_random_uuid(),
  offer_code_id uuid not null references public.offer_codes(id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  order_value_cents integer check (order_value_cents is null or order_value_cents >= 0),
  external_reference text
);

alter table public.profiles enable row level security;
alter table public.creator_profiles enable row level security;
alter table public.social_accounts enable row level security;
alter table public.campaigns enable row level security;
alter table public.pitches enable row level security;
alter table public.deliverables enable row level security;
alter table public.offer_codes enable row level security;
alter table public.offer_redemptions enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
drop policy if exists "Users can create own profile" on public.profiles;
create policy "Users can create own profile" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Discoverable creator profiles are visible" on public.creator_profiles;
create policy "Discoverable creator profiles are visible" on public.creator_profiles for select using (is_discoverable or auth.uid() = user_id);
drop policy if exists "Creators manage own creator profile" on public.creator_profiles;
create policy "Creators manage own creator profile" on public.creator_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Creators read own social profile links" on public.social_accounts;
create policy "Creators read own social profile links" on public.social_accounts for select using (auth.uid() = user_id);
drop policy if exists "Creators add own social profile links" on public.social_accounts;
create policy "Creators add own social profile links" on public.social_accounts for insert with check (auth.uid() = user_id);
drop policy if exists "Creators update own social profile links" on public.social_accounts;
create policy "Creators update own social profile links" on public.social_accounts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Creators delete own social profile links" on public.social_accounts;
create policy "Creators delete own social profile links" on public.social_accounts for delete using (auth.uid() = user_id);

drop policy if exists "Published campaigns are visible to signed-in creators" on public.campaigns;
create policy "Published campaigns are visible to signed-in creators" on public.campaigns for select using (status = 'published' or auth.uid() = business_id);
drop policy if exists "Businesses manage own campaigns" on public.campaigns;
create policy "Businesses manage own campaigns" on public.campaigns for all using (auth.uid() = business_id) with check (auth.uid() = business_id);

drop policy if exists "Pitch participants can view pitches" on public.pitches;
create policy "Pitch participants can view pitches" on public.pitches for select using (
  auth.uid() = creator_id or exists (select 1 from public.campaigns c where c.id = campaign_id and c.business_id = auth.uid())
);
drop policy if exists "Creators submit own pitches" on public.pitches;
create policy "Creators submit own pitches" on public.pitches for insert with check (auth.uid() = creator_id);
drop policy if exists "Pitch participants can update pitches" on public.pitches;
create policy "Pitch participants can update pitches" on public.pitches for update using (
  auth.uid() = creator_id or exists (select 1 from public.campaigns c where c.id = campaign_id and c.business_id = auth.uid())
);

drop policy if exists "Campaign participants can view deliverables" on public.deliverables;
create policy "Campaign participants can view deliverables" on public.deliverables for select using (
  auth.uid() = creator_id or exists (select 1 from public.campaigns c where c.id = campaign_id and c.business_id = auth.uid())
);
drop policy if exists "Campaign business can manage deliverables" on public.deliverables;
create policy "Campaign business can manage deliverables" on public.deliverables for all using (
  exists (select 1 from public.campaigns c where c.id = campaign_id and c.business_id = auth.uid())
) with check (exists (select 1 from public.campaigns c where c.id = campaign_id and c.business_id = auth.uid()));

drop policy if exists "Offer participants can view codes" on public.offer_codes;
create policy "Offer participants can view codes" on public.offer_codes for select using (
  auth.uid() = creator_id or exists (select 1 from public.campaigns c where c.id = campaign_id and c.business_id = auth.uid())
);
drop policy if exists "Campaign business can manage offer codes" on public.offer_codes;
create policy "Campaign business can manage offer codes" on public.offer_codes for all using (
  exists (select 1 from public.campaigns c where c.id = campaign_id and c.business_id = auth.uid())
) with check (exists (select 1 from public.campaigns c where c.id = campaign_id and c.business_id = auth.uid()));

drop policy if exists "Campaign participants can view redemptions" on public.offer_redemptions;
create policy "Campaign participants can view redemptions" on public.offer_redemptions for select using (
  exists (select 1 from public.offer_codes o where o.id = offer_code_id and o.creator_id = auth.uid()) or
  exists (select 1 from public.offer_codes o join public.campaigns c on c.id = o.campaign_id where o.id = offer_code_id and c.business_id = auth.uid())
);
drop policy if exists "Businesses record redemptions" on public.offer_redemptions;
create policy "Businesses record redemptions" on public.offer_redemptions for insert with check (
  exists (select 1 from public.offer_codes o join public.campaigns c on c.id = o.campaign_id where o.id = offer_code_id and c.business_id = auth.uid())
);
