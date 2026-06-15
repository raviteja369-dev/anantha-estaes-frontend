import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { plotsAPI } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import DataTable from '@/components/shared/DataTable'
import PageLoader from '@/components/shared/PageLoader'
import StatCard from '@/components/shared/StatCard'
import BookingDetailDialog from '@/components/bookings/BookingDetailDialog'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, PLOT_STATUS, canManageBooking } from '@/lib/utils'
import { Calendar, CheckCircle, Clock, Search } from 'lucide-react'

const BOOKING_STATUSES = ['pending', 'reserved', 'sold', 'under_processing']

export default function Bookings() {
  const { user, employeeId } = useAuth()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [detailPlot, setDetailPlot] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const highlightId = searchParams.get('plotId')

  const { data: allPlots, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => plotsAPI.getAll().then((r) => r.data),
    refetchInterval: 15000,
  })

  const bookings = useMemo(() => {
    return (allPlots || [])
      .filter((p) => BOOKING_STATUSES.includes(p.status) || (p.customer && p.status !== 'available'))
      .filter((p) => {
        if (statusFilter !== 'all' && p.status !== statusFilter) return false
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return (
          p.plotNumber?.toLowerCase().includes(q)
          || p.customer?.name?.toLowerCase().includes(q)
          || p.assignedEmployee?.name?.toLowerCase().includes(q)
          || p.project?.name?.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  }, [allPlots, statusFilter, search])

  useEffect(() => {
    if (!highlightId || !allPlots?.length) return
    const plot = allPlots.find((p) => String(p._id) === highlightId)
    if (plot) {
      setDetailPlot(plot)
      setDetailOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [highlightId, allPlots, setSearchParams])

  const statusUpdateMutation = useMutation({
    mutationFn: ({ id, status }) => plotsAPI.updateBookingStatus(id, { status }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['plots'] })
      setDetailPlot(res.data)
    },
  })

  const stats = useMemo(() => ({
    total: (allPlots || []).filter((p) => BOOKING_STATUSES.includes(p.status) || p.customer).length,
    pending: (allPlots || []).filter((p) => p.status === 'pending').length,
    reserved: (allPlots || []).filter((p) => p.status === 'reserved').length,
    sold: (allPlots || []).filter((p) => p.status === 'sold').length,
  }), [allPlots])

  const statusVariant = (status) => {
    if (status === 'available') return 'success'
    if (status === 'pending') return 'info'
    if (status === 'reserved') return 'warning'
    if (status === 'sold') return 'destructive'
    return 'secondary'
  }

  const openDetail = (plot) => {
    setDetailPlot(plot)
    setDetailOpen(true)
  }

  const columns = [
    { key: 'plotNumber', label: 'Plot No', render: (r) => <span className="font-medium">{r.plotNumber}</span> },
    { key: 'customer', label: 'Customer', render: (r) => (
      <div>
        <p className="font-medium">{r.customer?.name || '—'}</p>
        {r.customer?.mobile && <p className="text-xs text-muted-foreground">{r.customer.mobile}</p>}
      </div>
    )},
    { key: 'employee', label: 'Employee', render: (r) => r.assignedEmployee?.name || '—' },
    { key: 'status', label: 'Status', render: (r) => (
      <Badge variant={statusVariant(r.status)}>
        {PLOT_STATUS[r.status]?.label || r.status}
      </Badge>
    )},
    { key: 'cost', label: 'Amount', render: (r) => formatCurrency(r.cost) },
    { key: 'bookedOn', label: 'Date', render: (r) => r.updatedAt ? new Date(r.updatedAt).toLocaleDateString('en-IN') : '—' },
    { key: 'project', label: 'Project', render: (r) => r.project?.name || '—', className: 'hidden lg:table-cell' },
    { key: 'phase', label: 'Phase', render: (r) => r.phase?.name || '—', className: 'hidden lg:table-cell' },
  ]

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        Only plots from <strong>published layouts</strong> can be booked. Book new plots from the layout viewer, or manage existing bookings below.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Bookings" value={stats.total} icon={Calendar} index={0} />
        <StatCard title="Pending" value={stats.pending} icon={Clock} color="blue" index={1} />
        <StatCard title="Reserved" value={stats.reserved} icon={Clock} color="orange" index={2} />
        <StatCard title="Sold" value={stats.sold} icon={CheckCircle} color="red" index={3} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 w-64"
            placeholder="Search plot, customer, employee…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={bookings}
        emptyMessage="No customer bookings yet"
        onRowClick={openDetail}
      />

      <BookingDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        plot={detailPlot}
        canUpdateStatus={detailPlot ? canManageBooking(user, detailPlot, employeeId) : false}
        onUpdateStatus={(status) => detailPlot && statusUpdateMutation.mutate({ id: detailPlot._id, status })}
        updating={statusUpdateMutation.isPending}
      />
    </div>
  )
}
