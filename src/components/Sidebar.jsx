import React from 'react'
import { LayoutDashboard, KanbanSquare, CalendarDays, Lightbulb, Compass, Settings as SettingsIcon } from 'lucide-react'
import { useApp } from '../lib/AppContext'

const ACTIVE_BG   = 'var(--accent)'
const ACTIVE_TEXT = 'var(--accent-ink)'
const INACTIVE    = 'var(--on-canvas-2)'
const SIDEBAR_BG  = 'linear-gradient(180deg, #141d2f 0%, #1c2940 35%, #333056 75%, #4a3d66 100%)'

const NAV_GROUPS = [
  { label: 'Daily',     items: [{ id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard }] },
  { label: 'Content',   items: [{ id: 'buckets', label: 'Buckets', Icon: KanbanSquare }, { id: 'calendar', label: 'Calendar', Icon: CalendarDays }] },
  { label: 'Capture',   items: [{ id: 'ideas', label: 'Idea Bank', Icon: Lightbulb }] },
  { label: 'Reference', items: [{ id: 'vision', label: 'Vision', Icon: Compass }] },
]

export default function Sidebar({ activePage, onNavigate, isOpen }) {
  const { displayName } = useApp()
  const initial = displayName ? displayName.charAt(0).toUpperCase() : '?'

  return (
    <aside
      id="sidebar"
      className={isOpen ? 'open' : ''}
      style={{
        width: 240, minWidth: 240, height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 100,
        background: SIDEBAR_BG, borderRight: '1px solid var(--stroke-1)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}
    >
      <div style={{ padding: '24px 18px 18px', borderBottom: '1px solid var(--stroke-1)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 900, letterSpacing: '-0.045em', textTransform: 'uppercase', color: 'var(--on-canvas-1)', lineHeight: 1.1 }}>
          Personal Brand OS
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--on-canvas-3)', marginTop: 4 }}>
          Expert Brand System
        </div>
      </div>

      <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
        {NAV_GROUPS.map(group => (
          <div key={group.label} style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--on-canvas-3)', padding: '10px 12px 4px' }}>
              {group.label}
            </div>
            {group.items.map(item => {
              const active = activePage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
                    padding: '9px 12px', marginBottom: 2, border: 'none', borderRadius: 999, cursor: 'pointer',
                    background: active ? ACTIVE_BG : 'transparent',
                    color: active ? ACTIVE_TEXT : INACTIVE,
                    fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: active ? 650 : 500,
                    transition: 'background 0.15s ease, color 0.15s ease',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--on-canvas-1)' } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = INACTIVE } }}
                >
                  <item.Icon size={18} strokeWidth={1.4} style={{ flexShrink: 0 }} />
                  {item.label}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      <div style={{ padding: '10px 10px 14px', borderTop: '1px solid var(--stroke-1)' }}>
        <button
          onClick={() => onNavigate('settings')}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
            padding: '9px 12px', marginBottom: 8, border: 'none', borderRadius: 999, cursor: 'pointer',
            background: activePage === 'settings' ? ACTIVE_BG : 'transparent',
            color: activePage === 'settings' ? ACTIVE_TEXT : INACTIVE,
            fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: activePage === 'settings' ? 650 : 500,
          }}
        >
          <SettingsIcon size={18} strokeWidth={1.4} style={{ flexShrink: 0 }} />
          Settings
        </button>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px',
          background: 'var(--surface-2)', borderRadius: 999, border: '1px solid var(--stroke-1)',
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--pink-300), var(--purple-300))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-ink)' }}>{initial}</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-canvas-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {displayName}
          </div>
        </div>
      </div>
    </aside>
  )
}
