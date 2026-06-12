import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { employeesAPI } from '@/services/api'
import PageLoader from '@/components/shared/PageLoader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function EmployeePerformance() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['my-performance', user?.employeeId],
    queryFn: () => employeesAPI.getById(user.employeeId).then((r) => r.data),
    enabled: !!user?.employeeId,
  })

  if (isLoading) return <PageLoader />

  const chartData = [
    { name: 'Revenue', value: data?.stats?.revenue || 0 },
    { name: 'Target', value: data?.employee?.salesTarget || 0 },
  ]

  const achievement = data?.employee?.salesTarget
    ? Math.round((data.stats.revenue / data.employee.salesTarget) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Plots', value: data?.stats?.plots || 0 },
          { label: 'Customers', value: data?.stats?.customers || 0 },
          { label: 'Leads', value: data?.stats?.leads || 0 },
          { label: 'Achievement', value: `${achievement}%` },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-bold mt-1">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Revenue vs Target</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="value" fill="hsl(239 84% 67%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
