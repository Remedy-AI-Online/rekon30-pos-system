import { useState, useEffect } from "react"
import { Menu } from "lucide-react"
import { AuthPage } from "./components/AuthPage"
import { CashierDashboard } from "./components/CashierDashboard"
import { Sidebar } from "./components/Sidebar"
import { Dashboard } from "./components/Dashboard"
import { ProductsPage } from "./components/ProductsPage"
import { OrdersPage } from "./components/OrdersPage"
import { CustomersPage } from "./components/CustomersPage"
import { WorkersManagementPage } from "./components/WorkersManagementPage"
import { PayrollPage } from "./components/PayrollPage"
import { ReportsPage } from "./components/ReportsPage"
import { AdminReportsPage } from "./components/AdminReportsPage"
import { SettingsPage } from "./components/SettingsPage"
import { BusinessSetup, BusinessConfig } from "./components/BusinessSetup"
import { LocationManagement } from "./components/LocationManagement"
import { EnterpriseAnalytics } from "./components/EnterpriseAnalytics"
import { SuperAdminPanel } from "./components/SuperAdminPanel"
import { SuppliersPage } from "./components/SuppliersPage"
import { CorrectionsPage } from "./components/CorrectionsPage"
import { APIAccessPage } from "./components/APIAccessPage"
import { WhiteLabelPage } from "./components/WhiteLabelPage"
import { PrioritySupportPage } from "./components/PrioritySupportPage"
import { CustomFeaturesPage } from "./components/CustomFeaturesPage"
import CreditManagementPage from "./components/CreditManagementPage"
import { Button } from "./components/ui/button"
import { Sheet, SheetContent } from "./components/ui/sheet"
import { authService } from "./utils/authService"
import { Toaster } from "./components/ui/sonner"
import { Analytics } from "@vercel/analytics/react"
import { LandingPage } from "./components/LandingPage"

export default function App() {
  const [user, setUser] = useState<any>(null)
  const [accessToken, setAccessToken] = useState<string>('')
  const [activeSection, setActiveSection] = useState("dashboard")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768)
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig | null>(null)
  const [showLandingPage, setShowLandingPage] = useState(true)

  // Update page title based on current section
  useEffect(() => {
    const getPageTitle = () => {
      if (!user) return "Rekon360 - Complete POS System for Ghanaian Businesses"
      if (user.role === 'super_admin') return "Super Admin Panel - Rekon360"
      if (user.role === 'cashier') return "Cashier Dashboard - Rekon360"
      
      const sectionTitles: { [key: string]: string } = {
        dashboard: "Dashboard - Rekon360",
        products: "Product Management - Rekon360",
        orders: "Order Management - Rekon360",
        customers: "Customer Management - Rekon360",
        workers: "Worker Management - Rekon360",
        reports: "Reports & Analytics - Rekon360",
        settings: "Settings - Rekon360"
      }
      
      return sectionTitles[activeSection] || "Rekon360 - Complete POS System for Ghanaian Businesses"
    }
    
    document.title = getPageTitle()
  }, [user, activeSection])

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { user: sessionUser, accessToken: token } = await authService.getSession()
      if (sessionUser && token) {
        setUser(sessionUser)
        setAccessToken(token)
      }
      setLoading(false)
    }
    checkSession()
  }, [])

  // Handle window resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogin = (role: 'admin' | 'cashier' | 'super_admin', userInfo: any, token: string) => {
    setUser(userInfo)
    setAccessToken(token)
  }

  const handleLogout = async () => {
    await authService.signOut()
    setUser(null)
    setAccessToken('')
    setActiveSection("dashboard")
    setBusinessConfig(null)
  }

  const handleGetStarted = () => {
    setShowLandingPage(false)
  }

  const handleBusinessSetupComplete = (config: BusinessConfig) => {
    setBusinessConfig(config)
    // Store business config in localStorage
    localStorage.setItem('businessConfig', JSON.stringify(config))
  }

  // Load business config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('businessConfig')
    if (savedConfig) {
      try {
        setBusinessConfig(JSON.parse(savedConfig))
      } catch (error) {
        console.error('Error loading business config:', error)
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show landing page first if user hasn't clicked "Get Started"
  if (showLandingPage && !user) {
    return (
      <>
        <LandingPage onGetStarted={handleGetStarted} />
        <Analytics />
      </>
    )
  }

  // If not logged in, show auth page
  if (!user) {
    return (
      <>
        <AuthPage onLogin={handleLogin} onBusinessSetupComplete={handleBusinessSetupComplete} />
        <Toaster />
        <Analytics />
      </>
    )
  }

  // If super admin, show super admin panel
  if (user.role === 'super_admin') {
    console.log('🎯 Super Admin detected, showing Super Admin Panel')
    return (
      <>
        <SuperAdminPanel onLogout={handleLogout} />
        <Toaster />
        <Analytics />
      </>
    )
  }

  // Debug: Log user role for troubleshooting
  console.log('🔍 Current user role:', user.role, 'User object:', user)

  // If cashier, show cashier dashboard
  if (user.role === 'cashier') {
    return (
      <>
        <CashierDashboard user={user} accessToken={accessToken} onLogout={handleLogout} selectedFeatures={businessConfig?.selectedFeatures} />
        <Toaster />
        <Analytics />
      </>
    )
  }


  // Admin dashboard with dynamic content based on business config
  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />
      case "products":
        return <ProductsPage />
      case "suppliers":
        return <SuppliersPage />
      case "orders":
        return <OrdersPage />
      case "corrections":
        return <CorrectionsPage />
      case "customers":
        return <CustomersPage />
      case "credit-management":
        return <CreditManagementPage />
      case "workers":
        return <WorkersManagementPage /> // Using WorkersManagementPage
      case "payroll":
        return <PayrollPage />
      case "reports":
        return <AdminReportsPage />
      case "settings":
        return <SettingsPage />
      case "location-management":
        return <LocationManagement businessConfig={businessConfig || undefined} />
      case "workers-management":
        return <WorkersManagementPage />
      case "enterprise-analytics":
        return <EnterpriseAnalytics businessConfig={businessConfig || {
          businessName: "Business",
          businessType: "retail",
          businessSize: "small",
          ownerName: "Owner",
          ownerPhone: "",
          businessEmail: "",
          businessPhone: "",
          businessAddress: "",
          city: "",
          region: "",
          registrationNumber: "",
          tinNumber: "",
          yearEstablished: "",
          numberOfEmployees: 0,
          locationCount: 1,
          description: "",
          productsCount: 0,
          averageMonthlySales: "0",
          selectedFeatures: [],
          paymentMethod: "monthly",
          dashboardType: "simple"
        }} />
      case "api-access":
        return <APIAccessPage />
      case "white-label":
        return <WhiteLabelPage />
      case "priority-support":
        return <PrioritySupportPage />
      case "custom-features":
        return <CustomFeaturesPage />
      default:
        return <Dashboard />
    }
  }

  return (
    <>
      <div className="flex h-screen bg-background">
        {/* Desktop Sidebar - rendered only on desktop */}
        {isDesktop && (
          <aside className="w-64 flex-shrink-0">
            <Sidebar 
              activeSection={activeSection} 
              setActiveSection={setActiveSection}
              user={user}
              onLogout={handleLogout}
              businessConfig={businessConfig}
            />
          </aside>
        )}

        {/* Mobile Sidebar - Sheet overlay for mobile */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-64" aria-describedby={undefined}>
            <Sidebar 
              activeSection={activeSection} 
              setActiveSection={setActiveSection}
              user={user}
              onLogout={handleLogout}
              onNavigate={() => setMobileMenuOpen(false)}
              businessConfig={businessConfig}
            />
          </SheetContent>
        </Sheet>

        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Mobile Menu Button - visible only on mobile */}
          {!isDesktop && (
            <div className="p-4 border-b border-border bg-card">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(true)}
                className="gap-2"
              >
                <Menu className="h-5 w-5" />
                <span>Menu</span>
              </Button>
            </div>
          )}


          <div className="flex-1 overflow-hidden">
            {renderContent()}
          </div>
        </main>
      </div>
      <Toaster />
      <Analytics />
    </>
  )
}