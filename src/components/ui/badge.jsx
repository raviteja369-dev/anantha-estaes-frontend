import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize leading-5 transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-border bg-muted text-foreground',
        outline: 'border-border text-foreground bg-background',
        destructive:
          'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300',
        success:
          'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300',
        info:
          'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300',
        warning:
          'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300',
        violet:
          'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/25 dark:bg-violet-500/10 dark:text-violet-300',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

const dotColor = {
  success: 'bg-emerald-500',
  info: 'bg-blue-500',
  warning: 'bg-amber-500',
  violet: 'bg-violet-500',
  destructive: 'bg-rose-500',
}

function Badge({ className, variant, dot = false, children, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && dotColor[variant] && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60', dotColor[variant])} />
          <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', dotColor[variant])} />
        </span>
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
