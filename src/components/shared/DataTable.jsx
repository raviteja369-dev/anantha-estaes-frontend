import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function DataTable({ columns, data, onRowClick, emptyMessage = 'No data found' }) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {columns.map((col) => (
              <th key={col.key} className={cn('px-4 py-3 text-left font-medium text-muted-foreground', col.className)}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <motion.tr
              key={row._id || i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'border-b border-border last:border-0 transition-colors',
                onRowClick && 'cursor-pointer hover:bg-muted/50'
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('px-4 py-3', col.className)}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
