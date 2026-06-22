import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/context/ThemeContext'
import NotificationsDropdown from './NotificationsDropdown'
import ProfileMenu from './ProfileMenu'

const routeMeta = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Portfolio overview & key metrics' },
  '/projects': { title: 'Projects', subtitle: 'Manage your real estate developments' },
  '/plot-layout': { title: 'Plot Layout', subtitle: 'Visualize and plan plot layouts' },
  '/plots': { title: 'Plots', subtitle: 'Inventory of all plots' },
  '/employees': { title: 'Employees', subtitle: 'Team members & roles' },
  '/customers': { title: 'Customers', subtitle: 'Buyer records & relationships' },
  '/leads': { title: 'Leads', subtitle: 'Prospects & sales pipeline' },
  '/bookings': { title: 'Bookings', subtitle: 'Reservations & allotments' },
  '/payments': { title: 'Payments', subtitle: 'Collections & receivables' },
  '/site-visits': { title: 'Site Visits', subtitle: 'Scheduled property tours' },
  '/reports': { title: 'Reports', subtitle: 'Analytics & insights' },
  '/settings': { title: 'Settings', subtitle: 'Workspace configuration' },
  '/employee/dashboard': { title: 'Dashboard', subtitle: 'Your performance overview' },
  '/employee/plot-layout': { title: 'Plot Layout', subtitle: 'Visualize and plan plot layouts' },
  '/employee/plots': { title: 'Plots', subtitle: 'Inventory of all plots' },
  '/employee/customers': { title: 'Customers', subtitle: 'Buyer records & relationships' },
  '/employee/leads': { title: 'Leads', subtitle: 'Prospects & sales pipeline' },
  '/employee/site-visits': { title: 'Site Visits', subtitle: 'Scheduled property tours' },
  '/employee/performance': { title: 'Performance', subtitle: 'Your targets & achievements' },
}

export default function Header() {
  const location = useLocation()
  const { dark, toggleTheme } = useTheme()

  const meta = routeMeta[location.pathname] || { title: 'Dashboard', subtitle: '' }

  return (
    <header className="glass-header sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border px-5 lg:px-8">
      <div className="min-w-0">
        <motion.h1
          key={meta.title}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="truncate text-lg font-bold tracking-tight text-foreground"
        >
          {meta.title}
        </motion.h1>
        {meta.subtitle && (
          <p className="hidden truncate text-xs text-muted-foreground sm:block">{meta.subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="h-10 w-10 text-muted-foreground hover:text-foreground"
          aria-label="Toggle theme"
        >
          {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </Button>

        <NotificationsDropdown />

        <div className="mx-1 hidden h-8 w-px bg-border sm:block" />

        <ProfileMenu />
      </div>
    </header>
  )
}
