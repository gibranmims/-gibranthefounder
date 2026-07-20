-- Personal Brand OS — Supabase Schema
-- Run this in the Supabase SQL Editor (new project, not shared with coworlds-os)

-- Profile: single row per user
create table if not exists profile (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  positioning_statement text default '',
  icp_notes text default '',
  pillars_notes text default '',
  gcal_embed_url text default '',
  drive_ready_folder_id text default '',
  dark_mode boolean default false,
  streak_count integer default 0,
  last_activity_date date,
  created_at timestamptz default now()
);
alter table profile enable row level security;
create policy "Users can manage own profile"
  on profile for all using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profile (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- content_pieces: the core table — one row per piece of content
do $$ begin
  create type content_quadrant as enum (
    'creator_psychology', 'creator_business', 'content_that_converts', 'creator_os'
  );
exception when duplicate_object then null;
end $$;

-- channels: user-editable rows for the Calendar grid (e.g. TikTok, Instagram Reels).
-- Replaces the old fixed `platform` enum so the user can add/rename/reorder freely.
create table if not exists channels (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  label text not null,
  order_index integer not null default 0,
  created_at timestamptz default now(),
  unique (user_id, label)
);
alter table channels enable row level security;
create policy "Users can manage own channels"
  on channels for all using (auth.uid() = user_id);

create table if not exists content_pieces (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  quadrant content_quadrant not null,
  channel_id uuid references channels(id) on delete set null,
  stage text not null default 'scripted',
  scheduled_date date,
  posted_date date,
  notes text default '',
  script text default '',
  doc_link text default '',
  score_belief_shift integer,
  score_novelty integer,
  score_curiosity integer,
  score_authority integer,
  score_business_relevance integer,
  score_conversion_potential integer,
  score_discussion_potential integer,
  created_at timestamptz default now()
);
alter table content_pieces enable row level security;
create policy "Users can manage own content pieces"
  on content_pieces for all using (auth.uid() = user_id);

-- ideas: flat quick-capture bank, promotable to content_pieces
create table if not exists ideas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  text text not null,
  created_at timestamptz default now()
);
alter table ideas enable row level security;
create policy "Users can manage own ideas"
  on ideas for all using (auth.uid() = user_id);

-- sprint_items: "shit I'm about to record" — a simple checklist for an active
-- recording session, separate from Idea Bank. No dates/lifecycle, just check it off.
create table if not exists sprint_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  text text not null,
  done boolean not null default false,
  content_piece_id uuid references content_pieces(id) on delete set null,
  filming_style text,
  created_at timestamptz default now()
);
alter table sprint_items enable row level security;
create policy "Users can manage own sprint items"
  on sprint_items for all using (auth.uid() = user_id);

-- leads: warm outreach tracker — one row per personal contact being warmed for a
-- CoWorlds referral. raw_input keeps the original spoken line; the generated_* columns
-- hold the Claude-written message drafts. Stage is plain text (not_contacted → asked →
-- referred, plus not_now, plus watching for tier 3) so it can evolve without an ALTER TYPE.
--
-- tier drives the whole method and is set by hand at capture (the AI can't know how close
-- a relationship is):
--   1 = close ties      — no scripts, just talk to them. pure tracking.
--   2 = warm but distant — the full generated sequence. what the tool is built for.
--   3 = cold followers   — parked in 'watching'. no scripts. only promoted to tier 2
--                          if THEY engage first; you never reach down into tier 3.
create table if not exists leads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  tier smallint not null default 2,
  platform text,
  context text,
  raw_input text,
  stage text not null default 'not_contacted',
  generated_opener text,
  generated_followups jsonb,
  generated_transition text,
  generated_referral_ask text,
  notes text,
  referral_name text,
  next_follow_up date,
  date_last_contacted timestamptz,
  created_at timestamptz default now()
);
alter table leads enable row level security;
create policy "Users can manage own leads"
  on leads for all using (auth.uid() = user_id);

-- Migration for existing databases (safe to re-run):
-- alter table profile add column if not exists drive_ready_folder_id text default '';
--
-- create table if not exists channels (
--   id uuid default gen_random_uuid() primary key,
--   user_id uuid references auth.users on delete cascade not null,
--   label text not null,
--   order_index integer not null default 0,
--   created_at timestamptz default now()
-- );
-- alter table channels enable row level security;
-- create policy "Users can manage own channels" on channels for all using (auth.uid() = user_id);
--
-- alter table content_pieces add column if not exists channel_id uuid references channels(id) on delete set null;
-- alter table content_pieces alter column platform drop not null;
--
-- -- Dedupe channels created by the seeding race condition, then lock it down:
-- delete from channels a using channels b
--   where a.user_id = b.user_id and a.label = b.label and a.created_at > b.created_at;
-- alter table channels add constraint channels_user_label_unique unique (user_id, label);
--
-- create table if not exists sprint_items (
--   id uuid default gen_random_uuid() primary key,
--   user_id uuid references auth.users on delete cascade not null,
--   text text not null,
--   done boolean not null default false,
--   created_at timestamptz default now()
-- );
-- alter table sprint_items enable row level security;
-- create policy "Users can manage own sprint items" on sprint_items for all using (auth.uid() = user_id);
--
-- -- Stage moved from a fixed enum to plain text (new stages: scripted, filmed, edited,
-- -- ready_to_post, posted) so it can evolve without an ALTER TYPE migration each time:
-- alter table content_pieces alter column stage type text using stage::text;
-- alter table content_pieces alter column stage set default 'scripted';
-- update content_pieces set stage = case stage
--   when 'idea' then 'scripted'
--   when 'drafting' then 'filmed'
--   when 'scheduled' then 'ready_to_post'
--   else stage
-- end;
-- alter table content_pieces alter column channel_id drop not null; -- already nullable, no-op if so
--
-- alter table sprint_items add column if not exists content_piece_id uuid references content_pieces(id) on delete set null;
-- alter table sprint_items add column if not exists filming_style text;
--
-- -- Warm Outreach tool: the leads table.
-- create table if not exists leads (
--   id uuid default gen_random_uuid() primary key,
--   user_id uuid references auth.users on delete cascade not null,
--   name text not null,
--   tier smallint not null default 2,
--   platform text,
--   context text,
--   raw_input text,
--   stage text not null default 'not_contacted',
--   generated_opener text,
--   generated_followups jsonb,
--   generated_transition text,
--   generated_referral_ask text,
--   notes text,
--   referral_name text,
--   next_follow_up date,
--   date_last_contacted timestamptz,
--   created_at timestamptz default now()
-- );
-- alter table leads enable row level security;
-- create policy "Users can manage own leads" on leads for all using (auth.uid() = user_id);
--
-- -- Warm Outreach tiers. Run this if you already created the leads table above WITHOUT
-- -- the tier column. Existing rows default to tier 2 (warm but distant), which is the
-- -- tier the generated-sequence flow was originally built for, so nothing is mis-tagged.
-- alter table leads add column if not exists tier smallint not null default 2;
