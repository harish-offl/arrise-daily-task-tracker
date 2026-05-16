import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, User, Lock, UserPlus, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', username: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      if (mode === 'login') await login(form.username, form.password)
      else await register(form.name, form.username, form.password)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#111' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }} className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center text-lg font-bold"
            style={{ background: '#f0f0f0', color: '#111' }}>A</div>
          <h1 className="text-xl font-semibold" style={{ color: '#f0f0f0' }}>Arrise Task Tracker</h1>
          <p className="text-sm mt-1" style={{ color: '#666' }}>Your personal productivity dashboard</p>
        </div>

        <div className="card p-6">
          {/* Tabs */}
          <div className="flex rounded-lg p-1 mb-6" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                className="flex-1 py-2 rounded-md text-sm font-medium capitalize transition-all"
                style={mode === m ? { background: '#f0f0f0', color: '#111' } : { color: '#666' }}>
                {m}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <label className="block text-xs mb-1.5" style={{ color: '#888' }}>Full Name</label>
                  <div className="relative">
                    <UserPlus size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#555' }} />
                    <input className="input pl-9" placeholder="Your full name"
                      value={form.name} onChange={e => set('name', e.target.value)} required={mode === 'register'} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs mb-1.5" style={{ color: '#888' }}>Username</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#555' }} />
                <input className="input pl-9" placeholder="username"
                  value={form.username} onChange={e => set('username', e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1.5" style={{ color: '#888' }}>Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#555' }} />
                <input className="input pl-9 pr-10"
                  type={showPw ? 'text' : 'password'}
                  placeholder={mode === 'register' ? 'Min 6 characters' : 'Password'}
                  value={form.password} onChange={e => set('password', e.target.value)} required />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#555' }}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-xs px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button type="submit" disabled={loading}
              className="btn btn-primary w-full justify-center disabled:opacity-50"
              style={{ padding: '10px 16px' }}>
              {loading
                ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                : mode === 'login' ? <><LogIn size={14} /> Sign In</> : <><UserPlus size={14} /> Create Account</>}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: '#555' }}>
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            className="font-medium" style={{ color: '#aaa' }}>
            {mode === 'login' ? 'Register' : 'Sign in'}
          </button>
        </p>
      </motion.div>
    </div>
  )
}
