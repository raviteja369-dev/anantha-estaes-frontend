import { useEffect, useRef, useState } from 'react'
import { ChevronDown, KeyRound, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import ChangePasswordDialog from './ChangePasswordDialog'

export default function ProfileMenu() {
  const { user, logout, isAdmin } = useAuth()
  const [open, setOpen] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const initial = user?.name?.charAt(0)?.toUpperCase()

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-[12px] border border-border py-1 pl-2 pr-1.5 transition-colors hover:bg-accent cursor-pointer"
        >
          <div className="hidden text-right sm:block">
            <p className="text-[13px] font-semibold leading-tight text-foreground">{user?.name}</p>
            <p className="text-[11px] leading-tight text-muted-foreground">{user?.email}</p>
          </div>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="[background-image:var(--gradient-primary)] text-xs font-semibold text-white">
              {initial}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-popover shadow-[var(--shadow-elevated)]">
            <div className="flex items-center gap-3 border-b border-border px-3 py-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="[background-image:var(--gradient-primary)] text-sm font-semibold text-white">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  {isAdmin ? 'Super Admin' : 'Sales Executive'}
                </span>
              </div>
            </div>

            <div className="p-1.5">
              <button
                type="button"
                onClick={() => { setOpen(false); setPwOpen(true) }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent cursor-pointer"
              >
                <KeyRound className="h-4 w-4 text-muted-foreground" />
                Change Password
              </button>
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>

      <ChangePasswordDialog open={pwOpen} onOpenChange={setPwOpen} />
    </>
  )
}
