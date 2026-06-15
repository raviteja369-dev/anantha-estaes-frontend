import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import SearchableSelect from '@/components/ui/SearchableSelect'
import { formatCurrency } from '@/lib/utils'

function ReadOnlyField({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-900 mt-0.5">{value || '—'}</p>
    </div>
  )
}

/**
 * Creates a booking via plotsAPI.createBooking — status is always Pending.
 */
export default function BookingFormDialog({
  open,
  onOpenChange,
  plot,
  layoutName,
  projectName,
  phaseName,
  customers = [],
  employees = [],
  onSubmit,
  loading,
}) {
  const [customer, setCustomer] = useState('')
  const [assignedEmployee, setAssignedEmployee] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (open && plot) {
      setCustomer('')
      setAssignedEmployee('')
      setNotes('')
    }
  }, [open, plot])

  if (!plot) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!customer || !assignedEmployee) return
    onSubmit({ customer, assignedEmployee, notes })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book Plot — {plot.plotNumber}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <ReadOnlyField label="Plot" value={plot.plotNumber} />
            <ReadOnlyField label="Project" value={projectName || plot.project?.name} />
            <ReadOnlyField label="Phase" value={phaseName || plot.phase?.name} />
            {layoutName && <ReadOnlyField label="Layout" value={layoutName} />}
            <ReadOnlyField label="Area" value={`${plot.size} sqft`} />
            <ReadOnlyField label="Facing" value={plot.facing} />
            <ReadOnlyField label="Price" value={formatCurrency(plot.cost)} />
          </div>

          <p className="text-xs text-slate-500 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
            Booking will be created with status <strong>Pending</strong>. An admin or authorized employee can update it later.
          </p>

          <div>
            <Label>Customer *</Label>
            <SearchableSelect
              options={customers}
              value={customer}
              onChange={setCustomer}
              placeholder="Select customer"
              searchPlaceholder="Search customers…"
              getOptionLabel={(c) => `${c.name}${c.mobile ? ` — ${c.mobile}` : ''}`}
              getOptionValue={(c) => c._id}
              required
            />
          </div>

          <div>
            <Label>Employee *</Label>
            <SearchableSelect
              options={employees}
              value={assignedEmployee}
              onChange={setAssignedEmployee}
              placeholder="Select employee"
              searchPlaceholder="Search employees…"
              getOptionLabel={(e) => e.name}
              getOptionValue={(e) => e._id}
              required
            />
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional booking notes"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={loading || !customer || !assignedEmployee}>
              {loading ? 'Creating…' : 'Confirm Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
