import React, { useState } from 'react'
import { useApp } from '../lib/AppContext'

export default function Sprint() {
  const { sprintItems, addSprintItem, toggleSprintItem, deleteSprintItem, clearDoneSprintItems } = useApp()
  const [text, setText] = useState('')

  const doneCount = sprintItems.filter(i => i.done).length

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

      <div style={{ maxWidth: 640 }}>
        <div className="cw-card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="cw-input"
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
              placeholder="What are you recording next?"
              autoFocus
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

            <div className="cw-card" style={{ padding: 8 }}>
              {sprintItems.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 10px' }}>
                  <button
                    onClick={() => toggleSprintItem(item.id)}
                    aria-label={item.done ? 'Mark not recorded' : 'Mark recorded'}
                    style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                      border: item.done ? 'none' : '2px solid var(--stroke-2)',
                      background: item.done ? 'var(--ok)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {item.done && <span style={{ color: 'var(--surface-solid)', fontSize: 12, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                  </button>
                  <div style={{
                    flex: 1, fontSize: 15, fontWeight: 500,
                    color: item.done ? 'var(--on-surface-3)' : 'var(--on-surface-1)',
                    textDecoration: item.done ? 'line-through' : 'none',
                  }}>
                    {item.text}
                  </div>
                  <button
                    onClick={() => deleteSprintItem(item.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-3)', fontSize: 18, lineHeight: 1, flexShrink: 0 }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
