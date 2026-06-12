import { useQuery } from '@tanstack/react-query'
import { Grid3X3, CheckCircle, Clock, XCircle, Target, IndianRupee } from 'lucide-react'
import { reportsAPI, plotsAPI } from '@/services/api'
import StatCard from '@/components/shared/StatCard'
import PageLoader from '@/components/shared/PageLoader'
import { formatCurrency, PLOT_STATUS } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = ['#22C55E', '#F59E0B', '#EF4444', '#3B82F6']

export default function EmployeeDashboard() {
  const { data: stats, isLoading } = useQuery({ queryKey: ['employee-dashboard'], queryFn: () => reportsAPI.employeeDashboard().then((r) => r.data) })
  const { data: plots } = useQuery({ queryKey: ['my-plots'], queryFn: () => plotsAPI.getAll().then((r) => r.data) })

  if (isLoading) return <PageLoader />

  const chartData = [
    { name: 'Available', value: stats?.plotStatusDistribution?.available || 0 },
    { name: 'Reserved', value: stats?.plotStatusDistribution?.reserved || 0 },
    { name: 'Sold', value: stats?.plotStatusDistribution?.sold || 0 },
    { name: 'Processing', value: stats?.plotStatusDistribution?.under_processing || 0 },
  ]

  const achievement = stats?.monthlyTarget ? Math.round((stats.achievedRevenue / stats.monthlyTarget) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Assigned Plots" value={stats?.assignedPlots || 0} icon={Grid3X3} index={0} />
        <StatCard title="Available" value={stats?.availablePlots || 0} icon={CheckCircle} color="green" index={1} />
        <StatCard title="Reserved" value={stats?.reservedPlots || 0} icon={Clock} color="orange" index={2} />
        <StatCard title="Sold" value={stats?.soldPlots || 0} icon={XCircle} color="red" index={3} />
        <StatCard title="Monthly Target" value={formatCurrency(stats?.monthlyTarget)} icon={Target} color="purple" index={4} />
        <StatCard title="Achieved Revenue" value={formatCurrency(stats?.achievedRevenue)} subtitle={`${achievement}% of target`} icon={IndianRupee} color="blue" index={5} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>My Plot Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Assigned Plots</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {plots?.slice(0, 6).map((plot) => (
              <div key={plot._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                <div>
                  <p className="text-sm font-medium">{plot.plotNumber} — {plot.size} sqft</p>
                  <p className="text-xs text-muted-foreground">{plot.project?.name} · {plot.phase?.name}</p>
                </div>
                <Badge variant={plot.status === 'available' ? 'success' : plot.status === 'reserved' ? 'warning' : 'destructive'}>
                  {PLOT_STATUS[plot.status]?.label || plot.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
