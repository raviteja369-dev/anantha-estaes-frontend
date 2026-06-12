import { motion } from 'framer-motion'
import { cn, formatCurrency, PLOT_STATUS } from '@/lib/utils'

export default function PlotCard({ plot, selected, onClick, draggable, onDragStart, onDragEnd }) {
  const statusInfo = PLOT_STATUS[plot.status] || PLOT_STATUS.available

  return (
    <motion.div
      layout
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick?.(plot)}
      className={cn(
        'relative flex flex-col items-center justify-center rounded-xl border-2 p-3 cursor-pointer transition-all duration-200 min-w-[100px] min-h-[90px] shadow-sm hover:shadow-md',
        statusInfo.class,
        selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        draggable && 'cursor-grab active:cursor-grabbing'
      )}
    >
      <p className="text-sm font-bold">{plot.plotNumber}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{plot.size} sqft</p>
      <p className="text-xs font-semibold mt-1">{formatCurrency(plot.cost)}</p>
    </motion.div>
  )
}
