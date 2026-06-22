import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { notificationsAPI } from '@/services/api'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationsDropdown() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const panelRef = useRef(null)

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const { data } = await notificationsAPI.getAll()
      setItems(data.items || [])
      setUnreadCount(data.unreadCount || 0)
    } catch {
      setItems([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!open) return
    loadNotifications()

    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleItemClick = (item) => {
    setOpen(false)
    if (item.link) navigate(item.link)
  }

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant="outline"
        size="icon"
        className="relative h-10 w-10"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#EF4444] ring-2 ring-card" />
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-background shadow-lg z-50">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-muted-foreground">{unreadCount} new</span>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {!loading && items.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No notifications</p>
            )}
            {!loading && items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item)}
                className="flex w-full gap-3 border-b border-border/50 px-4 py-3 text-left hover:bg-muted/50 transition-colors last:border-0"
              >
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.unread ? 'bg-primary' : 'bg-transparent'}`} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium truncate">{item.title}</span>
                  <span className="block text-xs text-muted-foreground truncate">{item.message}</span>
                  <span className="block text-[10px] text-muted-foreground mt-1">
                    {item.createdAt
                      ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
                      : ''}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
