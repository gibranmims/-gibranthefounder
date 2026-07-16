import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useApp } from '../lib/AppContext'
import ContentPieceModal from '../components/ContentPieceModal'
import { QUADRANTS, STAGES, stageMeta, quadrantMeta } from '../lib/philosophy'

export default function Buckets() {
  const { contentPieces, channels, updateContentPiece } = useApp()
  const [newInitial, setNewInitial] = useState(null) // {quadrant} | null — controls the "+ New Piece" modal
  const [editing, setEditing] = useState(null)

  function channelLabel(id) {
    return channels.find(c => c.id === id)?.label || null
  }

  async function handleDragEnd(result) {
    const { destination, draggableId } = result
    if (!destination) return
    const newQuadrant = destination.droppableId
    const piece = contentPieces.find(p => p.id === draggableId)
    if (!piece || piece.quadrant === newQuadrant) return
    await updateContentPiece(piece.id, { quadrant: newQuadrant })
  }

  // Recorded but not yet cut — cross-pillar, lives outside the four buckets.
  const editsNeeded = contentPieces.filter(p => p.stage === 'filmed')

  return (
    <div>
      <div className="cw-banner cw-banner--content" style={{ padding: '26px 30px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="cw-eyebrow">Content Buckets</div>
          <h1 className="cw-title" style={{ fontSize: 30, marginTop: 4 }}>Buckets</h1>
          <div className="cw-sub" style={{ marginTop: 2 }}>Fresh ideas, ready to record — sorted into their pillar. Drag a piece into the right bucket.</div>
        </div>
        <button className="cw-btn-primary" onClick={() => setNewInitial({})}>+ New Piece</button>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="cw-grid-3" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', alignItems: 'start', flex: 1, minWidth: 0 }}>
          {QUADRANTS.map(q => {
            const items = contentPieces
              .filter(c => c.quadrant === q.key)
              .sort((a, b) => STAGES.findIndex(s => s.key === a.stage) - STAGES.findIndex(s => s.key === b.stage))
            return (
              <Droppable droppableId={q.key} key={q.key}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="cw-card-flat"
                    style={{
                      padding: 12, minHeight: 200,
                      border: snapshot.isDraggingOver ? `1.5px solid ${q.color}` : undefined,
                    }}
                  >
                    <div style={{ position: 'relative', paddingLeft: 10, marginBottom: 12 }}>
                      <div style={{ position: 'absolute', top: 2, left: 0, bottom: 2, width: 3, borderRadius: 2, background: q.color }} />
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--on-surface-1)' }}>{q.emoji} {q.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: q.color, marginTop: 2 }}>{q.question}</div>
                    </div>

                    {items.map((piece, index) => {
                      const chLabel = channelLabel(piece.channel_id)
                      const sm = stageMeta(piece.stage)
                      return (
                        <Draggable draggableId={piece.id} index={index} key={piece.id}>
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              onClick={() => setEditing(piece)}
                              className="cw-card"
                              style={{
                                padding: 12, marginBottom: 10, cursor: 'pointer',
                                opacity: dragSnapshot.isDragging ? 0.85 : 1,
                                ...dragProvided.draggableProps.style,
                              }}
                            >
                              <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, marginBottom: 8, color: 'var(--on-surface-1)' }}>
                                {piece.title}
                              </div>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                <span className="cw-badge" style={{ background: sm.dim, color: sm.color }}>{sm.label}</span>
                                {chLabel && <span className="cw-badge cw-badge-info">{chLabel}</span>}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      )
                    })}
                    {provided.placeholder}

                    <button
                      className="cw-btn-ghost"
                      style={{ width: '100%', fontSize: 12, padding: '6px 10px', marginTop: 4 }}
                      onClick={() => setNewInitial({ quadrant: q.key })}
                    >
                      + Add to {q.label}
                    </button>
                  </div>
                )}
              </Droppable>
            )
          })}
        </div>
      </DragDropContext>

      <div className="cw-card" style={{ padding: 18, width: 260, flexShrink: 0 }}>
        <div className="cw-label" style={{ marginBottom: 4 }}>Edits Needed</div>
        <div style={{ fontSize: 12, color: 'var(--on-surface-3)', marginBottom: 14 }}>Filmed, not cut yet</div>
        {editsNeeded.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--on-surface-3)' }}>Nothing waiting on edits.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {editsNeeded.map(piece => {
              const q = quadrantMeta(piece.quadrant)
              return (
                <div
                  key={piece.id}
                  onClick={() => setEditing(piece)}
                  className="cw-card-flat"
                  style={{ padding: 10, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: q.color }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface-1)', paddingLeft: 6, lineHeight: 1.35 }}>
                    {piece.title}
                  </div>
                  <div style={{ fontSize: 11, color: q.color, paddingLeft: 6, marginTop: 4 }}>{q.emoji} {q.label}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      </div>

      {newInitial && <ContentPieceModal initial={newInitial} onClose={() => setNewInitial(null)} />}
      {editing && <ContentPieceModal piece={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
