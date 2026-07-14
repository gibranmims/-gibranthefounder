import React, { useState } from 'react'
import { useApp } from '../lib/AppContext'

function formatIdeaDate(created_at) {
  if (!created_at) return ''
  const d = new Date(created_at)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Ideas() {
  const { ideas, addIdea, deleteIdea, promoteIdea } = useApp()
  const [text, setText] = useState('')

  async function handleAdd() {
    if (!text.trim()) return
    await addIdea(text.trim())
    setText('')
  }

  return (
    <div>
      <div className="cw-banner cw-banner--content" style={{ padding: '26px 30px', marginBottom: 24 }}>
        <div className="cw-eyebrow">Capture</div>
        <h1 className="cw-title" style={{ fontSize: 30, marginTop: 4 }}>Idea Bank</h1>
        <div className="cw-sub" style={{ marginTop: 2 }}>Nothing gets lost. Dump it here, promote it when it's ready to become a piece.</div>
      </div>

      <div style={{ maxWidth: 640 }}>
        <div className="cw-card" style={{ padding: 20, marginBottom: 20 }}>
          <div className="cw-label">New Idea</div>
          <textarea
            className="cw-textarea"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="What's on your mind? Anything goes..."
            style={{ marginBottom: 12 }}
          />
          <button className="cw-btn-primary" onClick={handleAdd}>Save to Bank</button>
        </div>

        {ideas.length === 0 ? (
          <div className="cw-card cw-empty">
            <div className="cw-empty-title">Idea bank is empty</div>
            <div className="cw-empty-sub">Drop anything here. A random thought. An observation. A spark.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ideas.map(idea => (
              <div key={idea.id} className="cw-card" style={{ padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 4, borderRadius: 2, alignSelf: 'stretch', minHeight: 40, background: 'var(--pink-300)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface-3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                    {formatIdeaDate(idea.created_at)}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.5, color: 'var(--on-surface-1)' }}>{idea.text}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                  <button className="cw-btn-ghost" style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => promoteIdea(idea.id)}>Promote</button>
                  <button className="cw-btn-danger" style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => deleteIdea(idea.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
