import { 
  LayoutDashboard, 
  DollarSign, 
  Receipt, 
  Users, 
  Clock,
  LogOut,
  Store
} from "lucide-react"
import { cn } from "./ui/utils"
import { Button } from "./ui/button"

interface CashierSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
  user: any
  onLogout: () => void
  todayTotal: number
  todaySalesCount: number
  onNavigate?: () => void
  selectedFeatures?: string[]
}

const menuItems = [
  { id: "pos", label: "Point of Sale", icon: LayoutDashboard, feature: "sales" },
  { id: "inventory", label: "Inventory", icon: Store, feature: "inventory" },
  { id: "customers", label: "Customers", icon: Users, feature: "customers" },
  { id: "reports", label: "Reports", icon: DollarSign, feature: "reports" },
]

export function CashierSidebar({ 
  activeSection, 
  setActiveSection, 
  user, 
  onLogout,
  todayTotal,
  todaySalesCount,
  onNavigate,
  selectedFeatures = []
}: CashierSidebarProps) {
  const handleNavigation = (section: string) => {
    setActiveSection(section)
    onNavigate?.()
  }

  // All cashier menu items are now core features - always show them
  const filteredMenuItems = menuItems

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <Store className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">POS System</h1>
            <p className="text-sm text-muted-foreground">{user.shopName}</p>
          </div>
        </div>
      </div>

      {/* Daily Summary */}
      <div className="p-4 border-b border-border">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Today's Summary</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-green-50 dark:bg-green-950 p-2 rounded-lg">
              <div className="text-xs text-green-600 dark:text-green-400">Sales</div>
              <div className="font-semibold text-green-700 dark:text-green-300">${todayTotal}</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950 p-2 rounded-lg">
              <div className="text-xs text-blue-600 dark:text-blue-400">Orders</div>
              <div className="font-semibold text-blue-700 dark:text-blue-300">{todaySalesCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                    activeSection === item.id
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

      {/* User info & Logout */}
      <div className="p-4 border-t border-border space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <span className="text-sm">{user.name?.charAt(0) || 'C'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">Cashier • {user.shopId}</p>
          </div>
        </div>
        <Button onClick={onLogout} variant="outline" size="sm" className="w-full">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  )
}