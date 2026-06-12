import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { plotsAPI, projectsAPI, phasesAPI, employeesAPI } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import DataTable from '@/components/shared/DataTable'
import PageLoader from '@/components/shared/PageLoader'
import PlotFormDialog from '@/components/plots/PlotFormDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, PLOT_STATUS } from '@/lib/utils'

export default function Plots() {
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editPlot, setEditPlot] = useState(null)

  const params = {}
  if (search) params.search = search
  if (statusFilter !== 'all') params.status = statusFilter

  const { data: plots, isLoading } = useQuery({ queryKey: ['plots', params], queryFn: () => plotsAPI.getAll(params).then((r) => r.data) })
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: () => projectsAPI.getAll().then((r) => r.data) })
  const { data: allPhases } = useQuery({
    queryKey: ['all-phases'],
    queryFn: async () => {
      const projs = await projectsAPI.getAll().then((r) => r.data)
      const phases = await Promise.all(projs.map((p) => phasesAPI.getByProject(p._id).then((r) => r.data)))
      return phases.flat()
    },
  })
  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: () => employeesAPI.getAll().then((r) => r.data), enabled: isAdmin })

  const createMutation = useMutation({
    mutationFn: (data) => plotsAPI.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['plots'] }); setDialogOpen(false) },
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => plotsAPI.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['plots'] }); setDialogOpen(false); setEditPlot(null) },
  })
  const deleteMutation = useMutation({
    mutationFn: (id) => plotsAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plots'] }),
  })
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => plotsAPI.updateStatus(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plots'] }),
  })

  const columns = [
    { key: 'plotNumber', label: 'Plot #', render: (r) => <span className="font-medium">{r.plotNumber}</span> },
    { key: 'project', label: 'Project', render: (r) => r.project?.name },
    { key: 'phase', label: 'Phase', render: (r) => r.phase?.name },
    { key: 'size', label: 'Size', render: (r) => `${r.size} sqft` },
    { key: 'cost', label: 'Cost', render: (r) => formatCurrency(r.cost) },
    { key: 'facing', label: 'Facing' },
    { key: 'status', label: 'Status', render: (r) => (
      <Badge variant={r.status === 'available' ? 'success' : r.status === 'reserved' ? 'warning' : r.status === 'sold' ? 'destructive' : 'info'}>
        {PLOT_STATUS[r.status]?.label}
      </Badge>
    )},
    { key: 'employee', label: 'Employee', render: (r) => r.assignedEmployee?.name || '—' },
    ...(isAdmin ? [{
      key: 'actions', label: 'Actions', render: (r) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setEditPlot(r); setDialogOpen(true) }}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          {r.status === 'available' && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ id: r._id, status: 'reserved' }) }}>Reserve</Button>
          )}
          {r.status === 'reserved' && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ id: r._id, status: 'sold' }) }}>Sold</Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(r._id) }}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    }] : []),
  ]

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
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
        {isAdmin && (
          <Button onClick={() => { setEditPlot(null); setDialogOpen(true) }}><Plus className="h-4 w-4" /> Add Plot</Button>
        )}
      </div>
      <DataTable columns={columns} data={plots} />
      <PlotFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        plot={editPlot}
        projects={projects}
        phases={allPhases}
        employees={employees}
        onSubmit={(data) => editPlot ? updateMutation.mutate({ id: editPlot._id, data }) : createMutation.mutate(data)}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}
