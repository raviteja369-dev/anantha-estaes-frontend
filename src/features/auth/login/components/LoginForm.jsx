import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const fieldClass =
  'flex h-11 w-full rounded-lg border border-slate-300/80 bg-white px-3.5 text-[14px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60'

export default function LoginForm({ onSubmit, loading, error }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(email.trim().toLowerCase(), password)
      }}
      className="space-y-5"
      noValidate
    >
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200/80 bg-red-50 px-3.5 py-2.5 text-[13px] leading-snug text-red-700"
        >
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-[13px] font-medium text-slate-700">
          Email address
        </Label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className={fieldClass}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-[13px] font-medium text-slate-700">
          Password
        </Label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className={cn(fieldClass, 'pr-11')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="mt-2 h-11 w-full text-[14px] font-semibold"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in
          </>
        ) : (
          'Sign in'
        )}
      </Button>
    </form>
  )
}
