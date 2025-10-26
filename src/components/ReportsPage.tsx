import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Button } from "./ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from "recharts"
import { Download, TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart } from "lucide-react"

const monthlyRevenueData = [
  { month: "Jan", revenue: 65000, profit: 13000, orders: 234 },
  { month: "Feb", revenue: 72000, profit: 15400, orders: 267 },
  { month: "Mar", revenue: 68000, profit: 14200, orders: 251 },
  { month: "Apr", revenue: 74000, profit: 16280, orders: 289 },
  { month: "May", revenue: 81000, profit: 18630, orders: 312 },
  { month: "Jun", revenue: 78000, profit: 17160, orders: 298 },
]

const categoryPerformanceData = [
  { category: "Cleaning Supplies", sales: 285000, profit: 68400, margin: 24 },
  { category: "Personal Care", sales: 198000, profit: 39600, margin: 20 },
  { category: "Food & Beverages", sales: 165000, profit: 28050, margin: 17 },
  { category: "Household Items", sales: 125000, profit: 18750, margin: 15 },
]

const topProductsData = [
  { product: "All-Purpose Cleaner 500ml", sales: 45000, units: 11250 },
  { product: "Hand Soap 250ml", sales: 32000, units: 12850 },
  { product: "Paper Towels 6-pack", sales: 28000, units: 2155 },
  { product: "Instant Coffee 200g", sales: 25000, units: 3130 },
  { product: "Dish Soap 1L", sales: 22000, units: 3670 },
]

const customerSegmentData = [
  { segment: "Retail Stores", value: 45, color: "#8884d8" },
  { segment: "Supermarkets", value: 28, color: "#82ca9d" },
  { segment: "Convenience Stores", value: 18, color: "#ffc658" },
  { segment: "Wholesale Distributors", value: 9, color: "#ff7300" },
]

const inventoryTurnoverData = [
  { month: "Jan", turnover: 4.2 },
  { month: "Feb", turnover: 4.5 },
  { month: "Mar", turnover: 4.1 },
  { month: "Apr", turnover: 4.8 },
  { month: "May", turnover: 5.1 },
  { month: "Jun", turnover: 4.9 },
]

export function ReportsPage() {
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 h-full overflow-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground">Business insights and performance metrics</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2">
          <Select defaultValue="6months">
            <SelectTrigger className="w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button className="w-full md:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export Report
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
            <div className="text-2xl">$438,000</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Gross Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">$89,420</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15.2% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">1,651</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.3% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Avg Order Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">$265</div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              -2.1% from last period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue and Profit Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Profit Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                <Area type="monotone" dataKey="profit" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={customerSegmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {customerSegmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {customerSegmentData.map((segment, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-sm">{segment.segment}: {segment.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryPerformanceData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={100} />
                <Bar dataKey="sales" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProductsData.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{product.product}</p>
                    <p className="text-sm text-muted-foreground">{product.units} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${product.sales.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">#{index + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory and Financial Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Turnover Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={inventoryTurnoverData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Line 
                  type="monotone" 
                  dataKey="turnover" 
                  stroke="#8884d8" 
                  strokeWidth={3}
                  dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profit Margins by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryPerformanceData.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{category.category}</span>
                    <span className="text-sm">{category.margin}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(category.margin / 30) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Sales: ${category.sales.toLocaleString()}</span>
                    <span>Profit: ${category.profit.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Operational Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Average Order Processing Time</span>
              <span className="font-medium">2.4 hours</span>
            </div>
            <div className="flex justify-between">
              <span>Order Fulfillment Rate</span>
              <span className="font-medium">97.8%</span>
            </div>
            <div className="flex justify-between">
              <span>Customer Satisfaction</span>
              <span className="font-medium">4.6/5.0</span>
            </div>
            <div className="flex justify-between">
              <span>Return Rate</span>
              <span className="font-medium">2.1%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Highlights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Gross Margin</span>
              <span className="font-medium">20.4%</span>
            </div>
            <div className="flex justify-between">
              <span>Operating Expenses</span>
              <span className="font-medium">$56,200</span>
            </div>
            <div className="flex justify-between">
              <span>Net Profit Margin</span>
              <span className="font-medium">7.6%</span>
            </div>
            <div className="flex justify-between">
              <span>Cash Flow</span>
              <span className="font-medium text-green-600">+$33,220</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>New Customers (6mo)</span>
              <span className="font-medium">42</span>
            </div>
            <div className="flex justify-between">
              <span>Customer Retention</span>
              <span className="font-medium">89.3%</span>
            </div>
            <div className="flex justify-between">
              <span>Market Share Growth</span>
              <span className="font-medium text-green-600">+3.2%</span>
            </div>
            <div className="flex justify-between">
              <span>Product Line Expansion</span>
              <span className="font-medium">18 new SKUs</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}