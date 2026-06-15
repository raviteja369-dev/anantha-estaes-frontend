import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil } from 'lucide-react'
import { siteVisitsAPI, projectsAPI, plotsAPI, employeesAPI, customersAPI } from '@/services/api'
import DataTable from '@/components/shared/DataTable'
import PageLoader from '@/components/shared/PageLoader'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const VISIT_STATUSES = ['scheduled', 'completed', 'cancelled', 'rescheduled']

const statusVariant = {
  scheduled: 'info',
  completed: 'success',
  cancelled: 'destructive',
  rescheduled: 'warning',
}

const emptyForm = {
  customer: '', project: '', plot: '', scheduledDate: '', notes: '', assignedEmployee: '',
}

export default function SiteVisits() {
  const { user, isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editVisit, setEditVisit] = useState(null)
  const [editForm, setEditForm] = useState({ status: 'scheduled', feedback: '' })
  const [remarkError, setRemarkError] = useState(false)
  const [editError, setEditError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const { data: visits, isLoading } = useQuery({ queryKey: ['site-visits'], queryFn: () => siteVisitsAPI.getAll().then((r) => r.data) })
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: () => projectsAPI.getAll().then((r) => r.data) })
  const { data: plots } = useQuery({ queryKey: ['plots'], queryFn: () => plotsAPI.getAll().then((r) => r.data) })
  const { data: customers } = useQuery({ queryKey: ['customers'], queryFn: () => customersAPI.getAll().then((r) => r.data) })
  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesAPI.getAll().then((r) => r.data),
    enabled: isAdmin,
  })

  const filteredPlots = useMemo(() => {
    if (!form.project) return plots || []
    return plots?.filter((p) => (p.project?._id || p.project) === form.project) || []
  }, [plots, form.project])

  const createMutation = useMutation({
    mutationFn: (data) => siteVisitsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-visits'] })
      setDialogOpen(false)
      setForm(emptyForm)
      setError('')
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to schedule site visit')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => siteVisitsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-visits'] })
      setEditOpen(false)
      setEditVisit(null)
      setRemarkError(false)
      setEditError('')
    },
    onError: (err) => {
      setEditError(err.response?.data?.message || 'Failed to update site visit')
    },
  })

  const openDialog = () => {
    setForm({
      ...emptyForm,
      assignedEmployee: isAdmin ? '' : user?.employeeId || '',
    })
    setError('')
    setDialogOpen(true)
  }

  const openEdit = (visit) => {
    setEditVisit(visit)
    setEditForm({
      status: visit.status || 'scheduled',
      feedback: visit.feedback || '',
    })
    setRemarkError(false)
    setEditError('')
    setEditOpen(true)
  }

  const handleEditStatusChange = (status) => {
    setEditForm((prev) => ({ ...prev, status }))
    if (status !== 'completed') {
      setRemarkError(false)
      setEditError('')
    }
  }

  const handleEditFeedbackChange = (value) => {
    setEditForm((prev) => ({ ...prev, feedback: value }))
    if (value.trim()) setRemarkError(false)
  }

  const handleEditDone = () => {
    setEditError('')
    if (editForm.status === 'completed' && !editForm.feedback.trim()) {
      setRemarkError(true)
      setEditError('Please write a remark before marking this visit as completed.')
      return
    }
    updateMutation.mutate({
      id: editVisit._id,
      data: {
        status: editForm.status,
        feedback: editForm.feedback.trim(),
      },
    })
  }

  const handleCustomerChange = (customerId) => {
    const customer = customers?.find((c) => c._id === customerId)
    const purchasedPlot = customer?.plotPurchased
    const plotId = purchasedPlot?._id || purchasedPlot || ''
    const plot = plots?.find((p) => p._id === plotId)

    setForm((prev) => ({
      ...prev,
      customer: customerId,
      plot: plotId,
      project: plot?.project?._id || plot?.project || prev.project,
    }))
  }

  const handlePlotChange = (plotId) => {
    const plot = plots?.find((p) => p._id === plotId)
    setForm((prev) => ({
      ...prev,
      plot: plotId,
      project: plot?.project?._id || plot?.project || prev.project,
      assignedEmployee: plot?.assignedEmployee?._id || plot?.assignedEmployee || prev.assignedEmployee,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!form.customer) {
      setError('Please select a customer')
      return
    }
    if (!form.project || !form.plot || !form.scheduledDate) {
      setError('Project, plot, and date & time are required')
      return
    }

    const payload = {
      customer: form.customer,
      project: form.project,
      plot: form.plot,
      scheduledDate: new Date(form.scheduledDate).toISOString(),
      notes: form.notes.trim(),
    }
    if (form.assignedEmployee) payload.assignedEmployee = form.assignedEmployee

    createMutation.mutate(payload)
  }

  const columns = [
    { key: 'date', label: 'Date', render: (r) => new Date(r.scheduledDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) },
    { key: 'project', label: 'Project', render: (r) => r.project?.name || '—' },
    { key: 'plot', label: 'Plot', render: (r) => r.plot?.plotNumber || '—' },
    { key: 'customer', label: 'Customer', render: (r) => r.customer?.name || r.lead?.name || '—' },
    { key: 'employee', label: 'Employee', render: (r) => r.assignedEmployee?.name || '—' },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <Badge variant={statusVariant[r.status] || 'secondary'}>
          {r.status}
        </Badge>
      ),
    },
    {
      key: 'remark',
      label: 'Remark',
      render: (r) => (
        <span className="text-muted-foreground text-xs max-w-[180px] truncate block" title={r.feedback}>
          {r.feedback || '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => openEdit(r)}>
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      ),
    },
  ]

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openDialog}><Plus className="h-4 w-4" /> Schedule Visit</Button>
      </div>
      <DataTable columns={columns} data={visits} emptyMessage="No site visits scheduled" onRowClick={openEdit} />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Site Visit</DialogTitle>
          </DialogHeader>

          {editVisit && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm grid grid-cols-2 gap-2">
                <span>Customer: <strong>{editVisit.customer?.name || editVisit.lead?.name}</strong></span>
                <span>Plot: <strong>{editVisit.plot?.plotNumber || '—'}</strong></span>
                <span>Project: <strong>{editVisit.project?.name || '—'}</strong></span>
                <span>Date: <strong>{new Date(editVisit.scheduledDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</strong></span>
              </div>

              {editError && (
                <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3 text-center">{editError}</div>
              )}

              <div>
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={handleEditStatusChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VISIT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>
                  Remark
                  {editForm.status === 'completed' && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Textarea
                  value={editForm.feedback}
                  onChange={(e) => handleEditFeedbackChange(e.target.value)}
                  placeholder={editForm.status === 'completed' ? 'Required — describe the visit outcome' : 'Optional notes about this visit'}
                  className={cn(
                    'mt-1',
                    remarkError && 'border-destructive ring-2 ring-destructive/30 focus-visible:ring-destructive'
                  )}
                  rows={4}
                />
                {remarkError && (
                  <p className="text-xs text-destructive mt-1.5 font-medium">
                    Remark is required when status is completed.
                  </p>
                )}
              </div>

              <Button
                className="w-full"
                onClick={handleEditDone}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Saving...' : 'Done'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Schedule Site Visit</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3 text-center">{error}</div>
            )}
            <div>
              <Label>Customer</Label>
              <Select
                value={form.customer || undefined}
                onValueChange={handleCustomerChange}
              >
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers?.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name} — {c.mobile}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Project</Label>
              <Select
                value={form.project || undefined}
                onValueChange={(v) => setForm({ ...form, project: v, plot: '' })}
              >
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projects?.map((p) => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Plot</Label>
              <Select
                value={form.plot || undefined}
                onValueChange={handlePlotChange}
                disabled={!form.project}
              >
                <SelectTrigger><SelectValue placeholder={form.project ? 'Select plot' : 'Select project first'} /></SelectTrigger>
                <SelectContent>
                  {filteredPlots.map((p) => (
                    <SelectItem key={p._id} value={p._id}>{p.plotNumber} — {p.size} sqft</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isAdmin && (
              <div>
                <Label>Assigned Employee</Label>
                <Select
                  value={form.assignedEmployee || undefined}
                  onValueChange={(v) => setForm({ ...form, assignedEmployee: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>
                    {employees?.map((e) => <SelectItem key={e._id} value={e._id}>{e.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Date & Time</Label>
              <Input
                type="datetime-local"
                value={form.scheduledDate}
                onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Optional notes"
              />
            </div>
            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Scheduling...' : 'Schedule'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
