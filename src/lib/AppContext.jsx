import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from './supabase'

const AppContext = createContext(null)

// Local date string (YYYY-MM-DD) — avoids UTC midnight flipping the date while local time is still "today"
function getToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isYesterday(dateStr, today) {
  if (!dateStr) return false
  const d = new Date(dateStr + 'T00:00:00')
  const t = new Date(today + 'T00:00:00')
  const diff = Math.round((t - d) / 86400000)
  return diff === 1
}

const DEFAULT_CHANNELS = ['TikTok', 'Instagram Reels', 'Instagram Static/Carousel', 'Threads/X', 'LinkedIn']

export function AppProvider({ children, userId, user }) {
  const emailPrefix = user?.email?.split('@')[0] || 'there'
  const fallbackName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)

  const [displayName, setDisplayName] = useState(fallbackName)
  const [positioningStatement, setPositioningStatement] = useState('')
  const [icpNotes, setIcpNotes] = useState('')
  const [pillarsNotes, setPillarsNotes] = useState('')
  const [gcalEmbedUrl, setGcalEmbedUrl] = useState('')
  const [driveFolderId, setDriveFolderId] = useState('')
  const [streakCount, setStreakCount] = useState(0)
  const [lastActivityDate, setLastActivityDate] = useState(null)
  const [contentPieces, setContentPieces] = useState([])
  const [ideas, setIdeas] = useState([])
  const [channels, setChannels] = useState([])
  const [sprintItems, setSprintItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (userId) loadAll() }, [userId])

  async function loadAll() {
    setLoading(true)
    await Promise.all([loadProfile(), loadContentPieces(), loadIdeas(), loadChannels(), loadSprintItems()])
    setLoading(false)
  }

  async function loadProfile() {
    const { data } = await supabase.from('profile').select('*').eq('id', userId).single()
    if (data) {
      if (data.display_name) setDisplayName(data.display_name)
      setPositioningStatement(data.positioning_statement || '')
      setIcpNotes(data.icp_notes || '')
      setPillarsNotes(data.pillars_notes || '')
      setGcalEmbedUrl(data.gcal_embed_url || '')
      setDriveFolderId(data.drive_ready_folder_id || '')
      setStreakCount(data.streak_count || 0)
      setLastActivityDate(data.last_activity_date || null)
    }
  }

  async function loadContentPieces() {
    const { data } = await supabase.from('content_pieces').select('*').eq('user_id', userId).order('created_at', { ascending: true })
    setContentPieces(data || [])
  }

  async function loadIdeas() {
    const { data } = await supabase.from('ideas').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    setIdeas(data || [])
  }

  async function loadChannels() {
    const { data } = await supabase.from('channels').select('*').eq('user_id', userId).order('order_index', { ascending: true })
    if (!data || data.length === 0) {
      // upsert + ignoreDuplicates guards against two concurrent loads (e.g. a fast reload)
      // both seeing zero channels and both trying to seed — the unique(user_id, label)
      // constraint means only one set actually lands, so we re-select rather than trust the insert result.
      const rows = DEFAULT_CHANNELS.map((label, i) => ({ user_id: userId, label, order_index: i }))
      await supabase.from('channels').upsert(rows, { onConflict: 'user_id,label', ignoreDuplicates: true })
      const { data: seeded } = await supabase.from('channels').select('*').eq('user_id', userId).order('order_index', { ascending: true })
      setChannels(seeded || [])
      return
    }
    setChannels(data)
  }

  async function loadSprintItems() {
    const { data } = await supabase.from('sprint_items').select('*').eq('user_id', userId).order('created_at', { ascending: true })
    setSprintItems(data || [])
  }

  // ── PROFILE ──
  async function updateProfile(updates) {
    await supabase.from('profile').upsert({ id: userId, ...updates })
    if ('display_name' in updates) setDisplayName(updates.display_name)
    if ('positioning_statement' in updates) setPositioningStatement(updates.positioning_statement)
    if ('icp_notes' in updates) setIcpNotes(updates.icp_notes)
    if ('pillars_notes' in updates) setPillarsNotes(updates.pillars_notes)
    if ('gcal_embed_url' in updates) setGcalEmbedUrl(updates.gcal_embed_url)
    if ('drive_ready_folder_id' in updates) setDriveFolderId(updates.drive_ready_folder_id)
  }

  // Bump the daily streak — called on any create/progress action. Increments once per day.
  async function bumpStreak() {
    const today = getToday()
    if (lastActivityDate === today) return
    const nextStreak = isYesterday(lastActivityDate, today) ? streakCount + 1 : 1
    setStreakCount(nextStreak)
    setLastActivityDate(today)
    await supabase.from('profile').upsert({ id: userId, streak_count: nextStreak, last_activity_date: today })
  }

  // ── IDEAS ──
  async function addIdea(text) {
    const { data, error } = await supabase.from('ideas').insert({ text, user_id: userId }).select().single()
    if (!error && data) {
      setIdeas(prev => [data, ...prev])
      bumpStreak()
    }
  }
  async function deleteIdea(id) {
    await supabase.from('ideas').delete().eq('id', id)
    setIdeas(prev => prev.filter(i => i.id !== id))
  }
  // Promote a raw idea into a full content piece (defaults quadrant/platform — user retags in Buckets)
  async function promoteIdea(id) {
    const idea = ideas.find(i => i.id === id)
    if (!idea) return
    const { data, error } = await supabase.from('content_pieces').insert({
      user_id: userId,
      title: idea.text,
      quadrant: 'creator_psychology',
      channel_id: channels[0]?.id || null,
      stage: 'idea',
    }).select().single()
    if (!error && data) {
      setContentPieces(prev => [...prev, data])
      await deleteIdea(id)
      bumpStreak()
    }
  }

  // ── CONTENT PIECES ──
  async function addContentPiece(piece) {
    const { data, error } = await supabase.from('content_pieces').insert({ ...piece, user_id: userId }).select().single()
    if (!error && data) {
      setContentPieces(prev => [...prev, data])
      bumpStreak()
    }
  }
  async function updateContentPiece(id, updates) {
    await supabase.from('content_pieces').update(updates).eq('id', id)
    setContentPieces(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
    bumpStreak()
  }
  async function moveStage(id, stage) {
    const updates = { stage }
    if (stage === 'posted') updates.posted_date = getToday()
    await updateContentPiece(id, updates)
  }
  async function deleteContentPiece(id) {
    await supabase.from('content_pieces').delete().eq('id', id)
    setContentPieces(prev => prev.filter(c => c.id !== id))
  }

  // ── CHANNELS ──
  async function addChannel(label) {
    const order_index = channels.length
    const { data, error } = await supabase.from('channels').insert({ user_id: userId, label, order_index }).select().single()
    if (!error && data) setChannels(prev => [...prev, data])
  }
  async function updateChannel(id, updates) {
    await supabase.from('channels').update(updates).eq('id', id)
    setChannels(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }
  async function deleteChannel(id) {
    await supabase.from('channels').delete().eq('id', id)
    setChannels(prev => prev.filter(c => c.id !== id))
  }
  async function moveChannel(id, direction) {
    const i = channels.findIndex(c => c.id === id)
    const j = direction === 'up' ? i - 1 : i + 1
    if (i < 0 || j < 0 || j >= channels.length) return
    const a = channels[i], b = channels[j]
    const reordered = [...channels]
    reordered[i] = { ...b, order_index: a.order_index }
    reordered[j] = { ...a, order_index: b.order_index }
    reordered.sort((x, y) => x.order_index - y.order_index)
    setChannels(reordered)
    await Promise.all([
      supabase.from('channels').update({ order_index: b.order_index }).eq('id', a.id),
      supabase.from('channels').update({ order_index: a.order_index }).eq('id', b.id),
    ])
  }

  // ── SPRINT ITEMS ──
  async function addSprintItem(text) {
    const { data, error } = await supabase.from('sprint_items').insert({ text, user_id: userId }).select().single()
    if (!error && data) setSprintItems(prev => [...prev, data])
  }
  async function toggleSprintItem(id) {
    const item = sprintItems.find(i => i.id === id)
    if (!item) return
    const done = !item.done
    await supabase.from('sprint_items').update({ done }).eq('id', id)
    setSprintItems(prev => prev.map(i => i.id === id ? { ...i, done } : i))
    if (done) bumpStreak()
  }
  async function deleteSprintItem(id) {
    await supabase.from('sprint_items').delete().eq('id', id)
    setSprintItems(prev => prev.filter(i => i.id !== id))
  }
  async function clearDoneSprintItems() {
    const doneIds = sprintItems.filter(i => i.done).map(i => i.id)
    if (!doneIds.length) return
    await supabase.from('sprint_items').delete().in('id', doneIds)
    setSprintItems(prev => prev.filter(i => !i.done))
  }

  return (
    <AppContext.Provider value={{
      userId,
      displayName,
      positioningStatement, icpNotes, pillarsNotes, gcalEmbedUrl, driveFolderId,
      updateProfile,
      streakCount, lastActivityDate,
      contentPieces, addContentPiece, updateContentPiece, moveStage, deleteContentPiece,
      ideas, addIdea, deleteIdea, promoteIdea,
      channels, addChannel, updateChannel, deleteChannel, moveChannel,
      sprintItems, addSprintItem, toggleSprintItem, deleteSprintItem, clearDoneSprintItems,
      loading,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() { return useContext(AppContext) }
