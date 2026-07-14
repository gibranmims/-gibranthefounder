import React, { useMemo, useState } from 'react'
import { useApp } from '../lib/AppContext'
import ContentPieceModal from '../components/ContentPieceModal'
import ReadyToPostPanel from '../components/ReadyToPostPanel'
import { quadrantMeta } from '../lib/philosophy'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export default function Calendar() {
  const { displayName, contentPieces, channels, streakCount } = useApp()
  const [weekOffset, setWeekOffset] = useState(0)
  const [modalState, setModalState] = useState(null) // { piece } | { initial } | null

  const weekDates = useMemo(() => {
    const monday = getMonday(new Date())
    monday.setDate(monday.getDate() + weekOffset * 7)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return d
    })
  }, [weekOffset])

  const weekLabel = useMemo(() => {
    const start = weekDates[0], end = weekDates[6]
    const sameMonth = start.getMonth() === end.getMonth()
    return sameMonth
      ? `${MONTHS[start.getMonth()]} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`
      : `${MONTHS[start.getMonth()]} ${start.getDate()} – ${MONTHS[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`
  }, [weekDates])

  // Days (last 7, ending today) that had at least one piece marked posted — the daily-post goal tracker.
  const daysPostedThisWeek = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      return toDateStr(d)
    })
    const postedDates = new Set(contentPieces.filter(c => c.stage === 'posted' && c.posted_date).map(c => c.posted_date))
    return last7.filter(d => postedDates.has(d)).length
  }, [contentPieces])

  function piecesFor(channelId, dateStr) {
    return contentPieces.filter(c => c.channel_id === channelId && c.scheduled_date === dateStr)
  }

  const todayStr = toDateStr(new Date())
  const greeting = useMemo(() => {
    const h = new Date().getHours()
    return h < 12 ? 'Good morning,' : h < 17 ? 'Good afternoon,' : 'Good evening,'
  }, [])

  return (
    <div>
      <div className="cw-banner cw-banner--sprint" style={{ padding: '26px 30px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="cw-eyebrow">{greeting} {displayName}</div>
            <h1 className="cw-title" style={{ fontSize: 30, marginTop: 4 }}>Calendar</h1>
            <div className="cw-sub" style={{ marginTop: 2 }}>Plan and track every post, by channel, by day.</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button className="cw-btn-ghost" style={{ padding: '6px 12px' }} onClick={() => setWeekOffset(w => w - 1)}>←</button>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: 'var(--on-canvas-1)', whiteSpace: 'nowrap' }}>{weekLabel}</div>
            <button className="cw-btn-ghost" style={{ padding: '6px 12px' }} onClick={() => setWeekOffset(w => w + 1)}>→</button>
            {weekOffset !== 0 && (
              <button className="cw-btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setWeekOffset(0)}>Today</button>
            )}
          </div>
        </div>

        <div className="cw-stat" style={{ marginTop: 20, flexDirection: 'row', gap: 32 }}>
          <div>
            <div className="cw-stat-value">{streakCount}</div>
            <div className="cw-stat-label">Day Streak</div>
          </div>
          <div>
            <div className="cw-stat-value">{daysPostedThisWeek}/7</div>
            <div className="cw-stat-label">Days Posted, Last 7</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '160px repeat(7, minmax(140px, 1fr))', gap: 8, minWidth: 940 }}>
            <div />
            {weekDates.map((d, i) => {
              const isToday = toDateStr(d) === todayStr
              return (
                <div key={i} style={{ textAlign: 'center', paddingBottom: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--on-canvas-3)' }}>{DAY_LABELS[i]}</div>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, marginTop: 2,
                    color: isToday ? 'var(--accent-ink)' : 'var(--on-canvas-1)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 30, height: 30, borderRadius: '50%',
                    background: isToday ? 'var(--accent)' : 'transparent',
                  }}>
                    {d.getDate()}
                  </div>
                </div>
              )
            })}

            {channels.map(channel => (
              <React.Fragment key={channel.id}>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 700, color: 'var(--on-canvas-2)' }}>
                  {channel.label}
                </div>
                {weekDates.map((d, i) => {
                  const dateStr = toDateStr(d)
                  const items = piecesFor(channel.id, dateStr)
                  return (
                    <div key={i} className="cw-card-flat" style={{ padding: 8, minHeight: 100, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {items.map(piece => {
                        const q = quadrantMeta(piece.quadrant)
                        return (
                          <div
                            key={piece.id}
                            onClick={() => setModalState({ piece })}
                            className="cw-hover"
                            style={{
                              cursor: 'pointer', borderRadius: 8, padding: '6px 8px', position: 'relative', overflow: 'hidden',
                              background: 'var(--surface-1)', border: '1px solid var(--stroke-1)',
                            }}
                          >
                            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: q.color }} />
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface-1)', paddingLeft: 6, lineHeight: 1.3 }}>
                              {piece.title}
                            </div>
                          </div>
                        )
                      })}
                      <button
                        className="cw-btn-ghost"
                        style={{ fontSize: 11, padding: '5px 8px', marginTop: 'auto' }}
                        onClick={() => setModalState({ initial: { channel_id: channel.id, scheduled_date: dateStr, stage: 'scheduled' } })}
                      >
                        + Add
                      </button>
                    </div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        <ReadyToPostPanel onUseFile={file => setModalState({ initial: { ...file, stage: 'scheduled' } })} />
      </div>

      {modalState && (
        <ContentPieceModal
          piece={modalState.piece}
          initial={modalState.initial}
          onClose={() => setModalState(null)}
        />
      )}
    </div>
  )
}
