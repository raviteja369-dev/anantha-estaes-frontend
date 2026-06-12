import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { plotsAPI, projectsAPI, phasesAPI, employeesAPI } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import PlotMap from '@/components/plots/PlotMap'
import PlotDetailsPanel from '@/components/plots/PlotDetailsPanel'
import PlotFormDialog from '@/components/plots/PlotFormDialog'
import StatCard from '@/components/shared/StatCard'
import PageLoader from '@/components/shared/PageLoader'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Grid3X3, CheckCircle, Clock, XCircle, IndianRupee } from 'lucide-react'
import { formatCurrency, formatNumber, PLOT_STATUS } from '@/lib/utils'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const COLORS = ['#22C55E', '#F59E0B', '#EF4444', '#3B82F6']

export default function PlotLayout() {
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [selectedProject, setSelectedProject] = useState('all')
  const [selectedPlot, setSelectedPlot] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editPlot, setEditPlot] = useState(null)
  const [search, setSearch] = useState('')

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

  const params = {}
  if (selectedProject !== 'all') params.project = selectedProject
  if (search) params.search = search

  const { data: plots, isLoading } = useQuery({
    queryKey: ['plots', params],
    queryFn: () => plotsAPI.getAll(params).then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data) => plotsAPI.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['plots'] }); setDialogOpen(false) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => plotsAPI.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['plots'] }); setDialogOpen(false); setEditPlot(null) },
  })

  const stats = {
    total: plots?.length || 0,
    available: plots?.filter((p) => p.status === 'available').length || 0,
    reserved: plots?.filter((p) => p.status === 'reserved').length || 0,
    sold: plots?.filter((p) => p.status === 'sold').length || 0,
    revenue: plots?.filter((p) => p.status === 'sold').reduce((s, p) => s + p.cost, 0) || 0,
  }

  const chartData = [
    { name: 'Available', value: stats.available },
    { name: 'Reserved', value: stats.reserved },
    { name: 'Sold', value: stats.sold },
    { name: 'Processing', value: plots?.filter((p) => p.status === 'under_processing').length || 0 },
  ]

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-56"><SelectValue placeholder="All Projects" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects?.map((p) => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {isAdmin && (
          <Button onClick={() => { setEditPlot(null); setDialogOpen(true) }}>
            <Plus className="h-4 w-4" /> Add New Plot
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Plots" value={formatNumber(stats.total)} subtitle="Across phases" icon={Grid3X3} index={0} />
        <StatCard title="Available" value={stats.available} subtitle={`${((stats.available / stats.total) * 100 || 0).toFixed(1)}%`} icon={CheckCircle} color="green" index={1} />
        <StatCard title="Reserved" value={stats.reserved} subtitle={`${((stats.reserved / stats.total) * 100 || 0).toFixed(1)}%`} icon={Clock} color="orange" index={2} />
        <StatCard title="Sold" value={stats.sold} subtitle={`${((stats.sold / stats.total) * 100 || 0).toFixed(1)}%`} icon={XCircle} color="red" index={3} />
        <StatCard title="Revenue" value={formatCurrency(stats.revenue)} subtitle="All time" icon={IndianRupee} color="blue" index={4} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <PlotMap
            plots={plots || []}
            phases={allPhases || []}
            selectedPlot={selectedPlot}
            onPlotClick={setSelectedPlot}
            isAdmin={isAdmin}
          />
        </div>
        <div className="space-y-4">
          <PlotDetailsPanel plot={selectedPlot} onViewDetails={(p) => { setEditPlot(p); setDialogOpen(true) }} />

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Status Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Bookings</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {plots?.filter((p) => p.status !== 'available').slice(0, 4).map((plot) => (
                <div key={plot._id} className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-muted/50">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {plot.plotNumber?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{plot.plotNumber}</p>
                    <p className="text-xs text-muted-foreground truncate">{plot.customer?.name || '—'}</p>
                  </div>
                  <Badge variant={plot.status === 'sold' ? 'destructive' : 'warning'} className="text-[10px]">
                    {PLOT_STATUS[plot.status]?.label || plot.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

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
