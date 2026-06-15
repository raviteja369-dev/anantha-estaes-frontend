import { Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LoginLogo({ className, variant = 'light' }) {
  const isDark = variant === 'dark'

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm',
          isDark
            ? 'bg-white text-slate-900'
            : 'bg-primary text-primary-foreground'
        )}
      >
        <Building2 className="h-5 w-5" strokeWidth={2} />
      </div>
      <div>
        <p
          className={cn(
            'text-[17px] font-semibold tracking-tight leading-tight',
            isDark ? 'text-white' : 'text-slate-900'
          )}
        >
          Anantha Estates
        </p>
        <p className={cn('mt-0.5 text-[13px]', isDark ? 'text-slate-400' : 'text-slate-500')}>
          Plot Management System
        </p>
      </div>
    </div>
  )
}
