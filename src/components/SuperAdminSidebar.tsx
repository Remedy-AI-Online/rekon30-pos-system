import { cn } from "./ui/utils"
import { Button } from "./ui/button"
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Settings,
  BarChart3,
  Database,
  Users,
  LogOut,
  UserPlus,
} from "lucide-react"

interface SuperAdminSidebarProps {
  activeTab: string
  onSelect: (tab: string) => void
  user?: { name?: string; role?: string } | null
  onLogout?: () => void
  onNavigate?: () => void
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "signup-requests", label: "Signup Requests", icon: UserPlus },
  { id: "businesses", label: "Businesses", icon: Building2 },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "features", label: "Features", icon: Settings },
  { id: "backups", label: "Backups", icon: Database },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
]

export function SuperAdminSidebar({ activeTab, onSelect, user, onLogout, onNavigate }: SuperAdminSidebarProps) {
  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-primary rounded-lg">
            <LayoutDashboard className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="font-semibold text-foreground">Super Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Manage all businesses</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onSelect(item.id)
                    onNavigate?.()
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <span className="text-sm">{user?.name?.slice(0, 2).toUpperCase() || 'SA'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{user?.name || 'Super Admin'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.role || 'super_admin'}</p>
          </div>
        </div>
        {onLogout && (
          <Button onClick={onLogout} variant="outline" size="sm" className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        )}
      </div>
    </div>
  )
}


