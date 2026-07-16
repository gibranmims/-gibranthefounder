import React, { useMemo, useState } from 'react'
import { useApp } from '../lib/AppContext'
import { FILMING_STYLES } from '../lib/philosophy'

export default function Sprint() {
  const {
    sprintItems, addSprintItem, addSprintItemFromPiece, updateSprintItem, toggleSprintItem, deleteSprintItem, clearDoneSprintItems,
    contentPieces,
  } = useApp()
  const [text, setText] = useState('')

  const doneCount = sprintItems.filter(i => i.done).length

  const queuedPieceIds = useMemo(() => new Set(sprintItems.map(i => i.content_piece_id).filter(Boolean)), [sprintItems])
  const readyToQueue = useMemo(
    () => contentPieces.filter(p => p.stage === 'scripted' && !queuedPieceIds.has(p.id)),
    [contentPieces, queuedPieceIds]
  )

  async function handleAdd() {
    if (!text.trim()) return
    await addSprintItem(text.trim())
    setText('')
  }

  return (
    <div>
      <div className="cw-banner cw-banner--sprint" style={{ padding: '26px 30px', marginBottom: 24 }}>
        <div className="cw-eyebrow">Recording Lineup</div>
        <h1 className="cw-title" style={{ fontSize: 30, marginTop: 4 }}>Recording Lineup</h1>
        <div className="cw-sub" style={{ marginTop: 2 }}>The shit you're about to record. Add it, knock it out, check it off.</div>
      </div>

      <div style={{ maxWidth: 760 }}>
        {readyToQueue.length > 0 && (
          <div className="cw-card" style={{ padding: 20, marginBottom: 20 }}>
            <div className="cw-label">Scripted & Ready ({readyToQueue.length})</div>
            <div style={{ fontSize: 13, color: 'var(--on-surface-3)', marginBottom: 14 }}>
              Already scripted in Buckets — queue it up without retyping.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {readyToQueue.map(piece => (
                <div key={piece.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--on-surface-1)' }}>{piece.title}</div>
                  <button className="cw-btn-ghost" style={{ padding: '5px 12px', fontSize: 12, flexShrink: 0 }} onClick={() => addSprintItemFromPiece(piece)}>
                    + Add to Lineup
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="cw-card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="cw-input"
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
              placeholder="Or type something new..."
            />
            <button className="cw-btn-primary" onClick={handleAdd} style={{ flexShrink: 0 }}>+ Add</button>
          </div>
        </div>

        {sprintItems.length === 0 ? (
          <div className="cw-card cw-empty">
            <div className="cw-empty-title">Nothing lined up yet</div>
            <div className="cw-empty-sub">Add everything you're planning to record next — no scoring, no pillars, just the lineup.</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-canvas-2)' }}>
                {doneCount} of {sprintItems.length} recorded
              </div>
              {doneCount > 0 && (
                <button className="cw-btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }} onClick={clearDoneSprintItems}>
                  Clear Recorded
                </button>
              )}
            </div>

            <div className="cw-table-wrap">
              <table className="cw-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Video</th>
                    <th style={{ width: 180 }}>Filming Style</th>
                    <th style={{ width: 36 }} />
                  </tr>
                </thead>
                <tbody>
                  {sprintItems.map((item, i) => (
                    <tr key={item.id}>
                      <td style={{ color: 'var(--on-surface-3)' }}>{i + 1}</td>
                      <td>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={item.done}
                            onChange={() => toggleSprintItem(item.id)}
                            style={{ width: 18, height: 18, accentColor: 'var(--accent)', flexShrink: 0 }}
                          />
                          <span style={{
                            color: item.done ? 'var(--on-surface-3)' : 'var(--on-surface-1)',
                            textDecoration: item.done ? 'line-through' : 'none',
                          }}>
                            {item.text}
                          </span>
                        </label>
                      </td>
                      <td>
                        <select
                          className="cw-select"
                          value={item.filming_style || ''}
                          onChange={e => updateSprintItem(item.id, { filming_style: e.target.value || null })}
                        >
                          <option value="">—</option>
                          {FILMING_STYLES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                        </select>
                      </td>
                      <td>
                        <button
                          onClick={() => deleteSprintItem(item.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-3)', fontSize: 18, lineHeight: 1 }}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
