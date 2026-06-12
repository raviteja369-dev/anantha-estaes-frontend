import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { plotsAPI } from '@/services/api'
import DataTable from '@/components/shared/DataTable'
import PageLoader from '@/components/shared/PageLoader'
import StatCard from '@/components/shared/StatCard'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, PLOT_STATUS } from '@/lib/utils'
import { Calendar, CheckCircle, Clock } from 'lucide-react'

const BOOKED_STATUSES = ['reserved', 'sold', 'under_processing']

export default function Bookings() {
  const { data: allPlots, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => plotsAPI.getAll().then((r) => r.data),
  })

  const bookings = useMemo(() => {
    return (allPlots || [])
      .filter((p) => BOOKED_STATUSES.includes(p.status) || p.customer)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  }, [allPlots])

  const stats = useMemo(() => ({
    total: bookings.length,
    reserved: bookings.filter((p) => p.status === 'reserved').length,
    sold: bookings.filter((p) => p.status === 'sold').length,
    processing: bookings.filter((p) => p.status === 'under_processing').length,
  }), [bookings])

  const statusVariant = (status) => {
    if (status === 'available') return 'success'
    if (status === 'reserved') return 'warning'
    if (status === 'sold') return 'destructive'
    return 'info'
  }

  const columns = [
    { key: 'plotNumber', label: 'Plot', render: (r) => <span className="font-medium">{r.plotNumber}</span> },
    { key: 'project', label: 'Project', render: (r) => r.project?.name || '—' },
    { key: 'phase', label: 'Phase', render: (r) => r.phase?.name || '—' },
    { key: 'size', label: 'Size', render: (r) => `${r.size} sqft` },
    { key: 'cost', label: 'Cost', render: (r) => formatCurrency(r.cost) },
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
    { key: 'bookedOn', label: 'Booked On', render: (r) => r.updatedAt ? new Date(r.updatedAt).toLocaleDateString('en-IN') : '—' },
  ]

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Bookings" value={stats.total} icon={Calendar} index={0} />
        <StatCard title="Reserved" value={stats.reserved} icon={Clock} color="orange" index={1} />
        <StatCard title="Sold" value={stats.sold} icon={CheckCircle} color="red" index={2} />
        <StatCard title="Under Processing" value={stats.processing} icon={Clock} color="blue" index={3} />
      </div>
      <DataTable columns={columns} data={bookings} emptyMessage="No customer bookings yet" />
    </div>
  )
}
