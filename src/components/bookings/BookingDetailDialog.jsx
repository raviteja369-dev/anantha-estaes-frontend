import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, PLOT_STATUS } from '@/lib/utils'

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900 text-right max-w-[55%]">{value || '—'}</span>
    </div>
  )
}

const STATUS_BADGE = {
  pending: 'info',
  reserved: 'warning',
  sold: 'destructive',
  available: 'success',
}

export default function BookingDetailDialog({
  open,
  onOpenChange,
  plot,
  layoutName,
  canUpdateStatus = false,
  onUpdateStatus,
  updating = false,
}) {
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (plot) setStatus(plot.status)
  }, [plot])

  if (!plot) return null

  const statusInfo = PLOT_STATUS[plot.status] || { label: plot.status }
  const isSold = plot.status === 'sold'

  const handleSaveStatus = () => {
    if (!status || status === plot.status) return
    onUpdateStatus?.(status)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            Booking — {plot.plotNumber}
            <Badge variant={STATUS_BADGE[plot.status] || 'secondary'}>
              {statusInfo.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-1">
          <DetailRow label="Plot Number" value={plot.plotNumber} />
          <DetailRow label="Project" value={plot.project?.name} />
          <DetailRow label="Phase" value={plot.phase?.name} />
          {layoutName && <DetailRow label="Layout" value={layoutName} />}
          <DetailRow label="Plot Size" value={`${plot.size} sqft`} />
          <DetailRow label="Facing" value={plot.facing} />
          <DetailRow label="Customer Name" value={plot.customer?.name} />
          <DetailRow label="Employee Name" value={plot.assignedEmployee?.name} />
          <DetailRow
            label="Booking Date"
            value={plot.updatedAt ? new Date(plot.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
          />
          <DetailRow label={isSold ? 'Final Amount' : 'Booking Amount'} value={formatCurrency(plot.cost)} />
          <DetailRow label="Current Status" value={statusInfo.label} />
          <DetailRow label="Notes" value={plot.notes} />
        </div>

        {canUpdateStatus && plot.status !== 'available' && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
            <Label className="text-sm font-medium">Update Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={updating || status === plot.status}
              onClick={handleSaveStatus}
            >
              {updating ? 'Saving…' : 'Save Status'}
            </Button>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
