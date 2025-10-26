import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Checkbox } from "../ui/checkbox"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { CheckCircle, Eye, RefreshCw, Search, XCircle, Filter, Download, MoreHorizontal, CreditCard, Users, Settings, FileText, Calendar, DollarSign, Building2, Mail, Phone, MapPin, Star, AlertTriangle, Clock, CheckSquare, Square, Plus } from "lucide-react"

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
  
  // Business Details (from business_config)
  ownerName?: string
  ownerPhone?: string
  businessPhone?: string
  businessAddress?: string
  businessDescription?: string
  city?: string
  region?: string
  registrationNumber?: string
  tinNumber?: string
  yearEstablished?: number
  numberOfEmployees?: number
  productsCount?: number
  averageMonthlySales?: number
  businessSize?: string
  businessConfig?: any
}

interface SuperAdminBusinessesProps {
  businesses: Business[]
  onRefresh: () => void
}

export function SuperAdminBusinesses({ businesses, onRefresh }: SuperAdminBusinessesProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPlan, setFilterPlan] = useState("all")
  const [filterDate, setFilterDate] = useState("all")
  const [selected, setSelected] = useState<Business | null>(null)
  const [open, setOpen] = useState(false)
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState("")
  const [showBulkDialog, setShowBulkDialog] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showNewBusinessDialog, setShowNewBusinessDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // New Business Form State
  const [newBusiness, setNewBusiness] = useState({
    businessName: "",
    ownerEmail: "",
    ownerPassword: "",
    businessPhone: "",
    businessAddress: "",
    plan: "basic" as 'basic' | 'pro' | 'enterprise',
    businessType: "retail"
  })

  const filtered = useMemo(() => {
    return businesses.filter(b => {
      const matches = b.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      b.email.toLowerCase().includes(searchTerm.toLowerCase())
      const statusOk = filterStatus === 'all' || b.status === filterStatus
      const planOk = filterPlan === 'all' || b.plan === filterPlan
      
      let dateOk = true
      if (filterDate !== 'all') {
        const created = new Date(b.createdAt)
        const now = new Date()
        const daysDiff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
        
        switch (filterDate) {
          case 'today': dateOk = daysDiff === 0; break
          case 'week': dateOk = daysDiff <= 7; break
          case 'month': dateOk = daysDiff <= 30; break
          case 'quarter': dateOk = daysDiff <= 90; break
        }
      }
      
      return matches && statusOk && planOk && dateOk
    })
  }, [businesses, searchTerm, filterStatus, filterPlan, filterDate])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'inactive': return 'bg-red-500'
      case 'pending': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'bg-blue-500'
      case 'pro': return 'bg-purple-500'
      case 'enterprise': return 'bg-amber-500'
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

  const handleBulkSelect = (businessId: string) => {
    setSelectedBusinesses(prev => 
      prev.includes(businessId) 
        ? prev.filter(id => id !== businessId)
        : [...prev, businessId]
    )
  }

  const handleSelectAll = () => {
    if (selectedBusinesses.length === filtered.length) {
      setSelectedBusinesses([])
    } else {
      setSelectedBusinesses(filtered.map(b => b.id))
    }
  }

  const handleBulkAction = () => {
    if (bulkAction && selectedBusinesses.length > 0) {
      // TODO: Implement bulk actions
      console.log(`Performing ${bulkAction} on ${selectedBusinesses.length} businesses`)
      setShowBulkDialog(false)
      setSelectedBusinesses([])
      setBulkAction("")
    }
  }

  const handleCreateBusiness = async () => {
    // Validate form
    if (!newBusiness.businessName || !newBusiness.ownerEmail || !newBusiness.ownerPassword) {
      alert("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      // TODO: Implement actual business creation via superAdminService
      console.log("Creating new business:", newBusiness)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Reset form
      setNewBusiness({
        businessName: "",
        ownerEmail: "",
        ownerPassword: "",
        businessPhone: "",
        businessAddress: "",
        plan: "basic",
        businessType: "retail"
      })
      
      setShowNewBusinessDialog(false)
      alert("Business created successfully!")
      onRefresh()
    } catch (error) {
      console.error("Error creating business:", error)
      alert("Failed to create business")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Page Title */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Business Management</h1>
          <p className="text-muted-foreground">Manage all businesses and their settings</p>
        </div>
        <Button size="lg" onClick={() => setShowNewBusinessDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Business
        </Button>
      </div>

      {/* Enhanced Toolbar - Single Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Side - Search and Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search businesses, emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          {/* Filters */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPlan} onValueChange={setFilterPlan}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterDate} onValueChange={setFilterDate}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>

          {/* Bulk Actions */}
          {selectedBusinesses.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{selectedBusinesses.length} selected</span>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowBulkDialog(true)}
              >
                Bulk Actions
              </Button>
            </div>
          )}
        </div>
          
        {/* Right Side - View Toggle and Action Buttons */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex gap-1 border rounded-md">
            <Button
              size="sm"
              variant={viewMode === "grid" ? "default" : "ghost"}
              onClick={() => setViewMode("grid")}
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === "list" ? "default" : "ghost"}
              onClick={() => setViewMode("list")}
            >
              <FileText className="h-4 w-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Business Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((b) => (
            <Card key={b.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedBusinesses.includes(b.id)}
                      onCheckedChange={() => handleBulkSelect(b.id)}
                    />
                    <div>
                      <CardTitle className="text-lg">{b.businessName}</CardTitle>
                      <CardDescription className="capitalize">{b.businessType}</CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={`${getStatusColor(b.status)} text-white`}>{b.status}</Badge>
                    <Badge className={`${getPlanColor(b.plan)} text-white`}>{b.plan}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium truncate">{b.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Revenue</p>
                    <p className="font-medium">₵{b.monthlyRevenue}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Logins</p>
                    <p className="font-medium">{b.activeLogins}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment</p>
                    <Badge className={`${getPaymentStatusColor(b.paymentStatus)} text-white text-xs`}>
                      {b.paymentStatus}
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setSelected(b); setOpen(true) }}>
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                    <Button size="sm" variant="outline">
                      <CreditCard className="h-4 w-4 mr-1" /> Pay
                    </Button>
                  </div>
                  {b.setupComplete ? (
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                      <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((b) => (
            <Card key={b.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selectedBusinesses.includes(b.id)}
                      onCheckedChange={() => handleBulkSelect(b.id)}
                    />
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-medium">{b.businessName}</h3>
                        <p className="text-sm text-muted-foreground">{b.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={`${getStatusColor(b.status)} text-white`}>{b.status}</Badge>
                        <Badge className={`${getPlanColor(b.plan)} text-white`}>{b.plan}</Badge>
                        <Badge className={`${getPaymentStatusColor(b.paymentStatus)} text-white`}>
                          {b.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p className="font-medium">₵{b.monthlyRevenue}</p>
                      <p className="text-muted-foreground">{b.activeLogins} logins</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setSelected(b); setOpen(true) }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <CreditCard className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Enhanced Business Detail Drawer */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {selected?.businessName} - Business Details
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Business Details</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Business Information</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Business ID:</span>
                          <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{selected.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span className="font-medium">{selected.businessName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span className="font-medium capitalize">{selected.businessType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium">{selected.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Plan:</span>
                          <Badge className={`${getPlanColor(selected.plan)} text-white`}>{selected.plan}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge className={`${getStatusColor(selected.status)} text-white`}>{selected.status}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Performance Metrics</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Sales:</span>
                          <span className="font-medium">{selected.totalSales}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monthly Revenue:</span>
                          <span className="font-medium">₵{selected.monthlyRevenue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Active Logins:</span>
                          <span className="font-medium">{selected.activeLogins}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Setup Complete:</span>
                          <Badge className={selected.setupComplete ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
                            {selected.setupComplete ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Created:</span>
                          <span className="font-medium">{new Date(selected.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div className="space-y-6">
                  {/* Business ID Card */}
                  <Card className="border-2 border-primary/20 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Business Identifier
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-sm">Backend Business ID (UUID)</Label>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-muted px-3 py-2 rounded font-mono text-sm break-all">
                            {selected?.id}
                          </code>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(selected?.id || '')
                              // Could add toast notification here
                            }}
                          >
                            Copy
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          This ID is used to link all business data (workers, products, sales, etc.)
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Owner Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Owner Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground text-sm">Owner Name</Label>
                          <p className="font-medium mt-1">{selected?.ownerName || 'Not provided'}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-sm">Owner Phone</Label>
                          <p className="font-medium mt-1">{selected?.ownerPhone || 'Not provided'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Business Contact */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Business Contact
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground text-sm">Business Phone</Label>
                          <p className="font-medium mt-1">{selected?.businessPhone || 'Not provided'}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-sm">Business Email</Label>
                          <p className="font-medium mt-1">{selected?.email || 'Not provided'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Business Location */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-muted-foreground text-sm">Address</Label>
                          <p className="font-medium mt-1">{selected?.businessAddress || 'Not provided'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-muted-foreground text-sm">City</Label>
                            <p className="font-medium mt-1">{selected?.city || 'Not provided'}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground text-sm">Region</Label>
                            <p className="font-medium mt-1">{selected?.region || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Business Registration */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Registration Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground text-sm">Registration Number</Label>
                          <p className="font-medium mt-1">{selected?.registrationNumber || 'Not provided'}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-sm">TIN Number</Label>
                          <p className="font-medium mt-1">{selected?.tinNumber || 'Not provided'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Business Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Business Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground text-sm">Business Size</Label>
                          <p className="font-medium mt-1 capitalize">{selected?.businessSize || 'Not specified'}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-sm">Year Established</Label>
                          <p className="font-medium mt-1">{selected?.yearEstablished || 'Not provided'}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-sm">Number of Employees</Label>
                          <p className="font-medium mt-1">{selected?.numberOfEmployees || 'Not provided'}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-sm">Products Count</Label>
                          <p className="font-medium mt-1">{selected?.productsCount || 'Not provided'}</p>
                        </div>
                        <div className="col-span-2">
                          <Label className="text-muted-foreground text-sm">Average Monthly Sales</Label>
                          <p className="font-medium mt-1">
                            {selected?.averageMonthlySales 
                              ? `₵${Number(selected.averageMonthlySales).toLocaleString()}`
                              : 'Not provided'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Business Description */}
                  {selected?.businessDescription && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Business Idea / Description
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed">{selected.businessDescription}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Users & Logins</h3>
                    <Button size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">A</span>
                        </div>
                        <div>
                          <p className="font-medium">Admin User</p>
                          <p className="text-sm text-muted-foreground">admin@{selected.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Admin</Badge>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">C</span>
                        </div>
                        <div>
                          <p className="font-medium">Cashier User</p>
                          <p className="text-sm text-muted-foreground">cashier@{selected.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Cashier</Badge>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Feature Management</h3>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Apply Preset</Button>
                      <Button size="sm">Save Changes</Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Core Features</Label>
                      <div className="space-y-2">
                        {['Inventory', 'Sales', 'Customers', 'Reports'].map(feature => (
                          <div key={feature} className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">{feature}</span>
                            <Badge className="bg-green-500 text-white">Enabled</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Advanced Features</Label>
                      <div className="space-y-2">
                        {['Workers', 'Payroll', 'Multi-location', 'Analytics'].map(feature => (
                          <div key={feature} className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">{feature}</span>
                            <Badge className={selected.features.includes(feature.toLowerCase()) ? "bg-green-500 text-white" : "bg-gray-500 text-white"}>
                              {selected.features.includes(feature.toLowerCase()) ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="payments" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Payment History</h3>
                    <Button size="sm">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Record Payment
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">₵{selected.plan === 'basic' ? '1,500' : selected.plan === 'pro' ? '3,000' : '5,000'} - Upfront Payment</p>
                        <p className="text-sm text-muted-foreground">Paid on {new Date(selected.lastPayment).toLocaleDateString()}</p>
                      </div>
                      <Badge className={`${getPaymentStatusColor(selected.paymentStatus)} text-white`}>
                        {selected.paymentStatus}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">₵{selected.plan === 'basic' ? '200' : selected.plan === 'pro' ? '400' : '800'} - Maintenance Fee</p>
                        <p className="text-sm text-muted-foreground">Due on {new Date(selected.renewalDate).toLocaleDateString()}</p>
                      </div>
                      <Badge className="bg-yellow-500 text-white">Pending</Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Business Notes</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Add Note</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add notes about this business..."
                      className="min-h-24"
                    />
                    <Button size="sm">Save Note</Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium">System Note</span>
                        <span className="text-xs text-muted-foreground">2 days ago</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Business setup completed successfully. All features enabled.</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Action</Label>
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activate">Activate Selected</SelectItem>
                  <SelectItem value="deactivate">Deactivate Selected</SelectItem>
                  <SelectItem value="send_reminder">Send Payment Reminder</SelectItem>
                  <SelectItem value="apply_preset">Apply Feature Preset</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              This will affect {selectedBusinesses.length} businesses.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkAction} disabled={!bulkAction}>
              Apply Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Business Dialog */}
      <Dialog open={showNewBusinessDialog} onOpenChange={setShowNewBusinessDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Create New Business
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Business Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    placeholder="e.g., Acme Store"
                    value={newBusiness.businessName}
                    onChange={(e) => setNewBusiness({ ...newBusiness, businessName: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select 
                    value={newBusiness.businessType} 
                    onValueChange={(value: string) => setNewBusiness({ ...newBusiness, businessType: value })}
                  >
                    <SelectTrigger id="businessType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="wholesale">Wholesale</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="plan">Subscription Plan *</Label>
                  <Select 
                    value={newBusiness.plan} 
                    onValueChange={(value: string) => setNewBusiness({ ...newBusiness, plan: value as 'basic' | 'pro' | 'enterprise' })}
                  >
                    <SelectTrigger id="plan">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic - ₵200/month</SelectItem>
                      <SelectItem value="pro">Pro - ₵400/month</SelectItem>
                      <SelectItem value="enterprise">Enterprise - ₵800/month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="businessPhone">Phone Number</Label>
                  <Input
                    id="businessPhone"
                    type="tel"
                    placeholder="+233 XX XXX XXXX"
                    value={newBusiness.businessPhone}
                    onChange={(e) => setNewBusiness({ ...newBusiness, businessPhone: e.target.value })}
                  />
                </div>

                <div className="col-span-1">
                  <Label htmlFor="businessAddress">Business Address</Label>
                  <Input
                    id="businessAddress"
                    placeholder="Street, City, Region"
                    value={newBusiness.businessAddress}
                    onChange={(e) => setNewBusiness({ ...newBusiness, businessAddress: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Owner Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Owner Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="ownerEmail">Owner Email *</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    placeholder="owner@example.com"
                    value={newBusiness.ownerEmail}
                    onChange={(e) => setNewBusiness({ ...newBusiness, ownerEmail: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">This will be used for login and notifications</p>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="ownerPassword">Initial Password *</Label>
                  <Input
                    id="ownerPassword"
                    type="password"
                    placeholder="Create a secure password"
                    value={newBusiness.ownerPassword}
                    onChange={(e) => setNewBusiness({ ...newBusiness, ownerPassword: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Owner can change this after first login</p>
                </div>
              </div>
            </div>

            {/* Plan Details */}
            <div className="bg-muted/50 border rounded-lg p-4">
              <h3 className="font-medium mb-2">Plan Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selected Plan:</span>
                  <span className="font-medium capitalize">{newBusiness.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Fee:</span>
                  <span className="font-medium">
                    ₵{newBusiness.plan === 'basic' ? '200' : newBusiness.plan === 'pro' ? '400' : '800'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Features:</span>
                  <span className="font-medium">
                    {newBusiness.plan === 'basic' ? 'Core Features' : 
                     newBusiness.plan === 'pro' ? 'Core + Advanced' : 
                     'All Features'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowNewBusinessDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateBusiness}
              disabled={loading || !newBusiness.businessName || !newBusiness.ownerEmail || !newBusiness.ownerPassword}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Business
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


