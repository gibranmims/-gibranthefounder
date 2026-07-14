import React, { useState, useEffect } from 'react'
import { useApp } from '../lib/AppContext'
import { supabase } from '../lib/supabase'

export default function Settings() {
  const { displayName, gcalEmbedUrl, updateProfile } = useApp()
  const [name, setName] = useState(displayName || '')
  const [gcalUrl, setGcalUrl] = useState(gcalEmbedUrl || '')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setName(displayName || '')
    setGcalUrl(gcalEmbedUrl || '')
  }, [displayName, gcalEmbedUrl])

  async function handleSave() {
    await updateProfile({ display_name: name || displayName, gcal_embed_url: gcalUrl })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <div>
      <div className="cw-banner cw-banner--pipeline" style={{ padding: '26px 30px', marginBottom: 24 }}>
        <div className="cw-eyebrow">Settings</div>
        <h1 className="cw-title" style={{ fontSize: 30, marginTop: 4 }}>Settings</h1>
        <div className="cw-sub" style={{ marginTop: 2 }}>Customize your workspace.</div>
      </div>

      <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="cw-card" style={{ padding: 24 }}>
          <div className="cw-label">Profile</div>
          <div>
            <label className="cw-label">Display name</label>
            <input className="cw-input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your first name" />
          </div>
        </div>

        <div className="cw-card" style={{ padding: 24 }}>
          <div className="cw-label">Google Calendar</div>
          <div style={{ fontSize: 13, color: 'var(--on-surface-3)', marginBottom: 16 }}>
            Paste a Google Calendar public embed URL to show it on the Calendar page, or any link to open it out.
            No sync — this app doesn't read or write your calendar.
          </div>
          <div>
            <label className="cw-label">Calendar link or embed URL</label>
            <input className="cw-input" type="text" value={gcalUrl} onChange={e => setGcalUrl(e.target.value)} placeholder="https://calendar.google.com/calendar/embed?src=..." />
          </div>
        </div>

        <div>
          <button className="cw-btn-primary" onClick={handleSave}>{saved ? '✓ Saved' : 'Save Settings'}</button>
        </div>

        <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--stroke-1)' }}>
          <button className="cw-btn-danger" onClick={handleSignOut}>Sign Out</button>
        </div>
      </div>
    </div>
  )
}
