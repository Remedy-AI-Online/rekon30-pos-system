import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import * as Recharts from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "../ui/chart"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Building2, 
  Star, 
  RefreshCw, 
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Globe,
  Clock
} from "lucide-react"
import { superAdminService } from "../../utils/superAdminService"

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

interface SuperAdminAnalyticsProps {
  businesses: Business[]
  onRefresh: () => void
}

export function SuperAdminAnalytics({ businesses, onRefresh }: SuperAdminAnalyticsProps) {
  const [timeRange, setTimeRange] = useState("6m")
  const [activeTab, setActiveTab] = useState("revenue")
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Load analytics data from API
  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      const { data, error } = await superAdminService.getAnalytics(timeRange as 'day' | 'week' | 'month' | 'year')
      
      if (error) {
        console.error('Failed to load analytics:', error)
        // Use fallback data from businesses
        setAnalyticsData(null)
      } else {
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
      setAnalyticsData(null)
    } finally {
      setLoading(false)
    }
  }

  // Fallback data when API fails
  const mrrData = analyticsData?.mrrData || []
  const cohortData = analyticsData?.cohortData || []
  const featureUsageData = analyticsData?.featureUsageData || []

  const topBusinesses = businesses
    .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
    .slice(0, 5)

  const planDistribution = businesses.reduce((acc, business) => {
    acc[business.plan] = (acc[business.plan] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalMRR = businesses.reduce((sum, business) => {
    const planPrice = business.plan === 'basic' ? 200 : business.plan === 'pro' ? 400 : 800
    return sum + planPrice
  }, 0)

  const averageRevenue = businesses.length > 0 ? totalMRR / businesses.length : 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics & Insights</h2>
          <p className="text-muted-foreground">Business performance, revenue trends, and user adoption</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => { loadAnalyticsData(); onRefresh(); }} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{totalMRR.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monthly Recurring Revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average ARPU</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{Math.round(averageRevenue)}</div>
            <p className="text-xs text-muted-foreground">Average Revenue Per User</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Businesses</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businesses.filter(b => b.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5%</div>
            <p className="text-xs text-muted-foreground">Monthly churn rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="adoption">Adoption</TabsTrigger>
          <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>MRR Growth</CardTitle>
                <CardDescription>Monthly Recurring Revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{ mrr: { label: "MRR", color: "hsl(var(--primary))" } }}
                  className="h-64"
                >
                  <Recharts.LineChart data={mrrData}>
                    <Recharts.CartesianGrid strokeDasharray="3 3" />
                    <Recharts.XAxis dataKey="month" />
                    <Recharts.YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Recharts.Line type="monotone" dataKey="mrr" stroke="var(--color-mrr)" strokeWidth={2} />
                  </Recharts.LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plan Distribution</CardTitle>
                <CardDescription>Business distribution by plan</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    basic: { label: "Basic", color: "hsl(var(--chart-1))" },
                    pro: { label: "Pro", color: "hsl(var(--chart-2))" },
                    enterprise: { label: "Enterprise", color: "hsl(var(--chart-3))" }
                  }}
                  className="h-64"
                >
                  <Recharts.PieChart>
                    <Recharts.Pie
                      data={Object.entries(planDistribution).map(([plan, count]) => ({ plan, count }))}
                      dataKey="count"
                      nameKey="plan"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </Recharts.PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>Revenue by plan and business type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">₵{planDistribution.basic * 200 || 0}</div>
                  <p className="text-sm text-muted-foreground">Basic Plan Revenue</p>
                  <p className="text-xs text-muted-foreground">{planDistribution.basic || 0} businesses</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">₵{planDistribution.pro * 400 || 0}</div>
                  <p className="text-sm text-muted-foreground">Pro Plan Revenue</p>
                  <p className="text-xs text-muted-foreground">{planDistribution.pro || 0} businesses</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">₵{planDistribution.enterprise * 800 || 0}</div>
                  <p className="text-sm text-muted-foreground">Enterprise Plan Revenue</p>
                  <p className="text-xs text-muted-foreground">{planDistribution.enterprise || 0} businesses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Retention Cohort</CardTitle>
              <CardDescription>Business retention by signup month</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  month0: { label: "Month 0", color: "hsl(var(--chart-1))" },
                  month1: { label: "Month 1", color: "hsl(var(--chart-2))" },
                  month2: { label: "Month 2", color: "hsl(var(--chart-3))" },
                  month3: { label: "Month 3", color: "hsl(var(--chart-4))" },
                  month4: { label: "Month 4", color: "hsl(var(--chart-5))" },
                  month5: { label: "Month 5", color: "hsl(var(--chart-6))" }
                }}
                className="h-80"
              >
                <Recharts.BarChart data={cohortData}>
                  <Recharts.CartesianGrid strokeDasharray="3 3" />
                  <Recharts.XAxis dataKey="cohort" />
                  <Recharts.YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Recharts.Bar dataKey="month0" stackId="a" fill="var(--color-month0)" />
                  <Recharts.Bar dataKey="month1" stackId="a" fill="var(--color-month1)" />
                  <Recharts.Bar dataKey="month2" stackId="a" fill="var(--color-month2)" />
                  <Recharts.Bar dataKey="month3" stackId="a" fill="var(--color-month3)" />
                  <Recharts.Bar dataKey="month4" stackId="a" fill="var(--color-month4)" />
                  <Recharts.Bar dataKey="month5" stackId="a" fill="var(--color-month5)" />
                </Recharts.BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adoption" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Adoption</CardTitle>
              <CardDescription>Feature usage across all businesses</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{ usage: { label: "Usage %", color: "hsl(var(--primary))" } }}
                className="h-64"
              >
                <Recharts.BarChart data={featureUsageData} layout="horizontal">
                  <Recharts.CartesianGrid strokeDasharray="3 3" />
                  <Recharts.XAxis type="number" domain={[0, 100]} />
                  <Recharts.YAxis dataKey="feature" type="category" width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Recharts.Bar dataKey="usage" fill="var(--color-usage)" />
                </Recharts.BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Features</CardTitle>
                <CardDescription>Most used features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {featureUsageData.slice(0, 5).map((feature: any, index: number) => (
                  <div key={feature.feature} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">#{index + 1}</span>
                      <span className="text-sm">{feature.feature}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{feature.usage}%</div>
                      <div className="text-xs text-muted-foreground">{feature.businesses} businesses</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Underutilized Features</CardTitle>
                <CardDescription>Features with low adoption</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {featureUsageData.slice(-3).map((feature: any, index: number) => (
                  <div key={feature.feature} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">#{featureUsageData.length - 2 + index}</span>
                      <span className="text-sm">{feature.feature}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-red-600">{feature.usage}%</div>
                      <div className="text-xs text-muted-foreground">{feature.businesses} businesses</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leaderboards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Top Performing Businesses
                </CardTitle>
                <CardDescription>By monthly revenue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {topBusinesses.map((business: any, index: number) => (
                  <div key={business.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-yellow-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{business.businessName}</p>
                        <p className="text-sm text-muted-foreground">{business.plan} • {business.businessType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₵{business.monthlyRevenue}</p>
                      <Badge className={business.status === 'active' ? 'bg-green-500' : 'bg-red-500'} variant="outline">
                        {business.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Newest Businesses
                </CardTitle>
                <CardDescription>Recently registered</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {businesses
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 5)
                  .map((business: any, index: number) => (
                    <div key={business.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{business.businessName}</p>
                          <p className="text-sm text-muted-foreground">{business.plan} • {business.businessType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{new Date(business.createdAt).toLocaleDateString()}</p>
                        <Badge className={business.setupComplete ? 'bg-green-500' : 'bg-yellow-500'} variant="outline">
                          {business.setupComplete ? 'Complete' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Business Activity Summary
              </CardTitle>
              <CardDescription>Overall platform activity and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{businesses.length}</div>
                  <p className="text-sm text-muted-foreground">Total Businesses</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{businesses.filter(b => b.status === 'active').length}</div>
                  <p className="text-sm text-muted-foreground">Active Businesses</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{businesses.reduce((sum, b) => sum + b.activeLogins, 0)}</div>
                  <p className="text-sm text-muted-foreground">Total Logins</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">{businesses.filter(b => b.setupComplete).length}</div>
                  <p className="text-sm text-muted-foreground">Setup Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
