import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Building2, Grid3X3, CheckCircle, Clock, XCircle, IndianRupee, Users, UserCircle, ArrowRight } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { reportsAPI, plotsAPI } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import StatCard from '@/components/shared/StatCard'
import { StatCardSkeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatNumber, PLOT_STATUS } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const COLORS = ['#22C55E', '#F59E0B', '#7C3AED', '#4F46E5']

const statusDot = {
  available: 'bg-emerald-500',
  reserved: 'bg-amber-500',
  sold: 'bg-violet-500',
  under_processing: 'bg-indigo-500',
  pending: 'bg-indigo-500',
  cancelled: 'bg-slate-400',
}

export default function Dashboard() {
  const { user } = useAuth()
  const { data: stats, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: () => reportsAPI.dashboard().then((r) => r.data) })
  const { data: recentPlots } = useQuery({
    queryKey: ['recent-plots'],
    queryFn: () => plotsAPI.getAll().then((r) => r.data.slice(0, 6)),
  })

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  const pct = (n) => (((n / stats?.totalPlots) * 100 || 0).toFixed(1) + '% of total')

  const chartData = [
    { name: 'Available', value: stats?.availablePlots || 0 },
    { name: 'Reserved', value: stats?.reservedPlots || 0 },
    { name: 'Sold', value: stats?.soldPlots || 0 },
    { name: 'Processing', value: stats?.underProcessingPlots || 0 },
  ]
  const totalPlots = chartData.reduce((s, d) => s + d.value, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
          {greeting}, {user?.name?.split(' ')[0] || 'there'}
        </h2>
        <p className="text-sm text-muted-foreground">Here's what's happening across your portfolio today.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Projects" value={stats?.totalProjects || 0} trendLabel="Active developments" icon={Building2} color="default" index={0} />
        <StatCard title="Total Plots" value={formatNumber(stats?.totalPlots)} trendLabel="Across all projects" icon={Grid3X3} color="blue" index={1} />
        <StatCard title="Total Revenue" value={formatCurrency(stats?.totalRevenue)} trendLabel="All time collections" icon={IndianRupee} color="purple" index={2} />
        <StatCard title="Customers" value={stats?.customers || 0} trendLabel="Registered buyers" icon={UserCircle} color="green" index={3} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Available" value={stats?.availablePlots || 0} subtitle={pct(stats?.availablePlots)} icon={CheckCircle} color="green" index={4} />
        <StatCard title="Reserved" value={stats?.reservedPlots || 0} subtitle={pct(stats?.reservedPlots)} icon={Clock} color="orange" index={5} />
        <StatCard title="Sold" value={stats?.soldPlots || 0} subtitle={pct(stats?.soldPlots)} icon={XCircle} color="red" index={6} />
        <StatCard title="Employees" value={stats?.employees || 0} subtitle="Team members" icon={Users} color="default" index={7} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Latest plot updates</p>
            </div>
            <Link to="/plots" className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/70">
              {recentPlots?.length ? recentPlots.map((plot) => (
                <div key={plot._id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-[13px] font-bold text-primary ring-1 ring-primary/10">
                      {plot.plotNumber}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        Plot {plot.plotNumber} · {plot.size} sqft
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {plot.customer?.name || 'Unassigned'} · {plot.project?.name || '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${statusDot[plot.status] || 'bg-slate-400'}`} />
                    <Badge variant={plot.status === 'available' ? 'success' : plot.status === 'reserved' ? 'warning' : plot.status === 'sold' ? 'violet' : 'info'}>
                      {PLOT_STATUS[plot.status]?.label || plot.status}
                    </Badge>
                  </div>
                </div>
              )) : (
                <p className="py-8 text-center text-sm text-muted-foreground">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plot Distribution</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Inventory by status</p>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={62} outerRadius={88} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '0.625rem',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-card)',
                      color: 'var(--color-foreground)',
                      fontSize: '12px',
                      boxShadow: 'var(--shadow-elevated)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="font-display text-2xl font-bold tabular-nums text-foreground">{formatNumber(totalPlots)}</p>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Total Plots</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
              {chartData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="ml-auto font-semibold tabular-nums text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
