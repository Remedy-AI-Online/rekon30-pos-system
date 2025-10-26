import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, Tooltip } from "recharts"
import { DollarSign, Package, ShoppingCart, TrendingUp, Users, Loader2, TrendingDown, Warehouse } from "lucide-react"
import { ReportingStatus } from "./ReportingStatus"
import { dataService } from "../utils/dataService"
import { toast } from "sonner"
import { getSupabaseClient } from "../utils/authService"

// Error Boundary Component
interface DashboardErrorBoundaryProps {
  children: React.ReactNode;
}

interface DashboardErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class DashboardErrorBoundary extends React.Component<DashboardErrorBoundaryProps, DashboardErrorBoundaryState> {
  constructor(props: DashboardErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <div className="text-center py-8">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Dashboard Error</h2>
            <p className="text-muted-foreground mb-4">
              Something went wrong loading the dashboard. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Refresh Page
            </button>
            {this.state.error && (
              <pre className="mt-4 text-xs text-red-500 text-left whitespace-pre-wrap break-all">
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [businessName, setBusinessName] = useState<string>('Loading...')
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [profitPeriod, setProfitPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [profitAnalysis, setProfitAnalysis] = useState<any>(null)

  useEffect(() => {
    loadBusinessName()
    loadDashboardData()
    loadProfitAnalysis()
  }, [])

  const loadBusinessName = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user?.user_metadata?.business_id) {
        const { data, error } = await supabase
          .from('businesses')
          .select('business_name')
          .eq('id', user.user_metadata.business_id)
          .single()
        
        if (!error && data) {
          setBusinessName(data.business_name || 'My Business')
        } else {
          setBusinessName('My Business')
        }
      } else {
        setBusinessName('My Business')
      }
    } catch (error) {
      console.error('Error loading business name:', error)
      setBusinessName('My Business')
    }
  }

  useEffect(() => {
    loadProfitAnalysis()
  }, [profitPeriod])

  const loadDashboardData = async () => {
    try {
      console.log("🔄 Loading dashboard data...")
      setLoading(true)

      const response = await dataService.getDashboardSummary()
      console.log("📊 Dashboard response:", response)
      if (response.success) {
        setDashboardData(response.summary)
        console.log("✅ Dashboard data loaded successfully")
      } else {
        toast.error("Failed to load dashboard data")
      }
    } catch (error) {
      console.error("❌ Error loading dashboard data:", error)
      toast.error("Error loading dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const loadProfitAnalysis = async () => {
    try {
      console.log(`🔄 Loading profit analysis for period: ${profitPeriod}...`)
      const response = await dataService.getProfitAnalysis(profitPeriod)
      console.log("📈 Profit analysis response:", response)
      if (response.success) {
        setProfitAnalysis(response.analysis)
        console.log("✅ Profit analysis loaded successfully")
      } else {
        console.error("❌ Failed to load profit analysis:", response.error)
      }
    } catch (error) {
      console.error("❌ Error loading profit analysis:", error)
    }
  }

  if (loading) {
    return (
      <div className="p-4 compact-spacing h-full overflow-auto flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="p-4 compact-spacing h-full overflow-auto">
        <div className="text-center py-8">
          <h2 className="text-lg font-semibold mb-2">Dashboard Loading</h2>
          <p className="text-muted-foreground">No data available or still loading...</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`
  const formatGrowth = (growth: number) => `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`

  const chartData = dashboardData.weeklyData?.map((day: any) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sales: day.amount,
    transactions: day.transactions
  })) || []

  return (
    <DashboardErrorBoundary>
      <div className="p-4 compact-spacing h-full overflow-auto">
        {/* Header */}
        <div>
          <h1 className="text-xl">{businessName} Dashboard</h1>
          <p className="text-muted-foreground text-sm">Business management system</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="compact-card-header flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs">Today's Revenue</CardTitle>
              <DollarSign className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="compact-card-content">
              <div className="text-lg font-semibold">{formatCurrency(dashboardData.today.sales)}</div>
              <p className="text-xs text-muted-foreground">
                <span className={dashboardData.growth.sales >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatGrowth(dashboardData.growth.sales)}
                </span> from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="compact-card-header flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs">Today's Transactions</CardTitle>
              <ShoppingCart className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="compact-card-content">
              <div className="text-lg font-semibold">{dashboardData.today.transactions}</div>
              <p className="text-xs text-muted-foreground">
                <span className={dashboardData.growth.transactions >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatGrowth(dashboardData.growth.transactions)}
                </span> from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="compact-card-header flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs">Products</CardTitle>
              <Package className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="compact-card-content">
              <div className="text-lg font-semibold">{dashboardData.counts.products}</div>
              <p className="text-xs text-muted-foreground">
                Total products in inventory
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="compact-card-header flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs">Customers</CardTitle>
              <Users className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="compact-card-content">
              <div className="text-lg font-semibold">{dashboardData.counts.customers}</div>
              <p className="text-xs text-muted-foreground">
                Total registered customers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Sales Trend */}
          <Card>
            <CardHeader className="compact-card-header">
              <CardTitle className="text-sm">Weekly Sales Trend</CardTitle>
            </CardHeader>
            <CardContent className="compact-card-content">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Company Performance */}
          <Card>
            <CardHeader className="compact-card-header">
              <CardTitle className="text-sm">Company Performance</CardTitle>
            </CardHeader>
            <CardContent className="compact-card-content">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Workers</span>
                  <Badge variant="outline">{dashboardData.counts.workers}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Inventory Value</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(dashboardData.inventory?.value || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Low Stock Items</span>
                  <Badge variant={dashboardData.counts.lowStockProducts > 0 ? "destructive" : "outline"}>
                    {dashboardData.counts.lowStockProducts || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pending Corrections</span>
                  <Badge variant={dashboardData.counts.pendingCorrections > 0 ? "destructive" : "outline"}>
                    {dashboardData.counts.pendingCorrections}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profit Margins Section */}
        <Card>
          <CardHeader className="compact-card-header flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Profit Margins by Product</CardTitle>
            <Select value={profitPeriod} onValueChange={(value: any) => setProfitPeriod(value)}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="compact-card-content">
            {profitAnalysis ? (
              <>
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xs text-muted-foreground">Revenue</div>
                      <div className="text-sm font-semibold text-blue-600">
                        {formatCurrency(profitAnalysis.overall.revenue)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Profit</div>
                      <div className="text-sm font-semibold text-green-600">
                        {formatCurrency(profitAnalysis.overall.profit)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Margin</div>
                      <div className="text-sm font-semibold">
                        {profitAnalysis.overall.margin.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {profitAnalysis.productProfits.slice(0, 5).map((product: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Sold: {product.quantity} | Revenue: {formatCurrency(product.revenue)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={product.margin > 30 ? "default" : product.margin > 15 ? "secondary" : "outline"}>
                          {product.margin.toFixed(1)}%
                        </Badge>
                        {product.margin > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  ))}
                  {profitAnalysis.productProfits.length === 0 && (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      No sales data for this period
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Loading profit analysis...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Automatic Reporting Status */}
        <ReportingStatus />
      </div>
    </DashboardErrorBoundary>
  )
}