import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from './lib/supabase'
import { AppProvider } from './lib/AppContext'
import { initGlow } from './lib/glow'
import Sidebar from './components/Sidebar'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Buckets from './pages/Buckets'
import Calendar from './pages/Calendar'
import Ideas from './pages/Ideas'
import Vision from './pages/Vision'
import Settings from './pages/Settings'

const PAGES = { dashboard: Dashboard, buckets: Buckets, calendar: Calendar, ideas: Ideas, vision: Vision, settings: Settings }

export default function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [page, setPage] = useState('dashboard')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => { initGlow() }, [])

  function navigate(id) { setPage(id) }

  if (authLoading) {
    return (
      <div className="dark-world" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 14, color: 'var(--on-canvas-2)' }}>Loading...</div>
      </div>
    )
  }

  if (!session) return <Auth />

  const Page = PAGES[page] || Dashboard

  return (
    <AppProvider userId={session.user.id} user={session.user}>
      <div className="dark-world" style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar activePage={page} onNavigate={navigate} />
        <main style={{ marginLeft: 240, flex: 1, padding: '36px 40px' }}>
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Page onNavigate={navigate} />
          </motion.div>
        </main>
      </div>
    </AppProvider>
  )
}
