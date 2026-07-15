import React, { useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { useApp } from '../lib/AppContext'
import ContentPieceModal from '../components/ContentPieceModal'
import ReadyToPostPanel from '../components/ReadyToPostPanel'
import { quadrantMeta } from '../lib/philosophy'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const WINDOW_SIZE = 5

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function Calendar() {
  const { contentPieces, channels } = useApp()
  const [dayOffset, setDayOffset] = useState(0) // shifts the 5-day window by WINDOW_SIZE each nav click
  const [modalState, setModalState] = useState(null) // { piece } | { initial } | null

  // Rolling window: always WINDOW_SIZE consecutive days starting from today + dayOffset —
  // not aligned to Monday, so opening the app mid-week starts the view right there.
  const weekDates = useMemo(() => {
    const anchor = new Date()
    anchor.setHours(0, 0, 0, 0)
    anchor.setDate(anchor.getDate() + dayOffset)
    return Array.from({ length: WINDOW_SIZE }, (_, i) => {
      const d = new Date(anchor)
      d.setDate(anchor.getDate() + i)
      return d
    })
  }, [dayOffset])

  const weekLabel = useMemo(() => {
    const start = weekDates[0], end = weekDates[WINDOW_SIZE - 1]
    const sameMonth = start.getMonth() === end.getMonth()
    return sameMonth
      ? `${MONTHS[start.getMonth()]} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`
      : `${MONTHS[start.getMonth()]} ${start.getDate()} – ${MONTHS[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`
  }, [weekDates])

  // Any date with at least one piece marked posted — drives the checkmark in each day header.
  const postedDates = useMemo(
    () => new Set(contentPieces.filter(c => c.stage === 'posted' && c.posted_date).map(c => c.posted_date)),
    [contentPieces]
  )

  function piecesFor(channelId, dateStr) {
    return contentPieces.filter(c => c.channel_id === channelId && c.scheduled_date === dateStr)
  }

  const todayStr = toDateStr(new Date())

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <h1 className="cw-title" style={{ fontSize: 26 }}>Calendar</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button className="cw-btn-ghost" style={{ padding: '6px 12px' }} onClick={() => setDayOffset(o => o - WINDOW_SIZE)}>←</button>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: 'var(--on-canvas-1)', whiteSpace: 'nowrap' }}>{weekLabel}</div>
          <button className="cw-btn-ghost" style={{ padding: '6px 12px' }} onClick={() => setDayOffset(o => o + WINDOW_SIZE)}>→</button>
          {dayOffset !== 0 && (
            <button className="cw-btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setDayOffset(0)}>Today</button>
          )}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `160px repeat(${WINDOW_SIZE}, minmax(160px, 1fr))`, gap: 8, minWidth: 860 }}>
          <div />
          {weekDates.map((d, i) => {
            const dateStr = toDateStr(d)
            const isToday = dateStr === todayStr
            const isPast = dateStr <= todayStr
            const posted = postedDates.has(dateStr)
            return (
              <div key={i} style={{ textAlign: 'center', paddingBottom: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--on-canvas-3)' }}>{DAY_LABELS[d.getDay()]}</div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, marginTop: 2,
                  color: isToday ? 'var(--accent-ink)' : 'var(--on-canvas-1)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 30, height: 30, borderRadius: '50%',
                  background: isToday ? 'var(--accent)' : 'transparent',
                }}>
                  {d.getDate()}
                </div>
                <div style={{ marginTop: 4, height: 16, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {posted ? (
                    <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--ok-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={11} strokeWidth={3} color="var(--ok)" />
                    </span>
                  ) : isPast ? (
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--stroke-2)' }} />
                  ) : null}
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
                  <div key={i} className="cw-card-flat" style={{ padding: 8, minHeight: 76, display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                      onClick={() => setModalState({ initial: { channel_id: channel.id, scheduled_date: dateStr, stage: 'ready_to_post' } })}
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

      <div style={{ marginTop: 24 }}>
        <ReadyToPostPanel onUseFile={file => setModalState({ initial: { ...file, stage: 'ready_to_post' } })} />
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
