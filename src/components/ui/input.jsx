import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      'flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/60 outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200 focus:border-primary/50 focus:ring-0',
      className
    )}
    ref={ref}
    {...props}
  />
))
Input.displayName = 'Input'

export { Input }
