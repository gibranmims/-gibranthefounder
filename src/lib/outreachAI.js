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

// Product context + voice rules baked in here. Field-level guidance rides on the tool schema.
//
// The model deliberately does NOT write the referral ask. That copy makes factual claims about
// the business (revenue figure, pricing, the guarantee) and lives as fixed, hand-written text in
// outreachAsk.js so it can never drift or be embellished. The AI's job stops at the transition —
// the personal, per-contact part it's actually good at.
const SYSTEM_PROMPT = `You turn one raw spoken or typed line about a personal contact into a
structured warm outreach record, plus the personal message content that leads up to a pitch.
Always call the save_lead tool with your result.

CONTEXT (for tone only — do not pitch, do not write the offer):
Gibran runs CoWorlds. He is warming up personal contacts so he can eventually ask them for a
REFERRAL ("do you know anyone who'd want this"), never a direct sale to the contact themselves.
You are writing the catch-up conversation that happens BEFORE that ask. Someone else writes the
ask itself. Never state prices, revenue numbers, guarantees, program details, or results — you
do not know them and must not invent them.

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
        description: 'the line that shifts from personal catch-up into mentioning gibran started something new. a natural pivot, not a hard cut. do NOT describe the offer, name a price, or make the ask — this line only opens the door',
      },
    },
    required: ['name', 'platform', 'context', 'generated_opener', 'generated_followups', 'generated_transition'],
  },
}

// Parse-only tool for tiers 1 and 3. No message drafts get written — tier 1 doesn't need a
// script (you already know how to talk to these people) and tier 3 must never get one. We still
// parse the raw line so the card reads cleanly instead of showing a messy dictated sentence.
const PARSE_TOOL = {
  name: 'save_contact',
  description: 'Save just the identity details of a personal contact. Do not write any messages.',
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
    },
    required: ['name', 'platform', 'context'],
  },
}

const PARSE_SYSTEM_PROMPT = `You extract the identity details of a personal contact from one raw
spoken or typed line. Call the save_contact tool. Write no outreach messages of any kind — you
are only tidying up who this person is and what was said about them. Keep the context summary
lowercase and plain.`

async function callClaude({ system, tool, toolName, rawInput, maxTokens = 1024 }) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      tools: [tool],
      tool_choice: { type: 'tool', name: toolName },
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
  return record
}

// Tier 2 only: parse the line AND write the full message sequence.
export async function structureLead(rawInput) {
  const record = await callClaude({
    system: SYSTEM_PROMPT, tool: LEAD_TOOL, toolName: 'save_lead', rawInput,
  })

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
  }
}

// Bulk import. One call for the whole dictated or pasted blob, however many people are in it —
// not one call per name. Writes no messages and assigns no tier: imported names land untagged
// so triage stays visible work.
const LIST_TOOL = {
  name: 'save_contacts',
  description: 'Save a list of personal contacts parsed out of one raw block of text.',
  input_schema: {
    type: 'object',
    properties: {
      contacts: {
        type: 'array',
        description: 'one entry per distinct person mentioned, in the order they were said',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'the person\'s name as said' },
            platform: {
              type: 'string',
              enum: ['instagram', 'tiktok', 'facebook', 'phone_contacts', 'other'],
              description: 'only if actually stated, otherwise other',
            },
            context: {
              type: 'string',
              description: 'any detail mentioned about this specific person. empty string if none was given. never invent one',
            },
          },
          required: ['name'],
        },
      },
    },
    required: ['contacts'],
  },
}

const LIST_SYSTEM_PROMPT = `You split one raw block of dictated or pasted text into a list of
individual people. Call the save_contacts tool.

The input is someone talking or typing through a list of personal contacts. It may be messy,
run-on, comma separated, newline separated, or full of filler words from speech to text. Your
only job is to separate it into one entry per distinct person and attach any detail that was
said about that specific person.

Rules:
- one entry per person. do not merge two people, do not split one person into two.
- keep names as spoken. do not correct or formalise them.
- context is only what was actually said about that person. if nothing was said, use an empty
  string. never invent a detail, a platform, or a relationship.
- ignore filler words and speech to text noise like "um", "okay so", "next one".
- write no outreach messages of any kind.`

export async function parseLeadList(rawInput) {
  const record = await callClaude({
    system: LIST_SYSTEM_PROMPT,
    tool: LIST_TOOL,
    toolName: 'save_contacts',
    rawInput,
    maxTokens: 8192,
  })

  const contacts = Array.isArray(record.contacts) ? record.contacts : []
  return contacts
    .map(c => ({
      name: (c?.name || '').toString().trim(),
      platform: normalizePlatform(c?.platform),
      context: (c?.context || '').toString().trim(),
    }))
    .filter(c => c.name)
}

// Tiers 1 and 3: identity only, no drafts.
export async function parseLeadOnly(rawInput) {
  const record = await callClaude({
    system: PARSE_SYSTEM_PROMPT, tool: PARSE_TOOL, toolName: 'save_contact', rawInput,
  })
  return {
    name: (record.name || '').toString().trim() || fallbackName(rawInput),
    platform: normalizePlatform(record.platform),
    context: (record.context || '').toString().trim(),
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
