import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Bell, CheckCircle, Clock, Download, Mail, Settings } from "lucide-react"
import { reportingService } from "../utils/reportingService"
import { projectId, publicAnonKey } from "../utils/supabase/info"
import { Alert, AlertDescription } from "./ui/alert"

interface ReportingStatusProps {
  onOpenSettings?: () => void
}

export function ReportingStatus({ onOpenSettings }: ReportingStatusProps) {
  const [todaysSales, setTodaysSales] = useState<any>(null)
  const [lastReport, setLastReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [shopSettings, setShopSettings] = useState<any>(null)

  useEffect(() => {
    loadTodaysData()
    loadLatestReport()
    loadShopSettings()
  }, [])

  const loadTodaysData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const data = await reportingService.getDailySales(today)
      setTodaysSales(data)
    } catch (error) {
      console.error('Error loading today\'s sales:', error)
      // Set fallback data
      setTodaysSales({
        date: new Date().toISOString().split('T')[0],
        totalSales: 0,
        totalTransactions: 0,
        averageTransaction: 0,
        sales: []
      })
    }
  }

  const loadLatestReport = async () => {
    try {
      const reports = await reportingService.getAllReports()
      if (reports.length > 0) {
        setLastReport(reports[0])
      }
    } catch (error) {
      console.error('Error loading latest report:', error)
      // Set fallback report
      setLastReport({
        date: new Date().toISOString().split('T')[0],
        generated: new Date().toISOString(),
        status: 'No reports available',
        totalSales: 0
      })
    }
  }

  const loadShopSettings = async () => {
    try {
      // For now, use default settings until backend is fully implemented
      setShopSettings({
        managerEmail: "manager@business.com",
        managerPhone: "+1234567890",
        reportTime: "18:00",
        autoReportEnabled: true
      })
    } catch (error) {
      console.error('Error loading shop settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const triggerDailyReport = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      const report = await reportingService.generateAutoReport(today)
      await loadLatestReport()
    } catch (error) {
      console.error('Error triggering daily report:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = () => {
    if (!shopSettings) return <Badge variant="secondary">Loading...</Badge>
    
    if (shopSettings.autoReportEnabled) {
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
    } else {
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Disabled</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Loading reporting status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Auto-Reporting Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5" />
              Automatic Reporting
            </CardTitle>
            {getStatusBadge()}
          </div>
          <CardDescription>
            Daily sales reports for Uncle's review
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {shopSettings && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Email:</span>
                <br />
                <span className="font-medium">{shopSettings.managerEmail}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Report Time:</span>
                <br />
                <span className="font-medium">{shopSettings.reportTime || '18:00'} daily</span>
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={triggerDailyReport} 
              disabled={loading}
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Report Now
            </Button>
            {onOpenSettings && (
              <Button 
                variant="outline" 
                onClick={onOpenSettings}
                size="sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Today's Sales Summary */}
      {todaysSales && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Today's Sales</CardTitle>
            <CardDescription>
              Real-time sales data for {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${todaysSales.totalAmount || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Sales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {todaysSales.totalTransactions || 0}
                </div>
                <div className="text-sm text-muted-foreground">Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  ${todaysSales.totalTransactions > 0 
                    ? ((todaysSales.totalAmount || 0) / todaysSales.totalTransactions).toFixed(2)
                    : '0.00'}
                </div>
                <div className="text-sm text-muted-foreground">Average Sale</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Report Info */}
      {lastReport && (
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>
            <strong>Last Report:</strong> {lastReport.date} - 
            ${lastReport.summary?.totalAmount || 0} from {lastReport.summary?.totalTransactions || 0} transactions
            <br />
            <span className="text-sm text-muted-foreground">
              Generated on {new Date(lastReport.generatedAt).toLocaleString()}
            </span>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}