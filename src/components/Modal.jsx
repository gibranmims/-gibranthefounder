import React, { useEffect } from 'react'

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="cw-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="cw-modal">
        <div className="cw-modal-header">
          <div className="cw-modal-title">{title}</div>
        </div>
        <div className="cw-modal-body">{children}</div>
      </div>
    </div>
  )
}
