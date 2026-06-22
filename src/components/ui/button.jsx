import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius)] text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.97]',
  {
    variants: {
      variant: {
        default:
          'text-white [background-image:var(--gradient-primary)] shadow-[var(--shadow-glow)] hover:brightness-[1.07] hover:shadow-[0_10px_30px_-8px_rgb(79_70_229_/_0.6)]',
        destructive:
          'text-white [background-image:var(--gradient-danger)] shadow-[0_8px_22px_-8px_rgb(239_68_68_/_0.5)] hover:brightness-[1.06]',
        outline:
          'border border-border bg-card text-foreground shadow-[var(--shadow-xs)] hover:border-primary/50 hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/70',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        soft: 'bg-accent text-accent-foreground hover:brightness-[0.98]',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-[10px] px-3 text-xs',
        lg: 'h-12 rounded-[16px] px-7 text-[15px]',
        icon: 'h-10 w-10 rounded-[12px]',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

const Button = forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
})
Button.displayName = 'Button'

export { Button, buttonVariants }
