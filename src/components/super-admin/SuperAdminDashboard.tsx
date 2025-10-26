import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { AlertTriangle, Building2, CheckCircle, Clock, DollarSign, Plus, TrendingUp, Activity as ActivityIcon, Users, CreditCard, Database, Settings, BarChart3, Zap, Target, ArrowUpRight, ArrowDownRight, Eye, MoreHorizontal } from "lucide-react"
import * as Recharts from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "../ui/chart"

interface BusinessLite {
  id: string
  businessName: string
  paymentStatus: 'paid' | 'pending' | 'overdue'
  renewalDate: string
  monthlyRevenue: number
}

interface SuperAdminDashboardProps {
  stats: {
    totalBusinesses: number
    activeBusinesses: number
    totalRevenue: number
    overduePayments: number
    newThisMonth: number
    renewalsDue: number
  }
  businesses: BusinessLite[]
  onNavigate?: (tab: string) => void
  onVerifyPayment?: () => void
}

export function SuperAdminDashboard({ stats, businesses, onNavigate, onVerifyPayment }: SuperAdminDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {onVerifyPayment && (
          <Button onClick={onVerifyPayment}>
            <DollarSign className="h-4 w-4 mr-2" />
            Verify Payment
          </Button>
        )}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Businesses</p>
                <p className="text-3xl font-bold">{stats.totalBusinesses}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12% from last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Businesses</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeBusinesses}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+8% from last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-3xl font-bold">₵{stats.totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+15% from last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
          <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue Payments</p>
                <p className="text-3xl font-bold text-red-600">{stats.overduePayments}</p>
                <div className="flex items-center mt-2">
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600">-3 from last week</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
          </div>
          </CardContent>
        </Card>
          </div>

      {/* Quick Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Navigation
          </CardTitle>
          <CardDescription>Access all major features from here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="h-12 flex items-center gap-2"
              onClick={() => onNavigate?.('businesses')}
            >
              <Building2 className="h-4 w-4" />
              <span className="text-xs">Businesses</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-12 flex items-center gap-2"
              onClick={() => onNavigate?.('payments')}
            >
              <CreditCard className="h-4 w-4" />
              <span className="text-xs">Payments</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-12 flex items-center gap-2"
              onClick={() => onNavigate?.('features')}
            >
              <Settings className="h-4 w-4" />
              <span className="text-xs">Features</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-12 flex items-center gap-2"
              onClick={() => onNavigate?.('backups')}
            >
              <Database className="h-4 w-4" />
              <span className="text-xs">Backups</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-12 flex items-center gap-2"
              onClick={() => onNavigate?.('analytics')}
            >
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs">Analytics</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-12 flex items-center gap-2"
              onClick={() => onNavigate?.('settings')}
            >
              <Settings className="h-4 w-4" />
              <span className="text-xs">Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Dashboard */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Business Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Rate</span>
                  <span className="text-2xl font-bold text-green-600">
                    {Math.round((stats.activeBusinesses / stats.totalBusinesses) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(stats.activeBusinesses / stats.totalBusinesses) * 100}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Payment Rate</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {Math.round(((stats.totalBusinesses - stats.overduePayments) / stats.totalBusinesses) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${((stats.totalBusinesses - stats.overduePayments) / stats.totalBusinesses) * 100}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Growth Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">New This Month</span>
                  <span className="text-2xl font-bold">{stats.newThisMonth}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Renewals Due</span>
                  <span className="text-2xl font-bold text-yellow-600">{stats.renewalsDue}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Revenue/Business</span>
                  <span className="text-2xl font-bold">₵{Math.round(stats.totalRevenue / stats.totalBusinesses)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ActivityIcon className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Database</span>
                  <Badge className="bg-green-500 text-white">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Payments</span>
                  <Badge className="bg-green-500 text-white">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Backups</span>
                  <Badge className="bg-green-500 text-white">Up to Date</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">API</span>
                  <Badge className="bg-green-500 text-white">Healthy</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Cards - All in one row */}
          <div className="grid grid-cols-3 md:grid-cols-3 gap-6">
            {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Trend
            </CardTitle>
                <CardDescription>Last 8 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ revenue: { label: "Revenue", color: "hsl(var(--primary))" } }}
              className="h-48"
            >
              <Recharts.AreaChart data={Array.from({ length: 8 }).map((_, i) => ({
                week: `W${i + 1}`,
                revenue: Math.round(400 + Math.random() * 800),
              }))}>
                <Recharts.CartesianGrid strokeDasharray="3 3" />
                <Recharts.XAxis dataKey="week" />
                <Recharts.YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Recharts.Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fill="var(--color-revenue)" fillOpacity={0.2} />
              </Recharts.AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
                <CardTitle>Business Growth</CardTitle>
                <CardDescription>New signups vs renewals</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                signups: { label: "Signups", color: "hsl(var(--chart-1))" },
                renewals: { label: "Renewals", color: "hsl(var(--chart-2))" },
              }}
              className="h-48"
            >
              <Recharts.LineChart data={Array.from({ length: 8 }).map((_, i) => ({
                week: `W${i + 1}`,
                signups: Math.round(1 + Math.random() * 4),
                renewals: Math.round(1 + Math.random() * 4),
              }))}>
                <Recharts.CartesianGrid strokeDasharray="3 3" />
                <Recharts.XAxis dataKey="week" />
                <Recharts.YAxis />
                <Recharts.Tooltip />
                <Recharts.Legend />
                <Recharts.Line type="monotone" dataKey="signups" stroke="var(--color-signups)" dot={false} />
                <Recharts.Line type="monotone" dataKey="renewals" stroke="var(--color-renewals)" dot={false} />
              </Recharts.LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
                <CardTitle>Retention Rate</CardTitle>
                <CardDescription>Monthly retention percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ retained: { label: "Retained", color: "hsl(var(--chart-3))" } }}
              className="h-48"
            >
              <Recharts.BarChart data={Array.from({ length: 6 }).map((_, i) => ({
                month: `M${i + 1}`,
                retained: Math.round(40 + Math.random() * 60),
              }))}>
                <Recharts.CartesianGrid strokeDasharray="3 3" />
                <Recharts.XAxis dataKey="month" />
                <Recharts.YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Recharts.Bar dataKey="retained" fill="var(--color-retained)" />
              </Recharts.BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          {/* Revenue Overview */}
          <div className="grid grid-cols-3 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Basic Plans</span>
                  <span className="text-lg font-bold">₵{Math.round(stats.totalRevenue * 0.4)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pro Plans</span>
                  <span className="text-lg font-bold">₵{Math.round(stats.totalRevenue * 0.4)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Enterprise</span>
                  <span className="text-lg font-bold">₵{Math.round(stats.totalRevenue * 0.2)}</span>
                </div>
              </CardContent>
            </Card>

        <Card>
          <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Growth Rate
                </CardTitle>
          </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">+15%</div>
                  <p className="text-sm text-muted-foreground">Month over Month</p>
                  </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">+8%</div>
                  <p className="text-sm text-muted-foreground">New Businesses</p>
                </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Targets
                </CardTitle>
          </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Monthly Goal</span>
                  <span className="text-lg font-bold">₵{Math.round(stats.totalRevenue * 1.2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '83%' }}></div>
                </div>
                <p className="text-sm text-muted-foreground">83% of monthly goal</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Recent Activity & Top Businesses */}
          <div className="grid grid-cols-3 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ActivityIcon className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest system events and actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { id: 'a1', text: 'Payment recorded for Kofi Electronics', level: 'info', time: '2 min ago' },
                  { id: 'a2', text: 'Enabled Workers feature for Ama Wholesale', level: 'success', time: '15 min ago' },
                  { id: 'a3', text: 'Unpaid renewal detected for Uncle 19 Shops', level: 'warning', time: '1 hour ago' },
                  { id: 'a4', text: 'New business registered: Tech Solutions', level: 'info', time: '2 hours ago' },
                  { id: 'a5', text: 'Backup completed for all businesses', level: 'success', time: '3 hours ago' },
            ].map((a) => (
                  <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      a.level === 'warning' ? 'bg-yellow-500' : 
                      a.level === 'success' ? 'bg-green-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{a.text}</p>
                      <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
                <Badge variant={a.level === 'warning' ? 'destructive' : 'outline'} className={a.level === 'success' ? 'bg-green-500 text-white border-none' : ''}>
                  {a.level}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Top Businesses
                </CardTitle>
                <CardDescription>By monthly revenue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {businesses
                  .slice()
                  .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
                  .slice(0, 5)
                  .map((b, i) => (
                    <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{i + 1}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{b.businessName}</p>
                          <p className="text-xs text-muted-foreground">₵{b.monthlyRevenue}/month</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
      </div>
                  ))}
              </CardContent>
            </Card>

      <Card>
        <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming Renewals (Next 30 Days)
              </CardTitle>
              <CardDescription>Businesses with payments due soon</CardDescription>
        </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {businesses
                  .filter(b => {
                    const renewal = new Date(b.renewalDate)
                    const now = new Date()
                    const days = Math.ceil((renewal.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                    return days <= 30 && days >= 0
                  })
                  .slice(0, 6)
                  .map(b => (
                    <div key={b.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium">{b.businessName}</p>
                          <p className="text-sm text-muted-foreground">Due: {new Date(b.renewalDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold">₵{b.monthlyRevenue}</span>
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">Due Soon</Badge>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
        </CardContent>
      </Card>
          </div>
        </TabsContent>
      </Tabs>

    </div>
  )
}


