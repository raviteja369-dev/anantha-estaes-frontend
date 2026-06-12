import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Bell, Moon, Sun, Command } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/context/ThemeContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/context/AuthContext'

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
  '/documents': 'Documents',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/employee/dashboard': 'Employee Dashboard',
  '/employee/plots': 'My Plots',
  '/employee/customers': 'My Customers',
  '/employee/leads': 'My Leads',
  '/employee/site-visits': 'Site Visits',
  '/employee/performance': 'Performance',
}

export default function Header({ onSearch }) {
  const location = useLocation()
  const { dark, toggleTheme } = useTheme()
  const { user } = useAuth()
  const [search, setSearch] = useState('')

  const title = routeTitles[location.pathname] || 'Dashboard'
  const breadcrumbs = title.split(' ')

  const handleSearch = (e) => {
    setSearch(e.target.value)
    onSearch?.(e.target.value)
  }

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
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search anything..."
            className="w-72 pl-9 pr-16 bg-muted/50 border-0"
            value={search}
            onChange={handleSearch}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>

        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button variant="ghost" size="icon" className="rounded-full relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {user?.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
