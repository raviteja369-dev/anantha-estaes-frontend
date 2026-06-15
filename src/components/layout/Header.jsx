import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/context/ThemeContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/context/AuthContext'
import NotificationsDropdown from './NotificationsDropdown'

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/plot-layout': 'Plot Layout',
  '/plots': 'Plots',
  '/employees': 'Employees',
  '/customers': 'Customers',
  '/leads': 'Leads',
  '/bookings': 'Bookings',
  '/payments': 'Payments',
  '/site-visits': 'Site Visits',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/employee/dashboard': 'Employee Dashboard',
  '/employee/plot-layout': 'Plot Layout',
  '/employee/plots': 'Plots',
  '/employee/customers': 'Customers',
  '/employee/leads': 'Leads',
  '/employee/site-visits': 'Site Visits',
  '/employee/performance': 'Performance',
}

export default function Header() {
  const location = useLocation()
  const { dark, toggleTheme } = useTheme()
  const { user } = useAuth()

  const title = routeTitles[location.pathname] || 'Dashboard'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-6">
      <div>
        <p className="text-xs text-muted-foreground">
          Dashboard <span className="mx-1">›</span> {title}
        </p>
        <motion.h1
          key={title}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-bold tracking-tight"
        >
          {title}
        </motion.h1>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <NotificationsDropdown />

        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {user?.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
