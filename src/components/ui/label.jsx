import { forwardRef } from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/lib/utils'

const Label = forwardRef(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn('mb-1.5 block text-xs font-semibold leading-none text-[#374151] peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)} {...props} />
))
Label.displayName = 'Label'

export { Label }
