import { motion, AnimatePresence } from 'framer-motion'
import useLayoutStore from '../store/layoutStore'
import { PLOT_STATUS_COLORS } from '../constants'
import { formatCurrency } from '@/lib/utils'

export default function PlotTooltip() {
  const { hoverId, elements } = useLayoutStore()
  const el = elements.find((e) => e.id === hoverId && e.type === 'plot')
  if (!el) return null

  const meta = el.metadata || {}
  const status = PLOT_STATUS_COLORS[meta.status] || PLOT_STATUS_COLORS.available

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 glass-panel rounded-xl border border-white/10 px-4 py-3 shadow-2xl pointer-events-none"
      >
        <div className="flex items-center gap-4 text-sm">
          <div>
            <p className="font-bold">{meta.plotNumber || 'Unnamed Plot'}</p>
            <p className="text-xs text-muted-foreground">{meta.size} Sqft · {formatCurrency(meta.price || 0)}</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-xs space-y-0.5">
            <p><span className="text-muted-foreground">Status:</span> <span style={{ color: status.fill }}>{status.label}</span></p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
