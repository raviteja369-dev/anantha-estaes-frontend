import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Download, FileText } from 'lucide-react'
import { paymentsAPI, customersAPI, plotsAPI } from '@/services/api'
import DataTable from '@/components/shared/DataTable'
import PageLoader from '@/components/shared/PageLoader'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

export default function Payments() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [txnDialog, setTxnDialog] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [form, setForm] = useState({ customer: '', plot: '', totalAmount: '', bookingAmount: '', downPayment: '' })
  const [txnForm, setTxnForm] = useState({ amount: '', type: 'emi', notes: '' })

  const { data: payments, isLoading } = useQuery({ queryKey: ['payments'], queryFn: () => paymentsAPI.getAll().then((r) => r.data) })
  const { data: customers } = useQuery({ queryKey: ['customers'], queryFn: () => customersAPI.getAll().then((r) => r.data) })
  const { data: plots } = useQuery({ queryKey: ['plots'], queryFn: () => plotsAPI.getAll().then((r) => r.data) })

  const createMutation = useMutation({
    mutationFn: (data) => paymentsAPI.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['payments'] }); setDialogOpen(false) },
  })
  const txnMutation = useMutation({
    mutationFn: ({ id, data }) => paymentsAPI.addTransaction(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['payments'] }); setTxnDialog(false) },
  })

  const downloadPDF = async (id, type) => {
    const res = await paymentsAPI.downloadPDF(id, type)
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = `${type}-${id}.pdf`
    a.click()
  }

  const columns = [
    { key: 'customer', label: 'Customer', render: (r) => <span className="font-medium">{r.customer?.name}</span> },
    { key: 'plot', label: 'Plot', render: (r) => r.plot?.plotNumber },
    { key: 'total', label: 'Total', render: (r) => formatCurrency(r.totalAmount) },
    { key: 'paid', label: 'Paid', render: (r) => formatCurrency(r.totalPaid) },
    { key: 'remaining', label: 'Remaining', render: (r) => formatCurrency(r.remainingAmount) },
    { key: 'status', label: 'Status', render: (r) => (
      <Badge variant={r.status === 'completed' ? 'success' : r.status === 'defaulted' ? 'destructive' : 'warning'}>{r.status}</Badge>
    )},
    { key: 'actions', label: 'Actions', render: (r) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setSelectedPayment(r); setTxnDialog(true) }}>+ Payment</Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => downloadPDF(r._id, 'receipt')}><Download className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => downloadPDF(r._id, 'agreement')}><FileText className="h-3.5 w-3.5" /></Button>
      </div>
    )},
  ]

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> New Payment</Button>
      </div>
      <DataTable columns={columns} data={payments} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Payment Record</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ ...form, totalAmount: Number(form.totalAmount), bookingAmount: Number(form.bookingAmount), downPayment: Number(form.downPayment), totalPaid: Number(form.bookingAmount) + Number(form.downPayment) }) }} className="space-y-3">
            <div><Label>Customer</Label>
              <Select value={form.customer} onValueChange={(v) => setForm({ ...form, customer: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{customers?.map((c) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Plot</Label>
              <Select value={form.plot} onValueChange={(v) => setForm({ ...form, plot: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{plots?.map((p) => <SelectItem key={p._id} value={p._id}>{p.plotNumber}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Total (₹)</Label><Input type="number" value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} required /></div>
              <div><Label>Booking (₹)</Label><Input type="number" value={form.bookingAmount} onChange={(e) => setForm({ ...form, bookingAmount: e.target.value })} /></div>
              <div><Label>Down Pay (₹)</Label><Input type="number" value={form.downPayment} onChange={(e) => setForm({ ...form, downPayment: e.target.value })} /></div>
            </div>
            <Button type="submit" className="w-full">Create</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={txnDialog} onOpenChange={setTxnDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Transaction</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); txnMutation.mutate({ id: selectedPayment._id, data: { ...txnForm, amount: Number(txnForm.amount) } }) }} className="space-y-3">
            <div><Label>Amount (₹)</Label><Input type="number" value={txnForm.amount} onChange={(e) => setTxnForm({ ...txnForm, amount: e.target.value })} required /></div>
            <div><Label>Type</Label>
              <Select value={txnForm.type} onValueChange={(v) => setTxnForm({ ...txnForm, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="booking">Booking</SelectItem>
                  <SelectItem value="down_payment">Down Payment</SelectItem>
                  <SelectItem value="emi">EMI</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">Record Payment</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
