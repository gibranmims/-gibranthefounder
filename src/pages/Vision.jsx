import React, { useState, useEffect } from 'react'
import { useApp } from '../lib/AppContext'
import { QUADRANTS, EVAL_CRITERIA } from '../lib/philosophy'

export default function Vision() {
  const { positioningStatement, icpNotes, pillarsNotes, updateProfile } = useApp()
  const [positioning, setPositioning] = useState(positioningStatement)
  const [icp, setIcp] = useState(icpNotes)
  const [pillars, setPillars] = useState(pillarsNotes)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setPositioning(positioningStatement)
    setIcp(icpNotes)
    setPillars(pillarsNotes)
  }, [positioningStatement, icpNotes, pillarsNotes])

  async function handleSave() {
    await updateProfile({
      positioning_statement: positioning,
      icp_notes: icp,
      pillars_notes: pillars,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <div className="cw-banner cw-banner--brand" style={{ padding: '26px 30px', marginBottom: 24 }}>
        <div className="cw-eyebrow">Reference</div>
        <h1 className="cw-title" style={{ fontSize: 30, marginTop: 4 }}>Vision / North Star</h1>
        <div className="cw-sub" style={{ marginTop: 2 }}>The framework behind every piece of content. Not editable — this is the source of truth.</div>
      </div>

      <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="cw-card" style={{ padding: 24 }}>
          <div className="cw-label">North Star</div>
          <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.5, color: 'var(--on-surface-1)' }}>
            CoWorlds helps creators turn content into a predictable business through systems, not luck.
            Content is the acquisition channel — not the product.
          </div>
        </div>

        <div className="cw-card" style={{ padding: 24 }}>
          <div className="cw-label">Foundational Belief — Expert Brand Before Personal Brand</div>
          <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 12, color: 'var(--on-surface-2)' }}>
            <strong style={{ color: 'var(--on-surface-1)' }}>Stage 1 — Expert Brand:</strong> build authority by demonstrating expertise and solving
            problems. Most content should live here: frameworks, insights, belief shifts, case studies,
            systems, psychology, business thinking.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--on-surface-2)' }}>
            <strong style={{ color: 'var(--on-surface-1)' }}>Stage 2 — Personal Brand:</strong> personal and lifestyle content only after authority is
            earned. Deprioritize day-in-the-life or relatable-for-relatability's-sake content until then.
          </p>
        </div>

        <div className="cw-card" style={{ padding: 24 }}>
          <div className="cw-label">The Four Content Pillars</div>
          <div style={{ fontSize: 13, color: 'var(--on-surface-3)', marginBottom: 16, lineHeight: 1.6 }}>
            Think → Build → Sell → Execute. A complete operating model — develop the right beliefs, create
            valuable assets and a business, learn how to influence and convert, then build systems that make
            it repeatable.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {QUADRANTS.map(q => (
              <div key={q.key} className="cw-card-flat" style={{ padding: 16, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: q.color }} />
                <div style={{ paddingLeft: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: q.color, marginBottom: 2 }}>{q.emoji} {q.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface-2)', marginBottom: 8 }}>{q.question}</div>
                  <div style={{ fontSize: 13, color: 'var(--on-surface-3)', lineHeight: 1.6, marginBottom: 10 }}>{q.desc}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {q.examples.map(ex => (
                      <span key={ex} className="cw-chip" style={{ fontSize: 11, padding: '3px 9px' }}>{ex}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cw-card" style={{ padding: 24 }}>
          <div className="cw-label">Content Evaluation Framework</div>
          <div style={{ fontSize: 13, color: 'var(--on-surface-3)', marginBottom: 12 }}>
            Score every idea against these before committing. Virality should emerge from insight — not empty provocation.
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {EVAL_CRITERIA.map(c => (
              <span key={c.key} className="cw-chip">{c.label}</span>
            ))}
          </div>
        </div>

        <div className="cw-card" style={{ padding: 24 }}>
          <div className="cw-label">Script Philosophy</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--on-surface-1)' }}>
            Belief Shift → Insight → Novelty → Curiosity → Conversion
          </div>
          <div style={{ fontSize: 13, color: 'var(--on-surface-3)', marginTop: 6 }}>Not entertainment-first.</div>
        </div>

        <div className="cw-card" style={{ padding: 24 }}>
          <div className="cw-label">ICP — "Miles"</div>
          <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--on-surface-2)' }}>
            Already believes content can build income but lacks a system. Core pain: <em>"I know people are
            making real money creating content. I just can't figure out why I'm not."</em>
          </div>
        </div>

        <div className="cw-card" style={{ padding: 24 }}>
          <div className="cw-label">Your Positioning (editable)</div>
          <div style={{ marginBottom: 14 }}>
            <label className="cw-label">Positioning statement</label>
            <textarea className="cw-textarea" value={positioning} onChange={e => setPositioning(e.target.value)} placeholder="How you'd describe what you do, in your own words..." />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="cw-label">ICP notes</label>
            <textarea className="cw-textarea" value={icp} onChange={e => setIcp(e.target.value)} placeholder="Anything specific about who you're speaking to..." />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="cw-label">Pillars, in your own words</label>
            <textarea className="cw-textarea" value={pillars} onChange={e => setPillars(e.target.value)} placeholder="Your take on the quadrants above..." />
          </div>
          <button className="cw-btn-primary" onClick={handleSave}>{saved ? '✓ Saved' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}
