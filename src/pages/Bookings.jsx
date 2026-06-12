import { useQuery } from '@tanstack/react-query'
import { plotsAPI } from '@/services/api'
import DataTable from '@/components/shared/DataTable'
import PageLoader from '@/components/shared/PageLoader'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

export default function Bookings() {
  const { data: plots, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => plotsAPI.getAll({ status: 'reserved' }).then((r) => r.data),
  })

  const columns = [
    { key: 'plotNumber', label: 'Plot', render: (r) => <span className="font-medium">{r.plotNumber}</span> },
    { key: 'project', label: 'Project', render: (r) => r.project?.name },
    { key: 'phase', label: 'Phase', render: (r) => r.phase?.name },
    { key: 'size', label: 'Size', render: (r) => `${r.size} sqft` },
    { key: 'cost', label: 'Cost', render: (r) => formatCurrency(r.cost) },
    { key: 'customer', label: 'Customer', render: (r) => r.customer?.name || '—' },
    { key: 'employee', label: 'Employee', render: (r) => r.assignedEmployee?.name || '—' },
    { key: 'status', label: 'Status', render: () => <Badge variant="warning">Reserved</Badge> },
  ]

  if (isLoading) return <PageLoader />
  return <DataTable columns={columns} data={plots} emptyMessage="No active bookings" />
}
