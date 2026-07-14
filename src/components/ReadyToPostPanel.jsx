import React, { useEffect, useState } from 'react'
import { useApp } from '../lib/AppContext'
import { listDriveFolderFiles } from '../lib/googleDrive'

const API_KEY = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY || ''

export default function ReadyToPostPanel({ onUseFile }) {
  const { driveFolderId } = useApp()
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const configured = Boolean(API_KEY && driveFolderId)

  useEffect(() => {
    if (!configured) return
    let cancelled = false
    setLoading(true)
    listDriveFolderFiles(API_KEY, driveFolderId).then(({ files, error }) => {
      if (cancelled) return
      setFiles(files)
      setError(error)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [configured, driveFolderId])

  return (
    <div className="cw-card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
        <div className="cw-label" style={{ marginBottom: 0 }}>Ready to Post</div>
        <div style={{ fontSize: 12, color: 'var(--on-surface-3)' }}>From your Drive folder</div>
      </div>

      {!configured && (
        <div style={{ fontSize: 12, color: 'var(--on-surface-3)', lineHeight: 1.6 }}>
          Not set up yet. Add a Google Drive API key and a folder link in Settings to see videos here.
        </div>
      )}

      {configured && loading && (
        <div style={{ fontSize: 12, color: 'var(--on-surface-3)' }}>Loading...</div>
      )}

      {configured && !loading && error && (
        <div style={{ fontSize: 12, color: 'var(--danger)', lineHeight: 1.5 }}>{error}</div>
      )}

      {configured && !loading && !error && files.length === 0 && (
        <div style={{ fontSize: 12, color: 'var(--on-surface-3)' }}>Nothing in the folder yet.</div>
      )}

      {configured && !loading && !error && files.length > 0 && (
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
          {files.map(file => (
            <div key={file.id} className="cw-card-flat" style={{ padding: 10, width: 200, flexShrink: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface-1)', marginBottom: 8, wordBreak: 'break-word' }}>
                {file.name}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className="cw-btn-ghost"
                  style={{ padding: '5px 10px', fontSize: 11 }}
                  onClick={() => onUseFile({ title: file.name, doc_link: file.webViewLink })}
                >
                  Use for piece
                </button>
                <a href={file.webViewLink} target="_blank" rel="noreferrer" className="cw-btn-ghost" style={{ padding: '5px 10px', fontSize: 11 }}>
                  Open
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
