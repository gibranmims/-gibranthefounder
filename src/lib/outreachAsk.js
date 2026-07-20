// THE ASK — canonical reference copy. Paste-only, never AI-generated.
//
// This is deliberately hand-written and static, sitting alongside philosophy.js as real
// strategy rather than data. The referral ask makes factual claims about the business —
// the 500k figure, the 90-day term, founder pricing, and the work-free-until-they-land-a-deal
// guarantee. Those must come out identical every single time, so no model ever paraphrases
// them. An LLM asked to "write the referral ask" will eventually round 500k to "half a
// million", soften the guarantee, or invent a case study.
//
// RULE: no fabricated names, only real numbers. Nothing goes in this file that hasn't
// actually happened.
//
// Future: once there's a real creator result, add a line to ASK_FULL and DM message 3 along
// the lines of "i just had a creator go from X to X doing this exact system". Deliberately
// left out for now — there isn't one yet, and an empty placeholder invites making one up.

// Sent as separate DMs, in order. 1 goes out on its own; 2-4 only once they bite.
export const ASK_DM_SEQUENCE = [
  {
    label: 'Message 1 — the ask',
    note: 'Send this on its own. Nothing else until they reply.',
    text: 'random question, do you know anybody making content who isn\'t seeing real money from it yet',
  },
  {
    label: 'Message 2 — what it is',
    note: 'Only if they say yes or ask for more.',
    text: 'i started this thing called creator sprint. 90 days, helps creators actually land paid brand deals and tiktok shop income instead of just posting and hoping something hits',
  },
  {
    label: 'Message 3 — proof',
    note: 'Real numbers only. Never round, never embellish.',
    text: 'built it off what me and my wife did with our own brand, no ads, all content, did over 500k in the first three months. taking a few people on right now at founder pricing before it goes up',
  },
  {
    label: 'Message 4 — guarantee',
    note: 'Closes the risk objection before they raise it, then asks.',
    text: 'and if they hit their numbers and still haven\'t landed a deal, i keep working with them free until they do. so does anyone come to mind',
  },
]

// For a phone call or one long DM, when you don't want to drip it out.
export const ASK_FULL = {
  label: 'Full version',
  note: 'Phone call or a single long DM.',
  text: `by the way, random question. do you know anybody who's making content but not seeing real money from it, trying to actually turn it into consistent income in the next few months?

i just launched something called creator sprint. it's a 90 day program that helps creators land paid brand deals and stack tiktok shop income, so they're not just posting and hoping.

i'm taking a handful of people on right now at founder pricing before it goes up once more case studies are locked in.

here's the thing, if they hit their daily numbers and still haven't landed a paid deal, i keep working with them free until they do. so the risk is on me, not them.

i built the whole system off what tamar and i actually did with our own brand. no ads, all content and creators, and it did over 500k in the first three months.

i just want a few more people running it so i've got proof across different situations, not just our own brand. does anyone come to mind?`,
}

// Say it after a real pause, only if nothing comes to mind.
export const ASK_CLOSER = {
  label: 'The closer',
  note: 'After a pause, only if they draw a blank.',
  text: '...and if nobody comes to mind right away, ha, does anyone you can\'t stand come to mind? that usually gets somebody thinking',
}
