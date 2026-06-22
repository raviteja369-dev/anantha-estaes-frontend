import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'

const fieldWrap =
  'group relative rounded-[14px] border border-border bg-input transition-all focus-within:border-primary focus-within:bg-card focus-within:ring-[3px] focus-within:ring-primary/15'
const fieldInput =
  'peer h-14 w-full rounded-[14px] bg-transparent pl-11 pr-11 text-[14px] text-foreground outline-none placeholder:text-transparent disabled:opacity-60'
const fieldLabel =
  'pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 text-[14px] text-muted-foreground transition-opacity duration-150 peer-focus:opacity-0 peer-[:not(:placeholder-shown)]:opacity-0'

export default function LoginForm({ onSubmit, loading }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(email.trim().toLowerCase(), password)
      }}
      className="space-y-4"
      noValidate
    >
      <div className={fieldWrap}>
        <Mail className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
        <input
          id="email"
          type="email"
          autoComplete="username"
          placeholder=" "
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className={fieldInput}
        />
        <label htmlFor="email" className={fieldLabel}>Email address</label>
      </div>

      <div className={fieldWrap}>
        <Lock className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
        <input
          id="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder=" "
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className={fieldInput}
        />
        <label htmlFor="password" className={fieldLabel}>Password</label>
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
        </button>
      </div>

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.015 }}
        whileTap={{ scale: loading ? 1 : 0.985 }}
        className="group relative mt-1 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-[14px] [background-image:var(--gradient-primary)] text-[15px] font-semibold text-white shadow-[var(--shadow-glow)] transition-all hover:shadow-[0_12px_34px_-8px_rgb(79_70_229_/_0.6)] disabled:opacity-80"
      >
        <span aria-hidden className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        {loading ? (
          <>
            <Loader2 className="h-[18px] w-[18px] animate-spin" />
            Authenticating…
          </>
        ) : (
          <>
            Sign In
            <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </motion.button>
    </form>
  )
}
