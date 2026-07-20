import React, { useMemo } from 'react'
import { Check } from 'lucide-react'
import { useApp } from '../lib/AppContext'

const TOTAL_DAYS = 100

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function Challenge() {
  const { challengeStartDate, challengeCheckins, toggleChallengeCheckin } = useApp()

  const todayStr = toDateStr(new Date())

  const days = useMemo(() => {
    if (!challengeStartDate) return []
    const start = new Date(challengeStartDate + 'T00:00:00')
    return Array.from({ length: TOTAL_DAYS }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const dateStr = toDateStr(d)
      return {
        dateStr,
        dayNum: i + 1,
        checked: challengeCheckins.has(dateStr),
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
        isFuture: dateStr > todayStr,
      }
    })
  }, [challengeStartDate, challengeCheckins, todayStr])

  const checkedCount = days.filter(d => d.checked).length
  const currentDay = days.findIndex(d => d.isToday) + 1 || Math.min(TOTAL_DAYS, days.filter(d => !d.isFuture).length)
  const missedCount = days.filter(d => d.isPast && !d.checked).length

  return (
    <div>
      <div className="cw-banner cw-banner--sprint" style={{ padding: '26px 30px', marginBottom: 24 }}>
        <div className="cw-eyebrow">100 Days</div>
        <h1 className="cw-title" style={{ fontSize: 30, marginTop: 4 }}>Day {currentDay} of {TOTAL_DAYS}</h1>
        <div className="cw-sub" style={{ marginTop: 2 }}>Post every day. Check off today once it's live.</div>
        <div className="cw-stat" style={{ marginTop: 20, flexDirection: 'row', gap: 32 }}>
          <div>
            <div className="cw-stat-value">{checkedCount}</div>
            <div className="cw-stat-label">Posted</div>
          </div>
          <div>
            <div className="cw-stat-value" style={{ color: missedCount > 0 ? 'var(--danger)' : undefined }}>{missedCount}</div>
            <div className="cw-stat-label">Missed</div>
          </div>
          <div>
            <div className="cw-stat-value">{TOTAL_DAYS - currentDay}</div>
            <div className="cw-stat-label">Days Left</div>
          </div>
        </div>
      </div>

      <div className="cw-card" style={{ padding: 20, maxWidth: 620 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 8 }}>
          {days.map(d => {
            const clickable = !d.isFuture
            let bg = 'var(--surface-2)'
            let border = '1px solid var(--stroke-1)'
            let color = 'var(--on-surface-3)'
            if (d.checked) {
              bg = 'var(--ok)'
              border = '1px solid var(--ok)'
              color = 'var(--surface-solid)'
            } else if (d.isToday) {
              border = '1.5px solid var(--accent)'
              color = 'var(--accent)'
            } else if (d.isPast) {
              bg = 'var(--danger-dim)'
              border = '1px solid transparent'
              color = 'var(--danger)'
            }
            return (
              <button
                key={d.dateStr}
                disabled={!clickable}
                onClick={() => toggleChallengeCheckin(d.dateStr)}
                title={d.dateStr}
                style={{
                  aspectRatio: '1', borderRadius: 8, background: bg, border, color,
                  fontSize: 11, fontWeight: 700, cursor: clickable ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: d.isFuture ? 0.5 : 1,
                }}
              >
                {d.checked ? <Check size={13} strokeWidth={3} /> : d.dayNum}
              </button>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 16, fontSize: 12, color: 'var(--on-surface-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--ok)', display: 'inline-block' }} /> Posted
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--danger-dim)', display: 'inline-block' }} /> Missed
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, border: '1.5px solid var(--accent)', display: 'inline-block' }} /> Today
          </div>
        </div>
      </div>
    </div>
  )
}
