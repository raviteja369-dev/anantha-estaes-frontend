import { useQuery } from '@tanstack/react-query'
import { Building2, Grid3X3, CheckCircle, Clock, XCircle, IndianRupee, Users, UserCircle } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { reportsAPI, plotsAPI } from '@/services/api'
import StatCard from '@/components/shared/StatCard'
import PageLoader from '@/components/shared/PageLoader'
import { formatCurrency, formatNumber, PLOT_STATUS } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const COLORS = ['#22C55E', '#F59E0B', '#EF4444', '#3B82F6']

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: () => reportsAPI.dashboard().then((r) => r.data) })
  const { data: recentPlots } = useQuery({
    queryKey: ['recent-plots'],
    queryFn: () => plotsAPI.getAll().then((r) => r.data.slice(0, 5)),
  })

  if (isLoading) return <PageLoader />

  const chartData = [
    { name: 'Available', value: stats?.availablePlots || 0 },
    { name: 'Reserved', value: stats?.reservedPlots || 0 },
    { name: 'Sold', value: stats?.soldPlots || 0 },
    { name: 'Processing', value: stats?.underProcessingPlots || 0 },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Projects" value={stats?.totalProjects || 0} icon={Building2} color="purple" index={0} />
        <StatCard title="Total Plots" value={formatNumber(stats?.totalPlots)} subtitle={`Across all projects`} icon={Grid3X3} index={1} />
        <StatCard title="Available" value={stats?.availablePlots || 0} subtitle={`${((stats?.availablePlots / stats?.totalPlots) * 100 || 0).toFixed(1)}% of total`} icon={CheckCircle} color="green" index={2} />
        <StatCard title="Reserved" value={stats?.reservedPlots || 0} subtitle={`${((stats?.reservedPlots / stats?.totalPlots) * 100 || 0).toFixed(1)}% of total`} icon={Clock} color="orange" index={3} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Sold" value={stats?.soldPlots || 0} subtitle={`${((stats?.soldPlots / stats?.totalPlots) * 100 || 0).toFixed(1)}% of total`} icon={XCircle} color="red" index={4} />
        <StatCard title="Total Revenue" value={formatCurrency(stats?.totalRevenue)} subtitle="All time" icon={IndianRupee} color="blue" index={5} />
        <StatCard title="Employees" value={stats?.employees || 0} icon={Users} color="purple" index={6} />
        <StatCard title="Customers" value={stats?.customers || 0} icon={UserCircle} color="default" index={7} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPlots?.map((plot) => (
                <div key={plot._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {plot.plotNumber}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{plot.plotNumber} — {plot.size} sqft</p>
                      <p className="text-xs text-muted-foreground">{plot.customer?.name || 'No customer'} · {plot.project?.name}</p>
                    </div>
                  </div>
                  <Badge variant={plot.status === 'available' ? 'success' : plot.status === 'reserved' ? 'warning' : plot.status === 'sold' ? 'destructive' : 'info'}>
                    {PLOT_STATUS[plot.status]?.label || plot.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Plot Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {chartData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-medium ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
