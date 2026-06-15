import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import useLayoutStore from '../store/layoutStore'
import { PLOT_STATUS_COLORS } from '../constants'
import { formatCurrency, PLOT_STATUS } from '@/lib/utils'

export default function PlotDetailsDrawer({ plots, onEditPlot }) {
  const { selectedIds, elements, clearSelection } = useLayoutStore()
  const el = elements.find((e) => e.id === selectedIds[0] && e.type === 'plot')
  const open = !!el

  if (!open) return null

  const meta = el.metadata || {}
  const plot = plots?.find((p) => String(p._id) === String(meta.plotId))
  const status = PLOT_STATUS[meta.status] || PLOT_STATUS.available

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="fixed right-0 top-0 bottom-0 w-96 z-[60] glass-panel border-l border-white/10 shadow-2xl p-6 overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">{meta.plotNumber || 'Plot Details'}</h2>
            <p className="text-sm text-muted-foreground">{meta.plotName || plot?.plotName || '—'}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={clearSelection}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Badge className="mb-4" style={{ backgroundColor: PLOT_STATUS_COLORS[meta.status]?.fill }}>
          {status.label}
        </Badge>

        <div className="space-y-4 text-sm">
          <DetailRow label="Size" value={`${meta.size || plot?.size || '—'} Sqft`} />
          <DetailRow label="Facing" value={meta.facing || plot?.facing || '—'} />
          <DetailRow label="Price" value={formatCurrency(meta.price || plot?.cost || 0)} />
          <DetailRow label="Phase" value={plot?.phase?.name || '—'} />
        </div>

        {plot && onEditPlot && (
          <Button className="w-full mt-6" onClick={() => onEditPlot(plot)}>
            Edit Plot Record
          </Button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-white/5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right max-w-[60%]">{value}</span>
    </div>
  )
}
