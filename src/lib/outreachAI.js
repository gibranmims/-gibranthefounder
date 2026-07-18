// The entire "engine" behind the Warm Outreach tool: one Claude call per capture that turns
// a raw spoken/typed line about a contact into a structured lead record + ready-to-send message
// drafts. Goes through the dormant /api/claude proxy in server.js (keeps the key server-side).
// The proxy forwards the Messages body verbatim, so we send the full payload ourselves.
//
// Structured output is done with FORCED TOOL USE (tool_choice), not JSON-in-text or an
// assistant prefill — claude-sonnet-5 rejects assistant-message prefill, and forced tool use
// guarantees a schema-valid object back with no fragile parsing.

// Swap this if you want cheaper/faster generation (e.g. 'claude-haiku-4-5-20251001').
// Sonnet 5 gives the best voice-match for the casual-text copy.
const MODEL = 'claude-sonnet-5'

// Product context + voice rules baked in here. Edit the pricing / program copy if the offer
// changes — this is the one place it lives. Field-level guidance rides on the tool schema below.
const SYSTEM_PROMPT = `You turn one raw spoken or typed line about a personal contact into a
structured warm outreach record, plus ready-to-send message content. Always call the save_lead
tool with your result.

CONTEXT ON THE PROGRAM BEING PITCHED (bake this in, do not ask about it):
CoWorlds runs Creator Sprint, a 90-day done-with-you program that installs a creator business.
It helps creators who already make content get paid for it consistently, through UGC brand deals
and TikTok Shop income. Price is $5,000 founder rate right now, going to $10,000 once more
testimonials are stacked. This is not free and never frame it as free. The ask to warm contacts
is NOT "do you want this." It is "do you know anyone who'd want this," a referral ask, because
these are personal contacts being warmed up, not qualified leads.

VOICE RULES, apply to every generated message:
- lowercase only
- no em dashes
- no exclamation marks
- no corporate language, no guru language
- short sentences, sixth grade reading level
- sounds like a real person texting a friend, never like marketing copy
- specific to the detail given, never generic`

const LEAD_TOOL = {
  name: 'save_lead',
  description: 'Save the structured warm-outreach lead and its ready-to-send message drafts.',
  input_schema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'the contact\'s name' },
      platform: {
        type: 'string',
        enum: ['instagram', 'tiktok', 'facebook', 'phone_contacts', 'other'],
        description: 'guess from context if not stated, default other',
      },
      context: { type: 'string', description: 'clean one-line summary of what was said about them' },
      generated_opener: {
        type: 'string',
        description: 'a casual first message referencing the specific detail, a question not a statement, the entire message ready to paste',
      },
      generated_followups: {
        type: 'array',
        items: { type: 'string' },
        description: '2-3 natural next lines for once they reply. mix of compliment, follow-up question, and a light personal question. these are options, not all sent at once',
      },
      generated_transition: {
        type: 'string',
        description: 'the line that shifts from personal catch-up into mentioning CoWorlds exists. a natural pivot, not a hard cut',
      },
      generated_referral_ask: {
        type: 'string',
        description: 'the referral pitch: name creator sprint, what it does in one line, that spots are limited at founder pricing right now, ask if anyone comes to mind, end with a soft out',
      },
    },
    required: ['name', 'platform', 'context', 'generated_opener', 'generated_followups', 'generated_transition', 'generated_referral_ask'],
  },
}

export async function structureLead(rawInput) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: [LEAD_TOOL],
      tool_choice: { type: 'tool', name: 'save_lead' },
      messages: [{ role: 'user', content: rawInput }],
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.error?.message || `Claude request failed (${res.status})`)
  }

  const block = (data?.content || []).find(b => b.type === 'tool_use')
  const record = block?.input
  if (!record || typeof record !== 'object') {
    throw new Error('Claude did not return a structured lead')
  }

  // Normalise: guarantee the shape the UI/DB expect regardless of model wobble.
  return {
    name: (record.name || '').toString().trim() || fallbackName(rawInput),
    platform: normalizePlatform(record.platform),
    context: (record.context || '').toString().trim(),
    generated_opener: (record.generated_opener || '').toString().trim(),
    generated_followups: Array.isArray(record.generated_followups)
      ? record.generated_followups.map(s => (s || '').toString().trim()).filter(Boolean)
      : [],
    generated_transition: (record.generated_transition || '').toString().trim(),
    generated_referral_ask: (record.generated_referral_ask || '').toString().trim(),
  }
}

const VALID_PLATFORMS = ['instagram', 'tiktok', 'facebook', 'phone_contacts', 'other']
function normalizePlatform(p) {
  const v = (p || '').toString().toLowerCase().trim()
  return VALID_PLATFORMS.includes(v) ? v : 'other'
}

// If the AI never runs (or fails), still capture a usable name from the raw line —
// first comma-separated chunk, or the first couple of words.
export function fallbackName(rawInput) {
  const raw = (rawInput || '').trim()
  if (!raw) return 'New lead'
  const firstChunk = raw.split(',')[0].trim()
  const words = firstChunk.split(/\s+/).slice(0, 3).join(' ')
  return words || 'New lead'
}
