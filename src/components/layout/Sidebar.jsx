import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Map, Grid3X3, Users, UserCircle, Calendar,
  CreditCard, BarChart3, Settings, LogOut, Building2, UserPlus, MapPin
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const adminNav = [
  {
    section: 'Overview',
    links: [{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }],
  },
  {
    section: 'Real Estate',
    links: [
      { to: '/projects', icon: Building2, label: 'Projects' },
      { to: '/plots', icon: Grid3X3, label: 'Plots' },
      { to: '/plot-layout', icon: Map, label: 'Layout Designer' },
    ],
  },
  {
    section: 'Sales & CRM',
    links: [
      { to: '/leads', icon: UserPlus, label: 'Leads' },
      { to: '/customers', icon: UserCircle, label: 'Customers' },
      { to: '/bookings', icon: Calendar, label: 'Bookings' },
      { to: '/payments', icon: CreditCard, label: 'Payments' },
      { to: '/site-visits', icon: MapPin, label: 'Site Visits' },
    ],
  },
  {
    section: 'Team',
    links: [{ to: '/employees', icon: Users, label: 'Employees' }],
  },
  {
    section: 'Insights',
    links: [
      { to: '/reports', icon: BarChart3, label: 'Reports' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
]

const employeeNav = [
  {
    section: 'Overview',
    links: [{ to: '/employee/dashboard', icon: LayoutDashboard, label: 'Dashboard' }],
  },
  {
    section: 'Inventory',
    links: [
      { to: '/employee/plot-layout', icon: Map, label: 'Plot Layout' },
      { to: '/employee/plots', icon: Grid3X3, label: 'Plots' },
    ],
  },
  {
    section: 'Sales & CRM',
    links: [
      { to: '/employee/leads', icon: UserPlus, label: 'Leads' },
      { to: '/employee/customers', icon: UserCircle, label: 'Customers' },
      { to: '/employee/site-visits', icon: MapPin, label: 'Site Visits' },
    ],
  },
  {
    section: 'Workspace',
    links: [{ to: '/employee/performance', icon: BarChart3, label: 'Performance' }],
  },
]

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()
  const nav = isAdmin ? adminNav : employeeNav

  const isLinkActive = (to) =>
    location.pathname === to ||
    location.pathname.startsWith(to + '/') ||
    (to.includes('plot-layout') &&
      (location.pathname.startsWith('/layout-designer') || location.pathname.startsWith('/layout-viewer')))

  return (
    <aside className="sidebar-surface fixed left-3 top-3 bottom-3 z-40 flex w-60 flex-col overflow-hidden rounded-[24px] text-sidebar-foreground shadow-[var(--shadow-float)] ring-1 ring-white/[0.06]">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="relative flex h-11 w-11 items-center justify-center rounded-[14px] [background-image:var(--gradient-primary)] shadow-[var(--shadow-glow)] ring-1 ring-white/15">
          <Building2 className="h-[22px] w-[22px] text-white" strokeWidth={2.2} />
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0f172a]" />
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-[15px] font-bold leading-tight tracking-tight text-white">
            Anantha Estates
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
            Property Suite
          </p>
        </div>
      </div>

      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {nav.map((group) => (
          <div key={group.section} className="space-y-1">
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
              {group.section}
            </p>
            {group.links.map((link) => {
              const active = isLinkActive(link.to)
              return (
                <NavLink key={link.to} to={link.to}>
                  <motion.div
                    whileHover={{ x: active ? 0 : 3 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[13.5px] font-medium transition-colors duration-200',
                      active ? 'text-white' : 'text-white/55 hover:bg-white/[0.06] hover:text-white/90'
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-[12px] [background-image:var(--gradient-primary)] opacity-95 shadow-[var(--shadow-glow)] ring-1 ring-white/15"
                        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                      />
                    )}
                    <link.icon
                      className={cn(
                        'relative z-10 h-[18px] w-[18px] shrink-0 transition-colors',
                        active ? 'text-white' : 'text-white/45 group-hover:text-white/80'
                      )}
                      strokeWidth={2}
                    />
                    <span className="relative z-10">{link.label}</span>
                  </motion.div>
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="p-3">
        <div className="flex items-center gap-3 rounded-[16px] bg-white/[0.05] px-3 py-2.5 ring-1 ring-white/[0.08] backdrop-blur">
          <Avatar className="h-9 w-9 ring-2 ring-white/10">
            <AvatarFallback className="[background-image:var(--gradient-primary)] text-[13px] font-semibold text-white">
              {user?.name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-[13px] font-semibold text-white">{user?.name}</p>
            <p className="text-[11px] text-white/45">{isAdmin ? 'Super Admin' : 'Sales Executive'}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-[10px] p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
            aria-label="Sign out"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </aside>
  )
}
