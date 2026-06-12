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

import PhoneInput from '@/components/shared/PhoneInput'

import { isValidMobile } from '@/lib/utils'



const emptyForm = { name: '', mobile: '', email: '', address: '', assignedEmployee: '' }



export default function Customers() {

  const { isAdmin } = useAuth()

  const queryClient = useQueryClient()

  const [dialogOpen, setDialogOpen] = useState(false)

  const [editCustomer, setEditCustomer] = useState(null)

  const [form, setForm] = useState(emptyForm)

  const [error, setError] = useState('')



  const { data: customers, isLoading } = useQuery({ queryKey: ['customers'], queryFn: () => customersAPI.getAll().then((r) => r.data) })

  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: () => employeesAPI.getAll().then((r) => r.data), enabled: isAdmin })



  const createMutation = useMutation({

    mutationFn: (data) => customersAPI.create(data),

    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); setDialogOpen(false); setError('') },

    onError: (err) => setError(err.response?.data?.message || 'Failed to create customer'),

  })

  const updateMutation = useMutation({

    mutationFn: ({ id, data }) => customersAPI.update(id, data),

    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); setDialogOpen(false); setError('') },

    onError: (err) => setError(err.response?.data?.message || 'Failed to update customer'),

  })

  const deleteMutation = useMutation({

    mutationFn: (id) => customersAPI.delete(id),

    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),

  })



  const openCreate = () => {

    setEditCustomer(null)

    setForm(emptyForm)

    setError('')

    setDialogOpen(true)

  }



  const openEdit = (customer) => {

    setEditCustomer(customer)

    setForm({

      name: customer.name,

      mobile: customer.mobile,

      email: customer.email || '',

      address: customer.address || '',

      assignedEmployee: customer.assignedEmployee?._id || customer.assignedEmployee || '',

    })

    setError('')

    setDialogOpen(true)

  }



  const buildPayload = () => {

    const payload = {

      name: form.name.trim(),

      mobile: form.mobile.trim(),

      email: form.email.trim(),

      address: form.address.trim(),

    }

    if (isAdmin && form.assignedEmployee) {

      payload.assignedEmployee = form.assignedEmployee

    }

    return payload

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

    const data = buildPayload()

    editCustomer ? updateMutation.mutate({ id: editCustomer._id, data }) : createMutation.mutate(data)

  }



  const columns = [

    { key: 'name', label: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },

    { key: 'mobile', label: 'Mobile' },

    { key: 'email', label: 'Email', render: (r) => r.email || '—' },

    ...(isAdmin ? [{ key: 'employee', label: 'Employee', render: (r) => r.assignedEmployee?.name || '—' }] : []),

    { key: 'followUp', label: 'Follow-up', render: (r) => (

      <Badge variant={r.followUpStatus === 'interested' ? 'success' : r.followUpStatus === 'contacted' ? 'info' : 'secondary'}>

        {r.followUpStatus}

      </Badge>

    )},

    {

      key: 'actions', label: 'Actions', render: (r) => (

        <div className="flex gap-1">

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}>

            <Pencil className="h-3.5 w-3.5" />

          </Button>

          {isAdmin && (

            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(r._id)}>

              <Trash2 className="h-3.5 w-3.5" />

            </Button>

          )}

        </div>

      ),

    },

  ]



  if (isLoading) return <PageLoader />



  return (

    <div className="space-y-4">

      <div className="flex justify-end">

        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Customer</Button>

      </div>

      <DataTable columns={columns} data={customers} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>

        <DialogContent>

          <DialogHeader><DialogTitle>{editCustomer ? 'Edit Customer' : 'Add Customer'}</DialogTitle></DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3">

            {error && <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3 text-center">{error}</div>}

            <div className="grid grid-cols-2 gap-3">

              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>

              <div><Label>Mobile</Label><PhoneInput value={form.mobile} onChange={(v) => setForm({ ...form, mobile: v })} required /></div>

            </div>

            <div><Label>Email</Label><Input type="text" inputMode="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Optional" /></div>

            <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>

            {isAdmin && (

              <div>

                <Label>Assigned Employee</Label>

                <Select value={form.assignedEmployee || undefined} onValueChange={(v) => setForm({ ...form, assignedEmployee: v })}>

                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>

                  <SelectContent>

                    {employees?.map((e) => <SelectItem key={e._id} value={e._id}>{e.name}</SelectItem>)}

                  </SelectContent>

                </Select>

              </div>

            )}

            <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>

              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editCustomer ? 'Update' : 'Create'}

            </Button>

          </form>

        </DialogContent>

      </Dialog>

    </div>

  )

}


