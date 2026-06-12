import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { customersAPI, employeesAPI } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import DataTable from '@/components/shared/DataTable'
import PageLoader from '@/components/shared/PageLoader'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

export default function Customers() {
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editCustomer, setEditCustomer] = useState(null)
  const [form, setForm] = useState({ name: '', mobile: '', email: '', aadhaar: '', address: '', assignedEmployee: '' })

  const { data: customers, isLoading } = useQuery({ queryKey: ['customers'], queryFn: () => customersAPI.getAll().then((r) => r.data) })
  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: () => employeesAPI.getAll().then((r) => r.data), enabled: isAdmin })

  const createMutation = useMutation({
    mutationFn: (data) => customersAPI.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); setDialogOpen(false) },
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => customersAPI.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); setDialogOpen(false) },
  })
  const deleteMutation = useMutation({
    mutationFn: (id) => customersAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  })

  const columns = [
    { key: 'name', label: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'mobile', label: 'Mobile' },
    { key: 'email', label: 'Email' },
    { key: 'aadhaar', label: 'Aadhaar', render: (r) => r.aadhaar || '—' },
    { key: 'plot', label: 'Plot', render: (r) => r.plotPurchased?.plotNumber || '—' },
    { key: 'employee', label: 'Employee', render: (r) => r.assignedEmployee?.name || '—' },
    { key: 'followUp', label: 'Follow-up', render: (r) => (
      <Badge variant={r.followUpStatus === 'interested' ? 'success' : r.followUpStatus === 'contacted' ? 'info' : 'secondary'}>
        {r.followUpStatus}
      </Badge>
    )},
    ...(isAdmin ? [{
      key: 'actions', label: 'Actions', render: (r) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditCustomer(r); setForm(r); setDialogOpen(true) }}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(r._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      ),
    }] : []),
  ]

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <Button onClick={() => { setEditCustomer(null); setForm({ name: '', mobile: '', email: '', aadhaar: '', address: '', assignedEmployee: '' }); setDialogOpen(true) }}>
            <Plus className="h-4 w-4" /> Add Customer
          </Button>
        </div>
      )}
      <DataTable columns={columns} data={customers} />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editCustomer ? 'Edit Customer' : 'Add Customer'}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); editCustomer ? updateMutation.mutate({ id: editCustomer._id, data: form }) : createMutation.mutate(form) }} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div><Label>Mobile</Label><Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Aadhaar</Label><Input value={form.aadhaar} onChange={(e) => setForm({ ...form, aadhaar: e.target.value })} /></div>
            </div>
            <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            {isAdmin && (
              <div>
                <Label>Assigned Employee</Label>
                <Select value={form.assignedEmployee} onValueChange={(v) => setForm({ ...form, assignedEmployee: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {employees?.map((e) => <SelectItem key={e._id} value={e._id}>{e.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button type="submit" className="w-full">{editCustomer ? 'Update' : 'Create'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
