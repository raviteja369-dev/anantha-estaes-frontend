import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { leadsAPI, employeesAPI, projectsAPI } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import DataTable from '@/components/shared/DataTable'
import PageLoader from '@/components/shared/PageLoader'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import PhoneInput from '@/components/shared/PhoneInput'
import { isValidMobile } from '@/lib/utils'

const statusColors = {
  new: 'secondary', contacted: 'info', qualified: 'info', site_visit: 'warning',
  negotiation: 'warning', converted: 'success', lost: 'destructive',
}

const emptyForm = {
  name: '', mobile: '', email: '', source: 'walk-in', status: 'new', assignedEmployee: '', interestedProject: '',
}

const buildLeadPayload = (form, isAdmin) => {
  const payload = {
    name: form.name.trim(),
    mobile: form.mobile.trim(),
    email: form.email.trim(),
    source: form.source,
    status: form.status,
  }
  if (form.interestedProject) payload.interestedProject = form.interestedProject
  if (isAdmin && form.assignedEmployee) payload.assignedEmployee = form.assignedEmployee
  return payload
}

export default function Leads() {
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const { data: leads, isLoading } = useQuery({ queryKey: ['leads'], queryFn: () => leadsAPI.getAll().then((r) => r.data) })
  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: () => employeesAPI.getAll().then((r) => r.data), enabled: isAdmin })
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: () => projectsAPI.getAll().then((r) => r.data) })

  const createMutation = useMutation({
    mutationFn: (data) => leadsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      setDialogOpen(false)
      setForm(emptyForm)
      setError('')
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to create lead')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => leadsAPI.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => leadsAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  })

  const openDialog = () => {
    setForm(emptyForm)
    setError('')
    setDialogOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.mobile.trim()) {
      setError('Name and mobile are required')
      return
    }
    if (!isValidMobile(form.mobile)) {
      setError('Mobile number must be exactly 10 digits and start with 6-9')
      return
    }
    createMutation.mutate(buildLeadPayload(form, isAdmin))
  }

  const columns = [
    { key: 'name', label: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'mobile', label: 'Mobile' },
    { key: 'email', label: 'Email', render: (r) => r.email || '—' },
    { key: 'source', label: 'Source' },
    { key: 'project', label: 'Project', render: (r) => r.interestedProject?.name || '—' },
    ...(isAdmin ? [{ key: 'employee', label: 'Employee', render: (r) => r.assignedEmployee?.name || '—' }] : []),
    { key: 'status', label: 'Status', render: (r) => (
      isAdmin ? (
        <Badge variant={statusColors[r.status]}>{r.status.replace('_', ' ')}</Badge>
      ) : (
        <Select value={r.status} onValueChange={(v) => updateMutation.mutate({ id: r._id, data: { status: v } })}>
          <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.keys(statusColors).map((s) => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
      )
    )},
    ...(isAdmin ? [{
      key: 'actions', label: '', render: (r) => (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(r._id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ),
    }] : []),
  ]

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openDialog}><Plus className="h-4 w-4" /> Add Lead</Button>
      </div>
      <DataTable columns={columns} data={leads} />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Lead</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3 text-center">{error}</div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div><Label>Mobile</Label><PhoneInput value={form.mobile} onChange={(v) => setForm({ ...form, mobile: v })} required /></div>
            </div>
            <div><Label>Email</Label><Input type="text" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Optional" /></div>
            <div>
              <Label>Interested Project</Label>
              <Select value={form.interestedProject || undefined} onValueChange={(v) => setForm({ ...form, interestedProject: v })}>
                <SelectTrigger><SelectValue placeholder="Select project (optional)" /></SelectTrigger>
                <SelectContent>{projects?.map((p) => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {isAdmin && (
              <div>
                <Label>Assigned Employee</Label>
                <Select value={form.assignedEmployee || undefined} onValueChange={(v) => setForm({ ...form, assignedEmployee: v })}>
                  <SelectTrigger><SelectValue placeholder="Select employee (optional)" /></SelectTrigger>
                  <SelectContent>{employees?.map((e) => <SelectItem key={e._id} value={e._id}>{e.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Lead'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
