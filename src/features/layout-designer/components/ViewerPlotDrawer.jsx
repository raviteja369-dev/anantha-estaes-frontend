import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, User, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import useLayoutStore from '../store/layoutStore'
import { PLOT_STATUS_COLORS } from '../constants'
import { formatCurrency, PLOT_STATUS } from '@/lib/utils'
import { calcArea } from '../constants'

function DetailRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500 flex items-center gap-1.5 shrink-0">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </span>
      <span className="text-sm font-medium text-slate-900 text-right">{value || '—'}</span>
    </div>
  )
}

const BOOKING_STATUSES = ['pending', 'reserved', 'sold']

function resolvePlot(livePlots, layoutPlots, meta, phaseId) {
  const sources = [...(livePlots || []), ...(layoutPlots || [])]
  const seen = new Set()
  const unique = sources.filter((p) => {
    const id = String(p._id)
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })

  return unique.find((p) => {
    if (meta.plotId && String(p._id) === String(meta.plotId)) return true
    if (!meta.plotNumber || p.plotNumber !== meta.plotNumber) return false
    const plotPhase = String(p.phase?._id || p.phase || '')
    const resolvedPhase = String(meta.phase || phaseId || '')
    return !resolvedPhase || plotPhase === resolvedPhase
  })
}

export default function ViewerPlotDrawer({
  livePlots,
  layoutPlots,
  phaseId,
  layoutName,
  phaseName,
  projectName,
  onBookPlot,
  canUpdateStatus = false,
  onUpdateStatus,
  updatingStatus = false,
}) {
  const { selectedIds, elements, clearSelection } = useLayoutStore()
  const [statusDraft, setStatusDraft] = useState('')

  const el = elements.find((e) => e.id === selectedIds[0] && e.type === 'plot')
  const open = !!el

  const meta = el?.metadata || {}
  const plot = resolvePlot(livePlots, layoutPlots, meta, phaseId)
  const statusKey = plot?.status || meta.status || 'available'
  const status = PLOT_STATUS[statusKey] || PLOT_STATUS.available
  const colors = PLOT_STATUS_COLORS[statusKey] || PLOT_STATUS_COLORS.available

  const areaSqft = plot?.size || meta.size || (el ? calcArea(el.width, el.height) : '—')
  const price = plot?.cost ?? meta.price ?? 0
  const isAvailable = statusKey === 'available' && plot?.active !== false
  const canBook = isAvailable && plot?.active === true
  const hasBooking = BOOKING_STATUSES.includes(statusKey) || (plot?.customer && statusKey !== 'available')

  useEffect(() => {
    if (plot) setStatusDraft(plot.status)
  }, [plot])

  const bookingDate = plot?.updatedAt
    ? new Date(plot.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  const sectionTitle = {
    pending: 'Booking Details',
    reserved: 'Reserved Details',
    sold: 'Sold Details',
  }[statusKey]

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="absolute right-0 top-0 bottom-0 w-[340px] z-20 flex flex-col border-l border-slate-200 bg-white shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {plot?.plotNumber || meta.plotNumber || 'Plot Details'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{plot?.plotName || meta.plotName || projectName}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearSelection}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            <Badge className="mb-4 text-white border-0" style={{ backgroundColor: colors.fill }}>
              {status.label}
            </Badge>

            <div className="space-y-0">
              <DetailRow label="Plot Number" value={plot?.plotNumber || meta.plotNumber} />
              <DetailRow label="Plot Size" value={`${plot?.size || meta.size || '—'} sqft`} />
              <DetailRow label="Area" value={typeof areaSqft === 'number' ? `${areaSqft} sqft` : areaSqft} />
              <DetailRow label="Facing" value={plot?.facing || meta.facing} />
              <DetailRow label="Price" value={formatCurrency(price)} />
              <DetailRow label="Current Status" value={status.label} />

              {hasBooking && plot && (
                <>
                  {sectionTitle && (
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 pt-4 pb-1">
                      {sectionTitle}
                    </p>
                  )}
                  <DetailRow label="Customer" value={plot.customer?.name} icon={User} />
                  <DetailRow label="Employee" value={plot.assignedEmployee?.name} icon={Briefcase} />
                  <DetailRow
                    label={statusKey === 'sold' ? 'Sold Date' : 'Booking Date'}
                    value={bookingDate}
                    icon={Calendar}
                  />
                  <DetailRow label="Booking Amount" value={formatCurrency(price)} />
                  <DetailRow label="Notes" value={plot.notes} />
                </>
              )}
            </div>

            {canUpdateStatus && hasBooking && plot && onUpdateStatus && (
              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                <Label className="text-sm font-medium">Update Status</Label>
                <Select value={statusDraft} onValueChange={setStatusDraft}>
                  <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  size="sm"
                  disabled={updatingStatus || statusDraft === plot.status}
                  onClick={() => onUpdateStatus(plot._id, statusDraft)}
                >
                  {updatingStatus ? 'Saving…' : 'Save Status'}
                </Button>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 p-5">
            {canBook && onBookPlot && plot && (
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => onBookPlot(plot)}>
                Book Plot
              </Button>
            )}
            {statusKey === 'available' && plot && !plot.active && (
              <p className="text-xs text-center text-amber-600">
                This plot is not in a published layout yet. Publish the layout to enable booking.
              </p>
            )}
            {statusKey === 'available' && !plot && (
              <p className="text-xs text-center text-slate-500">
                This plot is not linked to the database yet. Save the layout in the designer first.
              </p>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
