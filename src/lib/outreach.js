// Warm outreach pipeline — tier + stage constants, mirroring philosophy.js's STAGES/stageMeta.
// Deliberately lean: 3 forward stages you tap through, plus a not_now off-ramp. This is a
// warm-outreach tracker, not a sales CRM — booked-call / closed-won belong to the referred
// person's pipeline inside CoWorlds, not here.

// ── TIERS ──
// The most load-bearing field in the tool, and the one thing the AI genuinely cannot infer:
// "would they pick up if you called" is knowledge only Gibran has. So it's set by hand at
// capture, and it decides whether anything gets generated at all.
export const TIERS = [
  {
    key: 1,
    label: 'Close',
    short: 'Tier 1',
    badge: 'cw-badge-ok',
    blurb: 'Family, close friends, people who\'d pick up if you called.',
    rule: 'No script. Just talk to them like you always do, and bring it up when it\'s true.',
    generatesScripts: false,
  },
  {
    key: 2,
    label: 'Warm',
    short: 'Tier 2',
    badge: 'cw-badge-info',
    blurb: 'Real history, but you haven\'t talked in a while.',
    rule: 'The full sequence. Opener, let it breathe, 2-3 real exchanges, then the ask.',
    generatesScripts: true,
  },
  {
    key: 3,
    label: 'Cold',
    short: 'Tier 3',
    badge: 'cw-badge-neutral',
    blurb: 'They follow you, but there\'s no real relationship.',
    rule: 'Don\'t reach down. No scripts get written. Let your content do the work — if they engage first, promote them up.',
    generatesScripts: false,
  },
]

// Bulk-imported names arrive with no tier. Untagged is a real state, not a default —
// "I haven't sorted this person yet" must stay distinguishable from "I decided they're warm",
// otherwise a cold follower can quietly inherit warm treatment.
export const UNTAGGED = {
  key: null,
  label: 'Untagged',
  short: 'Untagged',
  badge: 'cw-badge-neutral',
  blurb: 'Not sorted yet.',
  rule: 'Tag them before anything gets written.',
  generatesScripts: false,
}

export function isUntagged(tier) {
  return tier === null || tier === undefined || tier === ''
}

export function tierMeta(tier) {
  if (isUntagged(tier)) return UNTAGGED
  return TIERS.find(t => t.key === Number(tier)) || UNTAGGED
}

// Only tier 2 gets generated message drafts. Untagged never does.
export function tierGeneratesScripts(tier) {
  return tierMeta(tier).generatesScripts
}

// ── STAGES ──
// Forward order for tap-to-advance (tiers 1 and 2). not_now is an off-ramp reachable only via
// jump; watching is tier 3's parked state and never advances — it only exits via promotion.
export const OUTREACH_STAGES = ['not_contacted', 'asked', 'referred']

export const OUTREACH_STAGE_ALL = [...OUTREACH_STAGES, 'not_now']

export const OUTREACH_STAGE_META = {
  not_contacted: { label: 'To Reach Out', badge: 'cw-badge-warn' },
  asked:         { label: 'Asked',        badge: 'cw-badge-info' },
  referred:      { label: 'Referred',     badge: 'cw-badge-ok' },
  not_now:       { label: 'Not Now',      badge: 'cw-badge-neutral' },
  watching:      { label: 'Watching',     badge: 'cw-badge-neutral' },
}

export function outreachStageMeta(stage) {
  return OUTREACH_STAGE_META[stage] || OUTREACH_STAGE_META.not_contacted
}

// Next stage for tap-to-advance. referred, not_now and watching are terminal (stay put).
export function nextStage(stage) {
  const i = OUTREACH_STAGES.indexOf(stage)
  if (i === -1 || i === OUTREACH_STAGES.length - 1) return stage
  return OUTREACH_STAGES[i + 1]
}

// The stage a lead starts in, given its tier. Tier 3 parks in 'watching' — it is explicitly
// NOT "to reach out", because reaching out to tier 3 is the thing we're preventing.
export function initialStage(tier) {
  return Number(tier) === 3 ? 'watching' : 'not_contacted'
}

// Retagging moves a lead between the pipeline and the tier-3 holding pen. Only force a stage
// change when the lead is crossing that boundary — otherwise leave their progress alone.
export function stageForTierChange(currentStage, newTier) {
  const goingCold = Number(newTier) === 3
  if (goingCold) return 'watching'
  if (currentStage === 'watching') return 'not_contacted'
  return currentStage
}

// ── PLATFORMS ──
export const PLATFORM_LABELS = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  phone_contacts: 'Phone',
  other: 'Other',
}

export function platformLabel(platform) {
  return PLATFORM_LABELS[platform] || 'Other'
}
