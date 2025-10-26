import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { Separator } from "./ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Calendar } from "./ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { 
  Download, 
  Mail, 
  Calendar as CalendarIcon, 
  DollarSign, 
  FileText, 
  TrendingUp,
  BarChart3,
  Loader2
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, Tooltip } from "recharts"
import { dataService } from "../utils/dataService"
import { toast } from "sonner"
import { format } from "date-fns"

interface SalesData {
  date: string
  sales: any[]
  totalAmount: number
  totalTransactions: number
}

export function AdminReportsPage() {
  const [loading, setLoading] = useState(false)
  const [reportType, setReportType] = useState("daily")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined
  })
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [reportData, setReportData] = useState<any>(null)

  useEffect(() => {
    if (reportType === "daily" && selectedDate) {
      loadDailyReport()
    } else if (reportType === "weekly") {
      loadWeeklyReport()
    } else if (reportType === "monthly") {
      loadMonthlyReport()
    } else if (reportType === "range" && dateRange.from && dateRange.to) {
      loadRangeReport()
    }
  }, [reportType, selectedDate, dateRange])

  const loadDailyReport = async () => {
    if (!selectedDate) return

    try {
      setLoading(true)
      const dateStr = selectedDate.toISOString().split('T')[0]

      const response = await dataService.getSales(dateStr)

      if (response.success) {
        const dayData: SalesData = {
          date: dateStr,
          sales: response.data.sales || [],
          totalAmount: response.data.totalAmount || 0,
          totalTransactions: response.data.totalTransactions || 0
        }
        setSalesData([dayData])
        setReportData(dayData)
      } else {
        const emptyData: SalesData = { date: dateStr, sales: [], totalAmount: 0, totalTransactions: 0 }
        setSalesData([emptyData])
        setReportData(emptyData)
        toast.error("Failed to load daily report")
      }
    } catch (error) {
      console.error("Error loading daily report:", error)
      const emptyData: SalesData = { date: selectedDate.toISOString().split('T')[0], sales: [], totalAmount: 0, totalTransactions: 0 }
      setSalesData([emptyData])
      setReportData(emptyData)
      toast.error("Error loading daily report")
    } finally {
      setLoading(false)
    }
  }

  const loadWeeklyReport = async () => {
    try {
      setLoading(true)
      const today = new Date()
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

      const startDate = weekAgo.toISOString().split('T')[0]
      const endDate = today.toISOString().split('T')[0]

      const response = await dataService.getSalesRange(startDate, endDate)

      if (response.success) {
        setSalesData(response.data || [])

        const totalAmount = response.data.reduce((sum: number, day: any) => sum + (day.totalAmount || 0), 0)
        const totalTransactions = response.data.reduce((sum: number, day: any) => sum + (day.totalTransactions || 0), 0)
        const allSales = response.data.flatMap((day: any) => day.sales || [])

        const report = {
          period: 'weekly',
          startDate: weekAgo,
          endDate: today,
          totalAmount,
          totalTransactions,
          allSales,
          dailyBreakdown: response.data
        }

        setReportData(report)
      } else {
        setSalesData([])
        setReportData({ period: 'weekly', startDate: weekAgo, endDate: today, totalAmount: 0, totalTransactions: 0, allSales: [], dailyBreakdown: [] })
        toast.error("Failed to load weekly report")
      }
    } catch (error) {
      console.error("Error loading weekly report:", error)
      setSalesData([])
      setReportData(null)
      toast.error("Error loading weekly report")
    } finally {
      setLoading(false)
    }
  }

  const loadMonthlyReport = async () => {
    try {
      setLoading(true)
      const today = new Date()
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

      const startDate = monthAgo.toISOString().split('T')[0]
      const endDate = today.toISOString().split('T')[0]

      const response = await dataService.getSalesRange(startDate, endDate)

      if (response.success) {
        setSalesData(response.data || [])

        const totalAmount = response.data.reduce((sum: number, day: any) => sum + (day.totalAmount || 0), 0)
        const totalTransactions = response.data.reduce((sum: number, day: any) => sum + (day.totalTransactions || 0), 0)
        const allSales = response.data.flatMap((day: any) => day.sales || [])

        const report = {
          period: 'monthly',
          startDate: monthAgo,
          endDate: today,
          totalAmount,
          totalTransactions,
          allSales,
          dailyBreakdown: response.data
        }

        setReportData(report)
      } else {
        setSalesData([])
        setReportData({ period: 'monthly', startDate: monthAgo, endDate: today, totalAmount: 0, totalTransactions: 0, allSales: [], dailyBreakdown: [] })
        toast.error("Failed to load monthly report")
      }
    } catch (error) {
      console.error("Error loading monthly report:", error)
      setSalesData([])
      setReportData(null)
      toast.error("Error loading monthly report")
    } finally {
      setLoading(false)
    }
  }

  const loadRangeReport = async () => {
    if (!dateRange.from || !dateRange.to) return

    try {
      setLoading(true)
      const startDate = dateRange.from.toISOString().split('T')[0]
      const endDate = dateRange.to.toISOString().split('T')[0]

      const response = await dataService.getSalesRange(startDate, endDate)

      if (response.success) {
        setSalesData(response.data || [])

        const totalAmount = response.data.reduce((sum: number, day: any) => sum + (day.totalAmount || 0), 0)
        const totalTransactions = response.data.reduce((sum: number, day: any) => sum + (day.totalTransactions || 0), 0)
        const allSales = response.data.flatMap((day: any) => day.sales || [])

        const report = {
          dateRange: { from: dateRange.from, to: dateRange.to },
          totalAmount,
          totalTransactions,
          allSales,
          dailyBreakdown: response.data
        }

        setReportData(report)
      } else {
        setSalesData([])
        setReportData({ dateRange: { from: dateRange.from, to: dateRange.to }, totalAmount: 0, totalTransactions: 0, allSales: [], dailyBreakdown: [] })
        toast.error("Failed to load range report")
      }
    } catch (error) {
      console.error("Error loading range report:", error)
      setSalesData([])
      setReportData(null)
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = async () => {
    try {
      if (reportType === "daily" && selectedDate) {
        const dateStr = selectedDate.toISOString().split('T')[0]
        const blob = await dataService.getDailyReportCSV(dateStr)
        
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `daily-report-${dateStr}.csv`
        link.click()
        window.URL.revokeObjectURL(url)
        
        toast.success("Report downloaded successfully")
      } else if (reportType === "weekly") {
        generateWeeklyReportCSV()
      } else if (reportType === "monthly") {
        generateMonthlyReportCSV()
      } else if (reportType === "range" && dateRange.from && dateRange.to) {
        generateRangeReportCSV()
      }
    } catch (error) {
      console.error("Error downloading report:", error)
      toast.error("Error downloading report")
    }
  }

  const generateRangeReportCSV = () => {
    if (!reportData) return

    const headers = "Date,Transaction ID,Customer Name,Customer Phone,Items,Payment Method,Total Amount\n"
    
    const csvRows = reportData.allSales.map((sale: any) => {
      const time = new Date(sale.timestamp).toLocaleString()
      const items = sale.items.map((item: any) => `${item.name} (${item.size}) x${item.quantity}`).join('; ')
      
      return [
        time,
        sale.receiptId || sale.id,
        sale.customer?.name || 'N/A',
        sale.customer?.phone || 'N/A',
        `"${items}"`,
        sale.paymentMethod,
        sale.total
      ].join(',')
    })

    const summary = `\n\nRANGE SUMMARY\nPeriod,${format(dateRange.from!, "yyyy-MM-dd")} to ${format(dateRange.to!, "yyyy-MM-dd")}\nTotal Transactions,${reportData.totalTransactions}\nTotal Amount,${reportData.totalAmount}\n`

    const watermark = `\n\n---\nPowered by Rekon360 - Business Management Software\nwww.rekon360.com\nGenerated on ${new Date().toLocaleString()}\n`

    const csvContent = headers + csvRows.join('\n') + summary + watermark
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sales-report-${format(dateRange.from!, "yyyy-MM-dd")}-to-${format(dateRange.to!, "yyyy-MM-dd")}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
    
    toast.success("Range report downloaded successfully")
  }

  const generateWeeklyReportCSV = () => {
    if (!reportData) return

    const csvLines: string[] = []
    
    // Title and period
    csvLines.push("WEEKLY SALES REPORT")
    csvLines.push("")
    csvLines.push(`Period:,${format(reportData.startDate, "MMM dd yyyy")} - ${format(reportData.endDate, "MMM dd yyyy")}`)
    csvLines.push(`Generated:,${format(new Date(), "MMM dd yyyy HH:mm")}`)
    csvLines.push("")
    
    // Summary section
    csvLines.push("SUMMARY")
    csvLines.push(`Total Transactions:,${reportData.totalTransactions}`)
    csvLines.push(`Total Sales Amount:,${reportData.totalAmount.toFixed(2)}`)
    csvLines.push(`Average Transaction:,${(reportData.totalAmount / reportData.totalTransactions).toFixed(2)}`)
    csvLines.push("")
    csvLines.push("")
    
    // Transaction details header
    csvLines.push("TRANSACTION DETAILS")
    csvLines.push("Date & Time,Receipt ID,Customer Name,Customer Phone,Items,Payment Method,Amount")
    
    // Transaction rows
    reportData.allSales.forEach((sale: any) => {
      const dateTime = format(new Date(sale.timestamp), "MMM dd yyyy HH:mm")
      const items = sale.items.map((item: any) => `${item.name} (${item.size}) x${item.quantity}`).join('; ')
      
      csvLines.push([
        dateTime,
        sale.receiptId || sale.id,
        sale.customer?.name || 'Walk-in',
        sale.customer?.phone || 'N/A',
        `"${items}"`,
        sale.paymentMethod,
        `${sale.total.toFixed(2)}`
      ].join(','))
    })
    
    // Daily breakdown
    csvLines.push("")
    csvLines.push("")
    csvLines.push("DAILY BREAKDOWN")
    csvLines.push("Date,Transactions,Total Sales")
    reportData.dailyBreakdown.forEach((day: any) => {
      csvLines.push([
        format(new Date(day.date), "MMM dd yyyy"),
        day.totalTransactions,
        `${day.totalAmount.toFixed(2)}`
      ].join(','))
    })

    // Add watermark
    csvLines.push("")
    csvLines.push("")
    csvLines.push("---")
    csvLines.push("Powered by Rekon360 - Business Management Software")
    csvLines.push("www.rekon360.com")
    csvLines.push(`Generated on ${new Date().toLocaleString()}`)

    const csvContent = csvLines.join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `weekly-sales-report-${format(reportData.startDate, "yyyy-MM-dd")}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
    
    toast.success("Weekly report downloaded successfully")
  }

  const generateMonthlyReportCSV = () => {
    if (!reportData) return

    const csvLines: string[] = []
    
    // Title and period
    csvLines.push("MONTHLY SALES REPORT")
    csvLines.push("")
    csvLines.push(`Period:,${format(reportData.startDate, "MMM dd yyyy")} - ${format(reportData.endDate, "MMM dd yyyy")}`)
    csvLines.push(`Generated:,${format(new Date(), "MMM dd yyyy HH:mm")}`)
    csvLines.push("")
    
    // Summary section
    csvLines.push("SUMMARY")
    csvLines.push(`Total Transactions:,${reportData.totalTransactions}`)
    csvLines.push(`Total Sales Amount:,${reportData.totalAmount.toFixed(2)}`)
    csvLines.push(`Average Transaction:,${(reportData.totalAmount / reportData.totalTransactions).toFixed(2)}`)
    csvLines.push("")
    csvLines.push("")
    
    // Transaction details header
    csvLines.push("TRANSACTION DETAILS")
    csvLines.push("Date & Time,Receipt ID,Customer Name,Customer Phone,Items,Payment Method,Amount")
    
    // Transaction rows
    reportData.allSales.forEach((sale: any) => {
      const dateTime = format(new Date(sale.timestamp), "MMM dd yyyy HH:mm")
      const items = sale.items.map((item: any) => `${item.name} (${item.size}) x${item.quantity}`).join('; ')
      
      csvLines.push([
        dateTime,
        sale.receiptId || sale.id,
        sale.customer?.name || 'Walk-in',
        sale.customer?.phone || 'N/A',
        `"${items}"`,
        sale.paymentMethod,
        `${sale.total.toFixed(2)}`
      ].join(','))
    })
    
    // Daily breakdown
    csvLines.push("")
    csvLines.push("")
    csvLines.push("DAILY BREAKDOWN")
    csvLines.push("Date,Transactions,Total Sales")
    reportData.dailyBreakdown.forEach((day: any) => {
      csvLines.push([
        format(new Date(day.date), "MMM dd yyyy"),
        day.totalTransactions,
        `${day.totalAmount.toFixed(2)}`
      ].join(','))
    })

    // Add watermark
    csvLines.push("")
    csvLines.push("")
    csvLines.push("---")
    csvLines.push("Powered by Rekon360 - Business Management Software")
    csvLines.push("www.rekon360.com")
    csvLines.push(`Generated on ${new Date().toLocaleString()}`)

    const csvContent = csvLines.join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `monthly-sales-report-${format(reportData.startDate, "yyyy-MM-dd")}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
    
    toast.success("Monthly report downloaded successfully")
  }

  const getChartData = () => {
    if (reportType === "daily" && reportData) {
      // For daily report, show hourly breakdown
      const hourlyData: any = {}
      reportData.sales.forEach((sale: any) => {
        const hour = new Date(sale.timestamp).getHours()
        const hourStr = `${hour}:00`
        if (!hourlyData[hourStr]) {
          hourlyData[hourStr] = { hour: hourStr, amount: 0, transactions: 0 }
        }
        hourlyData[hourStr].amount += sale.total
        hourlyData[hourStr].transactions += 1
      })
      return Object.values(hourlyData)
    } else if (reportType === "weekly" && reportData) {
      // For weekly report, show daily breakdown
      return salesData.map(day => ({
        date: format(new Date(day.date), "MMM dd"),
        amount: day.totalAmount,
        transactions: day.totalTransactions
      }))
    } else if (reportType === "monthly" && reportData) {
      // For monthly report, show daily breakdown
      return salesData.map(day => ({
        date: format(new Date(day.date), "MMM dd"),
        amount: day.totalAmount,
        transactions: day.totalTransactions
      }))
    } else if (reportType === "range" && reportData) {
      // For range report, show daily breakdown
      return salesData.map(day => ({
        date: format(new Date(day.date), "MMM dd"),
        amount: day.totalAmount,
        transactions: day.totalTransactions
      }))
    }
    return []
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1>Sales Reports</h1>
          <p className="text-muted-foreground">Generate and analyze sales reports with custom date ranges</p>
        </div>
        
        <Button onClick={downloadReport} disabled={!reportData || loading}>
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Report</SelectItem>
                  <SelectItem value="weekly">Weekly Report</SelectItem>
                  <SelectItem value="monthly">Monthly Report</SelectItem>
                  <SelectItem value="range">Custom Date Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType === "daily" && (
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {reportType === "range" && (
              <>
                <div className="space-y-2">
                  <Label>From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? format(dateRange.from, "PPP") : "Start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.to ? format(dateRange.to, "PPP") : "End date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading report data...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && reportData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="compact-card-header flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="compact-card-content">
                <div className="text-2xl font-bold">${reportData.totalAmount?.toFixed(2) || '0.00'}</div>
                <p className="text-xs text-muted-foreground">
                  {reportType === "daily" ? "For selected date" : "For selected period"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="compact-card-header flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total Transactions</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="compact-card-content">
                <div className="text-2xl font-bold">{reportData.totalTransactions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {reportType === "daily" ? "Transactions today" : "Total transactions"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="compact-card-header flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Average Transaction</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="compact-card-content">
                <div className="text-2xl font-bold">
                  ${reportData.totalTransactions > 0 ? (reportData.totalAmount / reportData.totalTransactions).toFixed(2) : '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per transaction
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Sales {reportType === "daily" ? "Timeline" : "Trend"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getChartData().length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={reportType === "daily" ? "hour" : "date"} fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip 
                      formatter={(value: any) => [`${value.toFixed(2)}`, 'Sales']}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                    <Bar dataKey="amount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <p>No data available for chart</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Transaction Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(reportType === "daily" ? reportData.sales : reportData.allSales)?.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No transactions found for the selected period</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Receipt ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(reportType === "daily" ? reportData.sales : reportData.allSales)?.map((sale: any) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          {new Date(sale.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-mono">
                          {sale.receiptId || sale.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{sale.customer?.name || 'Walk-in Customer'}</p>
                            <p className="text-sm text-muted-foreground">{sale.customer?.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{sale.paymentMethod}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${sale.total.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!loading && !reportData && (
        <Card>
          <CardContent className="text-center py-8">
            <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select a date or date range to generate a report</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
