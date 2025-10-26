import { useState as importedUseState, useEffect } from "react"
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  UserPlus, 
  DollarSign,
  BarChart3, 
  Settings,
  Store,
  LogOut,
  MapPin,
  Building2,
  TrendingUp,
  Zap,
  Shield,
  Star,
  Target,
  Boxes,
  AlertCircle,
  CreditCard,
  RefreshCw
} from "lucide-react"
import { cn } from "./ui/utils"
import { Button } from "./ui/button"
import { NotificationBell } from "./NotificationBell"
import { BusinessConfig } from "./BusinessSetup"
import { getSupabaseClient } from "../utils/authService"
import { dataService } from "../utils/dataService"

interface SidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
  user?: any
  onLogout?: () => void
  onNavigate?: () => void
  businessConfig?: BusinessConfig | null
}

const baseMenuItems = [
  // Core Features (Basic Plan)
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, show: true, feature: "dashboard" },
  { id: "products", label: "Products", icon: Package, show: false, feature: "products" },
  { id: "orders", label: "Orders", icon: ShoppingCart, show: false, feature: "orders" },
  { id: "workers", label: "Workers", icon: UserPlus, show: false, feature: "workers" },
  { id: "reports", label: "Reports", icon: BarChart3, show: false, feature: "reports" },
  { id: "settings", label: "Settings", icon: Settings, show: false, feature: "settings" },
  
  // Advanced Features (Pro Plan)
  { id: "customers", label: "Customers", icon: Users, show: false, feature: "customers", addon: true },
  { id: "workers-management", label: "Workers Management", icon: UserPlus, show: false, feature: "workers-management", addon: true },
  { id: "payroll", label: "Payroll", icon: DollarSign, show: false, feature: "payroll", addon: true },
  { id: "suppliers", label: "Suppliers", icon: Boxes, show: false, feature: "suppliers", addon: true },
  { id: "location-management", label: "Location Management", icon: MapPin, show: false, feature: "location-management", addon: true },
  { id: "credit-management", label: "Credit Management", icon: CreditCard, show: false, feature: "credit-management", addon: true },
  
  // Enterprise Features
  { id: "api-access", label: "API Access", icon: Zap, show: false, feature: "api-access", addon: true },
  { id: "white-label", label: "White Label", icon: Shield, show: false, feature: "white-label", addon: true },
  { id: "priority-support", label: "Priority Support", icon: Star, show: false, feature: "priority-support", addon: true },
  { id: "custom-features", label: "Custom Features", icon: Target, show: false, feature: "custom-features", addon: true },
  { id: "enterprise-analytics", label: "Enterprise Analytics", icon: TrendingUp, show: false, feature: "enterprise-analytics", addon: true },
]

export function Sidebar({ activeSection, setActiveSection, user, onLogout, onNavigate, businessConfig }: SidebarProps) {
  const [businessName, setBusinessName] = importedUseState<string>('Loading...')
  const [businessFeatures, setBusinessFeatures] = importedUseState<string[]>([])
  const [businessPlan, setBusinessPlan] = importedUseState<string>('basic')

  // Function to update business features in database
  const updateBusinessFeatures = async (features: string[]) => {
    try {
      const supabase = getSupabaseClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (currentUser?.user_metadata?.business_id) {
        const { error } = await supabase
          .from('businesses')
          .update({ features: features })
          .eq('id', currentUser.user_metadata.business_id)
        
        if (error) {
          console.error('❌ Failed to update business features:', error)
        } else {
          console.log('✅ Business features updated in database:', features)
        }
      }
    } catch (error) {
      console.error('❌ Error updating business features:', error)
    }
  }

  // Fetch business name and features from database
  useEffect(() => {
    const loadBusinessData = async () => {
      try {
        const supabase = getSupabaseClient()
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        
        console.log('Current user:', currentUser)
        console.log('Business ID from metadata:', currentUser?.user_metadata?.business_id)
        
        if (currentUser?.user_metadata?.business_id) {
          const { data, error } = await supabase
            .from('businesses')
            .select('business_name, features, plan')
            .eq('id', currentUser.user_metadata.business_id)
            .single()
          
          console.log('Business data:', data)
          console.log('Business error:', error)
          
          if (!error && data) {
            setBusinessName(data.business_name || 'My Business')
            setBusinessPlan(data.plan || 'basic')
            console.log('🏢 Business features loaded from DB:', data.features)
            console.log('📋 Business plan:', data.plan)
            
            // Check if features are properly assigned
            if (!data.features || data.features.length === 0) {
              console.log('⚠️ No features found in database, setting default basic plan features')
              setBusinessFeatures(['dashboard', 'products', 'orders', 'workers', 'reports', 'settings'])
            } else {
              // Use the features from database exactly as assigned
              console.log('✅ Using database features:', data.features)
              console.log('📋 Business plan:', data.plan)
              setBusinessFeatures(data.features)
              
              // Only update if we're missing core features (this should not happen for approved businesses)
              const coreFeatures = ['dashboard', 'products', 'orders', 'workers', 'reports', 'settings']
              const missingCoreFeatures = coreFeatures.filter(f => !data.features.includes(f))
              if (missingCoreFeatures.length > 0) {
                console.log('🔧 Missing core features in database, updating...', missingCoreFeatures)
                const allFeatures = [...new Set([...coreFeatures, ...data.features])]
                updateBusinessFeatures(allFeatures)
                setBusinessFeatures(allFeatures)
              }
            }
          } else {
            console.log('❌ Error loading business data, using fallback features')
            setBusinessName('My Business')
            setBusinessFeatures(['dashboard', 'products', 'orders', 'workers', 'reports', 'settings'])
            setBusinessPlan('basic')
          }
        } else {
          setBusinessName('My Business')
          setBusinessFeatures(['dashboard', 'products', 'orders', 'workers', 'reports', 'settings'])
          setBusinessPlan('basic')
        }
      } catch (error) {
        console.error('Error loading business data:', error)
        setBusinessName('My Business')
        setBusinessFeatures(['dashboard', 'products', 'orders', 'workers', 'reports', 'settings'])
        setBusinessPlan('basic')
      }
    }

    loadBusinessData()
  }, [user])

  // Also try to load from businessConfig if available
  useEffect(() => {
    if (businessConfig?.businessName) {
      setBusinessName(businessConfig.businessName)
    }
  }, [businessConfig])

  // Refresh user session to get latest features
  useEffect(() => {
    const refreshUserSession = async () => {
      try {
        const supabase = getSupabaseClient()
        const { data: { user: freshUser } } = await supabase.auth.getUser()
        if (freshUser && user) {
          // Update user if features changed
          if (JSON.stringify(freshUser.user_metadata) !== JSON.stringify(user.user_metadata)) {
            console.log('🔄 User metadata updated, features may have changed')
          }
        }
      } catch (error) {
        console.error('Error refreshing user session:', error)
      }
    }

    // Refresh every 30 seconds to pick up feature changes
    const interval = setInterval(refreshUserSession, 30000)

    return () => clearInterval(interval)
  }, [user])

  // Get dynamic menu items based on business features
  const getMenuItems = () => {
    const userRole = user?.user_metadata?.role || 'admin';

    console.log('🏢 Business features:', businessFeatures);
    console.log('📋 Business plan:', businessPlan);
    console.log('👤 User role:', userRole);
    console.log('📋 Available menu items:', baseMenuItems.map(i => `${i.label} (${i.feature || 'core'})`));

    // If no features are loaded yet, show basic plan features
    if (businessFeatures.length === 0) {
      console.log('⚠️ No business features loaded yet, showing basic plan features')
      return baseMenuItems.filter(item => 
        ['dashboard', 'products', 'orders', 'workers', 'reports', 'settings'].includes(item.feature)
      )
    }

    // Filter items based on business features
    const filteredItems = baseMenuItems.map(item => {
      // Check if business has this feature
      const hasFeature = businessFeatures.includes(item.feature);
      
      console.log(`🔍 Checking ${item.label}: feature=${item.feature}, hasFeature=${hasFeature}, businessFeatures=${JSON.stringify(businessFeatures)}`);

      return { ...item, show: hasFeature };
    }).filter(item => item.show);
    
    console.log('📋 Final filtered items:', filteredItems.map(item => item.label));

    // Ensure Settings is always at the bottom
    const settingsItem = filteredItems.find(item => item.id === 'settings');
    const otherItems = filteredItems.filter(item => item.id !== 'settings');
    
    // Return other items first, then settings at the bottom
    return [...otherItems, ...(settingsItem ? [settingsItem] : [])];
  }

  const menuItems = getMenuItems()
  const handleNavigation = (section: string) => {
    setActiveSection(section)
    onNavigate?.()
  }

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-primary rounded-lg">
            <Store className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="font-semibold text-foreground">{businessName}</h1>
            <p className="text-sm text-muted-foreground">Admin Dashboard</p>
          </div>
        </div>
        <NotificationBell />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
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

      {/* User info */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <span className="text-sm">{user?.name?.slice(0, 2).toUpperCase() || 'AD'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{user?.name || 'Administrator'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.role || 'Admin'}</p>
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