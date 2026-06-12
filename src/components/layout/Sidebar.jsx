import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Map, Grid3X3, Users, UserCircle, Calendar,
  CreditCard, FileText, BarChart3, Settings, LogOut, Building2, UserPlus, MapPin
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const adminLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: Building2, label: 'Projects' },
  { to: '/plot-layout', icon: Map, label: 'Plot Layout' },
  { to: '/plots', icon: Grid3X3, label: 'Plots' },
  { to: '/employees', icon: Users, label: 'Employees' },
  { to: '/customers', icon: UserCircle, label: 'Customers' },
  { to: '/leads', icon: UserPlus, label: 'Leads' },
  { to: '/bookings', icon: Calendar, label: 'Bookings' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/site-visits', icon: MapPin, label: 'Site Visits' },
  { to: '/documents', icon: FileText, label: 'Documents' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

const employeeLinks = [
  { to: '/employee/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employee/plots', icon: Grid3X3, label: 'My Plots' },
  { to: '/employee/customers', icon: UserCircle, label: 'My Customers' },
  { to: '/employee/leads', icon: UserPlus, label: 'My Leads' },
  { to: '/employee/site-visits', icon: MapPin, label: 'Site Visits' },
  { to: '/employee/performance', icon: BarChart3, label: 'Performance' },
]

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()
  const links = isAdmin ? adminLinks : employeeLinks

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight">Anantha Estates</h1>
          <p className="text-[11px] text-white/50">Plot Management</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {links.map((link) => {
          const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + '/')
          return (
            <NavLink key={link.to} to={link.to}>
              <motion.div
                whileHover={{ x: 4 }}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </motion.div>
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {user?.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-[11px] text-white/50">{isAdmin ? 'Super Admin' : 'Employee'}</p>
          </div>
          <button onClick={logout} className="text-white/40 hover:text-white transition-colors cursor-pointer">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
