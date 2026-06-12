import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import PageLoader from '@/components/shared/PageLoader'

export default function ProtectedRoute({ children, adminOnly, employeeOnly }) {
  const { user, loading, isAdmin, isEmployee } = useAuth()

  if (loading) return <PageLoader />

  if (!user) return <Navigate to="/login" replace />

  if (adminOnly && !isAdmin) return <Navigate to="/employee/dashboard" replace />
  if (employeeOnly && !isEmployee) return <Navigate to="/dashboard" replace />

  return children
}
