# Personal Brand OS

Gibran's personal content-pipeline app — separate from CoWorlds OS (business/operator
tasks) and BLC Affiliate OS. Single-user, deliberately lean: only what he actually uses
daily to plan, script, record, and post his own content.

**Live:** https://personalbrand.coworlds.io
**GitHub:** `github.com/gibranmims/-gibranthefounder` — pushes to `main` auto-deploy via Railway
**Login:** email + password (gibran@coworlds.io)

## Stack

React 18 + Vite 5, Tailwind + framer-motion + lucide-react + `@hello-pangea/dnd`,
Supabase (own project — not shared with any other app), Express `server.js`
(static serve + `/api/claude` proxy — keeps the Anthropic key server-side; used
by Warm Outreach's lead-generation calls, see below).

## Design system

Pulled from `coworlds-creator-portal`, **not** `coworlds-os` — don't copy design
tokens/components from the wrong sibling repo. Dark-glass "dusk world" theme:
`src/index.css` (tokens) + `src/styles/system.css` (`.cw-*` component classes) +
`src/lib/motion.js` (framer-motion presets) + `src/lib/glow.js` (cursor-following
card glow, initialized once in `App.jsx`). The Auth screen is the one light-world
exception (pastel `bg-dream` treatment).

## Data model

`supabase-schema.sql` is the source of truth — read it fresh before assuming
anything about the schema, it has grown several migration blocks over time.

- **`content_pieces`** — the core table. `quadrant` (which pillar), `channel_id`
  (FK to `channels`), `stage` (plain text: `scripted → filmed → edited →
  ready_to_post → posted`, deliberately not a Postgres enum so it can keep
  evolving without an `ALTER TYPE`), `script` (beat-formatted), `scheduled_date`,
  `doc_link`, seven `score_*` columns for the evaluation framework.
- **`channels`** — user-editable rows for the Calendar grid (managed in Settings),
  not a fixed enum.
- **`ideas`** — flat capture bank, promotable into `content_pieces`.
- **`sprint_items`** — "Recording Lineup." Can link to a `content_piece_id` with
  a `filming_style` (phone/studio); checking off a linked item auto-advances that
  piece's stage to `filmed`.
- **`leads`** — Warm Outreach tracker (see below). `tier` (1 close / 2 warm / 3
  cold) is set by hand at capture — it's the one field the AI can't infer — and
  gates whether message drafts get generated at all.
- **`challenge_checkins`** — 100-Day Challenge. One row per day actually posted;
  presence of a row is the checkmark. Deliberately self-reported (not derived
  from `content_pieces.posted_date`) since posting can happen outside a tracked
  piece.
- **`profile`** — single row per user: display name, Vision page's editable
  positioning/ICP/pillars notes, streak, Drive folder ID, `challenge_start_date`
  (auto-set to "today" the first time a profile loads with it null).

## The four content pillars

Defined in `src/lib/philosophy.js` (`QUADRANTS`) — this is real content strategy,
not just a data enum. Locked in by Gibran, don't rename without asking:

1. 🧠 **Creator Mindset** — "How should I think?"
2. 💼 **Creator Business** — "What should I build? How should I build it?"
3. 🧠 **Consumer Psychology** (key stays `content_that_converts` internally) —
   "How do I sell with content?"
4. ⚙️ **Creator Operating System** — "How do I execute?"

North Star: *"CoWorlds helps creators turn content into a predictable business
through systems, not luck."* Foundational belief: Expert Brand before Personal
Brand — most content should demonstrate expertise, not be lifestyle/relatable
content, until authority is earned.

## Pages

- **Calendar** (home page) — 5-day rolling window anchored on today (not a fixed
  Mon–Sun week), one row per channel, per-day posted checkmark, Ready to Post
  Drive panel below the grid, small "Day X/100" chip linking to the challenge
  tracker.
- **100 Days** — 10x10 grid, one box per day of the challenge. Green = posted,
  red = missed (past, unchecked), pink outline = today. Click any past-or-today
  box to toggle; future boxes are disabled.
- **Buckets** — four pillar columns, real drag-and-drop (reassigns pillar), cards
  sort by production stage with color-coded stage badges, "Edits Needed" side
  panel surfaces cross-pillar filmed-not-edited pieces.
- **Recording Lineup** — table (# / video checkbox / filming style), plus a
  "Scripted & Ready" quick-add pulling straight from Buckets.
- **Warm Outreach** — separate from Buckets/Calendar entirely; a referral-ask
  tracker for personal contacts, not a content tool. Capture a raw line about
  someone → tier it by hand (1 close / 2 warm / 3 cold) → tier 2 gets an AI-drafted
  opener/followups/referral-ask via `src/lib/outreachAI.js` (forced tool use,
  `claude-sonnet-5`, through `/api/claude`); tiers 1 and 3 get no scripts by
  design. Tap-to-advance stage pipeline in `src/lib/outreach.js`. Tier 3 can only
  be promoted to tier 2 if they engage first — the tool never lets you reach
  down into cold contacts.
- **Idea Bank**, **Vision** (static philosophy + editable notes), **Settings**
  (channel management, Drive folder, password).

## Content editor (`ContentPieceModal`)

Full-page takeover, not a small dialog — the script textarea needs Google-Docs
levels of room. Script auto-formats into beats (one delivery line per beat,
double-spaced) on blur via `formatScriptBeats()`. Notes/doc-link/date are
deliberately not visible form fields — `scheduled_date`/`doc_link` still ride
along invisibly when set via Calendar's "+ Add" or the Ready to Post panel.

## Google Drive "Ready to Post"

Read-only, API-key based — no OAuth. Needs `VITE_GOOGLE_DRIVE_API_KEY` (Drive API
enabled, HTTP-referrer restricted) and a folder shared "Anyone with the link –
Viewer." Folder ID lives in `profile.drive_ready_folder_id`. See
`src/lib/googleDrive.js`.

## Working in this repo

- No Supabase CLI/MCP access in this environment — every schema change needs a
  manual migration block appended to the bottom of `supabase-schema.sql` (as a
  commented-out SQL snippet) AND the user has to actually run it in the Supabase
  SQL editor after you push. Always call this out explicitly when you change the
  schema.
- Always `npm run build` before pushing — Railway builds directly from `main`.
- To confirm a deploy actually landed, compare the live site's JS bundle filename
  (via network requests, e.g. `index-XXXXXXXX.js`) against the hash in your last
  local `npm run build` output — Vite content-hashes the filename, so a match
  means the deploy is current.
- Keep it lean. This is a single person's daily tool — don't add features he
  hasn't asked for.
