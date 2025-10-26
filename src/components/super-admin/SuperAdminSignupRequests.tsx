import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  User,
  FileText,
  AlertCircle,
  Search,
  Filter
} from "lucide-react"
import { superAdminService } from "../../utils/superAdminService"
import { toast } from "sonner"

interface SignupRequest {
  id: string
  email: string
  business_config: any
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  approved_at?: string
  approved_by?: string
  rejection_reason?: string
}

export function SuperAdminSignupRequests() {
  const [requests, setRequests] = useState<SignupRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<SignupRequest | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)
  
  // Plan assignment state
  const [assignedPlan, setAssignedPlan] = useState<'basic' | 'pro' | 'enterprise'>('basic')
  const [upfrontPayment, setUpfrontPayment] = useState('')
  const [maintenanceFee, setMaintenanceFee] = useState('')

  useEffect(() => {
    loadRequests()
  }, [filterStatus])

  const loadRequests = async () => {
    try {
      setLoading(true)
      console.log('Loading signup requests with filter:', filterStatus)
      const data = await superAdminService.getSignupRequests(filterStatus)
      console.log('Received data:', data)
      setRequests(data)
    } catch (error) {
      console.error('Error loading requests:', error)
      toast.error('Failed to load signup requests')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenApproveDialog = (request: SignupRequest) => {
    setSelectedRequest(request)
    // Set default pricing based on plan
    setAssignedPlan('basic')
    setUpfrontPayment('1000')
    setMaintenanceFee('200')
    setShowApproveDialog(true)
  }

  const handleApprove = async () => {
    if (!selectedRequest) return
    
    try {
      setProcessingRequest(selectedRequest.id)
      const result = await superAdminService.approveSignupRequest(
        selectedRequest.id,
        assignedPlan,
        parseFloat(upfrontPayment) || 0,
        parseFloat(maintenanceFee) || 0
      )
      
      if (result.success) {
        toast.success(`Business approved with ${assignedPlan.toUpperCase()} plan!`)
        loadRequests()
        setShowDetailsDialog(false)
        setShowApproveDialog(false)
      } else {
        toast.error(result.error || 'Failed to approve business')
      }
    } catch (error) {
      console.error('Error approving request:', error)
      toast.error('Failed to approve business')
    } finally {
      setProcessingRequest(null)
    }
  }

  const handlePlanChange = (plan: 'basic' | 'pro' | 'enterprise') => {
    setAssignedPlan(plan)
    // Auto-fill pricing based on plan
    if (plan === 'basic') {
      setUpfrontPayment('1000')
      setMaintenanceFee('200')
    } else if (plan === 'pro') {
      setUpfrontPayment('2000')
      setMaintenanceFee('200')
    } else if (plan === 'enterprise') {
      setUpfrontPayment('5000')
      setMaintenanceFee('800')
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      setProcessingRequest(requestId)
      const result = await superAdminService.rejectSignupRequest(requestId, rejectionReason)
      
      if (result.success) {
        toast.success('Business rejected successfully!')
        loadRequests()
        setShowRejectDialog(false)
        setRejectionReason('')
      } else {
        toast.error(result.error || 'Failed to reject business')
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast.error('Failed to reject business')
    } finally {
      setProcessingRequest(null)
    }
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.business_config?.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading signup requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Business Signup Requests</h1>
          <p className="text-muted-foreground">Review and approve new business registrations</p>
        </div>
        <Button onClick={loadRequests} variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by business name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRequests.map((request) => (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{request.business_config?.businessName || 'Unknown Business'}</h3>
                    <p className="text-sm text-muted-foreground">{request.email}</p>
                  </div>
                </div>
                {getStatusBadge(request.status)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{request.business_config?.businessType || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{request.business_config?.city || 'N/A'}, {request.business_config?.region || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(request.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {request.status === 'pending' && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedRequest(request)
                      setShowDetailsDialog(true)
                    }}
                    className="flex-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Review
                  </Button>
                </div>
              )}

              {request.status === 'approved' && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Approved on {new Date(request.approved_at!).toLocaleDateString()}</span>
                </div>
              )}

              {request.status === 'rejected' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <XCircle className="h-4 w-4" />
                    <span>Rejected on {new Date(request.approved_at!).toLocaleDateString()}</span>
                  </div>
                  {request.rejection_reason && (
                    <p className="text-xs text-muted-foreground bg-red-50 p-2 rounded">
                      {request.rejection_reason}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Building2 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <h3 className="font-medium text-gray-600 mb-1">No signup requests found</h3>
            <p className="text-sm text-muted-foreground">
              {filterStatus === 'all' 
                ? 'No business signup requests have been submitted yet.'
                : `No ${filterStatus} requests found.`
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Request Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Business Signup Request Details
            </DialogTitle>
            <DialogDescription>
              Review all business information before approving or rejecting
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Business Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Business Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Business Name</Label>
                      <p className="text-sm text-muted-foreground">{selectedRequest.business_config?.businessName || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Business Type</Label>
                      <p className="text-sm text-muted-foreground capitalize">{selectedRequest.business_config?.businessType || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Business Size</Label>
                      <p className="text-sm text-muted-foreground capitalize">{selectedRequest.business_config?.businessSize || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Registration Number</Label>
                      <p className="text-sm text-muted-foreground">{selectedRequest.business_config?.registrationNumber || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Owner Name</Label>
                      <p className="text-sm text-muted-foreground">{selectedRequest.business_config?.ownerName || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Owner Phone</Label>
                      <p className="text-sm text-muted-foreground">{selectedRequest.business_config?.ownerPhone || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Business Email</Label>
                      <p className="text-sm text-muted-foreground">{selectedRequest.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Business Phone</Label>
                      <p className="text-sm text-muted-foreground">{selectedRequest.business_config?.businessPhone || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-sm font-medium">Business Address</Label>
                      <p className="text-sm text-muted-foreground">{selectedRequest.business_config?.businessAddress || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">City</Label>
                      <p className="text-sm text-muted-foreground">{selectedRequest.business_config?.city || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Region</Label>
                      <p className="text-sm text-muted-foreground">{selectedRequest.business_config?.region || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Business Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">TIN Number</Label>
                      <p className="text-sm text-muted-foreground">{selectedRequest.business_config?.tinNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Year Established</Label>
                      <p className="text-sm text-muted-foreground">{selectedRequest.business_config?.yearEstablished || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Number of Employees</Label>
                      <p className="text-sm text-muted-foreground">{selectedRequest.business_config?.numberOfEmployees || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Number of Locations</Label>
                      <p className="text-sm text-muted-foreground">{selectedRequest.business_config?.numberOfLocations || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Products Count</Label>
                      <p className="text-sm text-muted-foreground">{selectedRequest.business_config?.productsCount || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Average Monthly Sales</Label>
                      <p className="text-sm text-muted-foreground">₵{selectedRequest.business_config?.averageMonthlySales || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => {
                    setShowDetailsDialog(false)
                    handleOpenApproveDialog(selectedRequest)
                  }}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve & Assign Plan
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailsDialog(false)
                    setShowRejectDialog(true)
                  }}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Reject Business Signup
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this business signup request.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false)
                  setRejectionReason('')
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedRequest && handleReject(selectedRequest.id)}
                disabled={processingRequest === selectedRequest?.id}
                variant="destructive"
                className="flex-1"
              >
                {processingRequest === selectedRequest?.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Rejecting...
                  </>
                ) : (
                  'Reject Business'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approve & Assign Plan Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Approve Business & Assign Plan
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && `Assign a plan and pricing for ${selectedRequest.business_config?.businessName}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Plan Selection */}
            <div>
              <Label htmlFor="plan">Select Plan</Label>
              <Select value={assignedPlan} onValueChange={(value: string) => handlePlanChange(value as 'basic' | 'pro' | 'enterprise')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">Basic Plan</span>
                      <span className="text-xs text-muted-foreground">₵1,000 upfront + ₵200/6 months</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pro">
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">Pro Plan</span>
                      <span className="text-xs text-muted-foreground">₵2,000-3,000 upfront + ₵200/6 months</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="enterprise">
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">Enterprise Plan</span>
                      <span className="text-xs text-muted-foreground">₵5,000+ upfront + ₵800/6 months</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Features Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Features Included</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {assignedPlan === 'basic' && (
                    <>
                      <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>Dashboard</span></div>
                      <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>Products</span></div>
                      <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>Orders</span></div>
                      <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>Workers</span></div>
                      <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>Reports</span></div>
                      <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>Settings</span></div>
                    </>
                  )}
                  {assignedPlan === 'pro' && (
                    <>
                      <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>All Core Features</span></div>
                      <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>Customers</span></div>
                      <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>Workers Management</span></div>
                      <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>Payroll</span></div>
                      <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>Suppliers</span></div>
                      <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>Location Management</span></div>
                      <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>Credit Management</span></div>
                    </>
                  )}
                  {assignedPlan === 'enterprise' && (
                    <>
                      <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>All Pro Features</span></div>
                      <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>API Access</span></div>
                      <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>White Label</span></div>
                      <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>Priority Support</span></div>
                      <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>Custom Features</span></div>
                      <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>Enterprise Analytics</span></div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="upfront-payment">Upfront Payment (₵)</Label>
                <Input
                  id="upfront-payment"
                  type="number"
                  value={upfrontPayment}
                  onChange={(e) => setUpfrontPayment(e.target.value)}
                  placeholder="1000"
                />
              </div>
              <div>
                <Label htmlFor="maintenance-fee">Maintenance Fee (₵/6 months)</Label>
                <Input
                  id="maintenance-fee"
                  type="number"
                  value={maintenanceFee}
                  onChange={(e) => setMaintenanceFee(e.target.value)}
                  placeholder="200"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowApproveDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                disabled={processingRequest === selectedRequest?.id}
                className="flex-1"
              >
                {processingRequest === selectedRequest?.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Business
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
