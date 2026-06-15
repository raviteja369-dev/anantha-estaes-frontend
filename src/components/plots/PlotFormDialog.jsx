import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function PlotFormDialog({ open, onOpenChange, plot, projects, phases, employees, customers, onSubmit, loading }) {
  const [form, setForm] = useState({
    plotNumber: '', plotName: '', size: '', facing: 'East', cost: '', status: 'available',
    project: '', phase: '', assignedEmployee: '', customer: '', notes: '',
  })

  useEffect(() => {
    if (plot) {
      setForm({
        plotNumber: plot.plotNumber || '',
        plotName: plot.plotName || '',
        size: plot.size || '',
        facing: plot.facing || 'East',
        cost: plot.cost || '',
        status: plot.status || 'available',
        project: plot.project?._id || plot.project || '',
        phase: plot.phase?._id || plot.phase || '',
        assignedEmployee: plot.assignedEmployee?._id || plot.assignedEmployee || '',
        customer: plot.customer?._id || plot.customer || '',
        notes: plot.notes || '',
      })
    } else {
      setForm({
        plotNumber: '', plotName: '', size: '', facing: 'East', cost: '', status: 'available',
        project: projects?.[0]?._id || '', phase: '', assignedEmployee: '', customer: '', notes: '',
      })
    }
  }, [plot, open, projects])

  const filteredPhases = phases?.filter((p) => p.project === form.project || p.project?._id === form.project) || []

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...form,
      size: Number(form.size),
      cost: Number(form.cost),
      assignedEmployee: form.assignedEmployee || undefined,
      customer: form.customer || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{plot ? 'Edit Plot' : 'Add New Plot'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Plot Number</Label>
              <Input value={form.plotNumber} onChange={(e) => setForm({ ...form, plotNumber: e.target.value })} required />
            </div>
            <div>
              <Label>Plot Name</Label>
              <Input value={form.plotName} onChange={(e) => setForm({ ...form, plotName: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Size (sqft)</Label>
              <Input type="number" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} required />
            </div>
            <div>
              <Label>Cost (₹)</Label>
              <Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Facing</Label>
              <Select value={form.facing} onValueChange={(v) => setForm({ ...form, facing: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['North', 'South', 'East', 'West', 'NE', 'NW', 'SE', 'SW'].map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="under_processing">Under Processing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Project</Label>
            <Select value={form.project} onValueChange={(v) => setForm({ ...form, project: v, phase: '' })}>
              <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>
                {projects?.map((p) => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Phase</Label>
            <Select value={form.phase} onValueChange={(v) => setForm({ ...form, phase: v })}>
              <SelectTrigger><SelectValue placeholder="Select phase" /></SelectTrigger>
              <SelectContent>
                {filteredPhases.map((p) => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Assigned Employee</Label>
            <Select value={form.assignedEmployee} onValueChange={(v) => setForm({ ...form, assignedEmployee: v })}>
              <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
              <SelectContent>
                {employees?.map((e) => <SelectItem key={e._id} value={e._id}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {customers?.length > 0 && (
            <div>
              <Label>Customer</Label>
              <Select value={form.customer} onValueChange={(v) => setForm({ ...form, customer: v })}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers.map((c) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : plot ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
