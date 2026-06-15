import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, LayoutGrid } from 'lucide-react'
import { plotsAPI } from '@/services/api'
import DataTable from '@/components/shared/DataTable'
import PageLoader from '@/components/shared/PageLoader'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, PLOT_STATUS } from '@/lib/utils'

export default function Plots() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const params = {}
  if (search) params.search = search
  if (statusFilter !== 'all') params.status = statusFilter

  const { data: plots, isLoading } = useQuery({
    queryKey: ['plots', params],
    queryFn: () => plotsAPI.getAll(params).then((r) => r.data),
  })

  const columns = [
    { key: 'plotNumber', label: 'Plot Number', render: (r) => <span className="font-medium">{r.plotNumber}</span> },
    { key: 'project', label: 'Project', render: (r) => r.project?.name },
    { key: 'phase', label: 'Phase', render: (r) => r.phase?.name },
    { key: 'size', label: 'Area', render: (r) => `${r.size} sqft` },
    { key: 'facing', label: 'Facing' },
    { key: 'cost', label: 'Price', render: (r) => formatCurrency(r.cost) },
    { key: 'status', label: 'Status', render: (r) => (
      <Badge variant={r.status === 'available' ? 'success' : r.status === 'reserved' ? 'warning' : r.status === 'sold' ? 'destructive' : 'info'}>
        {PLOT_STATUS[r.status]?.label}
      </Badge>
    )},
  ]

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <LayoutGrid className="h-4 w-4 mt-0.5 shrink-0" />
        <p>
          Plots are sourced from <strong>published layouts</strong>. Draw plots in the Layout Designer, save, and publish to make them appear here.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 w-64" placeholder="Search plots..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(PLOT_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={plots}
        emptyMessage="No plots in published layouts yet. Create and publish a layout from Plot Layout."
      />
    </div>
  )
}
