import React, { useState, useMemo } from 'react'
import { Copy, Check, ChevronDown, ChevronRight, RotateCw, Trash2 } from 'lucide-react'
import { useApp } from '../lib/AppContext'
import { OUTREACH_STAGE_ALL, outreachStageMeta, platformLabel } from '../lib/outreach'

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

function LeadCard({ lead, onAdvance, onJump, onRegenerate, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const followups = Array.isArray(lead.generated_followups) ? lead.generated_followups : []
  const hasScripts = lead.generated_opener || followups.length || lead.generated_transition || lead.generated_referral_ask

  async function regen() {
    setRegenerating(true)
    await onRegenerate(lead.id)
    setRegenerating(false)
  }

  return (
    <div className="cw-card" style={{ padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--on-surface-1)' }}>{lead.name}</span>
            {lead.platform && <span className="cw-chip" style={{ fontSize: 11 }}>{platformLabel(lead.platform)}</span>}
          </div>
          {lead.context && (
            <div style={{ fontSize: 13.5, color: 'var(--on-surface-2)', marginTop: 4, lineHeight: 1.5 }}>{lead.context}</div>
          )}
        </div>
        <StagePill lead={lead} onAdvance={onAdvance} onJump={onJump} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
        {hasScripts ? (
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

      {expanded && hasScripts && (
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

export default function Outreach() {
  const { leads, addLead, regenerateLead, advanceLeadStage, setLeadStage, deleteLead } = useApp()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)
  const [filter, setFilter] = useState('all')

  async function handleAdd() {
    const raw = text.trim()
    if (!raw || busy) return
    setBusy(true)
    setNotice(null)
    const res = await addLead(raw)
    setBusy(false)
    if (!res.ok) {
      setNotice({ type: 'error', msg: res.error || 'Could not save that lead.' })
      return
    }
    setText('')
    if (res.error) {
      // Saved, but the AI draft failed — the card will offer a re-generate.
      setNotice({ type: 'warn', msg: 'Saved, but message generation failed. Open the card to re-generate.' })
    }
  }

  function onKeyDown(e) {
    // Enter submits; Shift+Enter for a newline.
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAdd()
    }
  }

  const counts = useMemo(() => ({
    total: leads.length,
    contacted: leads.filter(l => l.stage !== 'not_contacted').length,
    referrals: leads.filter(l => l.stage === 'referred').length,
  }), [leads])

  const filtered = filter === 'all' ? leads : leads.filter(l => l.stage === filter)

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'not_contacted', label: 'To Reach Out' },
    { key: 'asked', label: 'Asked' },
    { key: 'referred', label: 'Referred' },
    { key: 'not_now', label: 'Not Now' },
  ]

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
            <div className="cw-stat-value">{counts.total}</div>
            <div className="cw-stat-label">Leads</div>
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
              {busy ? 'Writing…' : 'Add'}
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
            const active = filter === f.key
            return (
              <button
                key={f.key}
                className="cw-chip"
                onClick={() => setFilter(f.key)}
                style={{
                  cursor: 'pointer', fontSize: 12.5,
                  background: active ? 'var(--accent)' : undefined,
                  color: active ? 'var(--accent-ink)' : undefined,
                  borderColor: active ? 'transparent' : undefined,
                  fontWeight: active ? 650 : undefined,
                }}
              >
                {f.label}
              </button>
            )
          })}
        </div>

        {/* Lead list */}
        {filtered.length === 0 ? (
          <div className="cw-card cw-empty">
            <div className="cw-empty-title">{leads.length === 0 ? 'No leads yet' : 'Nothing in this stage'}</div>
            <div className="cw-empty-sub">
              {leads.length === 0
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
      </div>
    </div>
  )
}
