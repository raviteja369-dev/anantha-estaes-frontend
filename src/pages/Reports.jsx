import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'
import { reportsAPI } from '@/services/api'
import PageLoader from '@/components/shared/PageLoader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export default function Reports() {
  const { data: revenue, isLoading: r1 } = useQuery({ queryKey: ['revenue'], queryFn: () => reportsAPI.revenue().then((r) => r.data) })
  const { data: performance, isLoading: r2 } = useQuery({ queryKey: ['performance'], queryFn: () => reportsAPI.employeePerformance().then((r) => r.data) })
  const { data: dashboard } = useQuery({ queryKey: ['dashboard'], queryFn: () => reportsAPI.dashboard().then((r) => r.data) })

  if (r1 || r2) return <PageLoader />

  const statusData = [
    { name: 'Available', count: dashboard?.availablePlots || 0 },
    { name: 'Reserved', count: dashboard?.reservedPlots || 0 },
    { name: 'Sold', count: dashboard?.soldPlots || 0 },
    { name: 'Processing', count: dashboard?.underProcessingPlots || 0 },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Revenue Analytics</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} className="text-xs" />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(239 84% 67%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Monthly Sales Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="revenue" fill="hsl(239 84% 67%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Employee Performance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <YAxis type="category" dataKey="name" width={100} className="text-xs" />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="revenue" fill="hsl(142 71% 45%)" name="Revenue" radius={[0, 4, 4, 0]} />
                <Bar dataKey="target" fill="hsl(215 16% 47% / 0.3)" name="Target" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Plot Status Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(239 84% 67%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
