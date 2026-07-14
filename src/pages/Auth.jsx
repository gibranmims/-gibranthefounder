import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [mode, setMode] = useState('password') // 'password' | 'magic-link'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  async function handleMagicLinkSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="bg-dream" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{
        background: 'var(--lw-surface)', border: `1px solid var(--lw-border)`,
        borderRadius: 24, padding: 40, width: 400, maxWidth: '92vw',
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--lw-ink)', marginBottom: 4 }}>
          Personal Brand OS
        </div>
        <div style={{ fontSize: 14, color: 'var(--lw-ink-3)', marginBottom: 32 }}>
          Expert Brand, Built On Systems
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📬</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--lw-ink)', marginBottom: 8 }}>Check your email</div>
            <div style={{ fontSize: 13, color: 'var(--lw-ink-2)', lineHeight: 1.6 }}>
              We sent a login link to <strong>{email}</strong>.<br />Click it to sign in.
            </div>
            <button
              onClick={() => { setSent(false); setEmail('') }}
              style={{ marginTop: 20, fontSize: 13, color: 'var(--lw-link)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Back
            </button>
          </div>
        ) : (
          <form onSubmit={mode === 'password' ? handlePasswordSubmit : handleMagicLinkSubmit}>
            {error && (
              <div style={{ background: 'rgba(248,113,113,0.12)', color: '#c0392b', fontSize: 14, fontWeight: 500, padding: '10px 14px', borderRadius: 10, marginBottom: 14 }}>
                {error}
              </div>
            )}
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--lw-ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoFocus
              autoComplete="username"
              style={{
                width: '100%', padding: '11px 14px', border: `1.5px solid var(--lw-border)`,
                borderRadius: 10, fontSize: 15, color: 'var(--lw-ink)', outline: 'none', marginBottom: 14,
                fontFamily: 'var(--font-sans)',
              }}
            />

            {mode === 'password' && (
              <>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--lw-ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{
                    width: '100%', padding: '11px 14px', border: `1.5px solid var(--lw-border)`,
                    borderRadius: 10, fontSize: 15, color: 'var(--lw-ink)', outline: 'none', marginBottom: 20,
                    fontFamily: 'var(--font-sans)',
                  }}
                />
              </>
            )}

            <button className="cw-btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Signing in...' : mode === 'password' ? 'Sign In' : 'Send Login Link'}
            </button>

            <div style={{ fontSize: 12, color: 'var(--lw-ink-3)', textAlign: 'center', marginTop: 12 }}>
              {mode === 'password' ? (
                <button type="button" onClick={() => { setMode('magic-link'); setError('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--lw-link)', textDecoration: 'underline' }}>
                  Email me a login link instead
                </button>
              ) : (
                <button type="button" onClick={() => { setMode('password'); setError('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--lw-link)', textDecoration: 'underline' }}>
                  Use a password instead
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
