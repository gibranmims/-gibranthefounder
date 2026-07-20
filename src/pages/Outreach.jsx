import React, { useState, useMemo } from 'react'
import { Copy, Check, ChevronDown, ChevronRight, RotateCw, Trash2, ArrowUp, Eye } from 'lucide-react'
import { useApp } from '../lib/AppContext'
import {
  OUTREACH_STAGE_ALL, outreachStageMeta, platformLabel,
  TIERS, tierMeta, tierGeneratesScripts,
} from '../lib/outreach'

// One copyable message draft. Copy button flips to a check for a beat — Gibran never hand-selects.
function CopyBlock({ label, text }) {
  const [copied, setCopied] = useState(false)
  if (!text) return null
  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch { /* clipboard blocked — no-op */ }
  }
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
        <div className="cw-label" style={{ margin: 0 }}>{label}</div>
        <button
          className="cw-btn-ghost"
          onClick={copy}
          style={{ padding: '3px 9px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 5 }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="cw-card-flat" style={{ padding: '10px 12px', fontSize: 14, lineHeight: 1.55, color: 'var(--on-surface-1)', whiteSpace: 'pre-wrap' }}>
        {text}
      </div>
    </div>
  )
}

// The tappable stage pill: click advances through the forward stages; the caret opens a menu
// to jump anywhere (including the Not Now off-ramp).
function StagePill({ lead, onAdvance, onJump }) {
  const [open, setOpen] = useState(false)
  const meta = outreachStageMeta(lead.stage)
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        className={`cw-badge ${meta.badge}`}
        onClick={() => onAdvance(lead.id)}
        title="Tap to advance"
        style={{ border: 'none', cursor: 'pointer', padding: '4px 10px' }}
      >
        {meta.label}
      </button>
      <button
        className={`cw-badge ${meta.badge}`}
        onClick={() => setOpen(o => !o)}
        title="Jump to stage"
        style={{ border: 'none', cursor: 'pointer', padding: '4px 6px', marginLeft: 3 }}
      >
        <ChevronDown size={12} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <div style={{
            position: 'absolute', top: '100%', right: 0, marginTop: 6, zIndex: 50,
            background: 'var(--surface-solid)', border: '1px solid var(--stroke-1)', borderRadius: 12,
            boxShadow: 'var(--shadow-night)', padding: 6, minWidth: 150,
          }}>
            {OUTREACH_STAGE_ALL.map(s => {
              const m = outreachStageMeta(s)
              const active = s === lead.stage
              return (
                <button
                  key={s}
                  onClick={() => { onJump(lead.id, s); setOpen(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', width: '100%', textAlign: 'left', gap: 8,
                    padding: '7px 10px', border: 'none', borderRadius: 8, cursor: 'pointer',
                    background: active ? 'var(--surface-2)' : 'transparent',
                    color: 'var(--on-surface-1)', fontFamily: 'var(--font-sans)', fontSize: 13,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-3)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = active ? 'var(--surface-2)' : 'transparent' }}
                >
                  <span className={`cw-badge ${m.badge}`} style={{ padding: '2px 8px' }}>{m.label}</span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function LeadHead({ lead }) {
  const tier = tierMeta(lead.tier)
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--on-surface-1)' }}>{lead.name}</span>
        <span className={`cw-badge ${tier.badge}`}>{tier.label}</span>
        {lead.platform && <span className="cw-chip" style={{ fontSize: 11 }}>{platformLabel(lead.platform)}</span>}
      </div>
      {lead.context && (
        <div style={{ fontSize: 13.5, color: 'var(--on-surface-2)', marginTop: 4, lineHeight: 1.5 }}>{lead.context}</div>
      )}
    </div>
  )
}

// Tier 1 and 2 cards. Only tier 2 has scripts — tier 1 gets the reminder that it doesn't need one.
function LeadCard({ lead, onAdvance, onJump, onRegenerate, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const followups = Array.isArray(lead.generated_followups) ? lead.generated_followups : []
  const usesScripts = tierGeneratesScripts(lead.tier)
  const hasScripts = lead.generated_opener || followups.length || lead.generated_transition || lead.generated_referral_ask

  async function regen() {
    setRegenerating(true)
    await onRegenerate(lead.id)
    setRegenerating(false)
  }

  return (
    <div className="cw-card" style={{ padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <LeadHead lead={lead} />
        <StagePill lead={lead} onAdvance={onAdvance} onJump={onJump} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
        {!usesScripts ? (
          <span style={{ fontSize: 12.5, color: 'var(--on-surface-3)', fontStyle: 'italic' }}>
            No script. Just talk to them like you always do.
          </span>
        ) : hasScripts ? (
          <button
            className="cw-btn-ghost"
            onClick={() => setExpanded(e => !e)}
            style={{ padding: '5px 11px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}
          >
            {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            {expanded ? 'Hide scripts' : 'View scripts'}
          </button>
        ) : (
          <button
            className="cw-btn-ghost"
            onClick={regen}
            disabled={regenerating}
            style={{ padding: '5px 11px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--warn)' }}
          >
            <RotateCw size={13} />
            {regenerating ? 'Generating…' : 'Generate scripts'}
          </button>
        )}
        <button
          className="cw-btn-ghost"
          onClick={() => onDelete(lead.id)}
          title="Delete lead"
          style={{ padding: '5px 9px', fontSize: 12, marginLeft: 'auto', color: 'var(--danger)' }}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {expanded && usesScripts && hasScripts && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--stroke-1)' }}>
          <CopyBlock label="Opener" text={lead.generated_opener} />
          {followups.map((f, i) => (
            <CopyBlock key={i} label={`Follow-up ${i + 1}`} text={f} />
          ))}
          <CopyBlock label="Transition into the pitch" text={lead.generated_transition} />
          <CopyBlock label="Referral ask" text={lead.generated_referral_ask} />
        </div>
      )}
    </div>
  )
}

// Tier 3. Deliberately has no stage pill and no scripts — the only action is the promotion
// that happens when THEY engage first.
function WatchingCard({ lead, onPromote, onDelete }) {
  const [promoting, setPromoting] = useState(false)
  async function promote() {
    setPromoting(true)
    await onPromote(lead.id)
    setPromoting(false)
  }
  return (
    <div className="cw-card" style={{ padding: '14px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <LeadHead lead={lead} />
        <button
          className="cw-btn-ghost"
          onClick={promote}
          disabled={promoting}
          title="Only if they replied, commented, or reacted first"
          style={{ padding: '5px 11px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0 }}
        >
          <ArrowUp size={13} />
          {promoting ? 'Promoting…' : 'They engaged first'}
        </button>
        <button
          className="cw-btn-ghost"
          onClick={() => onDelete(lead.id)}
          title="Delete lead"
          style={{ padding: '5px 9px', fontSize: 12, color: 'var(--danger)', flexShrink: 0 }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

export default function Outreach() {
  const { leads, addLead, regenerateLead, promoteLeadToWarm, advanceLeadStage, setLeadStage, deleteLead } = useApp()
  const [text, setText] = useState('')
  const [tier, setTier] = useState(2)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)
  const [filter, setFilter] = useState('all')
  const [showWatching, setShowWatching] = useState(false)

  async function handleAdd() {
    const raw = text.trim()
    if (!raw || busy) return
    setBusy(true)
    setNotice(null)
    const res = await addLead(raw, tier)
    setBusy(false)
    if (!res.ok) {
      setNotice({ type: 'error', msg: res.error || 'Could not save that lead.' })
      return
    }
    setText('')
    if (res.error) {
      setNotice({ type: 'warn', msg: 'Saved, but the AI call failed. Open the card to retry.' })
    }
  }

  function onKeyDown(e) {
    // Enter submits; Shift+Enter for a newline.
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAdd()
    }
  }

  // Tier 3 lives apart from the pipeline — it isn't a stage, it's a holding pen.
  const active = useMemo(() => leads.filter(l => Number(l.tier) !== 3), [leads])
  const watching = useMemo(() => leads.filter(l => Number(l.tier) === 3), [leads])

  const counts = useMemo(() => ({
    active: active.length,
    contacted: active.filter(l => l.stage !== 'not_contacted').length,
    referrals: active.filter(l => l.stage === 'referred').length,
  }), [active])

  const filtered = filter === 'all' ? active : active.filter(l => l.stage === filter)

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'not_contacted', label: 'To Reach Out' },
    { key: 'asked', label: 'Asked' },
    { key: 'referred', label: 'Referred' },
    { key: 'not_now', label: 'Not Now' },
  ]

  const activeTier = tierMeta(tier)

  return (
    <div>
      <div className="cw-banner cw-banner--content" style={{ padding: '26px 30px', marginBottom: 24 }}>
        <div className="cw-eyebrow">Outreach</div>
        <h1 className="cw-title" style={{ fontSize: 30, marginTop: 4 }}>Warm Outreach</h1>
        <div className="cw-sub" style={{ marginTop: 2 }}>Say one line about someone. Get the whole conversation written, ready to send.</div>
      </div>

      <div style={{ maxWidth: 680 }}>
        {/* Counts strip */}
        <div className="cw-grid-3" style={{ marginBottom: 20 }}>
          <div className="cw-card cw-stat" style={{ padding: '14px 18px' }}>
            <div className="cw-stat-value">{counts.active}</div>
            <div className="cw-stat-label">In Pipeline</div>
          </div>
          <div className="cw-card cw-stat" style={{ padding: '14px 18px' }}>
            <div className="cw-stat-value">{counts.contacted}</div>
            <div className="cw-stat-label">Contacted</div>
          </div>
          <div className="cw-card cw-stat" style={{ padding: '14px 18px' }}>
            <div className="cw-stat-value">{counts.referrals}</div>
            <div className="cw-stat-label">Referrals</div>
          </div>
        </div>

        {/* Quick Capture */}
        <div className="cw-card" style={{ padding: 20, marginBottom: 20 }}>
          <div className="cw-label">Quick Capture</div>

          {/* Tier is set by hand — the AI can't know how close the relationship is. */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            {TIERS.map(t => {
              const on = tier === t.key
              return (
                <button
                  key={t.key}
                  onClick={() => setTier(t.key)}
                  className="cw-chip"
                  style={{
                    cursor: 'pointer', fontSize: 12.5, flex: 1, justifyContent: 'center',
                    background: on ? 'var(--accent)' : undefined,
                    color: on ? 'var(--accent-ink)' : undefined,
                    borderColor: on ? 'transparent' : undefined,
                    fontWeight: on ? 650 : undefined,
                  }}
                >
                  {t.label}
                </button>
              )
            })}
          </div>
          <div style={{ fontSize: 12, color: 'var(--on-surface-3)', lineHeight: 1.5, marginBottom: 12 }}>
            <strong style={{ color: 'var(--on-surface-2)', fontWeight: 600 }}>{activeTier.blurb}</strong>{' '}
            {activeTier.rule}
          </div>

          <textarea
            className="cw-textarea"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="who and what's going on with them"
            disabled={busy}
            style={{ marginBottom: 12 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="cw-btn-primary" onClick={handleAdd} disabled={busy}>
              {busy ? (tierGeneratesScripts(tier) ? 'Writing…' : 'Saving…') : 'Add'}
            </button>
            {notice && (
              <span style={{ fontSize: 12.5, color: notice.type === 'error' ? 'var(--danger)' : 'var(--warn)' }}>
                {notice.msg}
              </span>
            )}
          </div>
        </div>

        {/* Stage filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {FILTERS.map(f => {
            const on = filter === f.key
            return (
              <button
                key={f.key}
                className="cw-chip"
                onClick={() => setFilter(f.key)}
                style={{
                  cursor: 'pointer', fontSize: 12.5,
                  background: on ? 'var(--accent)' : undefined,
                  color: on ? 'var(--accent-ink)' : undefined,
                  borderColor: on ? 'transparent' : undefined,
                  fontWeight: on ? 650 : undefined,
                }}
              >
                {f.label}
              </button>
            )
          })}
        </div>

        {/* Pipeline — tiers 1 and 2 */}
        {filtered.length === 0 ? (
          <div className="cw-card cw-empty">
            <div className="cw-empty-title">{active.length === 0 ? 'No leads yet' : 'Nothing in this stage'}</div>
            <div className="cw-empty-sub">
              {active.length === 0
                ? 'Drop a line about a contact above. Name, platform, what\'s going on with them.'
                : 'Try a different filter, or capture someone new.'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(lead => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onAdvance={advanceLeadStage}
                onJump={setLeadStage}
                onRegenerate={regenerateLead}
                onDelete={deleteLead}
              />
            ))}
          </div>
        )}

        {/* Watching — tier 3, deliberately apart from the pipeline */}
        {watching.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <button
              onClick={() => setShowWatching(s => !s)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left',
                background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: 10,
                color: 'var(--on-canvas-2)', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600,
              }}
            >
              {showWatching ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <Eye size={14} />
              Watching · {watching.length}
              <span style={{ fontWeight: 400, color: 'var(--on-canvas-3)', fontSize: 12.5 }}>
                — no scripts. let your content reach them.
              </span>
            </button>
            {showWatching && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {watching.map(lead => (
                  <WatchingCard
                    key={lead.id}
                    lead={lead}
                    onPromote={promoteLeadToWarm}
                    onDelete={deleteLead}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
