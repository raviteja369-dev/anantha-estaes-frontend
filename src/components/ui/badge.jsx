import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-border bg-muted text-foreground',
        destructive: 'border-red-200 bg-red-100 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100',
        outline: 'border-border text-foreground bg-background',
        success: 'border-emerald-200 bg-emerald-100 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-50',
        warning: 'border-amber-200 bg-amber-100 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-50',
        info: 'border-blue-200 bg-blue-100 text-blue-900 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-50',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
