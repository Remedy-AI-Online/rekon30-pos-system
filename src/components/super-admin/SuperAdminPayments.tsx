import { useState, useEffect } from "react"
import { superAdminService } from "../../utils/superAdminService"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Textarea } from "../ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { 
  Plus, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  RefreshCw, 
  Download, 
  CreditCard, 
  DollarSign, 
  Calendar,
  Mail,
  Phone,
  FileText,
  TrendingUp,
  Users,
  Building2
} from "lucide-react"

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

interface SuperAdminPaymentsProps {
  businesses: Business[]
  onRefresh: () => void
}

export function SuperAdminPayments({ businesses, onRefresh }: SuperAdminPaymentsProps) {
  const [showRecordDialog, setShowRecordDialog] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState("")
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [paymentReference, setPaymentReference] = useState("")
  const [paymentNotes, setPaymentNotes] = useState("")
  const [paymentType, setPaymentType] = useState<'upfront' | 'maintenance'>('upfront')
  const [activeTab, setActiveTab] = useState("overdue")
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      const { data, error } = await superAdminService.getAllPayments()
      if (error) {
        console.error('Error loading payments:', error)
        setPayments([])
      } else {
        setPayments(data || [])
      }
    } catch (error) {
      console.error('Error loading payments:', error)
      setPayments([])
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500'
      case 'overdue': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const overdueBusinesses = businesses.filter(b => b.paymentStatus === 'overdue')
  const dueSoonBusinesses = businesses.filter(b => {
    const renewal = new Date(b.renewalDate)
    const now = new Date()
    const daysUntilRenewal = Math.ceil((renewal.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilRenewal <= 30 && daysUntilRenewal >= 0 && b.paymentStatus !== 'overdue'
  })
  const recentlyPaidBusinesses = businesses.filter(b => b.paymentStatus === 'paid')
    .sort((a, b) => new Date(b.lastPayment).getTime() - new Date(a.lastPayment).getTime())
    .slice(0, 10)

  const handleRecordPayment = async () => {
    if (selectedBusiness && paymentAmount && paymentMethod) {
      setLoading(true)
      try {
        const { success, error } = await superAdminService.recordPayment({
          business_id: selectedBusiness,
          amount: parseFloat(paymentAmount),
          payment_type: paymentType,
          payment_method: paymentMethod,
          reference: paymentReference,
          notes: paymentNotes
        })

        if (success) {
          alert('Payment recorded successfully!')
          setShowRecordDialog(false)
          setSelectedBusiness("")
          setPaymentAmount("")
          setPaymentMethod("")
          setPaymentReference("")
          setPaymentNotes("")
          setPaymentType('upfront')
          loadPayments()
          onRefresh()
        } else {
          alert(`Failed to record payment: ${error}`)
        }
      } catch (error) {
        console.error('Error recording payment:', error)
        alert('Failed to record payment')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleSendReminder = (businessId: string) => {
    // TODO: Implement reminder sending
    console.log('Sending reminder to business:', businessId)
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Payment Management</h1>
          <p className="text-muted-foreground">Track payments, send reminders, and manage renewals</p>
        </div>

      {/* Enhanced Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Side - Stats */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{overdueBusinesses.length}</div>
            <div className="text-sm text-muted-foreground">Overdue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{dueSoonBusinesses.length}</div>
            <div className="text-sm text-muted-foreground">Due Soon</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{recentlyPaidBusinesses.length}</div>
            <div className="text-sm text-muted-foreground">Recent</div>
          </div>
        </div>

        {/* Right Side - Action Buttons */}
        <div className="flex items-center gap-2">
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowRecordDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Payment Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Overdue Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <h3 className="font-semibold text-lg">Overdue</h3>
            <Badge variant="destructive">{overdueBusinesses.length}</Badge>
          </div>
          
          <div className="space-y-3">
              {overdueBusinesses.length > 0 ? (
                overdueBusinesses.map(business => (
                <Card key={business.id} className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                          <h4 className="font-medium">{business.businessName}</h4>
                        <p className="text-sm text-muted-foreground">{business.email}</p>
                      </div>
                    </div>
                      <Badge variant="destructive" className="text-xs">Overdue</Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-medium">₵{business.plan === 'basic' ? '200' : business.plan === 'pro' ? '400' : '800'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Due:</span>
                        <span className="text-red-600">{new Date(business.renewalDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Plan:</span>
                        <span className="capitalize">{business.plan}</span>
                      </div>
                      </div>
                    
                      <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => handleSendReminder(business.id)}>
                        <Mail className="h-3 w-3 mr-1" />
                          Remind
                        </Button>
                      <Button size="sm" className="flex-1" onClick={() => {
                          setSelectedBusiness(business.id)
                          setPaymentAmount(business.plan === 'basic' ? '200' : business.plan === 'pro' ? '400' : '800')
                          setShowRecordDialog(true)
                        }}>
                        <CreditCard className="h-3 w-3 mr-1" />
                          Record
                        </Button>
                      </div>
                  </CardContent>
                </Card>
                ))
              ) : (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <h3 className="font-medium text-green-600">All Caught Up!</h3>
                  <p className="text-sm text-muted-foreground">No overdue payments</p>
            </CardContent>
          </Card>
            )}
          </div>
        </div>

        {/* Due Soon Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <h3 className="font-semibold text-lg">Due Soon</h3>
            <Badge variant="secondary">{dueSoonBusinesses.length}</Badge>
          </div>
          
          <div className="space-y-3">
              {dueSoonBusinesses.length > 0 ? (
                dueSoonBusinesses.map(business => (
                <Card key={business.id} className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                          <h4 className="font-medium">{business.businessName}</h4>
                        <p className="text-sm text-muted-foreground">{business.email}</p>
                      </div>
                    </div>
                      <Badge variant="secondary" className="text-xs">Due Soon</Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-medium">₵{business.plan === 'basic' ? '200' : business.plan === 'pro' ? '400' : '800'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Due:</span>
                        <span className="text-yellow-600">{new Date(business.renewalDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Plan:</span>
                        <span className="capitalize">{business.plan}</span>
                      </div>
                      </div>
                    
                      <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => handleSendReminder(business.id)}>
                        <Mail className="h-3 w-3 mr-1" />
                          Remind
                        </Button>
                      <Button size="sm" className="flex-1" onClick={() => {
                          setSelectedBusiness(business.id)
                          setPaymentAmount(business.plan === 'basic' ? '200' : business.plan === 'pro' ? '400' : '800')
                          setShowRecordDialog(true)
                        }}>
                        <CreditCard className="h-3 w-3 mr-1" />
                          Record
                        </Button>
                      </div>
                  </CardContent>
                </Card>
                ))
              ) : (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <h3 className="font-medium text-blue-600">All Good!</h3>
                  <p className="text-sm text-muted-foreground">No payments due soon</p>
            </CardContent>
          </Card>
            )}
          </div>
        </div>

        {/* Recent Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <h3 className="font-semibold text-lg">Recent</h3>
            <Badge variant="default">{recentlyPaidBusinesses.length}</Badge>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
              {recentlyPaidBusinesses.length > 0 ? (
                recentlyPaidBusinesses.map(business => (
                <Card key={business.id} className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                          <h4 className="font-medium">{business.businessName}</h4>
                        <p className="text-sm text-muted-foreground">{business.email}</p>
                      </div>
                    </div>
                      <Badge className="bg-green-500 text-white text-xs">Paid</Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-medium">₵{business.plan === 'basic' ? '200' : business.plan === 'pro' ? '400' : '800'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Paid:</span>
                        <span className="text-green-600">{new Date(business.lastPayment).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Plan:</span>
                        <span className="capitalize">{business.plan}</span>
                    </div>
                  </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => handleSendReminder(business.id)}>
                        <Mail className="h-3 w-3 mr-1" />
                        Contact
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <FileText className="h-3 w-3 mr-1" />
                        Receipt
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                ))
              ) : (
              <Card className="border-dashed col-span-full">
                <CardContent className="p-8 text-center">
                  <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-600">No Recent Activity</h3>
                  <p className="text-sm text-muted-foreground">No recent payments</p>
            </CardContent>
          </Card>
            )}
          </div>
        </div>
      </div>

      {/* Payment Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest payment transactions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.length > 0 ? (
              payments.slice(0, 10).map((payment, index) => {
                const business = businesses.find(b => b.id === payment.business_id)
                return (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{business?.businessName || 'Unknown Business'}</h4>
                        <span className="text-sm text-muted-foreground">{new Date(payment.payment_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{payment.payment_method}</span>
                          <Badge className="bg-green-500 text-white text-xs">Completed</Badge>
                        </div>
                        <span className="font-semibold text-green-600">₵{payment.amount}</span>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <h3 className="font-medium text-gray-600">No Payment History</h3>
                <p className="text-sm text-muted-foreground">No payments have been recorded yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Record Payment Dialog */}
      <Dialog open={showRecordDialog} onOpenChange={setShowRecordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Business</Label>
              <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business" />
                </SelectTrigger>
                <SelectContent>
                  {businesses.map(business => (
                    <SelectItem key={business.id} value={business.id}>
                      {business.businessName} ({business.plan})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Payment Type</Label>
              <Select value={paymentType} onValueChange={(value: 'upfront' | 'maintenance') => setPaymentType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upfront">Upfront Payment</SelectItem>
                  <SelectItem value="maintenance">Maintenance Fee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Amount (₵)</Label>
              <Input
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            
            <div>
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="momo">Mobile Money</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Reference/Transaction ID</Label>
              <Input
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Enter reference number"
              />
            </div>
            
            <div>
              <Label>Notes</Label>
              <Textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Additional notes about this payment"
                className="min-h-20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecordPayment} disabled={!selectedBusiness || !paymentAmount || !paymentMethod || loading}>
              {loading ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}