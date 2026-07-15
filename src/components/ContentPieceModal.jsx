import React, { useEffect, useState } from 'react'
import { useApp } from '../lib/AppContext'
import { QUADRANTS, STAGES, EVAL_CRITERIA, formatScriptBeats } from '../lib/philosophy'

// Full-page editor for a content piece (Google-Docs-like room for the script).
// Pass `piece` to edit, or `initial` (partial field values, e.g. { channel_id,
// scheduled_date, doc_link }) to prefill a new one. scheduled_date / doc_link ride
// along invisibly when set via `initial` (Calendar's "+ Add" or Ready to Post) —
// no date/link field is shown here. Channel is optional — most pieces get assigned
// a channel later by being placed on a specific Calendar row/day.
export default function ContentPieceModal({ piece, initial, onClose }) {
  const isEdit = !!piece
  const { channels, addContentPiece, updateContentPiece, deleteContentPiece } = useApp()

  const [title, setTitle] = useState(piece?.title || initial?.title || '')
  const [script, setScript] = useState(formatScriptBeats(piece?.script || ''))
  const [quadrant, setQuadrant] = useState(piece?.quadrant || initial?.quadrant || QUADRANTS[0].key)
  const [channelId, setChannelId] = useState(piece?.channel_id || initial?.channel_id || '')
  const [stage, setStage] = useState(piece?.stage || initial?.stage || 'scripted')
  const [showScores, setShowScores] = useState(piece && EVAL_CRITERIA.some(c => piece[`score_${c.key}`]))
  const [scores, setScores] = useState(
    Object.fromEntries(EVAL_CRITERIA.map(c => [c.key, piece?.[`score_${c.key}`] || 0]))
  )

  // Carried through untouched — set by Calendar/Ready-to-Post, not editable here.
  const scheduledDate = piece?.scheduled_date ?? initial?.scheduled_date ?? null
  const docLink = piece?.doc_link ?? initial?.doc_link ?? ''

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSave() {
    if (!title.trim()) return
    const scoreUpdates = Object.fromEntries(EVAL_CRITERIA.map(c => [`score_${c.key}`, scores[c.key] || null]))
    const payload = {
      title: title.trim(),
      script: formatScriptBeats(script),
      quadrant,
      channel_id: channelId || null,
      stage,
      scheduled_date: scheduledDate,
      doc_link: docLink,
      ...scoreUpdates,
    }
    if (isEdit) await updateContentPiece(piece.id, payload)
    else await addContentPiece(payload)
    onClose()
  }

  async function handleDelete() {
    if (!isEdit) return
    await deleteContentPiece(piece.id)
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000, background: 'var(--surface-solid)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px', borderBottom: '1px solid var(--stroke-1)', flexShrink: 0,
      }}>
        <button className="cw-btn-ghost" onClick={onClose}>← Cancel</button>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: 'var(--on-surface-1)' }}>
          {isEdit ? 'Edit Content Piece' : 'New Content Piece'}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isEdit && <button className="cw-btn-danger" onClick={handleDelete}>Delete</button>}
          <button className="cw-btn-primary" onClick={handleSave}>{isEdit ? 'Save' : 'Add'}</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px 80px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <input
            className="cw-input"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
            placeholder="Title / hook..."
            style={{ fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 700, padding: '14px 16px', marginBottom: 20 }}
          />

          <textarea
            className="cw-textarea"
            value={script}
            onChange={e => setScript(e.target.value)}
            onBlur={() => setScript(formatScriptBeats(script))}
            placeholder="One beat per line — we'll space it out for delivery. Leave blank to just save the idea."
            style={{ minHeight: '52vh', fontSize: 16, lineHeight: 1.8, padding: 20, marginBottom: 20 }}
          />

          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label className="cw-label">Pillar</label>
              <select className="cw-select" value={quadrant} onChange={e => setQuadrant(e.target.value)}>
                {QUADRANTS.map(q => <option key={q.key} value={q.key}>{q.label}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className="cw-label">Channel (optional — set on Calendar too)</label>
              <select className="cw-select" value={channelId} onChange={e => setChannelId(e.target.value)}>
                <option value="">Not assigned yet</option>
                {channels.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="cw-label">Stage</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {STAGES.map(s => (
                <button
                  key={s.key}
                  type="button"
                  className="cw-chip"
                  onClick={() => setStage(s.key)}
                  style={stage === s.key ? { background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none' } : undefined}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {!showScores ? (
            <button type="button" className="cw-btn-ghost" onClick={() => setShowScores(true)} style={{ marginBottom: 14 }}>
              + Score against the Evaluation Framework
            </button>
          ) : (
            <div style={{ marginBottom: 14 }}>
              <label className="cw-label">Evaluation Framework (1–5, optional)</label>
              {EVAL_CRITERIA.map(c => (
                <div key={c.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: 'var(--on-surface-2)', fontWeight: 500 }}>{c.label}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setScores(prev => ({ ...prev, [c.key]: prev[c.key] === n ? 0 : n }))}
                        style={{
                          width: 26, height: 26, padding: 0, borderRadius: 6, border: 'none', cursor: 'pointer',
                          fontSize: 11, fontWeight: 700,
                          background: scores[c.key] >= n ? 'var(--accent)' : 'var(--surface-2)',
                          color: scores[c.key] >= n ? 'var(--accent-ink)' : 'var(--on-surface-3)',
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
