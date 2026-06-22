import { motion } from 'framer-motion'
import { Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', description, actionLabel, onAction }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center gap-4 rounded-[var(--radius-card)] border border-dashed border-border bg-card/60 px-6 py-20 text-center"
    >
      <div className="relative">
        <div aria-hidden className="absolute inset-0 -z-10 rounded-full blur-2xl [background-image:var(--gradient-primary)] opacity-20" />
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl [background-image:var(--gradient-primary-soft)] text-primary ring-1 ring-primary/10 dark:bg-accent">
          <Icon className="h-7 w-7" />
        </div>
      </div>
      <div className="space-y-1.5">
        <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
        {description && <p className="mx-auto max-w-sm text-sm text-muted-foreground">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-1">{actionLabel}</Button>
      )}
    </motion.div>
  )
}
