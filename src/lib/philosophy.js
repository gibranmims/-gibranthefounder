// Source of truth for the content philosophy this app is built around.
// Structural (quadrant/platform/stage enums, eval criteria) — not user-editable data.

export const QUADRANTS = [
  {
    key: 'creator_psychology',
    label: 'Creator Psychology',
    color: 'var(--district-brand)',
    dim: 'var(--district-brand-dim)',
    desc: 'How creators think — beliefs, mindset, decision-making, identity shifts.',
  },
  {
    key: 'creator_business',
    label: 'Creator Business',
    color: 'var(--ok)',
    dim: 'var(--ok-dim)',
    desc: 'How creator businesses operate — brand deals, pricing, offers, systems, revenue.',
  },
  {
    key: 'content_that_converts',
    label: 'Content That Converts',
    color: 'var(--district-content)',
    dim: 'var(--district-content-dim)',
    desc: 'How content creates customers — hooks, storytelling, positioning, conversion (not virality).',
  },
  {
    key: 'creator_os',
    label: 'Creator Operating System',
    color: 'var(--district-pipeline)',
    dim: 'var(--district-pipeline-dim)',
    desc: 'How to build infrastructure — AI workflows, SOPs, automation, business architecture.',
  },
]

export function quadrantMeta(key) {
  return QUADRANTS.find(q => q.key === key) || QUADRANTS[0]
}

export const PLATFORMS = [
  { key: 'shortform', label: 'Short-Form Video' },
  { key: 'x_threads', label: 'X / Threads' },
  { key: 'linkedin', label: 'LinkedIn' },
]

export function platformLabel(key) {
  return PLATFORMS.find(p => p.key === key)?.label || key
}

export const STAGES = [
  { key: 'idea', label: 'Idea' },
  { key: 'drafting', label: 'Drafting' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'posted', label: 'Posted' },
]

// Matches content_pieces.score_* columns (strip the score_ prefix to get the key)
export const EVAL_CRITERIA = [
  { key: 'belief_shift', label: 'Belief Shift' },
  { key: 'novelty', label: 'Novelty' },
  { key: 'curiosity', label: 'Curiosity' },
  { key: 'authority', label: 'Authority' },
  { key: 'business_relevance', label: 'Business Relevance' },
  { key: 'conversion_potential', label: 'Conversion Potential' },
  { key: 'discussion_potential', label: 'Discussion Potential' },
]
