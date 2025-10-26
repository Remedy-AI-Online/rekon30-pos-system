import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"
import { SuperAdminSidebar } from "./SuperAdminSidebar"
import { SuperAdminDashboard } from "./super-admin/SuperAdminDashboard"
import { SuperAdminSignupRequests } from "./super-admin/SuperAdminSignupRequests"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { SuperAdminBusinesses } from "./super-admin/SuperAdminBusinesses"
import { SuperAdminPayments } from "./super-admin/SuperAdminPayments"
import { SuperAdminFeatures } from "./super-admin/SuperAdminFeatures"
import { SuperAdminAnalytics } from "./super-admin/SuperAdminAnalytics"
import { SuperAdminSettings } from "./super-admin/SuperAdminSettings"
import { SuperAdminBackups } from "./super-admin/SuperAdminBackups"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Textarea } from "./ui/textarea"
import { Sheet, SheetContent } from "./ui/sheet"
import { Menu } from "lucide-react"
import { toast } from "sonner"
import { superAdminService } from "../utils/superAdminService"
import { 
  Users, 
  Building2, 
  DollarSign, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  AlertTriangle,
  Calendar,
  CreditCard,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Monitor,
  Bell,
  Mail,
  Phone,
  Star,
  Minus,
  Package,
  ShoppingCart,
  MapPin
} from "lucide-react"

interface Business {
  id: string
  businessName: string
  businessType: string
  email: string
  plan: 'basic' | 'pro' | 'enterprise'
  status: 'active' | 'inactive' | 'pending'
  features: string[]
  paymentStatus: 'paid' | 'pending' | 'overdue'
  lastPayment: string
  renewalDate: string
  totalSales: number
  monthlyRevenue: number
  setupComplete: boolean
  activeLogins: number
  createdAt: string
  // Additional fields from database
  business_type?: string
  business_phone?: string
  business_address?: string
  next_payment_date?: string
  next_maintenance_due?: string
  payment_history?: any[]
}

interface SuperAdminPanelProps {
  onLogout: () => void
}

const allFeatures = [
  { id: 'dashboard', name: 'Dashboard', icon: BarChart3, category: 'core' },
  { id: 'products', name: 'Products', icon: Package, category: 'core' },
  { id: 'orders', name: 'Orders', icon: ShoppingCart, category: 'core' },
  { id: 'reports', name: 'Reports', icon: BarChart3, category: 'core' },
  { id: 'settings', name: 'Settings', icon: Settings, category: 'core' },
  { id: 'workers', name: 'Workers', icon: Users, category: 'advanced' },
  { id: 'customers', name: 'Customers', icon: Users, category: 'advanced' },
  { id: 'multi-location', name: 'Multi-location', icon: MapPin, category: 'advanced' },
  { id: 'warehouse', name: 'Warehouse', icon: Building2, category: 'enterprise' },
  { id: 'analytics', name: 'Analytics', icon: TrendingUp, category: 'enterprise' },
  { id: 'api', name: 'API Access', icon: Globe, category: 'enterprise' },
  { id: 'priority-support', name: 'Priority Support', icon: Star, category: 'enterprise' }
]

export function SuperAdminPanel({ onLogout }: SuperAdminPanelProps) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [showBusinessDetails, setShowBusinessDetails] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [paymentData, setPaymentData] = useState({
    businessId: "",
    amount: "",
    paymentMethod: "",
    reference: "",
    notes: ""
  })

  useEffect(() => {
    loadBusinesses()

    // Subscribe to realtime updates for businesses
    const businessSubscription = superAdminService.subscribeToBusinessUpdates((payload) => {
      console.log('Business update received:', payload)
      // Reload businesses when there's a change
      loadBusinesses()
    })

    // Subscribe to payment updates
    const paymentSubscription = superAdminService.subscribeToPaymentUpdates((payload) => {
      console.log('Payment update received:', payload)
      // Reload businesses to update payment statuses
      loadBusinesses()
    })

    // Cleanup subscriptions on unmount
    return () => {
      businessSubscription.unsubscribe()
      paymentSubscription.unsubscribe()
    }
  }, [])

  // Handle window resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const loadBusinesses = async () => {
    setLoading(true)
    try {
      const { data, error } = await superAdminService.getAllBusinesses()
      
      if (error) {
        toast.error(`Failed to load businesses: ${error}`)
        // Fallback to empty array if there's an error
        setBusinesses([])
        return
      }

      if (data && data.length > 0) {
        // Transform database data to match our Business interface
        const transformedBusinesses: Business[] = data.map((dbBusiness: any) => ({
          id: dbBusiness.id,
          businessName: dbBusiness.business_name,
          businessType: dbBusiness.business_type || 'retail',
          email: dbBusiness.email || dbBusiness.owner_email || 'No email',
          plan: dbBusiness.plan,
          status: dbBusiness.status,
          features: dbBusiness.features || ["dashboard", "products", "orders", "reports"],
          paymentStatus: dbBusiness.payment_status,
          lastPayment: dbBusiness.last_payment_date || '',
          renewalDate: dbBusiness.next_payment_date || dbBusiness.next_maintenance_due || '',
          totalSales: 0, // Can be calculated from sales data later
          monthlyRevenue: dbBusiness.monthly_revenue || (dbBusiness.upfront_payment + dbBusiness.maintenance_fee) || 0,
          setupComplete: dbBusiness.setup_complete !== false, // Default to true if column doesn't exist
          activeLogins: 0, // Can be tracked with authentication later
          createdAt: dbBusiness.created_at,
          
          // Business Details (new fields)
          ownerName: dbBusiness.owner_name,
          ownerPhone: dbBusiness.owner_phone,
          businessPhone: dbBusiness.business_phone,
          businessAddress: dbBusiness.business_address,
          businessDescription: dbBusiness.business_description,
          city: dbBusiness.city,
          region: dbBusiness.region,
          registrationNumber: dbBusiness.registration_number,
          tinNumber: dbBusiness.tin_number,
          yearEstablished: dbBusiness.year_established,
          numberOfEmployees: dbBusiness.number_of_employees,
          productsCount: dbBusiness.products_count,
          averageMonthlySales: dbBusiness.average_monthly_sales,
          businessSize: dbBusiness.business_size,
          businessConfig: dbBusiness.business_config,
          
          // Additional database fields (for backwards compatibility)
          business_type: dbBusiness.business_type,
          business_phone: dbBusiness.business_phone,
          business_address: dbBusiness.business_address,
          next_payment_date: dbBusiness.next_payment_date,
          next_maintenance_due: dbBusiness.next_maintenance_due,
          payment_history: dbBusiness.payment_history
        }))
        setBusinesses(transformedBusinesses)
        toast.success(`Loaded ${transformedBusinesses.length} businesses`)
      } else {
        // No businesses yet
        setBusinesses([])
        toast.info("No businesses found")
      }
    } catch (error: any) {
      console.error('Error loading businesses:', error)
      toast.error("Failed to load businesses")
      setBusinesses([])
    } finally {
      setLoading(false)
    }
  }

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || business.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const dashboardStats = {
    totalBusinesses: businesses.length,
    activeBusinesses: businesses.filter(b => b.status === 'active').length,
    totalRevenue: businesses.reduce((sum, b) => sum + b.monthlyRevenue, 0),
    overduePayments: businesses.filter(b => b.paymentStatus === 'overdue').length,
    newThisMonth: businesses.filter(b => {
      const created = new Date(b.createdAt)
      const now = new Date()
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    }).length,
    renewalsDue: businesses.filter(b => {
      const renewal = new Date(b.renewalDate)
      const now = new Date()
      const daysUntilRenewal = Math.ceil((renewal.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilRenewal <= 30 && daysUntilRenewal >= 0
    }).length
  }

  const toggleBusinessStatus = async (businessId: string, newStatus: 'active' | 'inactive') => {
    try {
      setBusinesses(prev => prev.map(b => 
        b.id === businessId ? { ...b, status: newStatus } : b
      ))
      toast.success(`Business ${newStatus === 'active' ? 'activated' : 'deactivated'}`)
    } catch (error) {
      toast.error("Failed to update business status")
    }
  }

  const toggleBusinessFeature = async (businessId: string, featureId: string) => {
    try {
      setBusinesses(prev => prev.map(b => {
        if (b.id === businessId) {
          const hasFeature = b.features.includes(featureId)
          const newFeatures = hasFeature 
            ? b.features.filter(f => f !== featureId)
            : [...b.features, featureId]
          return { ...b, features: newFeatures }
        }
        return b
      }))
      toast.success("Feature updated")
    } catch (error) {
      toast.error("Failed to update feature")
    }
  }

  const handlePaymentSubmit = async () => {
    try {
      // Add payment logic here
      toast.success("Payment recorded successfully")
      setShowPaymentDialog(false)
      setPaymentData({ businessId: "", amount: "", paymentMethod: "", reference: "", notes: "" })
    } catch (error) {
      toast.error("Failed to record payment")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'inactive': return 'bg-red-500'
      case 'pending': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500'
      case 'overdue': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'bg-blue-500'
      case 'pro': return 'bg-purple-500'
      case 'enterprise': return 'bg-gold-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading Super Admin Panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar - rendered only on desktop */}
      {isDesktop && (
        <aside className="w-64 flex-shrink-0">
          <SuperAdminSidebar
            activeTab={activeTab}
            onSelect={setActiveTab}
            user={{ name: 'Super Admin', role: 'super_admin' }}
            onLogout={onLogout}
          />
        </aside>
      )}

      {/* Mobile Sidebar - Sheet overlay for mobile */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64" aria-describedby={undefined}>
          <SuperAdminSidebar
            activeTab={activeTab}
            onSelect={(tab) => {
              setActiveTab(tab)
              setMobileMenuOpen(false)
            }}
            user={{ name: 'Super Admin', role: 'super_admin' }}
            onLogout={onLogout}
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
              <span>Super Admin Menu</span>
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          <div className="p-4 compact-spacing h-full overflow-auto">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <RefreshCw className="h-12 w-12 animate-spin mx-auto text-primary" />
                <p className="text-lg font-medium">Loading data...</p>
              </div>
            </div>
          )}

          {/* Dashboard Tab */}
          {!loading && activeTab === "dashboard" && (
            <div className="space-y-4">
              <SuperAdminDashboard 
                stats={dashboardStats} 
                businesses={businesses} 
                onNavigate={setActiveTab}
                onVerifyPayment={() => setShowPaymentDialog(true)}
              />
            </div>
          )}

          {/* Signup Requests Tab */}
          {!loading && activeTab === "signup-requests" && (
            <div className="space-y-4">
              <SuperAdminSignupRequests />
            </div>
          )}

          {/* Businesses Tab */}
          {!loading && activeTab === "businesses" && (
            <div className="space-y-4">
              <SuperAdminBusinesses businesses={businesses as any} onRefresh={loadBusinesses} />
            </div>
          )}

          {/* Payments Tab */}
          {!loading && activeTab === "payments" && (
            <div className="space-y-4">
              <SuperAdminPayments businesses={businesses as any} onRefresh={loadBusinesses} />
            </div>
          )}

          {/* Features Tab */}
          {!loading && activeTab === "features" && (
            <div className="space-y-4">
              <SuperAdminFeatures businesses={businesses as any} onRefresh={loadBusinesses} />
            </div>
          )}

          {/* Backups Tab */}
          {!loading && activeTab === "backups" && (
            <div className="space-y-4">
              <SuperAdminBackups businesses={businesses as any} onRefresh={loadBusinesses} />
            </div>
          )}

          {/* Analytics Tab */}
          {!loading && activeTab === "analytics" && (
            <div className="space-y-4">
              <SuperAdminAnalytics businesses={businesses as any} onRefresh={loadBusinesses} />
            </div>
          )}

          {/* Settings Tab */}
          {!loading && activeTab === "settings" && (
            <div className="space-y-4">
              <SuperAdminSettings onRefresh={loadBusinesses} />
            </div>
          )}

          {/* Default fallback */}
          {!loading && !activeTab && (
            <div className="space-y-4">
              <SuperAdminDashboard 
                stats={dashboardStats} 
                businesses={businesses} 
                onNavigate={setActiveTab}
                onVerifyPayment={() => setShowPaymentDialog(true)}
              />
            </div>
          )}
        </div>
      </div>
    </main>

    {/* Business Details Dialog */}
    <Dialog open={showBusinessDetails} onOpenChange={setShowBusinessDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Business Details</DialogTitle>
          </DialogHeader>
          {selectedBusiness && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Business Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">Name:</span> {selectedBusiness!.businessName}</p>
                    <p><span className="font-semibold">Type:</span> {selectedBusiness!.businessType}</p>
                    <p><span className="font-semibold">Email:</span> {selectedBusiness!.email}</p>
                    <p><span className="font-semibold">Plan:</span> {selectedBusiness!.plan}</p>
                    <p><span className="font-semibold">Status:</span> {selectedBusiness!.status}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Performance</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">Total Sales:</span> {selectedBusiness!.totalSales}</p>
                    <p><span className="font-semibold">Monthly Revenue:</span> ₵{selectedBusiness!.monthlyRevenue}</p>
                    <p><span className="font-semibold">Active Logins:</span> {selectedBusiness!.activeLogins}</p>
                    <p><span className="font-semibold">Setup Complete:</span> {selectedBusiness!.setupComplete ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Features</h3>
                <div className="grid grid-cols-3 gap-2">
                  {allFeatures.map(feature => (
                    <div key={feature.id} className="flex items-center space-x-2">
                      <feature.icon className="h-4 w-4" />
                      <span className="text-sm">{feature.name}</span>
                      {selectedBusiness!.features.includes(feature.id) ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    {/* Payment Verification Dialog */}
    <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Verify Payment
          </DialogTitle>
          <DialogDescription>
            Manually verify a payment for a business
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="business-select">Select Business</Label>
            <Select
              value={paymentData.businessId}
              onValueChange={(value: string) => setPaymentData({...paymentData, businessId: value})}
            >
              <SelectTrigger id="business-select">
                <SelectValue placeholder="Choose a business" />
              </SelectTrigger>
              <SelectContent>
                {businesses.map(business => (
                  <SelectItem key={business.id} value={business.id}>
                    {business.businessName} - {business.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Amount (₵)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="400"
              value={paymentData.amount}
              onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select
              value={paymentData.paymentMethod}
              onValueChange={(value: string) => setPaymentData({...paymentData, paymentMethod: value})}
            >
              <SelectTrigger id="payment-method">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MoMo">Mobile Money (MoMo)</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reference">Reference/Transaction ID (Optional)</Label>
            <Input
              id="reference"
              placeholder="e.g., TXN123456"
              value={paymentData.reference}
              onChange={(e) => setPaymentData({...paymentData, reference: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this payment..."
              value={paymentData.notes}
              onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
              rows={3}
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-600">
              <strong>Note:</strong> This will mark the payment as verified and update the business payment status.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            setShowPaymentDialog(false)
            setPaymentData({
              businessId: "",
              amount: "",
              paymentMethod: "",
              reference: "",
              notes: ""
            })
          }}>
            Cancel
          </Button>
          <Button onClick={async () => {
            if (!paymentData.businessId || !paymentData.amount || !paymentData.paymentMethod) {
              toast.error("Please fill in all required fields")
              return
            }

            try {
              const { success, error } = await superAdminService.verifyPayment({
                business_id: paymentData.businessId,
                amount: parseFloat(paymentData.amount),
                payment_type: parseFloat(paymentData.amount) >= 1000 ? 'upfront' : 'maintenance',
                payment_method: paymentData.paymentMethod,
                notes: paymentData.notes || undefined
              })

              if (success) {
                toast.success("Payment verified successfully!")
                setShowPaymentDialog(false)
                setPaymentData({
                  businessId: "",
                  amount: "",
                  paymentMethod: "",
                  reference: "",
                  notes: ""
                })
                loadBusinesses() // Reload to see updated status
              } else {
                toast.error(error || "Failed to verify payment")
              }
            } catch (error: any) {
              toast.error(`Error: ${error.message}`)
            }
          }}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Verify Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
)
}