// Source of truth for the content philosophy this app is built around.
// Structural (quadrant/platform/stage enums, eval criteria) — not user-editable data.

export const QUADRANTS = [
  {
    key: 'creator_psychology',
    label: 'Creator Mindset',
    emoji: '🧠',
    question: 'How should I think?',
    color: 'var(--district-brand)',
    dim: 'var(--district-brand-dim)',
    desc: 'Learn the beliefs, mental models, and decision-making frameworks that separate creators who stay stuck from creators who build lasting businesses.',
    examples: ['Identity', 'Discipline', 'Opportunity', 'Confidence', 'Productivity', 'Long-term thinking', 'Creator psychology'],
  },
  {
    key: 'creator_business',
    label: 'Creator Business',
    emoji: '💼',
    question: 'What should I build? How should I build it?',
    color: 'var(--ok)',
    dim: 'var(--ok-dim)',
    desc: 'Learn how to turn your expertise into a profitable creator business through the right offers, systems, and monetization strategies.',
    examples: ['Income streams', 'Brand deals', 'Offers', 'Digital products', 'Community', 'Pricing', 'Positioning', 'Business strategy', 'Personal branding'],
  },
  {
    key: 'content_that_converts',
    label: 'Consumer Psychology',
    emoji: '🧠',
    question: 'How do I sell with content?',
    color: 'var(--district-content)',
    dim: 'var(--district-content-dim)',
    desc: 'Learn the psychology behind content that captures attention, builds trust, influences buying decisions, and drives sales.',
    examples: ['Consumer psychology secrets', 'Hooks', 'Storytelling', 'Scripting', 'Trust', 'Angles', 'Offers', 'Persuasion', 'Buyer psychology'],
  },
  {
    key: 'creator_os',
    label: 'Creator Operating System',
    emoji: '⚙️',
    question: 'How do I execute?',
    color: 'var(--district-pipeline)',
    dim: 'var(--district-pipeline-dim)',
    desc: 'Build the systems, workflows, and habits that help you consistently create, publish, and grow without relying on motivation.',
    examples: ['AI workflows', 'Content systems', 'SOPs', 'Planning', 'Automation', 'Creator stack', 'Delegation', 'Organization', 'Execution systems'],
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
