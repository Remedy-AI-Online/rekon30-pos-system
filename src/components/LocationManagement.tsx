import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Badge } from "./ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Building2, 
  Warehouse, 
  Store, 
  Users, 
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Activity,
  Clock,
  Target,
  Eye,
  BarChart3
} from "lucide-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { BusinessConfig } from "./BusinessSetup"
import { toast } from "sonner"

interface Location {
  id: string
  name: string
  type: 'shop' | 'warehouse' | 'office'
  address: string
  phone?: string
  manager?: string
  staffCount: number
  inventoryValue: number
  monthlySales: number
  status: 'active' | 'inactive'
  createdAt: string
  dailySales?: number
  cashierCount?: number
  avgOrderValue?: number
  totalOrders?: number
  growth?: number
}

interface LocationManagementProps {
  businessConfig?: BusinessConfig
}

export function LocationManagement({ businessConfig }: LocationManagementProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string>("all")
  const [formData, setFormData] = useState({
    name: "",
    type: "shop" as Location['type'],
    address: "",
    phone: "",
    manager: ""
  })

  useEffect(() => {
    loadLocations()
  }, [])

  const loadLocations = async () => {
    try {
      setLoading(true)
      // TODO: Implement actual API call to fetch locations
      // const response = await dataService.getLocations()
      // setLocations(response.locations)
      setLocations([])
    } catch (error) {
      console.error("Error loading locations:", error)
      toast.error("Failed to load locations")
    } finally {
      setLoading(false)
    }
  }

  const handleAddLocation = async () => {
    try {
      if (!formData.name || !formData.address) {
        toast.error("Name and address are required")
        return
      }

      const newLocation: Location = {
        id: `loc_${Date.now()}`,
        name: formData.name,
        type: formData.type,
        address: formData.address,
        phone: formData.phone,
        manager: formData.manager,
        staffCount: 0,
        inventoryValue: 0,
        monthlySales: 0,
        dailySales: 0,
        cashierCount: 0,
        avgOrderValue: 0,
        totalOrders: 0,
        growth: 0,
        status: "active",
        createdAt: new Date().toISOString().split('T')[0]
      }

      setLocations([...locations, newLocation])
      toast.success("Location added successfully")
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error adding location:", error)
      toast.error("Failed to add location")
    }
  }

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location)
    setFormData({
      name: location.name,
      type: location.type,
      address: location.address,
      phone: location.phone || "",
      manager: location.manager || ""
    })
    setDialogOpen(true)
  }

  const handleUpdateLocation = async () => {
    try {
      if (!editingLocation) return

      const updatedLocation = {
        ...editingLocation,
        ...formData
      }

      setLocations(locations.map(loc => 
        loc.id === editingLocation.id ? updatedLocation : loc
      ))
      
      toast.success("Location updated successfully")
      setDialogOpen(false)
      setEditingLocation(null)
      resetForm()
    } catch (error) {
      console.error("Error updating location:", error)
      toast.error("Failed to update location")
    }
  }

  const handleDeleteLocation = async (locationId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this location? This action cannot be undone.")
    
    if (!confirmed) return

    try {
      setLocations(locations.filter(loc => loc.id !== locationId))
      toast.success("Location deleted successfully")
    } catch (error) {
      console.error("Error deleting location:", error)
      toast.error("Failed to delete location")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "shop",
      address: "",
      phone: "",
      manager: ""
    })
    setEditingLocation(null)
  }

  const getLocationIcon = (type: Location['type']) => {
    switch (type) {
      case 'shop':
        return <Store className="h-4 w-4" />
      case 'warehouse':
        return <Warehouse className="h-4 w-4" />
      case 'office':
        return <Building2 className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const getLocationTypeBadge = (type: Location['type']) => {
    const config = {
      shop: { label: "Shop", color: "bg-blue-100 text-blue-800" },
      warehouse: { label: "Warehouse", color: "bg-green-100 text-green-800" },
      office: { label: "Office", color: "bg-purple-100 text-purple-800" }
    }
    
    const typeConfig = config[type]
    return <Badge className={typeConfig.color}>{typeConfig.label}</Badge>
  }

  const getStatusBadge = (status: Location['status']) => {
    return status === 'active' 
      ? <Badge className="bg-green-100 text-green-800">Active</Badge>
      : <Badge className="bg-red-100 text-red-800">Inactive</Badge>
  }

  // Get selected location data
  const selectedLocationData = selectedLocation === "all" 
    ? null 
    : locations.find(loc => loc.id === selectedLocation)

  // Calculate totals
  const filteredLocations = selectedLocation === "all" ? locations : locations.filter(loc => loc.id === selectedLocation)
  const totalLocations = locations.length
  const activeLocations = locations.filter(loc => loc.status === 'active').length
  const totalStaff = filteredLocations.reduce((sum, loc) => sum + loc.staffCount, 0)
  const totalInventoryValue = filteredLocations.reduce((sum, loc) => sum + loc.inventoryValue, 0)
  const totalMonthlySales = filteredLocations.reduce((sum, loc) => sum + loc.monthlySales, 0)
  const totalDailySales = filteredLocations.reduce((sum, loc) => sum + (loc.dailySales || 0), 0)
  const totalOrders = filteredLocations.reduce((sum, loc) => sum + (loc.totalOrders || 0), 0)
  const avgOrderValue = totalOrders > 0 ? totalMonthlySales / totalOrders : 0

  // Chart data
  const salesComparisonData = locations.map(loc => ({
    name: loc.name,
    sales: loc.monthlySales,
    orders: loc.totalOrders
  }))

  const performanceData = locations.map(loc => ({
    name: loc.name,
    growth: loc.growth || 0,
    efficiency: ((loc.monthlySales || 0) / (loc.staffCount || 1) / 1000).toFixed(1)
  }))

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  // Daily trend data (calculated from real data)
  const dailyTrendData: any[] = []

  if (loading) {
    return (
      <div className="p-6 space-y-6 h-full overflow-auto flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span>Loading locations...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 h-full overflow-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold">Location Management</h1>
          <p className="text-muted-foreground">
            Manage your {businessConfig?.locationCount || totalLocations} location{(businessConfig?.locationCount || totalLocations) > 1 ? 's' : ''} and track performance
          </p>
        </div>
        
        <div className="flex items-center gap-3 ml-auto">
          {/* Location Selector */}
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingLocation ? "Edit Location" : "Add New Location"}
                </DialogTitle>
                <DialogDescription>
                  {editingLocation ? "Update location information" : "Add a new location to your business"}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Location Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter location name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Location Type</Label>
                    <Select value={formData.type} onValueChange={(value: Location['type']) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shop">Shop</SelectItem>
                        <SelectItem value="warehouse">Warehouse</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter full address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="manager">Manager</Label>
                    <Input
                      id="manager"
                      placeholder="Enter manager name"
                      value={formData.manager}
                      onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={editingLocation ? handleUpdateLocation : handleAddLocation}>
                  {editingLocation ? "Update Location" : "Add Location"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">
              {selectedLocation === "all" ? "Total Locations" : "Location Status"}
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedLocation === "all" ? totalLocations : selectedLocationData?.name}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedLocation === "all" ? `${activeLocations} active` : getStatusBadge(selectedLocationData?.status || 'active')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Monthly Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMonthlySales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {selectedLocation === "all" ? "All locations" : selectedLocationData?.name}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStaff}</div>
            <p className="text-xs text-muted-foreground">
              Across {selectedLocation === "all" ? "all locations" : "this location"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Avg Order Value</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgOrderValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              {totalOrders} orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="manage">Manage Locations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Location</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Sales Trend</CardTitle>
                <CardDescription>
                  {selectedLocation === "all" ? "All locations combined" : selectedLocationData?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Location Performance Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Location Performance</CardTitle>
              <CardDescription>Key metrics for each location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredLocations.map((location) => (
                  <div key={location.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          {getLocationIcon(location.type)}
                        </div>
                        <div>
                          <h4 className="font-semibold">{location.name}</h4>
                          <p className="text-sm text-muted-foreground">{location.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getLocationTypeBadge(location.type)}
                        {getStatusBadge(location.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Monthly Sales</p>
                        <p className="text-lg font-semibold">${location.monthlySales.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Orders</p>
                        <p className="text-lg font-semibold">{location.totalOrders}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Staff</p>
                        <p className="text-lg font-semibold">{location.staffCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Inventory</p>
                        <p className="text-lg font-semibold">${(location.inventoryValue / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Growth</p>
                        <div className="flex items-center gap-1">
                          {(location.growth || 0) >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <p className={`text-lg font-semibold ${(location.growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {Math.abs(location.growth || 0).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance by Location</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="growth" fill="#82ca9d" name="Growth %" />
                    <Bar dataKey="efficiency" fill="#8884d8" name="Efficiency (K/staff)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={salesComparisonData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.name}: $${(entry.sales / 1000).toFixed(0)}K`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="sales"
                    >
                      {salesComparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Sales/Staff</TableHead>
                    <TableHead>Avg Order</TableHead>
                    <TableHead>Orders/Day</TableHead>
                    <TableHead>Growth</TableHead>
                    <TableHead>Manager</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLocations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell className="font-medium">{location.name}</TableCell>
                      <TableCell>${((location.monthlySales || 0) / (location.staffCount || 1) / 1000).toFixed(1)}K</TableCell>
                      <TableCell>${((location.monthlySales || 0) / (location.totalOrders || 1)).toFixed(0)}</TableCell>
                      <TableCell>{((location.totalOrders || 0) / 30).toFixed(1)}</TableCell>
                      <TableCell>
                        <span className={(location.growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {(location.growth || 0) >= 0 ? '+' : ''}{(location.growth || 0).toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>{location.manager || "Not assigned"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Locations Tab */}
        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                All Locations ({locations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {locations.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No locations yet</p>
                  <p className="text-muted-foreground text-sm">Add your first location to get started</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Manager</TableHead>
                        <TableHead>Staff</TableHead>
                        <TableHead>Inventory</TableHead>
                        <TableHead>Sales</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {locations.map((location) => (
                        <TableRow key={location.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{location.name}</p>
                              <p className="text-sm text-muted-foreground">{location.address}</p>
                              {location.phone && (
                                <p className="text-sm text-muted-foreground">{location.phone}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getLocationIcon(location.type)}
                              {getLocationTypeBadge(location.type)}
                            </div>
                          </TableCell>
                          <TableCell>{location.manager || "Not assigned"}</TableCell>
                          <TableCell>{location.staffCount}</TableCell>
                          <TableCell>${location.inventoryValue.toLocaleString()}</TableCell>
                          <TableCell>${location.monthlySales.toLocaleString()}</TableCell>
                          <TableCell>{getStatusBadge(location.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditLocation(location)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteLocation(location.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
