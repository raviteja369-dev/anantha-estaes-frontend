import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }) {
  return <div className={cn('skeleton rounded-[10px]', className)} {...props} />
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-12 w-12 rounded-[14px]" />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 6 }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="border-b border-border bg-muted/50 px-4 py-3.5">
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="divide-y divide-border/60">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-3.5 flex-1" />
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
