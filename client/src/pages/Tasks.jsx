import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit3, Check, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Tasks as DB } from '../api/db'

const CATEGORIES = ['Personal', 'Study', 'Agency Work', 'Client Work', 'Fitness', 'Finance', 'Custom']
const PRIORITIES = ['Low', 'Medium', 'High']

function TaskRow({ task, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [desc, setDesc] = useState(task.description || '')
  const done = task.status === 'completed'

  const save = () => { onEdit(task._id, { title, description: desc }); setEditing(false) }

  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -16 }}
      className="flex items-start gap-3 py-3 px-4 group rounded-lg transition-colors"
      style={{ borderBottom: '1px solid #222' }}>

      <motion.button whileTap={{ scale: 0.85 }} onClick={() => onToggle(task._id, task.status)}
        className="habit-check flex-shrink-0 mt-0.5"
        style={done ? { background: '#2a2a2a', borderColor: '#555' } : {}}>
        {done && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <Check size={13} style={{ color: '#aaa' }} strokeWidth={2.5} />
          </motion.div>
        )}
      </motion.button>

      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="space-y-2">
            <input className="input text-sm py-1.5" value={title}
              onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && save()} autoFocus />
            <input className="input text-xs py-1.5" placeholder="Description..." value={desc}
              onChange={e => setDesc(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={save} className="btn btn-primary text-xs py-1.5 px-3">Save</button>
              <button onClick={() => setEditing(false)} className="btn btn-ghost text-xs py-1.5 px-3">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm" style={{ color: done ? '#555' : '#ccc', textDecoration: done ? 'line-through' : 'none' }}>
              {task.title}
            </p>
            {task.description && <p className="text-xs mt-0.5 truncate" style={{ color: '#555' }}>{task.description}</p>}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`tag tag-${task.priority?.toLowerCase()}`}>{task.priority}</span>
              {task.category && <span className="tag tag-cat">{task.category}</span>}
              {task.dueTime && <span className="text-xs" style={{ color: '#555' }}>{task.dueTime}</span>}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5">
        <button onClick={() => setEditing(true)} style={{ color: '#555' }}
          onMouseEnter={e => e.currentTarget.style.color = '#aaa'}
          onMouseLeave={e => e.currentTarget.style.color = '#555'}>
          <Edit3 size={13} />
        </button>
        <button onClick={() => onDelete(task._id)} style={{ color: '#555' }}
          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={e => e.currentTarget.style.color = '#555'}>
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  )
}

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({ title: '', description: '', category: 'Personal', priority: 'Medium', dueTime: '' })

  const load = useCallback(() => setTasks(DB.getByDate(date)), [date])
  useEffect(() => { load() }, [load])

  const addTask = () => {
    if (!form.title.trim()) return
    const task = DB.add({ ...form, date })
    setTasks(prev => [task, ...prev])
    setForm({ title: '', description: '', category: 'Personal', priority: 'Medium', dueTime: '' })
    setShowForm(false)
  }

  const toggleTask = (id, status) => {
    const updated = DB.update(id, { status: status === 'completed' ? 'pending' : 'completed' })
    if (updated) setTasks(prev => prev.map(t => t._id === id ? updated : t))
  }
  const deleteTask = (id) => { DB.delete(id); setTasks(prev => prev.filter(t => t._id !== id)) }
  const editTask = (id, updates) => {
    const updated = DB.update(id, updates)
    if (updated) setTasks(prev => prev.map(t => t._id === id ? updated : t))
  }

  const shiftDate = (days) => {
    const d = new Date(date); d.setDate(d.getDate() + days)
    setDate(d.toISOString().split('T')[0])
  }

  const isToday = date === new Date().toISOString().split('T')[0]
  const completed = tasks.filter(t => t.status === 'completed').length
  const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0
  const filtered = tasks.filter(t => filter === 'all' ? true : t.status === filter)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="page-title">Daily Tasks</h1>
        <button onClick={() => setShowForm(s => !s)} className="btn btn-primary text-sm">
          <Plus size={14} /> Add Task
        </button>
      </div>

      {/* Date nav */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => shiftDate(-1)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: '#666', border: '1px solid #2a2a2a' }}>
            <ChevronLeft size={15} />
          </button>
          <div className="flex items-center gap-3">
            <input type="date" className="input text-sm py-1.5 w-auto" value={date}
              onChange={e => setDate(e.target.value)} />
            {!isToday && (
              <button onClick={() => setDate(new Date().toISOString().split('T')[0])}
                className="text-xs" style={{ color: '#888' }}>Today</button>
            )}
          </div>
          <button onClick={() => shiftDate(1)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: '#666', border: '1px solid #2a2a2a' }}>
            <ChevronRight size={15} />
          </button>
        </div>
        {tasks.length > 0 && (
          <>
            <div className="flex justify-between text-xs mb-1.5">
              <span style={{ color: '#666' }}>{completed}/{tasks.length} completed</span>
              <span style={{ color: '#888' }}>{progress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </>
        )}
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: '#ccc' }}>New Task</span>
                <button onClick={() => setShowForm(false)} style={{ color: '#555' }}><X size={14} /></button>
              </div>
              <input className="input" placeholder="Task title *" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addTask()} autoFocus />
              <input className="input text-sm" placeholder="Description (optional)" value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <select className="input text-sm" value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <select className="input text-sm" value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
                <input type="time" className="input text-sm" value={form.dueTime}
                  onChange={e => setForm(f => ({ ...f, dueTime: e.target.value }))} />
              </div>
              <div className="flex gap-2">
                <button onClick={addTask} className="btn btn-primary text-sm flex-1 justify-center">Add Task</button>
                <button onClick={() => setShowForm(false)} className="btn btn-ghost text-sm">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'pending', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
            style={filter === f
              ? { background: '#2a2a2a', color: '#f0f0f0', border: '1px solid #3a3a3a' }
              : { background: 'transparent', color: '#666', border: '1px solid #2a2a2a' }}>
            {f} ({f === 'all' ? tasks.length : f === 'pending' ? tasks.length - completed : completed})
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="card overflow-hidden">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-12 text-center text-sm" style={{ color: '#555' }}>
              {tasks.length === 0 ? 'No tasks for this date. Add one above!' : `No ${filter} tasks.`}
            </motion.div>
          ) : filtered.map(task => (
            <TaskRow key={task._id} task={task} onToggle={toggleTask} onDelete={deleteTask} onEdit={editTask} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
