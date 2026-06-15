import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Download, FileText } from 'lucide-react'
import { paymentsAPI, customersAPI, plotsAPI, projectsAPI, phasesAPI } from '@/services/api'
import DataTable from '@/components/shared/DataTable'
import PageLoader from '@/components/shared/PageLoader'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

const emptyForm = {
  customer: '',
  project: '',
  phase: '',
  plot: '',
  totalAmount: '',
  bookingAmount: '',
  downPayment: '',
}

export default function Payments() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [txnDialog, setTxnDialog] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [txnForm, setTxnForm] = useState({ amount: '', type: 'emi', notes: '' })
  const [formError, setFormError] = useState('')

  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsAPI.getAll().then((r) => r.data),
  })
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersAPI.getAll().then((r) => r.data),
  })
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsAPI.getAll().then((r) => r.data),
  })
  const { data: phases } = useQuery({
    queryKey: ['phases', form.project],
    queryFn: () => phasesAPI.getByProject(form.project).then((r) => r.data),
    enabled: !!form.project,
  })
  const { data: phasePlots } = useQuery({
    queryKey: ['plots', form.project, form.phase],
    queryFn: () => plotsAPI.getAll({ project: form.project, phase: form.phase }).then((r) => r.data),
    enabled: !!form.project && !!form.phase,
  })

  const selectedPlot = useMemo(
    () => phasePlots?.find((p) => p._id === form.plot),
    [phasePlots, form.plot]
  )

  const createMutation = useMutation({
    mutationFn: (data) => paymentsAPI.create(data),
    onSuccess: async (res) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      setDialogOpen(false)
      setForm(emptyForm)
      setFormError('')
      try {
        const pdfRes = await paymentsAPI.downloadPDF(res.data._id, 'receipt')
        const url = window.URL.createObjectURL(new Blob([pdfRes.data]))
        const a = document.createElement('a')
        a.href = url
        a.download = `receipt-${res.data._id}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
      } catch {
        // PDF download is optional if it fails
      }
    },
    onError: (err) => setFormError(err.response?.data?.message || 'Failed to create payment'),
  })

  const txnMutation = useMutation({
    mutationFn: ({ id, data }) => paymentsAPI.addTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      setTxnDialog(false)
    },
  })

  const openCreateDialog = () => {
    setForm(emptyForm)
    setFormError('')
    setDialogOpen(true)
  }

  const handleProjectChange = (projectId) => {
    setForm((prev) => ({ ...prev, project: projectId, phase: '', plot: '', totalAmount: '' }))
  }

  const handlePhaseChange = (phaseId) => {
    setForm((prev) => ({ ...prev, phase: phaseId, plot: '', totalAmount: '' }))
  }

  const handlePlotChange = (plotId) => {
    const plot = phasePlots?.find((p) => p._id === plotId)
    setForm((prev) => ({
      ...prev,
      plot: plotId,
      totalAmount: plot ? String(plot.cost) : '',
    }))
  }

  const handleCreate = (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.customer || !form.project || !form.phase || !form.plot) {
      setFormError('Customer, project, phase, and plot are required')
      return
    }
    const bookingAmount = Number(form.bookingAmount) || 0
    const downPayment = Number(form.downPayment) || 0
    createMutation.mutate({
      customer: form.customer,
      plot: form.plot,
      totalAmount: Number(form.totalAmount),
      bookingAmount,
      downPayment,
      totalPaid: bookingAmount + downPayment,
    })
  }

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
    { key: 'project', label: 'Project', render: (r) => r.plot?.project?.name || '—' },
    { key: 'phase', label: 'Phase', render: (r) => r.plot?.phase?.name || '—' },
    { key: 'plot', label: 'Plot', render: (r) => r.plot?.plotNumber || '—' },
    { key: 'total', label: 'Total', render: (r) => formatCurrency(r.totalAmount) },
    { key: 'paid', label: 'Paid', render: (r) => formatCurrency(r.totalPaid) },
    { key: 'remaining', label: 'Remaining', render: (r) => formatCurrency(r.remainingAmount) },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <Badge variant={r.status === 'completed' ? 'success' : r.status === 'defaulted' ? 'destructive' : 'warning'}>
          {r.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setSelectedPayment(r); setTxnDialog(true) }}>
            + Payment
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => downloadPDF(r._id, 'receipt')} title="Download receipt">
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => downloadPDF(r._id, 'agreement')} title="Download agreement">
            <FileText className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ]

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreateDialog}><Plus className="h-4 w-4" /> New Payment</Button>
      </div>
      <DataTable columns={columns} data={payments} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Payment Record</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            {formError && (
              <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3 text-center">{formError}</div>
            )}

            <div>
              <Label>Customer *</Label>
              <Select value={form.customer || undefined} onValueChange={(v) => setForm({ ...form, customer: v })}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>{customers?.map((c) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Project *</Label>
                <Select value={form.project || undefined} onValueChange={handleProjectChange}>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>{projects?.map((p) => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Phase *</Label>
                <Select
                  value={form.phase || undefined}
                  onValueChange={handlePhaseChange}
                  disabled={!form.project}
                >
                  <SelectTrigger><SelectValue placeholder={form.project ? 'Select phase' : 'Select project first'} /></SelectTrigger>
                  <SelectContent>{phases?.map((ph) => <SelectItem key={ph._id} value={ph._id}>{ph.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Plot *</Label>
              <Select
                value={form.plot || undefined}
                onValueChange={handlePlotChange}
                disabled={!form.phase}
              >
                <SelectTrigger><SelectValue placeholder={form.phase ? 'Select plot' : 'Select phase first'} /></SelectTrigger>
                <SelectContent>
                  {phasePlots?.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.plotNumber} — {p.size} sqft — {formatCurrency(p.cost)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPlot && (
              <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs text-indigo-900 grid grid-cols-2 gap-1">
                <span>Project: <strong>{selectedPlot.project?.name}</strong></span>
                <span>Phase: <strong>{selectedPlot.phase?.name}</strong></span>
                <span>Plot: <strong>{selectedPlot.plotNumber}</strong></span>
                <span>Area: <strong>{selectedPlot.size} sqft</strong></span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Total (₹) *</Label>
                <Input type="number" value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} required />
              </div>
              <div>
                <Label>Booking (₹)</Label>
                <Input type="number" value={form.bookingAmount} onChange={(e) => setForm({ ...form, bookingAmount: e.target.value })} />
              </div>
              <div>
                <Label>Down Pay (₹)</Label>
                <Input type="number" value={form.downPayment} onChange={(e) => setForm({ ...form, downPayment: e.target.value })} />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create & Generate Invoice'}
            </Button>
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
