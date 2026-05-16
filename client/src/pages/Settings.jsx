import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { hashPassword } from '../utils/crypto'

export default function Settings({ theme, onThemeChange }) {
  const { user, updateUser, logout } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', username: user?.username || '', password: '', dailyGoal: user?.dailyGoal || 3 })
  const [showPw, setShowPw] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    setSaving(true); setMsg(null)
    try {
      const users = JSON.parse(localStorage.getItem('arrise_users') || '{}')
      const key = user.username
      const updates = { name: form.name, dailyGoal: Number(form.dailyGoal) }
      if (form.password) {
        if (form.password.length < 6) throw new Error('Password must be at least 6 characters')
        updates.passwordHash = await hashPassword(form.password)
      }
      if (form.username !== key) {
        const newKey = form.username.toLowerCase()
        if (users[newKey]) throw new Error('Username already taken')
        users[newKey] = { ...users[key], ...updates, username: newKey }
        delete users[key]
        ;['tasks','habits','habitlogs','notes','streak'].forEach(k2 => {
          const val = localStorage.getItem(`arrise_${k2}_${key}`)
          if (val) { localStorage.setItem(`arrise_${k2}_${newKey}`, val); localStorage.removeItem(`arrise_${k2}_${key}`) }
        })
        localStorage.setItem('arrise_session', JSON.stringify({ username: newKey }))
      } else {
        users[key] = { ...users[key], ...updates }
      }
      localStorage.setItem('arrise_users', JSON.stringify(users))
      updateUser({ name: form.name, username: form.username.toLowerCase(), dailyGoal: Number(form.dailyGoal) })
      setMsg({ type: 'success', text: 'Settings saved!' })
      setForm(f => ({ ...f, password: '' }))
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to save' })
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-5">
      <h1 className="page-title">Settings</h1>

      <div className="card p-6 space-y-4">
        <h2 className="text-sm font-medium" style={{ color: '#ccc' }}>Profile</h2>
        <hr className="divider" />
        {[
          { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your name' },
          { label: 'Username', key: 'username', type: 'text', placeholder: 'username' },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key}>
            <label className="block text-xs mb-1.5" style={{ color: '#666' }}>{label}</label>
            <input className="input" type={type} placeholder={placeholder}
              value={form[key]} onChange={e => set(key, e.target.value)} />
          </div>
        ))}
        <div>
          <label className="block text-xs mb-1.5" style={{ color: '#666' }}>
            New Password <span style={{ color: '#444' }}>(leave blank to keep current)</span>
          </label>
          <div className="relative">
            <input className="input pr-10" type={showPw ? 'text' : 'password'}
              placeholder="Min 6 characters" value={form.password}
              onChange={e => set('password', e.target.value)} />
            <button type="button" onClick={() => setShowPw(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#555' }}>
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs mb-1.5" style={{ color: '#666' }}>Daily Goal (tasks for streak)</label>
          <input className="input" type="number" min="1" max="20" value={form.dailyGoal}
            onChange={e => set('dailyGoal', e.target.value)} />
        </div>

        {msg && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-xs px-3 py-2 rounded-lg"
            style={msg.type === 'success'
              ? { background: 'rgba(34,197,94,0.08)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.15)' }
              : { background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)' }}>
            {msg.text}
          </motion.p>
        )}

        <button onClick={save} disabled={saving} className="btn btn-primary text-sm disabled:opacity-50">
          {saving ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : <><Save size={13} /> Save Changes</>}
        </button>
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-medium mb-4" style={{ color: '#ccc' }}>Appearance</h2>
        <hr className="divider mb-4" />
        <div className="flex gap-3">
          {[['dark','🌙 Dark'],['light','☀️ Light']].map(([t, label]) => (
            <button key={t} onClick={() => onThemeChange(t)}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={theme === t
                ? { background: '#f0f0f0', color: '#111' }
                : { background: '#1a1a1a', color: '#666', border: '1px solid #2a2a2a' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-medium mb-4" style={{ color: '#ef4444' }}>Account</h2>
        <hr className="divider mb-4" />
        <button onClick={logout} className="btn btn-danger text-sm">Sign Out</button>
      </div>
    </div>
  )
}
