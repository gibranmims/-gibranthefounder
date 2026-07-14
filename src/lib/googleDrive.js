// Read-only Google Drive folder listing via API key (no OAuth).
// Requires: a Google Cloud API key with the Drive API enabled, restricted by
// HTTP referrer to this app's domain(s); and the target folder shared as
// "Anyone with the link — Viewer". Neither is set up by default.

export function extractFolderId(input) {
  if (!input) return ''
  const match = input.match(/folders\/([a-zA-Z0-9_-]+)/)
  if (match) return match[1]
  return input.trim()
}

export async function listDriveFolderFiles(apiKey, folderId) {
  if (!apiKey || !folderId) return { files: [], error: null }
  const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`)
  const fields = encodeURIComponent('files(id,name,webViewLink,thumbnailLink,mimeType,createdTime)')
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&orderBy=createdTime desc&key=${apiKey}`
  try {
    const res = await fetch(url)
    const data = await res.json()
    if (!res.ok) return { files: [], error: data?.error?.message || 'Drive request failed' }
    return { files: data.files || [], error: null }
  } catch (e) {
    return { files: [], error: e.message }
  }
}
