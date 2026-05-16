import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CheckSquare, StickyNote, Flame,
  Calendar, Settings, Search, Plus, LogOut, Grid3X3, X, Menu
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NOTE_COLORS = ['orange','yellow','purple','cyan','green','pink','red','blue']
const COLOR_HEX = {
  orange:'#f97316', yellow:'#eab308', purple:'#8b5cf6', cyan:'#06b6d4',
  green:'#22c55e', pink:'#ec4899', red:'#ef4444', blue:'#3b82f6'
}

const NAV = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'tasks',     icon: CheckSquare,     label: 'Tasks' },
  { id: 'habits',    icon: Grid3X3,         label: 'Habits' },
  { id: 'notes',     icon: StickyNote,      label: 'Notes' },
  { id: 'streaks',   icon: Flame,           label: 'Streaks' },
  { id: 'calendar',  icon: Calendar,        label: 'Calendar' },
  { id: 'settings',  icon: Settings,        label: 'Settings' },
]

export default function Sidebar({ active, onNav, onAddNote, theme }) {
  const { user, logout } = useAuth()
  const [plusOpen, setPlusOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [search, setSearch] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  const initial = user?.username?.[0]?.toUpperCase() || 'A'

  const handleColor = (color) => { onAddNote(color); setPlusOpen(false); setMobileOpen(false) }
  const handleNav = (id) => { onNav(id); setMobileOpen(false) }

  const SidebarContent = () => (
    <div className="sidebar flex flex-col" style={{ width: 200 }}>
      {/* User profile */}
      <div className="flex items-center gap-3 px-2 mb-6">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
          style={{ background: '#333', color: '#f0f0f0' }}>
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: '#f0f0f0' }}>
            {user?.name?.toUpperCase() || 'USER'}
          </p>
          <p className="text-xs truncate" style={{ color: '#666' }}>@{user?.username}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-2">
        {showSearch ? (
          <div className="flex items-center gap-2 px-2">
            <input className="input text-xs py-1.5 flex-1" placeholder="Search..."
              value={search} onChange={e => setSearch(e.target.value)} autoFocus />
            <button onClick={() => setShowSearch(false)} style={{ color: '#666' }}><X size={13} /></button>
          </div>
        ) : (
          <button onClick={() => setShowSearch(true)} className="nav-item w-full">
            <Search size={15} style={{ color: '#666' }} /><span>Search</span>
          </button>
        )}
      </div>

      {/* Nav */}
      {NAV.map(({ id, icon: Icon, label }) => (
        <button key={id} onClick={() => handleNav(id)}
          className={`nav-item ${active === id ? 'active' : ''}`}>
          <Icon size={15} style={{ color: active === id ? '#ccc' : '#666' }} />
          <span>{label}</span>
        </button>
      ))}

      <div className="flex-1" />

      {/* Add Note button */}
      <div className="relative mb-2">
        <AnimatePresence>
          {plusOpen && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.12 }}
              className="absolute bottom-full left-0 right-0 mb-2 card p-3"
              style={{ background: '#1e1e1e', zIndex: 50 }}>
              <p className="text-xs mb-2.5" style={{ color: '#666' }}>Choose color</p>
              <div className="grid grid-cols-4 gap-2">
                {NOTE_COLORS.map(c => (
                  <motion.button key={c} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                    onClick={() => handleColor(c)}
                    className="w-7 h-7 rounded-full mx-auto block"
                    style={{ background: COLOR_HEX[c] }} title={c} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setPlusOpen(o => !o)}
          className="btn btn-primary w-full justify-center text-sm"
          style={{ borderRadius: '8px', padding: '9px 16px' }}>
          <Plus size={14} /> Add Note
        </button>
      </div>

      <hr className="divider mb-2" />

      {/* Sign out */}
      <button onClick={logout} className="nav-item w-full" style={{ color: '#666' }}>
        <LogOut size={15} style={{ color: '#666' }} /><span>Sign Out</span>
      </button>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <SidebarContent />
      </div>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
        style={{ background: '#111', borderBottom: '1px solid #2a2a2a' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
            style={{ background: '#333', color: '#f0f0f0' }}>{initial}</div>
          <span className="text-sm font-medium" style={{ color: '#f0f0f0' }}>Arrise</span>
        </div>
        <button onClick={() => setMobileOpen(o => !o)} style={{ color: '#888' }}>
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.7)' }}
              onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: -220 }} animate={{ x: 0 }} exit={{ x: -220 }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="md:hidden fixed left-0 top-0 bottom-0 z-50" style={{ width: 200 }}>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
