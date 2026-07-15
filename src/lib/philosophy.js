// Source of truth for the content philosophy this app is built around.
// Structural (quadrant/platform/stage enums, eval criteria) — not user-editable data.

export const QUADRANTS = [
  {
    key: 'creator_psychology',
    label: 'Creator Mindset',
    question: 'How should I think?',
    color: 'var(--district-brand)',
    dim: 'var(--district-brand-dim)',
    desc: 'How creators think — beliefs, mindset, decision-making, identity shifts.',
  },
  {
    key: 'creator_business',
    label: 'Creator Business',
    question: 'What should I build?',
    color: 'var(--ok)',
    dim: 'var(--ok-dim)',
    desc: 'How creator businesses operate — brand deals, pricing, offers, systems, revenue.',
  },
  {
    key: 'content_that_converts',
    label: 'Content That Converts',
    question: 'How do I sell?',
    color: 'var(--district-content)',
    dim: 'var(--district-content-dim)',
    desc: 'How content creates customers — hooks, storytelling, positioning, conversion (not virality).',
  },
  {
    key: 'creator_os',
    label: 'Creator Operating System',
    question: 'How do I execute?',
    color: 'var(--district-pipeline)',
    dim: 'var(--district-pipeline-dim)',
    desc: 'How to build infrastructure — AI workflows, SOPs, automation, business architecture.',
  },
]

export function quadrantMeta(key) {
  return QUADRANTS.find(q => q.key === key) || QUADRANTS[0]
}

export const STAGES = [
  { key: 'scripted', label: 'Scripted' },
  { key: 'filmed', label: 'Filmed' },
  { key: 'edited', label: 'Edited' },
  { key: 'ready_to_post', label: 'Ready to Post' },
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

// Scripts are delivered one beat per line. Collapse whatever spacing was typed/pasted
// and re-insert exactly one blank line between beats — teleprompter-style.
export function formatScriptBeats(raw) {
  if (!raw) return ''
  return raw
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .join('\n\n')
}
