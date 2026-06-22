import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Pencil, UserPlus, CheckCircle2 } from 'lucide-react'
import { leadsAPI, employeesAPI, projectsAPI } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import DataTable from '@/components/shared/DataTable'
import PageLoader from '@/components/shared/PageLoader'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import PhoneInput from '@/components/shared/PhoneInput'
import { isValidMobile, cn } from '@/lib/utils'

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'site_visit', label: 'Site Visit' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'converted', label: 'Completed' },
  { value: 'lost', label: 'Lost' },
]

const emptyForm = {
  name: '', mobile: '', email: '', source: 'walk-in', status: 'new', assignedEmployee: '', interestedProject: '',
}

const buildLeadPayload = (form, isAdmin) => ({
  name: form.name.trim(),
  mobile: form.mobile.trim(),
  email: form.email.trim(),
  source: form.source,
  status: form.status,
  interestedProject: form.interestedProject,
  ...(isAdmin ? { assignedEmployee: form.assignedEmployee } : {}),
})

export default function Leads() {
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editLead, setEditLead] = useState(null)
  const [editForm, setEditForm] = useState({ status: 'new', notes: '' })
  const [remarkError, setRemarkError] = useState(false)
  const [editError, setEditError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [convertTarget, setConvertTarget] = useState(null)
  const [convertError, setConvertError] = useState('')

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      setEditOpen(false)
      setEditLead(null)
      setRemarkError(false)
      setEditError('')
    },
    onError: (err) => {
      setEditError(err.response?.data?.message || 'Failed to update lead')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => leadsAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  })

  const convertMutation = useMutation({
    mutationFn: (id) => leadsAPI.convert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setConvertTarget(null)
      setConvertError('')
    },
    onError: (err) => setConvertError(err.response?.data?.message || 'Failed to convert lead'),
  })

  const openConvert = (lead) => {
    setConvertTarget(lead)
    setConvertError('')
  }

  const openDialog = () => {
    setForm(emptyForm)
    setError('')
    setDialogOpen(true)
  }

  const openEdit = (lead) => {
    if (!isAdmin) return
    setEditLead(lead)
    setEditForm({ status: lead.status || 'new', notes: lead.notes || '' })
    setRemarkError(false)
    setEditError('')
    setEditOpen(true)
  }

  const handleEditStatusChange = (status) => {
    setEditForm((prev) => ({ ...prev, status }))
    if (status !== 'converted') {
      setRemarkError(false)
      setEditError('')
    }
  }

  const handleEditDone = () => {
    setEditError('')
    if (editForm.status === 'converted' && !editForm.notes.trim()) {
      setRemarkError(true)
      setEditError('Please write a remark before marking this lead as completed.')
      return
    }
    updateMutation.mutate({
      id: editLead._id,
      data: { status: editForm.status, notes: editForm.notes.trim() },
    })
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
    if (!form.email.trim()) {
      setError('Email is required')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Enter a valid email address')
      return
    }
    if (!form.interestedProject) {
      setError('Interested project is required')
      return
    }
    if (isAdmin && !form.assignedEmployee) {
      setError('Assigned employee is required')
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
    { key: 'employee', label: 'Employee', render: (r) => r.assignedEmployee?.name || '—' },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1">
          {r.convertedCustomer ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Customer
            </span>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={(e) => { e.stopPropagation(); openConvert(r) }}
              title="Convert to customer"
            >
              <UserPlus className="h-3.5 w-3.5" /> Convert
            </Button>
          )}
          {isAdmin && (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); openEdit(r) }} title="Update status">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(r._id) }}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openDialog}><Plus className="h-4 w-4" /> Add Lead</Button>
      </div>
      <DataTable columns={columns} data={leads} onRowClick={isAdmin ? openEdit : undefined} />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Lead Status</DialogTitle>
          </DialogHeader>
          {editLead && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm grid grid-cols-2 gap-2">
                <span>Name: <strong>{editLead.name}</strong></span>
                <span>Project: <strong>{editLead.interestedProject?.name || '—'}</strong></span>
                <span>Employee: <strong>{editLead.assignedEmployee?.name || '—'}</strong></span>
                <span>Mobile: <strong>{editLead.mobile}</strong></span>
              </div>

              {editError && (
                <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3 text-center">{editError}</div>
              )}

              <div>
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={handleEditStatusChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>
                  Remark
                  {editForm.status === 'converted' && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Textarea
                  value={editForm.notes}
                  onChange={(e) => {
                    setEditForm((prev) => ({ ...prev, notes: e.target.value }))
                    if (e.target.value.trim()) setRemarkError(false)
                  }}
                  placeholder={editForm.status === 'converted' ? 'Required — describe the outcome when completing this lead' : 'Optional notes'}
                  className={cn(
                    'mt-1',
                    remarkError && 'border-destructive ring-2 ring-destructive/30 focus-visible:ring-destructive'
                  )}
                  rows={4}
                />
                {remarkError && (
                  <p className="text-xs text-destructive mt-1.5 font-medium">
                    Remark is required when status is Completed.
                  </p>
                )}
              </div>

              <Button className="w-full" onClick={handleEditDone} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Done'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!convertTarget} onOpenChange={(open) => { if (!open) { setConvertTarget(null); setConvertError('') } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Convert Lead to Customer</DialogTitle></DialogHeader>
          {convertTarget && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                A customer record will be created from this lead and it will appear directly in the{' '}
                <span className="font-medium text-foreground">Customers</span> list. The lead will be marked as completed.
              </p>
              <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm grid grid-cols-2 gap-2">
                <span>Name: <strong>{convertTarget.name}</strong></span>
                <span>Mobile: <strong>{convertTarget.mobile}</strong></span>
                <span>Email: <strong>{convertTarget.email || '—'}</strong></span>
                <span>Employee: <strong>{convertTarget.assignedEmployee?.name || '—'}</strong></span>
              </div>
              {convertError && (
                <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3 text-center">{convertError}</div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setConvertTarget(null)} disabled={convertMutation.isPending}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => convertMutation.mutate(convertTarget._id)} disabled={convertMutation.isPending}>
                  {convertMutation.isPending ? 'Converting...' : 'Convert to Customer'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
            <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
            <div>
              <Label>Interested Project *</Label>
              <Select value={form.interestedProject || undefined} onValueChange={(v) => setForm({ ...form, interestedProject: v })} required>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>{projects?.map((p) => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {isAdmin && (
              <div>
                <Label>Assigned Employee *</Label>
                <Select value={form.assignedEmployee || undefined} onValueChange={(v) => setForm({ ...form, assignedEmployee: v })} required>
                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
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
