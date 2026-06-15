import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Projects from '@/pages/Projects'
import PlotLayout from '@/pages/PlotLayout'
import LayoutDesignerPage from '@/pages/LayoutDesignerPage'
import LayoutViewerPage from '@/pages/LayoutViewerPage'
import Plots from '@/pages/Plots'
import Employees from '@/pages/Employees'
import Customers from '@/pages/Customers'
import Leads from '@/pages/Leads'
import Bookings from '@/pages/Bookings'
import Payments from '@/pages/Payments'
import SiteVisits from '@/pages/SiteVisits'
import Reports from '@/pages/Reports'
import Settings from '@/pages/Settings'
import EmployeeDashboard from '@/pages/employee/EmployeeDashboard'
import EmployeePerformance from '@/pages/employee/EmployeePerformance'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30000, retry: 1 } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/login" replace />} />

              <Route element={<ProtectedRoute adminOnly><DashboardLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/plot-layout" element={<PlotLayout />} />
                <Route path="/plots" element={<Plots />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/site-visits" element={<SiteVisits />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              <Route
                path="/layout-viewer/:layoutId"
                element={<ProtectedRoute><LayoutViewerPage /></ProtectedRoute>}
              />

              <Route
                path="/layout-designer/:layoutId"
                element={<ProtectedRoute adminOnly><LayoutDesignerPage /></ProtectedRoute>}
              />

              <Route element={<ProtectedRoute employeeOnly><DashboardLayout /></ProtectedRoute>}>
                <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
                <Route path="/employee/plot-layout" element={<PlotLayout />} />
                <Route path="/employee/plots" element={<Plots />} />
                <Route path="/employee/customers" element={<Customers />} />
                <Route path="/employee/leads" element={<Leads />} />
                <Route path="/employee/site-visits" element={<SiteVisits />} />
                <Route path="/employee/performance" element={<EmployeePerformance />} />
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
