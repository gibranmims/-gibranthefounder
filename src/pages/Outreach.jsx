import React, { useState, useMemo } from 'react'
import {
  Copy, Check, ChevronDown, ChevronRight, RotateCw, Trash2, ArrowUp,
  MessageSquare, Loader2,
} from 'lucide-react'
import { useApp } from '../lib/AppContext'
import {
  OUTREACH_STAGE_ALL, outreachStageMeta, platformLabel,
  TIERS, tierMeta, tierGeneratesScripts, isUntagged,
} from '../lib/outreach'
import { ASK_DM_SEQUENCE, ASK_FULL, ASK_CLOSER } from '../lib/outreachAsk'

// ── shared bits ──────────────────────────────────────────────────────────────

function CopyBlock({ label, note, text }) {
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5, gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div className="cw-label" style={{ margin: 0 }}>{label}</div>
          {note && <div style={{ fontSize: 11.5, color: 'var(--on-surface-3)', marginTop: 2, lineHeight: 1.4 }}>{note}</div>}
        </div>
        <button
          className="cw-btn-ghost"
          onClick={copy}
          style={{ padding: '3px 9px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0 }}
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

// A small dropdown anchored under a pill. Shared by the tier and stage cells.
function PillMenu({ children, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
      <div style={{
        position: 'absolute', top: '100%', left: 0, marginTop: 6, zIndex: 50,
        background: 'var(--surface-solid)', border: '1px solid var(--stroke-1)', borderRadius: 12,
        boxShadow: 'var(--shadow-night)', padding: 6, minWidth: 150,
      }}>
        {children}
      </div>
    </>
  )
}

function MenuItem({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', width: '100%', textAlign: 'left', gap: 8,
        padding: '7px 10px', border: 'none', borderRadius: 8, cursor: 'pointer',
        background: active ? 'var(--surface-2)' : 'transparent',
        color: 'var(--on-surface-1)', fontFamily: 'var(--font-sans)', fontSize: 13,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-3)' }}
      onMouseLeave={e => { e.currentTarget.style.background = active ? 'var(--surface-2)' : 'transparent' }}
    >
      {children}
    </button>
  )
}

// ── The Ask ──────────────────────────────────────────────────────────────────

// Fixed reference copy, identical for every contact, so it lives here rather than on any one
// lead. Never AI-generated: it states real revenue, pricing and a guarantee.
function AskReference() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState('dm')
  return (
    <div className="cw-card" style={{ padding: '16px 18px', marginBottom: 20 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left',
          background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
          color: 'var(--on-surface-1)', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600,
        }}
      >
        {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        <MessageSquare size={15} />
        The Ask
        <span style={{ fontWeight: 400, color: 'var(--on-surface-3)', fontSize: 12.5 }}>
          — same for everyone. paste it when you get there.
        </span>
      </button>

      {open && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--stroke-1)' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {[{ k: 'dm', l: 'DM sequence' }, { k: 'full', l: 'Full version' }].map(m => {
              const on = mode === m.k
              return (
                <button
                  key={m.k}
                  onClick={() => setMode(m.k)}
                  className="cw-chip"
                  style={{
                    cursor: 'pointer', fontSize: 12.5,
                    background: on ? 'var(--accent)' : undefined,
                    color: on ? 'var(--accent-ink)' : undefined,
                    borderColor: on ? 'transparent' : undefined,
                    fontWeight: on ? 650 : undefined,
                  }}
                >
                  {m.l}
                </button>
              )
            })}
          </div>
          {mode === 'dm'
            ? ASK_DM_SEQUENCE.map(m => <CopyBlock key={m.label} label={m.label} note={m.note} text={m.text} />)
            : (
              <>
                <CopyBlock label={ASK_FULL.label} note={ASK_FULL.note} text={ASK_FULL.text} />
                <CopyBlock label={ASK_CLOSER.label} note={ASK_CLOSER.note} text={ASK_CLOSER.text} />
              </>
            )}
        </div>
      )}
    </div>
  )
}

// ── table cells ──────────────────────────────────────────────────────────────

function TierCell({ lead, onSetTier }) {
  const [open, setOpen] = useState(false)
  const meta = tierMeta(lead.tier)
  const untagged = isUntagged(lead.tier)
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        className={`cw-badge ${meta.badge}`}
        onClick={() => setOpen(o => !o)}
        title="Set tier"
        style={{
          border: untagged ? '1px dashed var(--stroke-2)' : 'none',
          cursor: 'pointer', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 4,
        }}
      >
        {meta.label}
        <ChevronDown size={11} />
      </button>
      {open && (
        <PillMenu onClose={() => setOpen(false)}>
          {TIERS.map(t => (
            <MenuItem key={t.key} active={Number(lead.tier) === t.key} onClick={() => { onSetTier(lead.id, t.key); setOpen(false) }}>
              <span className={`cw-badge ${t.badge}`} style={{ padding: '2px 8px' }}>{t.label}</span>
              <span style={{ fontSize: 11.5, color: 'var(--on-surface-3)' }}>{t.blurb}</span>
            </MenuItem>
          ))}
        </PillMenu>
      )}
    </div>
  )
}

function StageCell({ lead, onAdvance, onJump }) {
  const [open, setOpen] = useState(false)
  const meta = outreachStageMeta(lead.stage)
  const parked = lead.stage === 'watching'
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        className={`cw-badge ${meta.badge}`}
        onClick={() => (parked ? setOpen(true) : onAdvance(lead.id))}
        title={parked ? 'Cold contacts stay parked until they engage' : 'Tap to advance'}
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
        <ChevronDown size={11} />
      </button>
      {open && (
        <PillMenu onClose={() => setOpen(false)}>
          {OUTREACH_STAGE_ALL.map(s => {
            const m = outreachStageMeta(s)
            return (
              <MenuItem key={s} active={s === lead.stage} onClick={() => { onJump(lead.id, s); setOpen(false) }}>
                <span className={`cw-badge ${m.badge}`} style={{ padding: '2px 8px' }}>{m.label}</span>
              </MenuItem>
            )
          })}
        </PillMenu>
      )}
    </div>
  )
}

// The expanded row. For a warm lead with nothing written yet this is where generation happens —
// nothing is written at capture time any more.
function ScriptsPanel({ lead, generating, onGenerate, onPromote }) {
  const followups = Array.isArray(lead.generated_followups) ? lead.generated_followups : []
  const hasScripts = lead.generated_opener || followups.length || lead.generated_transition
  const untagged = isUntagged(lead.tier)
  const usesScripts = tierGeneratesScripts(lead.tier)

  if (untagged) {
    return <div style={{ fontSize: 13, color: 'var(--on-surface-3)' }}>Tag a tier first — nothing gets written until you do.</div>
  }
  if (Number(lead.tier) === 1) {
    return <div style={{ fontSize: 13, color: 'var(--on-surface-3)' }}>No script. Just talk to them like you always do, and bring it up when it's true.</div>
  }
  if (Number(lead.tier) === 3) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--on-surface-3)' }}>
          Parked. No scripts get written for cold contacts — let your content reach them.
        </span>
        <button
          className="cw-btn-ghost"
          onClick={() => onPromote(lead.id)}
          title="Only if they replied, commented, or reacted first"
          style={{ padding: '5px 11px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}
        >
          <ArrowUp size={13} />
          They engaged first
        </button>
      </div>
    )
  }
  if (generating) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--on-surface-2)' }}>
        <Loader2 size={14} style={{ animation: 'spin 0.9s linear infinite' }} />
        Writing the sequence…
      </div>
    )
  }
  if (!hasScripts && usesScripts) {
    return (
      <button
        className="cw-btn-ghost"
        onClick={() => onGenerate(lead.id)}
        style={{ padding: '5px 11px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--warn)' }}
      >
        <RotateCw size={13} />
        Generate scripts
      </button>
    )
  }
  return (
    <>
      <CopyBlock label="Opener" text={lead.generated_opener} />
      {followups.map((f, i) => <CopyBlock key={i} label={`Follow-up ${i + 1}`} text={f} />)}
      <CopyBlock label="Transition into the pitch" text={lead.generated_transition} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--on-surface-3)', fontStyle: 'italic' }}>
          Then open The Ask above — it's the same for everyone.
        </span>
        <button
          className="cw-btn-ghost"
          onClick={() => onGenerate(lead.id)}
          style={{ padding: '4px 9px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}
        >
          <RotateCw size={11} />
          Rewrite
        </button>
      </div>
    </>
  )
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function Outreach() {
  const {
    leads, addLead, addLeadsBulk, regenerateLead, promoteLeadToWarm,
    advanceLeadStage, setLeadStage, setLeadTier, deleteLead,
  } = useApp()

  const [mode, setMode] = useState('bulk')
  const [text, setText] = useState('')
  const [tier, setTier] = useState(2)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(() => new Set())
  const [generating, setGenerating] = useState(() => new Set())

  async function handleAdd() {
    const raw = text.trim()
    if (!raw || busy) return
    setBusy(true)
    setNotice(null)
    const res = mode === 'bulk' ? await addLeadsBulk(raw) : await addLead(raw, tier)
    setBusy(false)
    if (!res.ok) {
      setNotice({ type: 'error', msg: res.error || 'Could not save that.' })
      return
    }
    setText('')
    if (mode === 'bulk') {
      setNotice({ type: 'ok', msg: `Imported ${res.count} ${res.count === 1 ? 'name' : 'names'}. Tag them below.` })
    } else if (res.error) {
      setNotice({ type: 'warn', msg: 'Saved, but the AI call failed. Open the row to retry.' })
    }
  }

  function onKeyDown(e) {
    // Single capture submits on Enter. Bulk needs newlines, so it doesn't.
    if (mode === 'single' && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAdd()
    }
  }

  async function runGenerate(id) {
    setGenerating(prev => new Set(prev).add(id))
    await regenerateLead(id)
    setGenerating(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  // Opening a warm row with nothing written yet is the trigger to generate.
  function toggleRow(lead) {
    const id = lead.id
    const isOpen = expanded.has(id)
    setExpanded(prev => { const n = new Set(prev); isOpen ? n.delete(id) : n.add(id); return n })
    if (isOpen) return
    const followups = Array.isArray(lead.generated_followups) ? lead.generated_followups : []
    const hasScripts = lead.generated_opener || followups.length || lead.generated_transition
    if (tierGeneratesScripts(lead.tier) && !hasScripts && !generating.has(id)) runGenerate(id)
  }

  const counts = useMemo(() => ({
    total: leads.length,
    untagged: leads.filter(l => isUntagged(l.tier)).length,
    contacted: leads.filter(l => l.stage !== 'not_contacted' && l.stage !== 'watching').length,
    referrals: leads.filter(l => l.stage === 'referred').length,
  }), [leads])

  const FILTERS = useMemo(() => ([
    { key: 'all', label: 'All', n: leads.length },
    { key: 'untagged', label: 'Untagged', n: counts.untagged },
    { key: 'not_contacted', label: 'To Reach Out', n: leads.filter(l => l.stage === 'not_contacted').length },
    { key: 'asked', label: 'Asked', n: leads.filter(l => l.stage === 'asked').length },
    { key: 'referred', label: 'Referred', n: leads.filter(l => l.stage === 'referred').length },
    { key: 'watching', label: 'Watching', n: leads.filter(l => l.stage === 'watching').length },
    { key: 'not_now', label: 'Not Now', n: leads.filter(l => l.stage === 'not_now').length },
  ]), [leads, counts])

  const filtered = useMemo(() => {
    if (filter === 'all') return leads
    if (filter === 'untagged') return leads.filter(l => isUntagged(l.tier))
    return leads.filter(l => l.stage === filter)
  }, [leads, filter])

  const activeTier = tierMeta(tier)

  return (
    <div>
      <div className="cw-banner cw-banner--content" style={{ padding: '26px 30px', marginBottom: 24 }}>
        <div className="cw-eyebrow">Outreach</div>
        <h1 className="cw-title" style={{ fontSize: 30, marginTop: 4 }}>Warm Outreach</h1>
        <div className="cw-sub" style={{ marginTop: 2 }}>Dump the names. Tag them. Work the list.</div>
      </div>

      {/* Counts */}
      <div className="cw-grid-3" style={{ marginBottom: 20, gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <div className="cw-card cw-stat" style={{ padding: '14px 18px' }}>
          <div className="cw-stat-value">{counts.total}</div>
          <div className="cw-stat-label">Total Leads</div>
        </div>
        <div className="cw-card cw-stat" style={{ padding: '14px 18px' }}>
          <div className="cw-stat-value" style={{ color: counts.untagged ? 'var(--warn)' : undefined }}>{counts.untagged}</div>
          <div className="cw-stat-label">Untagged</div>
        </div>
        <div className="cw-card cw-stat" style={{ padding: '14px 18px' }}>
          <div className="cw-stat-value">{counts.contacted}</div>
          <div className="cw-stat-label">Contacted</div>
        </div>
        <div className="cw-card cw-stat" style={{ padding: '14px 18px' }}>
          <div className="cw-stat-value" style={{ color: counts.referrals ? 'var(--ok)' : undefined }}>{counts.referrals}</div>
          <div className="cw-stat-label">Referrals</div>
        </div>
      </div>

      {/* Capture */}
      <div className="cw-card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {[{ k: 'bulk', l: 'Bulk list' }, { k: 'single', l: 'One person' }].map(m => {
            const on = mode === m.k
            return (
              <button
                key={m.k}
                onClick={() => { setMode(m.k); setNotice(null) }}
                className="cw-chip"
                style={{
                  cursor: 'pointer', fontSize: 12.5,
                  background: on ? 'var(--accent)' : undefined,
                  color: on ? 'var(--accent-ink)' : undefined,
                  borderColor: on ? 'transparent' : undefined,
                  fontWeight: on ? 650 : undefined,
                }}
              >
                {m.l}
              </button>
            )
          })}
        </div>

        {mode === 'single' && (
          <>
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
          </>
        )}

        {mode === 'bulk' && (
          <div style={{ fontSize: 12, color: 'var(--on-surface-3)', lineHeight: 1.5, marginBottom: 10 }}>
            Talk or paste through as many people as you want, however messy. They land untagged —
            you sort them in the table below. Nothing gets written yet.
          </div>
        )}

        <textarea
          className="cw-textarea"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={mode === 'bulk'
            ? 'john from the agency, marcus does gym content, my cousin sarah, dave rodriguez…'
            : "who and what's going on with them"}
          disabled={busy}
          style={{ marginBottom: 12, minHeight: mode === 'bulk' ? 120 : undefined }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="cw-btn-primary" onClick={handleAdd} disabled={busy}>
            {busy ? (mode === 'bulk' ? 'Reading the list…' : 'Saving…') : (mode === 'bulk' ? 'Import list' : 'Add')}
          </button>
          {notice && (
            <span style={{
              fontSize: 12.5,
              color: notice.type === 'error' ? 'var(--danger)' : notice.type === 'ok' ? 'var(--ok)' : 'var(--warn)',
            }}>
              {notice.msg}
            </span>
          )}
        </div>
      </div>

      <AskReference />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {FILTERS.map(f => {
          const on = filter === f.key
          return (
            <button
              key={f.key}
              className="cw-chip"
              onClick={() => setFilter(f.key)}
              style={{
                cursor: 'pointer', fontSize: 12.5, gap: 6,
                background: on ? 'var(--accent)' : undefined,
                color: on ? 'var(--accent-ink)' : undefined,
                borderColor: on ? 'transparent' : undefined,
                fontWeight: on ? 650 : undefined,
              }}
            >
              {f.label}
              <span style={{ opacity: on ? 0.7 : 0.55, fontWeight: 500 }}>{f.n}</span>
            </button>
          )
        })}
      </div>

      {/* Pipeline table */}
      {filtered.length === 0 ? (
        <div className="cw-card cw-empty">
          <div className="cw-empty-title">{leads.length === 0 ? 'No leads yet' : 'Nothing here'}</div>
          <div className="cw-empty-sub">
            {leads.length === 0
              ? 'Dump a list of names above. Tag them after.'
              : 'Try a different filter.'}
          </div>
        </div>
      ) : (
        <div className="cw-table-wrap">
          <table className="cw-table">
            <thead>
              <tr>
                <th style={{ width: 34 }}></th>
                <th>Contact</th>
                <th style={{ width: 130 }}>Tier</th>
                <th style={{ width: 110 }}>Platform</th>
                <th style={{ width: 175 }}>Stage</th>
                <th style={{ width: 44 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => {
                const open = expanded.has(lead.id)
                return (
                  <React.Fragment key={lead.id}>
                    <tr>
                      <td>
                        <button
                          onClick={() => toggleRow(lead)}
                          title="Show scripts"
                          style={{
                            background: 'transparent', border: 'none', cursor: 'pointer', padding: 4,
                            color: 'var(--on-surface-2)', display: 'flex', alignItems: 'center',
                          }}
                        >
                          {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() => toggleRow(lead)}
                          style={{
                            background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
                            textAlign: 'left', fontFamily: 'var(--font-sans)',
                          }}
                        >
                          <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--on-surface-1)' }}>{lead.name}</div>
                          {lead.context && (
                            <div style={{ fontSize: 12.5, color: 'var(--on-surface-3)', marginTop: 2, lineHeight: 1.45 }}>
                              {lead.context}
                            </div>
                          )}
                        </button>
                      </td>
                      <td><TierCell lead={lead} onSetTier={setLeadTier} /></td>
                      <td style={{ fontSize: 12.5, color: 'var(--on-surface-2)' }}>
                        {lead.platform ? platformLabel(lead.platform) : '—'}
                      </td>
                      <td><StageCell lead={lead} onAdvance={advanceLeadStage} onJump={setLeadStage} /></td>
                      <td>
                        <button
                          className="cw-btn-ghost"
                          onClick={() => deleteLead(lead.id)}
                          title="Delete lead"
                          style={{ padding: '4px 8px', fontSize: 12, color: 'var(--danger)' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                    {open && (
                      <tr>
                        <td colSpan={6} style={{ background: 'var(--surface-2)' }}>
                          <div style={{ padding: '14px 16px 16px' }}>
                            <ScriptsPanel
                              lead={lead}
                              generating={generating.has(lead.id)}
                              onGenerate={runGenerate}
                              onPromote={promoteLeadToWarm}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
