// Warm outreach pipeline — stage constants + meta, mirroring philosophy.js's STAGES/stageMeta.
// Deliberately lean: 3 forward stages you tap through, plus a not_now off-ramp you can only
// jump to. This is a warm-outreach tracker, not a sales CRM — booked-call / closed-won belong
// to the referred person's pipeline inside CoWorlds, not here.

// Forward order for tap-to-advance. not_now lives outside this — reachable only via jump.
export const OUTREACH_STAGES = ['not_contacted', 'asked', 'referred']

export const OUTREACH_STAGE_ALL = [...OUTREACH_STAGES, 'not_now']

export const OUTREACH_STAGE_META = {
  not_contacted: { label: 'To Reach Out', badge: 'cw-badge-warn' },
  asked:         { label: 'Asked',        badge: 'cw-badge-info' },
  referred:      { label: 'Referred',     badge: 'cw-badge-ok' },
  not_now:       { label: 'Not Now',      badge: 'cw-badge-neutral' },
}

export function outreachStageMeta(stage) {
  return OUTREACH_STAGE_META[stage] || OUTREACH_STAGE_META.not_contacted
}

// Next stage for tap-to-advance. referred and not_now are terminal (stay put).
export function nextStage(stage) {
  const i = OUTREACH_STAGES.indexOf(stage)
  if (i === -1 || i === OUTREACH_STAGES.length - 1) return stage
  return OUTREACH_STAGES[i + 1]
}

// Platform labels for the card icon/tag. Keys match the AI's platform guess.
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
