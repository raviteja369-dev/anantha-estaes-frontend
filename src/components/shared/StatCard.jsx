import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const gradients = {
  default: 'var(--gradient-primary)',
  blue: 'var(--gradient-primary)',
  indigo: 'var(--gradient-primary)',
  green: 'var(--gradient-success)',
  orange: 'var(--gradient-warning)',
  red: 'var(--gradient-danger)',
  purple: 'var(--gradient-violet)',
  gold: 'var(--gradient-violet)',
}

const glow = {
  default: 'rgb(79 70 229 / 0.45)',
  blue: 'rgb(79 70 229 / 0.45)',
  indigo: 'rgb(79 70 229 / 0.45)',
  green: 'rgb(34 197 94 / 0.40)',
  orange: 'rgb(245 158 11 / 0.40)',
  red: 'rgb(239 68 68 / 0.40)',
  purple: 'rgb(124 58 237 / 0.42)',
  gold: 'rgb(124 58 237 / 0.42)',
}

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'default', index = 0, trend, trendLabel }) {
  const grad = gradients[color] || gradients.default
  const ring = glow[color] || glow.default
  const trendUp = typeof trend === 'number' ? trend >= 0 : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="card-hover group relative overflow-hidden rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-[var(--shadow-card)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: grad }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="mt-3 font-display text-[28px] font-bold leading-none tracking-tight text-foreground tabular-nums">
            {value}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {trendUp !== null && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold',
                  trendUp
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                )}
              >
                {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(trend)}%
              </span>
            )}
            {(trendLabel || subtitle) && (
              <p className="truncate text-xs text-muted-foreground">{trendLabel || subtitle}</p>
            )}
          </div>
        </div>
        {Icon && (
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] text-white transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
            style={{ backgroundImage: grad, boxShadow: `0 8px 22px -8px ${ring}` }}
          >
            <Icon className="h-[22px] w-[22px]" strokeWidth={2.1} />
          </div>
        )}
      </div>
    </motion.div>
  )
}
