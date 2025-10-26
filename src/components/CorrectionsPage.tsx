import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { 
  AlertTriangle, 
  Clock, 
  User, 
  DollarSign, 
  Receipt, 
  CheckCircle2,
  XCircle,
  Search,
  Filter
} from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"
import { Separator } from "./ui/separator"

interface Correction {
  id: string
  receiptId: string
  cashierName: string
  shopId: string
  timestamp: string
  reason: string
  originalAmount: number
  correctedAmount: number
  status: 'pending' | 'approved' | 'rejected'
  originalItems: any[]
  correctedItems: any[]
  approvedBy?: string
  notes?: string
}

interface CorrectionsPageProps {
  isAdmin?: boolean
  currentUser?: any
}

export function CorrectionsPage({ isAdmin = false, currentUser }: CorrectionsPageProps) {
  const [corrections, setCorrections] = useState<Correction[]>([])
  
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedCorrection, setSelectedCorrection] = useState<Correction | null>(null)

  // Filter corrections based on search and status
  const filteredCorrections = corrections.filter(correction => {
    const matchesSearch = correction.receiptId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         correction.cashierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         correction.reason.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || correction.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleApproveCorrection = (correctionId: string) => {
    setCorrections(prev => prev.map(correction => 
      correction.id === correctionId 
        ? { ...correction, status: 'approved' as const, approvedBy: currentUser?.name || 'Admin' }
        : correction
    ))
  }

  const handleRejectCorrection = (correctionId: string, reason: string) => {
    setCorrections(prev => prev.map(correction => 
      correction.id === correctionId 
        ? { ...correction, status: 'rejected' as const, notes: reason, approvedBy: currentUser?.name || 'Admin' }
        : correction
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertTriangle className="h-4 w-4" />
      case 'approved': return <CheckCircle2 className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const pendingCount = corrections.filter(c => c.status === 'pending').length
  const approvedCount = corrections.filter(c => c.status === 'approved').length
  const rejectedCount = corrections.filter(c => c.status === 'rejected').length

  return (
    <div className="p-6 space-y-6 h-full overflow-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Sales Corrections</h1>
        <p className="text-muted-foreground">
          {isAdmin ? "Review and approve sale corrections from cashiers" : "View your submitted corrections"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-sm text-muted-foreground">Pending</div>
                <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-muted-foreground">Approved</div>
                <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-sm text-muted-foreground">Rejected</div>
                <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="text-2xl font-bold text-blue-600">{corrections.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by receipt ID, cashier, or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Corrections List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCorrections.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No corrections found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          filteredCorrections.map(correction => (
            <Card key={correction.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(correction.status)}>
                      {getStatusIcon(correction.status)}
                      <span className="ml-1">{correction.status.toUpperCase()}</span>
                    </Badge>
                    <div>
                      <CardTitle className="text-lg">Receipt #{correction.receiptId}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Correction #{correction.id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {correction.timestamp}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <User className="h-3 w-3" />
                      {correction.cashierName} ({correction.shopId})
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Reason for Correction:</Label>
                  <p className="text-sm text-muted-foreground mt-1">{correction.reason}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-red-600">Original Sale</Label>
                    <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg space-y-2">
                      {correction.originalItems.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-sm">{item.name} ({item.size})</span>
                          <span className="text-sm font-medium">${item.price} x {item.quantity}</span>
                        </div>
                      ))}
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total:</span>
                        <span>${correction.originalAmount}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-green-600">Corrected Sale</Label>
                    <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg space-y-2">
                      {correction.correctedItems.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-sm">{item.name} ({item.size})</span>
                          <span className="text-sm font-medium">${item.price} x {item.quantity}</span>
                        </div>
                      ))}
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total:</span>
                        <span>${correction.correctedAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4" />
                  <span>Amount Difference: </span>
                  <span className={`font-medium ${
                    correction.correctedAmount > correction.originalAmount 
                      ? 'text-green-600' 
                      : correction.correctedAmount < correction.originalAmount
                      ? 'text-red-600'
                      : 'text-muted-foreground'
                  }`}>
                    {correction.correctedAmount > correction.originalAmount ? '+' : ''}
                    ${correction.correctedAmount - correction.originalAmount}
                  </span>
                </div>

                {correction.notes && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Admin Notes:</strong> {correction.notes}
                    </AlertDescription>
                  </Alert>
                )}

                {isAdmin && correction.status === 'pending' && (
                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={() => handleApproveCorrection(correction.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      onClick={() => handleRejectCorrection(correction.id, "Requires more information")}
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}

                {correction.approvedBy && (
                  <div className="text-xs text-muted-foreground">
                    {correction.status === 'approved' ? 'Approved' : 'Rejected'} by {correction.approvedBy}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}