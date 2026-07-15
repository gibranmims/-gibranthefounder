import React, { useState } from 'react'
import { useApp } from '../lib/AppContext'
import ContentPieceModal from '../components/ContentPieceModal'
import { QUADRANTS, quadrantMeta, STAGES } from '../lib/philosophy'

export default function Buckets() {
  const { contentPieces, channels, moveStage } = useApp()

  function channelLabel(id) {
    return channels.find(c => c.id === id)?.label || 'No channel'
  }
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
          <div className="cw-sub" style={{ marginTop: 2 }}>Every piece maps to one of the Four Content Pillars. Move it through the pipeline.</div>
        </div>
        <button className="cw-btn-primary" onClick={() => setNewOpen(true)}>+ New Piece</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <button
          className="cw-chip"
          onClick={() => setQuadrantFilter('all')}
          style={quadrantFilter === 'all' ? { background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none' } : undefined}
        >
          All Pillars
        </button>
      </div>

      <div className="cw-grid-3" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', marginBottom: 22 }}>
        {QUADRANTS.map(q => {
          const active = quadrantFilter === q.key
          return (
            <button
              key={q.key}
              onClick={() => setQuadrantFilter(active ? 'all' : q.key)}
              className="cw-card cw-hover"
              style={{
                width: '100%', padding: '14px 16px', textAlign: 'left', cursor: 'pointer', position: 'relative', overflow: 'hidden',
                fontFamily: 'inherit', appearance: 'none',
                border: active ? `1.5px solid ${q.color}` : '1px solid var(--stroke-1)',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: q.color }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--on-surface-1)', paddingLeft: 6 }}>{q.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: q.color, marginTop: 4, paddingLeft: 6 }}>{q.question}</div>
            </button>
          )
        })}
      </div>

      <div className="cw-grid-3" style={{ gridTemplateColumns: `repeat(${STAGES.length}, minmax(0, 1fr))` }}>
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
                      <span className="cw-badge cw-badge-neutral">{channelLabel(piece.channel_id)}</span>
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

      {newOpen && <ContentPieceModal onClose={() => setNewOpen(false)} />}
      {editing && <ContentPieceModal piece={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
