import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, Zap, Target, Quote, TrendingUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Tasks, Streak } from '../api/db'

const QUOTES = [
  "Small steps every day lead to big results.",
  "Discipline is choosing what you want most over what you want now.",
  "The secret of getting ahead is getting started.",
  "Focus on progress, not perfection.",
  "Consistency is the key to achieving momentum.",
  "Every day is a new opportunity to grow.",
  "You don't have to be great to start, but you have to start to be great.",
]

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } }
const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <motion.div variants={fadeUp} className="card card-hover p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: '#2a2a2a' }}>
          <Icon size={16} style={{ color: '#888' }} />
        </div>
        <span className="text-xs" style={{ color: '#666' }}>{label}</span>
      </div>
      <p className="text-2xl font-semibold" style={{ color: '#f0f0f0' }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: '#555' }}>{sub}</p>}
    </motion.div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [streak, setStreak] = useState({ currentStreak: 0, bestStreak: 0 })
  const [focus, setFocus] = useState(() => localStorage.getItem(`arrise_focus_${user?.username}`) || '')
  const today = new Date().toISOString().split('T')[0]
  const quote = QUOTES[new Date().getDay() % QUOTES.length]
  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  useEffect(() => {
    setTasks(Tasks.getByDate(today))
    setStreak(Streak.get())
  }, [today])

  const completed = tasks.filter(t => t.status === 'completed').length
  const total = tasks.length
  const pending = total - completed
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  const saveFocus = (v) => { setFocus(v); localStorage.setItem(`arrise_focus_${user?.username}`, v) }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">

      {/* Welcome */}
      <motion.div variants={fadeUp} className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <p className="text-xs mb-1" style={{ color: '#666' }}>{todayStr}</p>
            <h1 className="text-2xl font-semibold" style={{ color: '#f0f0f0', letterSpacing: '-0.3px' }}>
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: '#2a2a2a', border: '1px solid #333' }}>
            <span className="text-xl">🔥</span>
            <div>
              <p className="text-sm font-medium" style={{ color: '#f0f0f0' }}>{streak.currentStreak} Day Streak</p>
              <p className="text-xs" style={{ color: '#666' }}>Best: {streak.bestStreak}d</p>
            </div>
          </div>
        </div>
        <div className="flex justify-between text-xs mb-2">
          <span style={{ color: '#888' }}>Today's Progress</span>
          <span style={{ color: '#aaa' }}>{progress}%</span>
        </div>
        <div className="progress-bar">
          <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: [0.4,0,0.2,1] }} />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs" style={{ color: '#555' }}>{completed} completed</span>
          <span className="text-xs" style={{ color: '#555' }}>{pending} remaining</span>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={container} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Target}      label="Total Tasks"  value={total}     sub="Today" />
        <StatCard icon={CheckCircle} label="Completed"    value={completed} sub="Done" />
        <StatCard icon={Clock}       label="Pending"      value={pending}   sub="Remaining" />
        <StatCard icon={Zap}         label="Streak"       value={`${streak.currentStreak}d`} sub={`Best: ${streak.bestStreak}d`} />
      </motion.div>

      {/* Focus */}
      <motion.div variants={fadeUp} className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} style={{ color: '#888' }} />
          <span className="text-sm font-medium" style={{ color: '#ccc' }}>Today's Focus</span>
        </div>
        <input className="input" placeholder="What's your main focus for today?"
          value={focus} onChange={e => saveFocus(e.target.value)} />
      </motion.div>

      {/* Quote */}
      <motion.div variants={fadeUp} className="card p-5 flex items-start gap-3"
        style={{ borderLeft: '2px solid #3a3a3a' }}>
        <Quote size={16} style={{ color: '#555', flexShrink: 0, marginTop: 2 }} />
        <p className="text-sm italic leading-relaxed" style={{ color: '#777' }}>"{quote}"</p>
      </motion.div>

      {/* Recent tasks */}
      {tasks.length > 0 && (
        <motion.div variants={fadeUp} className="card p-5">
          <h2 className="text-sm font-medium mb-4" style={{ color: '#ccc' }}>Recent Tasks</h2>
          <div className="space-y-1.5">
            {tasks.slice(0, 5).map(t => (
              <div key={t._id} className="flex items-center gap-3 py-2 px-3 rounded-lg"
                style={{ background: '#1a1a1a' }}>
                <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={t.status === 'completed' ? { background: '#3a3a3a' } : { border: '1px solid #3a3a3a' }}>
                  {t.status === 'completed' && (
                    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                      <path d="M3 8l3.5 3.5L13 5" stroke="#aaa" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <span className="text-sm flex-1 truncate"
                  style={{ color: t.status === 'completed' ? '#555' : '#ccc', textDecoration: t.status === 'completed' ? 'line-through' : 'none' }}>
                  {t.title}
                </span>
                <span className={`tag tag-${t.priority?.toLowerCase()}`}>{t.priority}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
