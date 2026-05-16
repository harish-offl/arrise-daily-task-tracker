import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthPage from './pages/AuthPage'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Habits from './pages/Habits'
import Notes from './pages/Notes'
import Streaks from './pages/Streaks'
import CalendarView from './pages/CalendarView'
import Settings from './pages/Settings'

const SECTIONS = { dashboard: Dashboard, tasks: Tasks, habits: Habits, notes: Notes, streaks: Streaks, calendar: CalendarView, settings: Settings }

function AppInner() {
  const { user, loading } = useAuth()
  const [active, setActive] = useState('dashboard')
  const [theme, setTheme] = useState(() => localStorage.getItem('arrise_theme') || 'dark')
  const [pendingNoteColor, setPendingNoteColor] = useState(null)

  useEffect(() => { document.body.classList.toggle('light', theme === 'light') }, [theme])

  const handleTheme = (t) => { setTheme(t); localStorage.setItem('arrise_theme', t) }
  const handleAddNote = useCallback((color) => { setPendingNoteColor(color); setActive('notes') }, [])
  const handleColorConsumed = useCallback(() => setPendingNoteColor(null), [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#111' }}>
      <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: '#333', borderTopColor: '#888' }} />
    </div>
  )

  if (!user) return <AuthPage />

  const Section = SECTIONS[active] || Dashboard

  return (
    <div style={{ background: theme === 'light' ? '#f4f4f5' : '#1a1a1a', minHeight: '100vh' }}>
      <Sidebar active={active} onNav={setActive} onAddNote={handleAddNote} theme={theme} />

      <div className="md:ml-[200px]">
        <div className="h-12 md:hidden" />
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
          <AnimatePresence mode="wait">
            <motion.div key={active}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}>
              {active === 'notes'
                ? <Section pendingColor={pendingNoteColor} onColorConsumed={handleColorConsumed} />
                : active === 'settings'
                  ? <Section theme={theme} onThemeChange={handleTheme} />
                  : <Section />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return <AuthProvider><AppInner /></AuthProvider>
}
