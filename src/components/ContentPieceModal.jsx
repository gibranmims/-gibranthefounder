import React, { useState } from 'react'
import { useApp } from '../lib/AppContext'
import Modal from './Modal'
import { QUADRANTS, STAGES, EVAL_CRITERIA } from '../lib/philosophy'

// Shared add/edit modal for a content piece. Pass `piece` to edit, or `initial`
// (partial field values, e.g. { channel_id, scheduled_date }) to prefill a new one.
export default function ContentPieceModal({ piece, initial, onClose }) {
  const isEdit = !!piece
  const { channels, addContentPiece, updateContentPiece, deleteContentPiece } = useApp()

  const [title, setTitle] = useState(piece?.title || initial?.title || '')
  const [quadrant, setQuadrant] = useState(piece?.quadrant || initial?.quadrant || QUADRANTS[0].key)
  const [channelId, setChannelId] = useState(piece?.channel_id || initial?.channel_id || channels[0]?.id || '')
  const [stage, setStage] = useState(piece?.stage || initial?.stage || 'idea')
  const [scheduledDate, setScheduledDate] = useState(piece?.scheduled_date || initial?.scheduled_date || '')
  const [script, setScript] = useState(piece?.script || '')
  const [notes, setNotes] = useState(piece?.notes || '')
  const [docLink, setDocLink] = useState(piece?.doc_link || initial?.doc_link || '')
  const [showScores, setShowScores] = useState(piece && EVAL_CRITERIA.some(c => piece[`score_${c.key}`]))
  const [scores, setScores] = useState(
    Object.fromEntries(EVAL_CRITERIA.map(c => [c.key, piece?.[`score_${c.key}`] || 0]))
  )

  async function handleSave() {
    if (!title.trim()) return
    const scoreUpdates = Object.fromEntries(EVAL_CRITERIA.map(c => [`score_${c.key}`, scores[c.key] || null]))
    const payload = {
      title: title.trim(),
      quadrant,
      channel_id: channelId || null,
      stage,
      scheduled_date: scheduledDate || null,
      script,
      notes,
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
    <Modal open onClose={onClose} title={isEdit ? 'Edit Content Piece' : 'New Content Piece'}>
      <div style={{ marginBottom: 14 }}>
        <label className="cw-label">Title / Hook</label>
        <input className="cw-input" type="text" value={title} onChange={e => setTitle(e.target.value)} autoFocus placeholder="What's the piece about?" />
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label className="cw-label">Pillar</label>
          <select className="cw-select" value={quadrant} onChange={e => setQuadrant(e.target.value)}>
            {QUADRANTS.map(q => <option key={q.key} value={q.key}>{q.label}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label className="cw-label">Channel</label>
          <select className="cw-select" value={channelId} onChange={e => setChannelId(e.target.value)}>
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

      <div style={{ marginBottom: 14 }}>
        <label className="cw-label">Scheduled Date</label>
        <input className="cw-input" type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label className="cw-label">Script</label>
        <textarea className="cw-textarea" value={script} onChange={e => setScript(e.target.value)} placeholder="Type or paste the full script here..." />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label className="cw-label">Notes</label>
        <textarea className="cw-textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Angle, talking points, references..." />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label className="cw-label">Doc / Drive Link</label>
        <input className="cw-input" type="text" value={docLink} onChange={e => setDocLink(e.target.value)} placeholder="Paste a Google Doc or Drive link" />
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

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 22 }}>
        {isEdit && <button className="cw-btn-danger" onClick={handleDelete} style={{ marginRight: 'auto' }}>Delete</button>}
        <button className="cw-btn-ghost" onClick={onClose}>Cancel</button>
        <button className="cw-btn-primary" onClick={handleSave}>{isEdit ? 'Save' : 'Add'}</button>
      </div>
    </Modal>
  )
}
