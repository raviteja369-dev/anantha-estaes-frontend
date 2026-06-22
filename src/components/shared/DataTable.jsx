import { motion } from 'framer-motion'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DataTable({ columns, data, onRowClick, emptyMessage = 'No records found' }) {
  if (!data?.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-[var(--radius-card)] border border-dashed border-border bg-card/60 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl [background-image:var(--gradient-primary-soft)] text-primary ring-1 ring-primary/10 dark:bg-accent">
          <Inbox className="h-7 w-7" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-border bg-muted/70 backdrop-blur supports-[backdrop-filter]:bg-muted/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground',
                    col.className
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <motion.tr
                key={row._id || i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.025, 0.3) }}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'border-t border-border/60 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-accent/50'
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3.5 text-[13px] text-foreground/90', col.className)}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
