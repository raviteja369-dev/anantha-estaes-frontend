import { motion } from 'framer-motion'
import { Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LoginLogo({ className, variant = 'light', size = 'md', showText = true }) {
  const isDark = variant === 'dark'
  const dim = size === 'lg' ? 'h-14 w-14' : size === 'sm' ? 'h-10 w-10' : 'h-12 w-12'
  const icon = size === 'lg' ? 'h-7 w-7' : size === 'sm' ? 'h-5 w-5' : 'h-6 w-6'

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <motion.div
        initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 16 }}
        whileHover={{ rotate: 6, scale: 1.05 }}
        className={cn(
          'relative flex shrink-0 items-center justify-center rounded-[16px] [background-image:var(--gradient-primary)] text-white shadow-[var(--shadow-glow)] ring-1 ring-white/20',
          dim
        )}
      >
        <Building2 className={icon} strokeWidth={2.1} />
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-[16px] ring-2 ring-white/30"
          animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.18, 1] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900" />
      </motion.div>
      {showText && (
        <div>
          <p
            className={cn(
              'font-display text-[18px] font-bold leading-tight tracking-tight',
              isDark ? 'text-white' : 'text-foreground'
            )}
          >
            Anantha Estates
          </p>
          <p className={cn('mt-0.5 text-[12px] font-medium', isDark ? 'text-white/55' : 'text-muted-foreground')}>
            Smart Real Estate Platform
          </p>
        </div>
      )}
    </div>
  )
}
