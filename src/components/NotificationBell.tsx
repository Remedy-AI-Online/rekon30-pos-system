import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "./ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Badge } from "./ui/badge"
import { ScrollArea } from "./ui/scroll-area"
import { projectId, publicAnonKey } from "../utils/supabase/info"

interface Notification {
  id: string
  type: string
  shopId: string
  shopName: string
  cashierName: string
  total: number
  timestamp: string
  message: string
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastCheck, setLastCheck] = useState(new Date().toISOString())

  useEffect(() => {
    // Disabled notifications for now - endpoint not available
    // const interval = setInterval(() => {
    //   fetchNotifications()
    // }, 30000)

    // fetchNotifications()
    // return () => clearInterval(interval)
  }, [lastCheck])

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-86b98184/notifications?since=${lastCheck}`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      )
      
      if (!response.ok) {
        console.log('📴 Notifications endpoint not available')
        return
      }
      
      const text = await response.text()
      if (!text || text.trim() === '') {
        console.log('📴 Empty notifications response')
        return
      }
      
      try {
        const data = JSON.parse(text)
        if (data.success && data.notifications && data.notifications.length > 0) {
          setNotifications(prev => [...data.notifications, ...prev].slice(0, 20))
          setUnreadCount(prev => prev + data.notifications.length)
        }
      } catch (parseError) {
        console.log('📴 Invalid JSON from notifications:', text.substring(0, 100))
      }
    } catch (error) {
      console.log("📴 Notifications not available:", error instanceof Error ? error.message : String(error))
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setUnreadCount(0)
      setLastCheck(new Date().toISOString())
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Recent Sales</h3>
          <p className="text-xs text-muted-foreground">Real-time notifications from all shops</p>
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No new notifications
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div key={notification.id} className="p-4 hover:bg-accent cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium">{notification.shopName}</span>
                    <span className="text-xs text-muted-foreground">{formatTime(notification.timestamp)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
