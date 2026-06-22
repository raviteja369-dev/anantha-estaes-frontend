import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, KeyRound, Lock, Activity, AlertCircle, X, Crown, UserCog } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import LoginBrandPanel from './components/LoginBrandPanel'
import LoginLogo from './components/LoginLogo'
import LoginForm from './components/LoginForm'

const roles = [
  { id: 'super_admin', label: 'Super Admin', icon: Crown },
  { id: 'employee', label: 'Employee', icon: UserCog },
]

const trust = [
  { icon: ShieldCheck, label: 'Secure Authentication' },
  { icon: KeyRound, label: 'Role-Based Access' },
  { icon: Lock, label: 'Enterprise Security' },
  { icon: Activity, label: 'Real-Time Management' },
]

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState('super_admin')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (email, password) => {
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      navigate(user.role === 'super_admin' ? '/dashboard' : '/employee/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <LoginBrandPanel />

      {/* Right side */}
      <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-5 py-10 sm:px-8">
        {/* premium animated background */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(120%_120%_at_50%_0%,#eef2ff_0%,#f8fafc_45%,#faf5ff_100%)] dark:bg-[radial-gradient(120%_120%_at_50%_0%,#111634_0%,#0b1120_45%,#160f2e_100%)]" />
        <motion.div
          aria-hidden
          className="absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-indigo-400/25 blur-3xl dark:bg-indigo-500/20"
          animate={{ y: [0, 30, 0], x: [0, 14, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden
          className="absolute -right-20 bottom-0 -z-10 h-80 w-80 rounded-full bg-violet-400/25 blur-3xl dark:bg-violet-500/20"
          animate={{ y: [0, -26, 0], x: [0, -12, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* error toast */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="fixed left-1/2 top-6 z-50 flex w-[min(92vw,420px)] -translate-x-1/2 items-start gap-3 rounded-2xl border border-rose-200 bg-white/90 p-3.5 shadow-[var(--shadow-float)] backdrop-blur-xl dark:border-rose-500/25 dark:bg-slate-900/90"
              role="alert"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-foreground">Authentication failed</p>
                <p className="text-[12.5px] text-muted-foreground">{error}</p>
              </div>
              <button onClick={() => setError('')} className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" aria-label="Dismiss">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[440px]"
        >
          <div className="rounded-[24px] border border-white/80 bg-white/95 p-7 shadow-[var(--shadow-float)] backdrop-blur-2xl sm:p-9 dark:border-white/10 dark:bg-slate-900/90">
            {/* logo + welcome */}
            <div className="mb-7 flex flex-col items-center text-center">
              <LoginLogo size="lg" showText={false} className="mb-4" />
              <h1 className="font-display text-[24px] font-bold tracking-tight text-foreground">
                Welcome back <span className="inline-block origin-bottom-right animate-[wave_1.6s_ease-in-out]">👋</span>
              </h1>
              <p className="mt-1.5 max-w-xs text-[13.5px] text-slate-500 dark:text-slate-400">
                Sign in to manage projects, plots, customers and sales.
              </p>
            </div>

            {/* role segmented selector */}
            <div className="mb-5 grid grid-cols-2 gap-1 rounded-[14px] border border-border bg-muted/60 p-1">
              {roles.map((r) => {
                const active = role === r.id
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className="relative flex items-center justify-center gap-2 rounded-[11px] px-3 py-2.5 text-[13px] font-semibold transition-colors"
                  >
                    {active && (
                      <motion.span
                        layoutId="role-pill"
                        className="absolute inset-0 rounded-[11px] bg-card shadow-[var(--shadow-card)] ring-1 ring-border"
                        transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                      />
                    )}
                    <r.icon className={`relative z-10 h-4 w-4 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`relative z-10 ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{r.label}</span>
                  </button>
                )
              })}
            </div>

            <LoginForm onSubmit={handleLogin} loading={loading} />

            {/* trust elements */}
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-border pt-5">
              {trust.map((t) => (
                <div key={t.label} className="flex items-center gap-2 text-[12px] font-medium text-slate-600 dark:text-slate-300">
                  <t.icon className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  {t.label}
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-[12px] text-muted-foreground">
            Need access? Contact your system administrator.
          </p>
        </motion.div>
      </main>
    </div>
  )
}
