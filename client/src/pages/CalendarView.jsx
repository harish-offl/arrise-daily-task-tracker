import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Tasks } from '../api/db'

export default function CalendarView() {
  const now = new Date()
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const [taskMap, setTaskMap] = useState({})

  useEffect(() => {
    const month = `${view.year}-${String(view.month + 1).padStart(2, '0')}`
    const monthTasks = Tasks.getByMonth(month)
    const map = {}
    monthTasks.forEach(t => {
      if (!map[t.date]) map[t.date] = { total: 0, completed: 0 }
      map[t.date].total++
      if (t.status === 'completed') map[t.date].completed++
    })
    setTaskMap(map)
  }, [view])

  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
  const firstDay = new Date(view.year, view.month, 1).getDay()
  const monthName = new Date(view.year, view.month).toLocaleString('default', { month: 'long', year: 'numeric' })
  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const prev = () => setView(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 })
  const next = () => setView(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 })

  const getDayStatus = (day) => {
    const key = `${view.year}-${String(view.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const d = taskMap[key]
    if (!d || d.total === 0) return null
    if (d.completed === d.total) return 'full'
    if (d.completed > 0) return 'partial'
    return 'none'
  }

  const isToday = (day) => view.year === now.getFullYear() && view.month === now.getMonth() && day === now.getDate()
  const statusColor = { full: '#4ade80', partial: '#fbbf24', none: '#f87171' }

  return (
    <div className="space-y-5">
      <h1 className="page-title">Calendar</h1>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <button onClick={prev} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: '#666', border: '1px solid #2a2a2a' }}>
            <ChevronLeft size={15} />
          </button>
          <h2 className="text-sm font-medium" style={{ color: '#ccc' }}>{monthName}</h2>
          <button onClick={next} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: '#666', border: '1px solid #2a2a2a' }}>
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center text-xs py-1" style={{ color: '#555' }}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const status = getDayStatus(day)
            const today = isToday(day)
            return (
              <motion.div key={day} whileHover={{ scale: 1.06 }}
                className="aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-all"
                style={{
                  background: status ? `${statusColor[status]}12` : '#1a1a1a',
                  color: today ? '#f0f0f0' : '#888',
                  border: today ? '1px solid #555' : '1px solid #222',
                }}>
                <span>{day}</span>
                {status && <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: statusColor[status] }} />}
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="card p-4 flex flex-wrap gap-5">
        {[['full','#4ade80','All done'],['partial','#fbbf24','Partial'],['none','#f87171','None']].map(([k,c,l]) => (
          <div key={k} className="flex items-center gap-2 text-xs" style={{ color: '#666' }}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />{l}
          </div>
        ))}
      </div>
    </div>
  )
}
