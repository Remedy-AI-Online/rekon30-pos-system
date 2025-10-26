import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Progress } from "../ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { 
  DollarSign, 
  Receipt, 
  TrendingUp, 
  Clock,
  CreditCard,
  Smartphone,
  Banknote,
  Calendar
} from "lucide-react"
import { useState } from "react"
import { Label } from "../ui/label"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  originalPrice?: number
  isBargained?: boolean
}

interface Sale {
  id: string
  time: string
  items: CartItem[]
  total: number
  paymentMethod: string
  customer?: any
}

interface ReportsSectionProps {
  sales: Sale[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export function ReportsSection({ sales }: ReportsSectionProps) {
  const [reportPeriod, setReportPeriod] = useState('daily')

  // Filter sales based on selected period
  const getFilteredSales = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (reportPeriod) {
      case 'daily':
        return sales.filter(sale => {
          const saleDate = new Date()
          saleDate.setHours(0, 0, 0, 0)
          return saleDate.getTime() === today.getTime()
        })
      case 'weekly':
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay())
        return sales.filter(sale => {
          const saleDate = new Date()
          return saleDate >= weekStart
        })
      case 'monthly':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        return sales.filter(sale => {
          const saleDate = new Date()
          return saleDate >= monthStart
        })
      default:
        return sales
    }
  }

  const filteredSales = getFilteredSales()
  
  // Calculate metrics
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0)
  const averageSale = filteredSales.length > 0 ? totalSales / filteredSales.length : 0
  
  // Payment method breakdown
  const paymentMethods = filteredSales.reduce((acc, sale) => {
    acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const paymentData = Object.entries(paymentMethods).map(([method, count]) => ({
    name: method.charAt(0).toUpperCase() + method.slice(1),
    value: count,
    percentage: filteredSales.length > 0 ? Math.round((count / filteredSales.length) * 100) : 0
  }))

  // Product performance
  const productSales = filteredSales.reduce((acc, sale) => {
    sale.items.forEach(item => {
      const key = `${item.name}`
      if (!acc[key]) {
        acc[key] = { name: key, quantity: 0, revenue: 0 }
      }
      acc[key].quantity += item.quantity
      acc[key].revenue += item.price * item.quantity
    })
    return acc
  }, {} as Record<string, { name: string, quantity: number, revenue: number }>)

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // Hourly sales (for daily), daily sales (for weekly), or weekly sales (for monthly)
  const getTimeSeriesData = () => {
    if (reportPeriod === 'daily') {
      const hourlySales = filteredSales.reduce((acc, sale) => {
        const hour = new Date(`2024-01-01 ${sale.time}`).getHours()
        const hourKey = `${hour}:00`
        acc[hourKey] = (acc[hourKey] || 0) + sale.total
        return acc
      }, {} as Record<string, number>)
      
      return Object.entries(hourlySales)
        .map(([hour, amount]) => ({ period: hour, amount }))
        .sort((a, b) => parseInt(a.period) - parseInt(b.period))
    } else if (reportPeriod === 'weekly') {
      const dailySales = filteredSales.reduce((acc, sale) => {
        const date = new Date().toLocaleDateString('en-US', { weekday: 'short' })
        acc[date] = (acc[date] || 0) + sale.total
        return acc
      }, {} as Record<string, number>)
      
      return Object.entries(dailySales)
        .map(([day, amount]) => ({ period: day, amount }))
    } else {
      const weeklySales = filteredSales.reduce((acc, sale) => {
        const weekNum = Math.ceil(new Date().getDate() / 7)
        const weekKey = `Week ${weekNum}`
        acc[weekKey] = (acc[weekKey] || 0) + sale.total
        return acc
      }, {} as Record<string, number>)
      
      return Object.entries(weeklySales)
        .map(([week, amount]) => ({ period: week, amount }))
    }
  }

  const timeSeriesData = getTimeSeriesData()

  const getPeriodLabel = () => {
    switch (reportPeriod) {
      case 'daily': return 'Hourly Sales'
      case 'weekly': return 'Daily Sales'
      case 'monthly': return 'Weekly Sales'
      default: return 'Sales'
    }
  }

  const getPaymentIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash': return <Banknote className="h-4 w-4" />
      case 'card': return <CreditCard className="h-4 w-4" />
      case 'mobile': return <Smartphone className="h-4 w-4" />
      default: return <DollarSign className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-auto">
      {/* Report Period Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-blue-600" />
            <Label className="text-sm font-medium">Report Period:</Label>
            <Select value={reportPeriod} onValueChange={setReportPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              Showing {reportPeriod} data ({filteredSales.length} sales)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-muted-foreground">Total Sales</div>
                <div className="text-2xl font-bold text-green-600">${totalSales}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm text-muted-foreground">Total Orders</div>
                <div className="text-2xl font-bold text-blue-600">{filteredSales.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-sm text-muted-foreground">Average Sale</div>
                <div className="text-2xl font-bold text-purple-600">${averageSale.toFixed(0)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-sm text-muted-foreground">Current Time</div>
                <div className="text-lg font-bold text-orange-600">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Time Series Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{getPeriodLabel()}</CardTitle>
          </CardHeader>
          <CardContent>
            {timeSeriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}`, 'Sales']} />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No sales data available for this period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentData.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={paymentData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                    >
                      {paymentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {paymentData.map((payment, index) => (
                    <div key={payment.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPaymentIcon(payment.name)}
                        <span>{payment.name}</span>
                      </div>
                      <Badge variant="secondary">
                        {payment.value} orders ({payment.percentage}%)
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No payment data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.quantity} units sold
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">${product.revenue}</div>
                    <Progress 
                      value={(product.revenue / topProducts[0].revenue) * 100} 
                      className="w-24 h-2 mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No product sales data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}