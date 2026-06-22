import { useState } from 'react'
import { Eye, EyeOff, Loader2, KeyRound, CheckCircle2 } from 'lucide-react'
import { authAPI } from '@/services/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const emptyForm = { currentPassword: '', newPassword: '', confirmPassword: '' }

function PasswordField({ id, label, value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="flex h-10 w-full rounded-lg border border-border bg-card pl-3 pr-10 py-2 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

export default function ChangePasswordDialog({ open, onOpenChange }) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const reset = () => {
    setForm(emptyForm)
    setError('')
    setSuccess(false)
    setLoading(false)
  }

  const handleOpenChange = (next) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('All fields are required')
      return
    }
    if (form.newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('New password and confirmation do not match')
      return
    }
    if (form.newPassword === form.currentPassword) {
      setError('New password must be different from the current password')
      return
    }

    setLoading(true)
    try {
      await authAPI.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      setSuccess(true)
      setForm(emptyForm)
      setTimeout(() => handleOpenChange(false), 1400)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-1 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary sm:mx-0">
            <KeyRound className="h-5 w-5" />
          </div>
          <DialogTitle>Change Password</DialogTitle>
          <p className="text-sm text-muted-foreground">Update your account password. You'll keep using your current session.</p>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <p className="text-sm font-medium text-foreground">Password changed successfully</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className={cn('rounded-lg bg-destructive/10 text-destructive text-sm p-3 text-center')}>{error}</div>
            )}
            <PasswordField
              id="currentPassword"
              label="Current password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              placeholder="Enter current password"
              autoComplete="current-password"
            />
            <PasswordField
              id="newPassword"
              label="New password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
            <PasswordField
              id="confirmPassword"
              label="Confirm new password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Re-enter new password"
              autoComplete="new-password"
            />
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => handleOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating</> : 'Update Password'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
