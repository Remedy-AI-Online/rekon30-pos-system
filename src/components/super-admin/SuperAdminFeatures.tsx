import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Checkbox } from "../ui/checkbox"
import { Textarea } from "../ui/textarea"
import { toast } from "sonner"
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Settings, 
  Star, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Building2,
  Package,
  ShoppingCart,
  BarChart3,
  CreditCard,
  FileText,
  Globe,
  Shield,
  Zap,
  Target,
  TrendingUp,
  Plus,
  Key,
  Copy,
  Eye,
  EyeOff,
  LayoutDashboard
} from "lucide-react"
import { superAdminService } from "../../utils/superAdminService"
import { dataService } from "../../utils/dataService"

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
}

interface SuperAdminFeaturesProps {
  businesses: Business[]
  onRefresh: () => void
}

interface CustomFeature {
  id: string
  feature_id: string
  feature_name: string
  feature_icon: string
  category: string
  description: string
  created_at: string
}

interface CustomFeatureRequest {
  id: string
  title: string
  description: string
  businessValue: string
  status: 'submitted' | 'reviewing' | 'approved' | 'in-development' | 'completed' | 'rejected'
  priority: 'low' | 'medium' | 'high'
  estimatedCost: number
  estimatedTime: string
  submittedDate: string
  updatedDate: string
  business_id: string
}

const CORE_FEATURES = ['dashboard', 'products', 'orders', 'workers', 'reports', 'settings']

const featureCatalog = {
  core: [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, description: 'Main business dashboard and overview' },
    { id: 'products', name: 'Products', icon: Package, description: 'Product management and inventory' },
    { id: 'orders', name: 'Orders', icon: FileText, description: 'Order processing and management' },
    { id: 'workers', name: 'Workers', icon: Users, description: 'Worker management and administration' },
    { id: 'reports', name: 'Reports', icon: BarChart3, description: 'Business reports and analytics' },
    { id: 'settings', name: 'Settings', icon: Settings, description: 'System settings and configuration' }
  ],
  advanced: [
    { id: 'customers', name: 'Customers', icon: Users, description: 'Customer management and database' },
    { id: 'workers-management', name: 'Workers Management', icon: Users, description: 'Advanced worker management tools' },
    { id: 'payroll', name: 'Payroll', icon: CreditCard, description: 'Payroll processing and management' },
    { id: 'suppliers', name: 'Suppliers', icon: Building2, description: 'Supplier and vendor management' },
    { id: 'location-management', name: 'Location Management', icon: Globe, description: 'Multi-location business management' },
    { id: 'credit-management', name: 'Credit Management', icon: CreditCard, description: 'Customer credit and payment management' }
  ],
  enterprise: [
    { id: 'api-access', name: 'API Access', icon: Zap, description: 'REST API for custom integrations' },
    { id: 'white-label', name: 'White Label', icon: Shield, description: 'Custom branding and white-label options' },
    { id: 'priority-support', name: 'Priority Support', icon: Star, description: '24/7 priority customer support' },
    { id: 'custom-features', name: 'Custom Features', icon: Target, description: 'Tailored features for specific needs' },
    { id: 'enterprise-analytics', name: 'Enterprise Analytics', icon: BarChart3, description: 'Advanced enterprise-level analytics' }
  ]
}

export function SuperAdminFeatures({ businesses, onRefresh }: SuperAdminFeaturesProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [showManageDialog, setShowManageDialog] = useState(false)
  const [showAddCustomDialog, setShowAddCustomDialog] = useState(false)
  const [customFeatures, setCustomFeatures] = useState<CustomFeature[]>([])
  const [customFeatureRequests, setCustomFeatureRequests] = useState<CustomFeatureRequest[]>([])
  const [featureStats, setFeatureStats] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({})
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  
  // Manage Features Dialog State
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [changeReason, setChangeReason] = useState("")
  
  // Add Custom Feature Dialog State
  const [newFeatureId, setNewFeatureId] = useState("")
  const [newFeatureName, setNewFeatureName] = useState("")
  const [newFeatureIcon, setNewFeatureIcon] = useState("Package")
  const [newFeatureCategory, setNewFeatureCategory] = useState("custom")
  const [newFeatureDescription, setNewFeatureDescription] = useState("")

  useEffect(() => {
    loadCustomFeatures()
    loadFeatureStats()
    
    // Subscribe to feature updates
    const subscription = superAdminService.subscribeToFeatureUpdates((payload) => {
      console.log('Feature update received:', payload)
      loadFeatureStats()
      onRefresh()
    })
    
    return () => {
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load custom feature requests when requests tab is active
  useEffect(() => {
    if (activeTab === 'requests') {
      loadCustomFeatureRequests()
    }
  }, [activeTab])

  const loadCustomFeatureRequests = async () => {
    try {
      setLoading(true)
      console.log("Loading custom feature requests for Super Admin...")
      const response = await dataService.getAllCustomFeatures()
      console.log("Super Admin custom features response:", response)
      if (response.success) {
        setCustomFeatureRequests(response.features || [])
        console.log("Custom feature requests loaded:", response.features)
      } else {
        console.error("Error loading custom feature requests:", response.error)
      }
    } catch (error) {
      console.error("Error loading custom feature requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadCustomFeatures = async () => {
    const { data, error } = await superAdminService.getCustomFeatures()
    if (data && !error) {
      setCustomFeatures(data)
    }
  }

  const loadFeatureStats = async () => {
    const { data, error } = await superAdminService.getFeatureStats()
    if (data && !error) {
      setFeatureStats(data.stats || {})
    }
  }

  const handleAddCustomFeature = async () => {
    if (!newFeatureId || !newFeatureName) {
      toast.error("Please provide feature ID and name")
      return
    }

    setLoading(true)
    const { success, error } = await superAdminService.addCustomFeature({
      feature_id: newFeatureId,
      feature_name: newFeatureName,
      feature_icon: newFeatureIcon,
      category: newFeatureCategory,
      description: newFeatureDescription
    })

    if (success) {
      toast.success("Custom feature added successfully!")
      setShowAddCustomDialog(false)
      setNewFeatureId("")
      setNewFeatureName("")
      setNewFeatureIcon("Package")
      setNewFeatureCategory("custom")
      setNewFeatureDescription("")
      loadCustomFeatures()
    } else {
      toast.error(error || "Failed to add custom feature")
    }
    setLoading(false)
  }

  const handleManageFeatures = (business: Business) => {
    setSelectedBusiness(business)
    setSelectedFeatures([...(business.features || [])])
    setChangeReason("")
    setShowManageDialog(true)
  }

  const handleSaveFeatures = async () => {
    if (!selectedBusiness) return
    
    if (!changeReason.trim()) {
      toast.error("Please provide a reason for this change")
      return
    }

    setLoading(true)
    
    const currentFeatures = selectedBusiness.features || []
    const featuresToAdd = selectedFeatures.filter(f => !currentFeatures.includes(f))
    const featuresToRemove = currentFeatures.filter(f => !selectedFeatures.includes(f))
    
    // Enable new features
    for (const feature of featuresToAdd) {
      const { success, error } = await superAdminService.enableFeature(
        selectedBusiness.id,
        feature,
        changeReason
      )
      if (!success) {
        toast.error(`Failed to enable ${feature}: ${error}`)
      }
    }
    
    // Disable removed features
    for (const feature of featuresToRemove) {
      if (CORE_FEATURES.includes(feature)) {
        toast.error(`Cannot remove core feature: ${feature}`)
        continue
      }
      const { success, error } = await superAdminService.disableFeature(
        selectedBusiness.id,
        feature,
        changeReason
      )
      if (!success) {
        toast.error(`Failed to disable ${feature}: ${error}`)
      }
    }
    
    toast.success("Features updated successfully!")
    setShowManageDialog(false)
    setLoading(false)
    onRefresh()
    loadFeatureStats()
  }

  const toggleFeature = (featureId: string) => {
    if (CORE_FEATURES.includes(featureId) && selectedFeatures.includes(featureId)) {
      toast.error("Cannot remove core features")
      return
    }
    
    if (selectedFeatures.includes(featureId)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== featureId))
    } else {
      setSelectedFeatures([...selectedFeatures, featureId])
    }
  }

  const copyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey)
    setCopiedKey(apiKey)
    toast.success("API key copied to clipboard!")
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const allFeatures = [
    ...featureCatalog.core,
    ...featureCatalog.advanced,
    ...featureCatalog.enterprise,
    ...customFeatures.map(cf => ({
      id: cf.feature_id,
      name: cf.feature_name,
      icon: Package, // Default icon
      description: cf.description
    }))
  ]

  const filteredBusinesses = businesses.filter(b => 
    b.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Feature Management
          </h2>
          <p className="text-muted-foreground">Manage features for all businesses</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddCustomDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Feature
          </Button>
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="businesses">Businesses</TabsTrigger>
          <TabsTrigger value="catalog">Feature Catalog</TabsTrigger>
          <TabsTrigger value="requests">Custom Requests</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Total Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{allFeatures.length}</div>
                <p className="text-xs text-muted-foreground">
                  {customFeatures.length} custom features
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Total Businesses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{businesses.length}</div>
                <p className="text-xs text-muted-foreground">
                  {businesses.filter(b => b.status === 'active').length} active
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Most Used Feature</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {Object.keys(featureStats).length > 0
                    ? Object.entries(featureStats).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
                    : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Object.keys(featureStats).length > 0
                    ? `${Object.entries(featureStats).sort((a, b) => b[1] - a[1])[0]?.[1] || 0} businesses`
                    : 'No data'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
                <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage features across your businesses</CardDescription>
                </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20" onClick={() => setActiveTab("catalog")}>
                  <div className="text-left w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-5 w-5" />
                      <span className="font-semibold">View Feature Catalog</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Browse all available features</p>
                  </div>
                </Button>
                
                <Button variant="outline" className="h-20" onClick={() => setActiveTab("businesses")}>
                  <div className="text-left w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="h-5 w-5" />
                      <span className="font-semibold">Manage Business Features</span>
                        </div>
                    <p className="text-xs text-muted-foreground">Enable/disable features per business</p>
                      </div>
                </Button>
                    </div>
                </CardContent>
              </Card>
        </TabsContent>

        {/* Businesses Tab */}
        <TabsContent value="businesses" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {filteredBusinesses.map((business) => (
              <Card key={business.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Building2 className="h-5 w-5 text-blue-500" />
                    <div>
                          <h4 className="font-medium">{business.businessName}</h4>
                          <p className="text-sm text-muted-foreground">{business.email}</p>
                    </div>
                        <Badge variant={business.plan === 'enterprise' ? 'default' : business.plan === 'pro' ? 'secondary' : 'outline'}>
                          {business.plan}
                    </Badge>
                  </div>

                      {/* API Key */}
                      <div className="mb-3">
                        <Label className="text-xs text-muted-foreground">API Key (for backups)</Label>
                        <div className="bg-gray-100 p-2 rounded flex items-center gap-2 mt-1">
                          <Key className="h-4 w-4 text-gray-500" />
                          <code className="text-sm font-mono flex-1">
                            {showApiKey[business.id] 
                              ? 'biz_' + business.id.substring(0, 20) 
                              : '••••••••••••••••••••••••'}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowApiKey({ ...showApiKey, [business.id]: !showApiKey[business.id] })}
                          >
                            {showApiKey[business.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyApiKey('biz_' + business.id)}
                          >
                            {copiedKey === 'biz_' + business.id ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                      </div>
                  </div>

                      {/* Features */}
                      <div>
                        <Label className="text-xs text-muted-foreground">Enabled Features ({business.features?.length || 0})</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {business.features && business.features.length > 0 ? (
                            business.features.map((featureId) => {
                              const feature = allFeatures.find(f => f.id === featureId)
                              const isCore = CORE_FEATURES.includes(featureId)
                              return (
                                <Badge 
                                  key={featureId}
                                  variant={isCore ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {feature?.name || featureId}
                                  {isCore && <Shield className="h-3 w-3 ml-1" />}
                                </Badge>
                              )
                            })
                          ) : (
                            <span className="text-sm text-muted-foreground">No features enabled</span>
                          )}
                        </div>
                      </div>
                  </div>

                    <Button onClick={() => handleManageFeatures(business)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Feature Catalog Tab */}
        <TabsContent value="catalog" className="space-y-4">
          <div className="grid gap-6">
            {/* Core Features */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Core Features (Cannot be removed)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {featureCatalog.core.map((feature) => {
                  const Icon = feature.icon
                  const count = featureStats[feature.id] || 0
                  return (
                    <Card key={feature.id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {feature.name}
                  </CardTitle>
                </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground mb-2">{feature.description}</p>
                        <Badge variant="secondary">{count} businesses</Badge>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Advanced Features */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Advanced Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {featureCatalog.advanced.map((feature) => {
                  const Icon = feature.icon
                  const count = featureStats[feature.id] || 0
                      return (
                    <Card key={feature.id}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {feature.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground mb-2">{feature.description}</p>
                        <Badge variant="secondary">{count} businesses</Badge>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
                        </div>

            {/* Enterprise Features */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Enterprise Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {featureCatalog.enterprise.map((feature) => {
                  const Icon = feature.icon
                  const count = featureStats[feature.id] || 0
                  return (
                    <Card key={feature.id}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {feature.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground mb-2">{feature.description}</p>
                        <Badge variant="secondary">{count} businesses</Badge>
                      </CardContent>
                    </Card>
                      )
                    })}
                  </div>
            </div>

            {/* Custom Features */}
            {customFeatures.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Custom Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {customFeatures.map((feature) => {
                    const count = featureStats[feature.feature_id] || 0
                    return (
                      <Card key={feature.id}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            {feature.feature_name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground mb-2">{feature.description}</p>
                          <Badge variant="secondary">{count} businesses</Badge>
                </CardContent>
              </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Custom Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Custom Feature Requests</CardTitle>
                  <CardDescription>Manage custom feature requests from Enterprise customers</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadCustomFeatureRequests}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading custom feature requests...</p>
                </div>
              ) : customFeatureRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Custom Feature Requests</h3>
                  <p className="text-muted-foreground mb-4">
                    No custom feature requests have been submitted yet.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Feature requests will appear here once Enterprise customers submit them through their Custom Features page.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customFeatureRequests.map((request) => {
                    const business = businesses.find(b => b.id === request.business_id)
                    return (
                      <Card key={request.id} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg">{request.title}</CardTitle>
                              <CardDescription>
                                From: {business?.businessName || 'Unknown Business'}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                request.status === 'submitted' ? 'secondary' :
                                request.status === 'reviewing' ? 'outline' :
                                request.status === 'approved' ? 'default' :
                                request.status === 'in-development' ? 'secondary' :
                                request.status === 'completed' ? 'default' : 'destructive'
                              }>
                                {request.status.replace('-', ' ')}
                              </Badge>
                              <Badge variant={
                                request.priority === 'high' ? 'destructive' :
                                request.priority === 'medium' ? 'default' : 'secondary'
                              }>
                                {request.priority} priority
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-sm font-medium">Description</Label>
                              <p className="text-sm text-muted-foreground mt-1">{request.description}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Business Value</Label>
                              <p className="text-sm text-muted-foreground mt-1">{request.businessValue}</p>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Submitted: {request.submittedDate}</span>
                              <span>Updated: {request.updatedDate}</span>
                              {request.estimatedCost > 0 && (
                                <span>Est. Cost: ${request.estimatedCost}</span>
                              )}
                              {request.estimatedTime !== 'TBD' && (
                                <span>Est. Time: {request.estimatedTime}</span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Usage Statistics</CardTitle>
              <CardDescription>See which features are most popular</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(featureStats).sort((a, b) => b[1] - a[1]).map(([featureId, count]) => {
                  const feature = allFeatures.find(f => f.id === featureId)
                  const percentage = businesses.length > 0 ? (count / businesses.length) * 100 : 0
                  return (
                    <div key={featureId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{feature?.name || featureId}</span>
                        <span className="text-sm text-muted-foreground">
                          {count} / {businesses.length} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
                
                {Object.keys(featureStats).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No feature usage data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Manage Features Dialog */}
      <Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Features - {selectedBusiness?.businessName}</DialogTitle>
            <DialogDescription>
              Enable or disable features for this business. Core features cannot be removed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Core Features Section */}
            <div>
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-foreground">
                <Shield className="h-4 w-4" />
                Core Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allFeatures.filter(f => CORE_FEATURES.includes(f.id)).map((feature) => {
                  const isEnabled = selectedFeatures.includes(feature.id)
                  const Icon = feature.icon
                  return (
                    <div key={feature.id} className="border rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isEnabled}
                          onCheckedChange={() => toggleFeature(feature.id)}
                          disabled={isEnabled}
                          className="mt-1 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                            <span className="font-medium">{feature.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
                          <Badge variant="default" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Core
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Advanced Features Section */}
            <div>
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-foreground">
                <TrendingUp className="h-4 w-4" />
                Advanced Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allFeatures.filter(f => !CORE_FEATURES.includes(f.id) && ['customers', 'workers-management', 'payroll', 'suppliers', 'location-management', 'credit-management'].includes(f.id)).map((feature) => {
                  const isEnabled = selectedFeatures.includes(feature.id)
                  const Icon = feature.icon
                  return (
                    <div key={feature.id} className={`border rounded-lg p-4 transition-colors ${isEnabled ? 'bg-blue-50 border-blue-200' : 'bg-background hover:bg-muted/50'}`}>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isEnabled}
                          onCheckedChange={() => toggleFeature(feature.id)}
                          className="mt-1 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                            <span className="font-medium">{feature.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
                        </div>

            {/* Enterprise Features Section */}
            <div>
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-foreground">
                <Star className="h-4 w-4" />
                Enterprise Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allFeatures.filter(f => !CORE_FEATURES.includes(f.id) && !['customers', 'workers-management', 'payroll', 'suppliers', 'location-management', 'credit-management'].includes(f.id)).map((feature) => {
                  const isEnabled = selectedFeatures.includes(feature.id)
                  const Icon = feature.icon
                  return (
                    <div key={feature.id} className={`border rounded-lg p-4 transition-colors ${isEnabled ? 'bg-purple-50 border-purple-200' : 'bg-background hover:bg-muted/50'}`}>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isEnabled}
                          onCheckedChange={() => toggleFeature(feature.id)}
                          className="mt-1 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                            <span className="font-medium">{feature.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                      </div>
                  )
                })}
                  </div>
              </div>
              
            <div className="border-t pt-6">
              <Label htmlFor="reason" className="text-sm font-semibold">Reason for Change *</Label>
              <Textarea
                id="reason"
                placeholder="Why are you making these changes? (e.g., 'Customer requested', 'Trial period', etc.)"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                rows={3}
                className="mt-2"
              />
              </div>
            </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManageDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveFeatures} disabled={loading || !changeReason.trim()}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Custom Feature Dialog */}
      <Dialog open={showAddCustomDialog} onOpenChange={setShowAddCustomDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Feature</DialogTitle>
            <DialogDescription>
              Create a new feature that can be assigned to businesses
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="feature-id">Feature ID *</Label>
              <Input
                id="feature-id"
                placeholder="e.g., loyalty-program"
                value={newFeatureId}
                onChange={(e) => setNewFeatureId(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              />
              <p className="text-xs text-muted-foreground mt-1">Use lowercase with hyphens</p>
            </div>
            
            <div>
              <Label htmlFor="feature-name">Feature Name *</Label>
              <Input
                id="feature-name"
                placeholder="e.g., Loyalty Program"
                value={newFeatureName}
                onChange={(e) => setNewFeatureName(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="feature-icon">Icon Name</Label>
              <Input
                id="feature-icon"
                placeholder="e.g., Package, Star, Gift"
                value={newFeatureIcon}
                onChange={(e) => setNewFeatureIcon(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">Lucide icon name</p>
            </div>
            
            <div>
              <Label htmlFor="feature-category">Category</Label>
              <Select value={newFeatureCategory} onValueChange={setNewFeatureCategory}>
                <SelectTrigger id="feature-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="feature-description">Description</Label>
              <Textarea
                id="feature-description"
                placeholder="Describe what this feature does..."
                value={newFeatureDescription}
                onChange={(e) => setNewFeatureDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCustomDialog(false)}>Cancel</Button>
            <Button onClick={handleAddCustomFeature} disabled={loading || !newFeatureId || !newFeatureName}>
              {loading ? "Adding..." : "Add Feature"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
