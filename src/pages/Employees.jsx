import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { employeesAPI } from '@/services/api'
import DataTable from '@/components/shared/DataTable'
import PageLoader from '@/components/shared/PageLoader'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const emptyForm = {
  employeeCode: '', name: '', mobile: '', email: '', address: '', salesTarget: '', password: '', joiningDate: '',
}

export default function Employees() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editEmp, setEditEmp] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const { data: employees, isLoading } = useQuery({ queryKey: ['employees'], queryFn: () => employeesAPI.getAll().then((r) => r.data) })

  const createMutation = useMutation({
    mutationFn: (data) => employeesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      setDialogOpen(false)
      setForm(emptyForm)
      setError('')
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to create employee')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => employeesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      setDialogOpen(false)
      setEditEmp(null)
      setError('')
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to update employee')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => employeesAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  })

  const openCreate = () => {
    setEditEmp(null)
    setForm(emptyForm)
    setError('')
    setDialogOpen(true)
  }

  const openEdit = (emp) => {
    setEditEmp(emp)
    setForm({
      employeeCode: emp.employeeCode, name: emp.name, mobile: emp.mobile, email: emp.email,
      address: emp.address, salesTarget: emp.salesTarget, password: '', joiningDate: emp.joiningDate?.split('T')[0] || '',
    })
    setError('')
    setDialogOpen(true)
  }

  const buildPayload = () => ({
    employeeCode: form.employeeCode.trim(),
    name: form.name.trim(),
    mobile: form.mobile.trim(),
    email: form.email.trim().toLowerCase(),
    address: form.address.trim(),
    salesTarget: Number(form.salesTarget) || 0,
    joiningDate: form.joiningDate || undefined,
    ...(form.password ? { password: form.password } : {}),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!form.employeeCode.trim() || !form.name.trim() || !form.mobile.trim() || !form.email.trim()) {
      setError('Employee ID, name, mobile, and email are required')
      return
    }
    if (!editEmp && !form.password) {
      setError('Password is required for new employees')
      return
    }

    const data = buildPayload()
    editEmp ? updateMutation.mutate({ id: editEmp._id, data }) : createMutation.mutate(data)
  }

  const columns = [
    { key: 'employeeCode', label: 'ID', render: (r) => <span className="font-mono text-xs">{r.employeeCode}</span> },
    { key: 'name', label: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'mobile', label: 'Mobile' },
    { key: 'email', label: 'Email' },
    { key: 'salesTarget', label: 'Target', render: (r) => formatCurrency(r.salesTarget) },
    { key: 'joiningDate', label: 'Joined', render: (r) => new Date(r.joiningDate).toLocaleDateString('en-IN') },
    { key: 'status', label: 'Status', render: (r) => <Badge variant={r.isActive ? 'success' : 'secondary'}>{r.isActive ? 'Active' : 'Inactive'}</Badge> },
    { key: 'actions', label: 'Actions', render: (r) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(r._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
    )},
  ]

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Employee</Button>
      </div>
      <DataTable columns={columns} data={employees} />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editEmp ? 'Edit Employee' : 'Add Employee'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3 text-center">{error}</div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Employee ID</Label><Input value={form.employeeCode} onChange={(e) => setForm({ ...form, employeeCode: e.target.value })} required /></div>
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Mobile</Label><Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required /></div>
              <div><Label>Email</Label><Input type="text" inputMode="email" autoComplete="off" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
            </div>
            {!editEmp && <div><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>}
            <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Sales Target (₹)</Label><Input type="number" value={form.salesTarget} onChange={(e) => setForm({ ...form, salesTarget: e.target.value })} /></div>
              <div><Label>Joining Date</Label><Input type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editEmp ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
