import React, { useState } from 'react'
import { useApp } from '../lib/AppContext'
import Modal from '../components/Modal'
import { QUADRANTS, quadrantMeta, PLATFORMS, platformLabel, STAGES, EVAL_CRITERIA } from '../lib/philosophy'

function EditPieceModal({ piece, onClose }) {
  const { updateContentPiece, deleteContentPiece } = useApp()
  const [title, setTitle] = useState(piece.title)
  const [quadrant, setQuadrant] = useState(piece.quadrant)
  const [platform, setPlatform] = useState(piece.platform)
  const [scheduledDate, setScheduledDate] = useState(piece.scheduled_date || '')
  const [notes, setNotes] = useState(piece.notes || '')
  const [docLink, setDocLink] = useState(piece.doc_link || '')
  const [showScores, setShowScores] = useState(EVAL_CRITERIA.some(c => piece[`score_${c.key}`]))
  const [scores, setScores] = useState(
    Object.fromEntries(EVAL_CRITERIA.map(c => [c.key, piece[`score_${c.key}`] || 0]))
  )

  async function handleSave() {
    if (!title.trim()) return
    const scoreUpdates = Object.fromEntries(EVAL_CRITERIA.map(c => [`score_${c.key}`, scores[c.key] || null]))
    await updateContentPiece(piece.id, {
      title: title.trim(),
      quadrant,
      platform,
      scheduled_date: scheduledDate || null,
      notes,
      doc_link: docLink,
      ...scoreUpdates,
    })
    onClose()
  }

  async function handleDelete() {
    await deleteContentPiece(piece.id)
    onClose()
  }

  return (
    <Modal open onClose={onClose} title="Edit Content Piece">
      <div style={{ marginBottom: 14 }}>
        <label className="cw-label">Title / Hook</label>
        <input className="cw-input" type="text" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label className="cw-label">Quadrant</label>
          <select className="cw-select" value={quadrant} onChange={e => setQuadrant(e.target.value)}>
            {QUADRANTS.map(q => <option key={q.key} value={q.key}>{q.label}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label className="cw-label">Platform</label>
          <select className="cw-select" value={platform} onChange={e => setPlatform(e.target.value)}>
            {PLATFORMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label className="cw-label">Scheduled Date</label>
        <input className="cw-input" type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label className="cw-label">Notes</label>
        <textarea className="cw-textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Angle, talking points, script draft..." />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label className="cw-label">Doc / Drive Link</label>
        <input className="cw-input" type="text" value={docLink} onChange={e => setDocLink(e.target.value)} placeholder="Paste a Google Doc or Drive link" />
      </div>

      {!showScores ? (
        <button className="cw-btn-ghost" onClick={() => setShowScores(true)} style={{ marginBottom: 14 }}>
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
        <button className="cw-btn-danger" onClick={handleDelete} style={{ marginRight: 'auto' }}>Delete</button>
        <button className="cw-btn-ghost" onClick={onClose}>Cancel</button>
        <button className="cw-btn-primary" onClick={handleSave}>Save</button>
      </div>
    </Modal>
  )
}

function NewPieceModal({ open, onClose }) {
  const { addContentPiece } = useApp()
  const [title, setTitle] = useState('')
  const [quadrant, setQuadrant] = useState(QUADRANTS[0].key)
  const [platform, setPlatform] = useState(PLATFORMS[0].key)

  async function handleAdd() {
    if (!title.trim()) return
    await addContentPiece({ title: title.trim(), quadrant, platform, stage: 'idea' })
    setTitle('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="New Content Piece">
      <div style={{ marginBottom: 14 }}>
        <label className="cw-label">Title / Hook</label>
        <input className="cw-input" type="text" value={title} onChange={e => setTitle(e.target.value)} autoFocus placeholder="What's the piece about?" />
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label className="cw-label">Quadrant</label>
          <select className="cw-select" value={quadrant} onChange={e => setQuadrant(e.target.value)}>
            {QUADRANTS.map(q => <option key={q.key} value={q.key}>{q.label}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label className="cw-label">Platform</label>
          <select className="cw-select" value={platform} onChange={e => setPlatform(e.target.value)}>
            {PLATFORMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 22 }}>
        <button className="cw-btn-ghost" onClick={onClose}>Cancel</button>
        <button className="cw-btn-primary" onClick={handleAdd}>Add to Buckets</button>
      </div>
    </Modal>
  )
}

export default function Buckets() {
  const { contentPieces, moveStage } = useApp()
  const [quadrantFilter, setQuadrantFilter] = useState('all')
  const [newOpen, setNewOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const filtered = quadrantFilter === 'all'
    ? contentPieces
    : contentPieces.filter(c => c.quadrant === quadrantFilter)

  function stageNeighbors(stage) {
    const i = STAGES.findIndex(s => s.key === stage)
    return { prev: STAGES[i - 1]?.key, next: STAGES[i + 1]?.key }
  }

  return (
    <div>
      <div className="cw-banner cw-banner--content" style={{ padding: '26px 30px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="cw-eyebrow">Content Buckets</div>
          <h1 className="cw-title" style={{ fontSize: 30, marginTop: 4 }}>Buckets</h1>
          <div className="cw-sub" style={{ marginTop: 2 }}>Every piece maps to one of the Four Quadrants. Move it through the pipeline.</div>
        </div>
        <button className="cw-btn-primary" onClick={() => setNewOpen(true)}>+ New Piece</button>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 22 }}>
        <button
          className="cw-chip"
          onClick={() => setQuadrantFilter('all')}
          style={quadrantFilter === 'all' ? { background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none' } : undefined}
        >
          All
        </button>
        {QUADRANTS.map(q => (
          <button
            key={q.key}
            className="cw-chip"
            onClick={() => setQuadrantFilter(q.key)}
            style={quadrantFilter === q.key ? { background: q.color, color: 'var(--accent-ink)', border: 'none' } : undefined}
          >
            {q.label}
          </button>
        ))}
      </div>

      <div className="cw-grid-3" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        {STAGES.map(stage => {
          const items = filtered.filter(c => c.stage === stage.key)
          const { prev, next } = stageNeighbors(stage.key)
          return (
            <div key={stage.key} className="cw-card-flat" style={{ padding: 12, minHeight: 120 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '0 4px' }}>
                <span className="cw-label" style={{ marginBottom: 0 }}>{stage.label}</span>
                <span style={{ fontSize: 11, color: 'var(--on-surface-3)', fontWeight: 700 }}>{items.length}</span>
              </div>
              {items.map(piece => {
                const q = quadrantMeta(piece.quadrant)
                return (
                  <div key={piece.id} className="cw-card" style={{ padding: 12, marginBottom: 10, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: q.color }} />
                    <div onClick={() => setEditing(piece)} style={{ cursor: 'pointer', fontSize: 14, fontWeight: 600, lineHeight: 1.4, marginBottom: 8, paddingLeft: 6, color: 'var(--on-surface-1)' }}>
                      {piece.title}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingLeft: 6, marginBottom: 10 }}>
                      <span className="cw-badge cw-badge-neutral">{platformLabel(piece.platform)}</span>
                      {piece.scheduled_date && <span className="cw-badge cw-badge-info">{piece.scheduled_date}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 6, paddingLeft: 6, flexWrap: 'wrap' }}>
                      {prev && <button className="cw-btn-ghost" style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => moveStage(piece.id, prev)}>← {STAGES.find(s => s.key === prev).label}</button>}
                      {next && <button className="cw-btn-primary" style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => moveStage(piece.id, next)}>{STAGES.find(s => s.key === next).label} →</button>}
                    </div>
                  </div>
                )
              })}
              {items.length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--on-surface-3)', textAlign: 'center', padding: '12px 0' }}>Empty</div>
              )}
            </div>
          )
        })}
      </div>

      <NewPieceModal open={newOpen} onClose={() => setNewOpen(false)} />
      {editing && <EditPieceModal piece={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
