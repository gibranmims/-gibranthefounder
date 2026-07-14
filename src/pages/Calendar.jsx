import React, { useMemo } from 'react'
import { useApp } from '../lib/AppContext'
import { quadrantMeta, platformLabel } from '../lib/philosophy'

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

export default function Calendar() {
  const { contentPieces, gcalEmbedUrl } = useApp()

  const scheduled = useMemo(() => {
    const withDates = contentPieces.filter(c => c.scheduled_date && c.stage !== 'posted')
    const byDate = {}
    withDates.forEach(c => {
      byDate[c.scheduled_date] = byDate[c.scheduled_date] || []
      byDate[c.scheduled_date].push(c)
    })
    return Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b))
  }, [contentPieces])

  const isEmbed = gcalEmbedUrl && /calendar\.google\.com\/calendar\/embed/.test(gcalEmbedUrl)

  return (
    <div>
      <div className="cw-banner cw-banner--sprint" style={{ padding: '26px 30px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="cw-eyebrow">Calendar</div>
          <h1 className="cw-title" style={{ fontSize: 30, marginTop: 4 }}>What's Scheduled</h1>
          <div className="cw-sub" style={{ marginTop: 2 }}>Your real calendar stays authoritative.</div>
        </div>
        {gcalEmbedUrl && !isEmbed && (
          <a href={gcalEmbedUrl} target="_blank" rel="noreferrer" className="cw-btn-ghost">Open Google Calendar</a>
        )}
      </div>

      {scheduled.length === 0 ? (
        <div className="cw-card cw-empty" style={{ marginBottom: 20 }}>
          <div className="cw-empty-title">Nothing scheduled yet</div>
          <div className="cw-empty-sub">Set a scheduled date on a piece in Buckets and it'll show up here.</div>
        </div>
      ) : (
        <div style={{ maxWidth: 640, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {scheduled.map(([date, items]) => (
            <div key={date} className="cw-card" style={{ padding: 20 }}>
              <div className="cw-label">{formatDate(date)}</div>
              {items.map(piece => {
                const q = quadrantMeta(piece.quadrant)
                return (
                  <div key={piece.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderTop: '1px solid var(--stroke-1)' }}>
                    <span className="cw-badge" style={{ background: q.dim, color: q.color, flexShrink: 0 }}>{q.label}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--on-surface-1)' }}>{piece.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--on-surface-3)', marginTop: 2 }}>{platformLabel(piece.platform)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {isEmbed && (
        <div className="cw-card" style={{ padding: 0, overflow: 'hidden' }}>
          <iframe
            title="Google Calendar"
            src={gcalEmbedUrl}
            style={{ width: '100%', height: 600, border: 'none', display: 'block' }}
          />
        </div>
      )}

      {!gcalEmbedUrl && (
        <div style={{ fontSize: 13, color: 'var(--on-canvas-3)' }}>
          Add a Google Calendar link or embed URL in Settings to see it here.
        </div>
      )}
    </div>
  )
}
