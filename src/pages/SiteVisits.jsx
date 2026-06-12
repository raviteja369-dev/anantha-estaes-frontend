import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { siteVisitsAPI, projectsAPI, plotsAPI, employeesAPI } from '@/services/api'
import DataTable from '@/components/shared/DataTable'
import PageLoader from '@/components/shared/PageLoader'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/context/AuthContext'

const emptyForm = {
  project: '', plot: '', scheduledDate: '', notes: '', assignedEmployee: '',
}

export default function SiteVisits() {
  const { user, isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const { data: visits, isLoading } = useQuery({ queryKey: ['site-visits'], queryFn: () => siteVisitsAPI.getAll().then((r) => r.data) })
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: () => projectsAPI.getAll().then((r) => r.data) })
  const { data: plots } = useQuery({ queryKey: ['plots'], queryFn: () => plotsAPI.getAll().then((r) => r.data) })
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['site-visits'] }),
  })

  const openDialog = () => {
    setForm({
      ...emptyForm,
      assignedEmployee: isAdmin ? '' : user?.employeeId || '',
    })
    setError('')
    setDialogOpen(true)
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

    if (!form.project || !form.plot || !form.scheduledDate) {
      setError('Project, plot, and date & time are required')
      return
    }

    const payload = {
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
    { key: 'status', label: 'Status', render: (r) => (
      <Select value={r.status} onValueChange={(v) => updateMutation.mutate({ id: r._id, data: { status: v } })}>
        <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
        <SelectContent>
          {['scheduled', 'completed', 'cancelled', 'rescheduled'].map((s) => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    )},
  ]

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openDialog}><Plus className="h-4 w-4" /> Schedule Visit</Button>
      </div>
      <DataTable columns={columns} data={visits} emptyMessage="No site visits scheduled" />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Schedule Site Visit</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3 text-center">{error}</div>
            )}
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
