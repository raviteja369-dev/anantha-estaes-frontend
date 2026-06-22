import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      'flex h-11 w-full rounded-[var(--radius)] border border-border bg-input px-3.5 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/70 outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 focus:border-primary focus:bg-card focus:ring-[3px] focus:ring-primary/15',
      className
    )}
    ref={ref}
    {...props}
  />
))
Input.displayName = 'Input'

export { Input }
