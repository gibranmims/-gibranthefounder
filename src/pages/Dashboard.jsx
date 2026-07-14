import React, { useMemo } from 'react'
import { useApp } from '../lib/AppContext'
import { quadrantMeta, platformLabel } from '../lib/philosophy'

function getToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function Dashboard({ onNavigate }) {
  const { displayName, streakCount, contentPieces, ideas } = useApp()

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    return h < 12 ? 'Good morning,' : h < 17 ? 'Good afternoon,' : 'Good evening,'
  }, [])

  const dateLine = useMemo(() => {
    const D = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
    const M = ['January','February','March','April','May','June','July','August','September','October','November','December']
    const d = new Date()
    return `${D[d.getDay()]}, ${M[d.getMonth()]} ${d.getDate()}`
  }, [])

  const dueSoon = useMemo(() => {
    const today = getToday()
    const weekOut = new Date()
    weekOut.setDate(weekOut.getDate() + 7)
    const weekOutStr = `${weekOut.getFullYear()}-${String(weekOut.getMonth() + 1).padStart(2, '0')}-${String(weekOut.getDate()).padStart(2, '0')}`
    return contentPieces
      .filter(c => c.scheduled_date && c.stage !== 'posted' && c.scheduled_date >= today && c.scheduled_date <= weekOutStr)
      .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
  }, [contentPieces])

  const inPipeline = contentPieces.filter(c => c.stage !== 'posted').length

  return (
    <div>
      <div className="cw-banner cw-banner--brand" style={{ padding: '26px 30px', marginBottom: 28 }}>
        <div className="cw-eyebrow">Dashboard</div>
        <h1 className="cw-title" style={{ fontSize: 34, marginTop: 4 }}>{greeting} {displayName}.</h1>
        <div className="cw-sub" style={{ marginTop: 2 }}>{dateLine}</div>
        <div className="cw-stat" style={{ marginTop: 20, flexDirection: 'row', gap: 32 }}>
          <div>
            <div className="cw-stat-value">{streakCount}</div>
            <div className="cw-stat-label">Day Streak</div>
          </div>
          <div>
            <div className="cw-stat-value">{inPipeline}</div>
            <div className="cw-stat-label">In Pipeline</div>
          </div>
          <div>
            <div className="cw-stat-value">{ideas.length}</div>
            <div className="cw-stat-label">Ideas Waiting</div>
          </div>
        </div>
      </div>

      <div className="cw-card cw-hover" style={{ padding: 24, marginBottom: 24, cursor: 'pointer' }} onClick={() => onNavigate('vision')}>
        <div className="cw-eyebrow">North Star</div>
        <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.5, marginTop: 8, color: 'var(--on-surface-1)' }}>
          Content is the acquisition channel for a business — not the product. Build the Expert Brand first.
        </div>
        <div className="cw-btn-ghost" style={{ display: 'inline-flex', marginTop: 14, fontSize: 13 }}>Full framework</div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div className="cw-label" style={{ marginBottom: 12 }}>Due This Week</div>
        {dueSoon.length === 0 ? (
          <div className="cw-card cw-empty">
            <div className="cw-empty-title">Nothing scheduled this week</div>
            <div className="cw-empty-sub">Move a piece to "scheduled" in Buckets to see it here.</div>
          </div>
        ) : (
          <div className="cw-card" style={{ padding: 8 }}>
            {dueSoon.map(piece => {
              const q = quadrantMeta(piece.quadrant)
              return (
                <div key={piece.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px' }}>
                  <span className="cw-badge" style={{ background: q.dim, color: q.color, flexShrink: 0 }}>{q.label}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--on-surface-1)' }}>{piece.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--on-surface-3)', marginTop: 2 }}>
                      {platformLabel(piece.platform)} · {piece.scheduled_date}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="cw-grid-3">
        <div className="cw-card cw-hover" style={{ padding: 20, cursor: 'pointer' }} onClick={() => onNavigate('buckets')}>
          <div style={{ width: 32, height: 4, borderRadius: 2, background: 'var(--district-content)', marginBottom: 10 }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--on-surface-1)' }}>Content Buckets</div>
          <div style={{ fontSize: 13, color: 'var(--on-surface-3)', marginTop: 3 }}>Move pieces through the pipeline</div>
        </div>
        <div className="cw-card cw-hover" style={{ padding: 20, cursor: 'pointer' }} onClick={() => onNavigate('calendar')}>
          <div style={{ width: 32, height: 4, borderRadius: 2, background: 'var(--district-sprint)', marginBottom: 10 }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--on-surface-1)' }}>Calendar</div>
          <div style={{ fontSize: 13, color: 'var(--on-surface-3)', marginTop: 3 }}>What's scheduled</div>
        </div>
        <div className="cw-card cw-hover" style={{ padding: 20, cursor: 'pointer' }} onClick={() => onNavigate('ideas')}>
          <div style={{ width: 32, height: 4, borderRadius: 2, background: 'var(--pink-300)', marginBottom: 10 }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--on-surface-1)' }}>Idea Bank</div>
          <div style={{ fontSize: 13, color: 'var(--on-surface-3)', marginTop: 3 }}>Capture, then promote</div>
        </div>
      </div>
    </div>
  )
}
