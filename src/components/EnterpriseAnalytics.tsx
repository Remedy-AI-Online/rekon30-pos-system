import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Badge } from "./ui/badge"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  Area, 
  AreaChart,
  Tooltip,
  Legend,
  ComposedChart
} from "recharts"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  MapPin,
  Building2,
  Warehouse,
  Download,
  Filter,
  Store,
  ShoppingCart,
  Clock,
  Target,
  Activity,
  Eye,
  Calendar
} from "lucide-react"
import { BusinessConfig } from "./BusinessSetup"

interface EnterpriseAnalyticsProps {
  businessConfig: BusinessConfig
}

export function EnterpriseAnalytics({ businessConfig }: EnterpriseAnalyticsProps) {
  // State for time range filtering and loading
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("6months")
  const [loading, setLoading] = useState(true)
  const [locations, setLocations] = useState<any[]>([])
  const [locationPerformanceData, setLocationPerformanceData] = useState<any[]>([])
  const [dailyPerformanceData, setDailyPerformanceData] = useState<any[]>([])
  const [cashierPerformanceData, setCashierPerformanceData] = useState<any[]>([])
  const [productPerformanceData, setProductPerformanceData] = useState<any[]>([])

  useEffect(() => {
    loadAnalyticsData()
  }, [selectedTimeRange])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      // TODO: Implement actual data fetching from backend
      // This would fetch real analytics data based on the selected time range
      // For now, initialize with empty arrays
      setLocations([])
      setLocationPerformanceData([])
      setDailyPerformanceData([])
      setCashierPerformanceData([])
      setProductPerformanceData([])
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate totals across all locations (business-wide)
  const totalRevenue = locationPerformanceData.reduce((sum, loc) => sum + (loc.sales || 0), 0)
  const totalProfit = locationPerformanceData.reduce((sum, loc) => sum + (loc.profit || 0), 0)
  const totalOrders = locationPerformanceData.reduce((sum, loc) => sum + (loc.orders || 0), 0)
  const totalCashierInputs = locationPerformanceData.reduce((sum, loc) => sum + (loc.cashierInputs || 0), 0)
  const averageGrowth = locationPerformanceData.length > 0 
    ? locationPerformanceData.reduce((sum, loc) => sum + (loc.growth || 0), 0) / locationPerformanceData.length 
    : 0

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 h-full overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Business Analytics</h1>
          <p className="text-muted-foreground">
            Performance insights across all {locations.length} locations
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1week">Last Week</SelectItem>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button size="sm" className="h-8 px-3">
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
        </div>
      </div>


      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{averageGrowth.toFixed(1)}% across locations
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Cashier Inputs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalCashierInputs.toLocaleString()}</div>
            <div className="flex items-center text-xs text-blue-600">
              <Users className="h-3 w-3 mr-1" />
              Across all locations
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalOrders.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              Across all locations
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Avg Order Value</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${(totalRevenue / totalOrders).toFixed(0)}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              Per order average
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
          <TabsTrigger value="performance">Location Performance</TabsTrigger>
          <TabsTrigger value="cashiers">Cashier Performance</TabsTrigger>
          <TabsTrigger value="trends">Daily Trends</TabsTrigger>
          <TabsTrigger value="products">Product Analysis</TabsTrigger>
          <TabsTrigger value="comparison">Location Comparison</TabsTrigger>
        </TabsList>

        {/* Location Performance */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={locationPerformanceData}>
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
                <CardTitle>Cashier Input Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={locationPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cashierInputs" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Location Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {locationPerformanceData.map((location: any, index: number) => (
                  <div key={location.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-black text-white rounded-md flex items-center justify-center text-lg font-bold">
                        {index + 1}
                      </div>
                      <div className="space-y-1 ml-4">
                        <p className="font-semibold text-base">{location.name}</p>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div>{location.orders} orders</div>
                          <div>{location.cashierInputs} cashier inputs</div>
                          <div>Updated {location.lastUpdated}</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${location.sales.toLocaleString()}</p>
                      <p className="text-sm text-green-600 font-medium">+{location.growth}% growth</p>
                      <p className="text-xs text-muted-foreground">${location.avgOrderValue} avg order</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cashier Performance */}
        <TabsContent value="cashiers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cashier Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cashierPerformanceData.map((cashier, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-12">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-sm"
                        style={{ 
                          backgroundColor: '#3b82f6', 
                          color: '#ffffff',
                          border: '2px solid #1d4ed8'
                        }}
                      >

                        
                        {cashier.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-base">{cashier.name}</p>
                        <p className="text-sm text-muted-foreground">{cashier.location}</p>
                        <p className="text-xs text-muted-foreground">Last active: {cashier.lastActive}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${cashier.sales.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{cashier.orders} orders</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Activity className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">{cashier.efficiency}% efficiency</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Daily Trends */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={dailyPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="sales" fill="#8884d8" name="Sales ($)" />
                  <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#82ca9d" strokeWidth={3} name="Orders" />
                  <Line yAxisId="right" type="monotone" dataKey="cashierInputs" stroke="#ffc658" strokeWidth={3} name="Cashier Inputs" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Product Analysis */}
        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Products by Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productPerformanceData.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{product.product}</p>
                          <p className="text-sm text-muted-foreground">{product.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${product.sales.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{product.units} units</p>
                        <p className="text-xs text-green-600">{product.margin}% margin</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Performance Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productPerformanceData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="product" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Location Comparison */}
        <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardHeader>
              <CardTitle>Location Comparison</CardTitle>
              </CardHeader>
              <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {locationPerformanceData.map((location) => (
                    <div key={location.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{location.name}</h3>
                        <Badge variant={location.growth > 10 ? "default" : "secondary"}>
                          {location.growth}% growth
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Sales:</span>
                          <span className="font-medium">${location.sales.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Orders:</span>
                          <span className="font-medium">{location.orders}</span>
                        </div>
                      <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Cashier Inputs:</span>
                          <span className="font-medium">{location.cashierInputs}</span>
                      </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Avg Order:</span>
                          <span className="font-medium">${location.avgOrderValue}</span>
                      </div>
                      </div>
                    </div>
                  ))}
                </div>
          </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
