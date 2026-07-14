import React, { useState, useEffect } from 'react'
import { useApp } from '../lib/AppContext'
import { supabase } from '../lib/supabase'
import { extractFolderId } from '../lib/googleDrive'

const DRIVE_API_KEY_SET = Boolean(import.meta.env.VITE_GOOGLE_DRIVE_API_KEY)

export default function Settings() {
  const { displayName, driveFolderId, updateProfile, channels, addChannel, updateChannel, deleteChannel, moveChannel } = useApp()
  const [name, setName] = useState(displayName || '')
  const [folderInput, setFolderInput] = useState(driveFolderId || '')
  const [saved, setSaved] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [newChannel, setNewChannel] = useState('')
  const [channelEdits, setChannelEdits] = useState({})

  useEffect(() => {
    setName(displayName || '')
    setFolderInput(driveFolderId || '')
  }, [displayName, driveFolderId])

  async function handleSave() {
    await updateProfile({ display_name: name || displayName, drive_ready_folder_id: extractFolderId(folderInput) })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  async function handleAddChannel() {
    if (!newChannel.trim()) return
    await addChannel(newChannel.trim())
    setNewChannel('')
  }

  function handleChannelLabelChange(id, value) {
    setChannelEdits(prev => ({ ...prev, [id]: value }))
  }

  async function handleChannelLabelBlur(id) {
    const value = channelEdits[id]
    if (value === undefined) return
    const current = channels.find(c => c.id === id)
    if (value.trim() && value.trim() !== current?.label) {
      await updateChannel(id, { label: value.trim() })
    }
    setChannelEdits(prev => { const next = { ...prev }; delete next[id]; return next })
  }

  async function handleSetPassword() {
    setPasswordError('')
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.')
      return
    }
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setPasswordError(error.message)
      return
    }
    setPassword('')
    setPasswordSaved(true)
    setTimeout(() => setPasswordSaved(false), 2500)
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
          <div className="cw-label">Calendar Channels</div>
          <div style={{ fontSize: 13, color: 'var(--on-surface-3)', marginBottom: 16 }}>
            These are the rows on your Calendar grid. Add, rename, reorder, or remove them.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {channels.map((c, i) => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  className="cw-input"
                  type="text"
                  value={channelEdits[c.id] ?? c.label}
                  onChange={e => handleChannelLabelChange(c.id, e.target.value)}
                  onBlur={() => handleChannelLabelBlur(c.id)}
                  style={{ flex: 1 }}
                />
                <button className="cw-btn-ghost" style={{ padding: '9px 10px' }} disabled={i === 0} onClick={() => moveChannel(c.id, 'up')}>↑</button>
                <button className="cw-btn-ghost" style={{ padding: '9px 10px' }} disabled={i === channels.length - 1} onClick={() => moveChannel(c.id, 'down')}>↓</button>
                <button className="cw-btn-danger" style={{ padding: '9px 10px' }} onClick={() => deleteChannel(c.id)}>Delete</button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="cw-input"
              type="text"
              value={newChannel}
              onChange={e => setNewChannel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddChannel() }}
              placeholder="New channel name..."
            />
            <button className="cw-btn-primary" onClick={handleAddChannel} style={{ flexShrink: 0 }}>+ Add</button>
          </div>
        </div>

        <div className="cw-card" style={{ padding: 24 }}>
          <div className="cw-label">Ready-to-Post Drive Folder</div>
          <div style={{ fontSize: 13, color: 'var(--on-surface-3)', marginBottom: 16, lineHeight: 1.6 }}>
            Videos in this Drive folder show up in the "Ready to Post" panel on the Calendar page. The folder
            needs to be shared as <strong>"Anyone with the link — Viewer."</strong>
            {!DRIVE_API_KEY_SET && (
              <>
                {' '}Also needs a Drive API key set as <code>VITE_GOOGLE_DRIVE_API_KEY</code> — not configured yet, so the panel won't load files until that's added.
              </>
            )}
          </div>
          <div>
            <label className="cw-label">Drive folder link or ID</label>
            <input className="cw-input" type="text" value={folderInput} onChange={e => setFolderInput(e.target.value)} placeholder="https://drive.google.com/drive/folders/..." />
          </div>
        </div>

        <div>
          <button className="cw-btn-primary" onClick={handleSave}>{saved ? '✓ Saved' : 'Save Settings'}</button>
        </div>

        <div className="cw-card" style={{ padding: 24 }}>
          <div className="cw-label">Password</div>
          <div style={{ fontSize: 13, color: 'var(--on-surface-3)', marginBottom: 16 }}>
            Set a password so you can sign in directly instead of waiting on a login-link email every time.
          </div>
          {passwordError && (
            <div style={{ background: 'var(--danger-dim)', color: 'var(--danger)', fontSize: 13, fontWeight: 500, padding: '9px 12px', borderRadius: 10, marginBottom: 12 }}>
              {passwordError}
            </div>
          )}
          <div style={{ marginBottom: 12 }}>
            <label className="cw-label">New password</label>
            <input className="cw-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" />
          </div>
          <button className="cw-btn-primary" onClick={handleSetPassword}>{passwordSaved ? '✓ Password Set' : 'Set Password'}</button>
        </div>

        <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--stroke-1)' }}>
          <button className="cw-btn-danger" onClick={handleSignOut}>Sign Out</button>
        </div>
      </div>
    </div>
  )
}
