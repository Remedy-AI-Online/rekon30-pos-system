import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Textarea } from "../ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Progress } from "../ui/progress"
import { toast } from "sonner"
import { superAdminService } from "../../utils/superAdminService"
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
  HardDrive,
  Cloud,
  Shield,
  Send,
  History,
  Settings,
  Trash2,
  Eye,
  Calendar,
  FileText,
  Users,
  Package,
  DollarSign,
  Building2,
  Search,
  Filter
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

interface Backup {
  id: string
  businessId: string
  businessName: string
  timestamp: string
  size: number
  type: 'automatic' | 'manual' | 'scheduled'
  status: 'completed' | 'failed' | 'in_progress'
  description: string
  dataPoints: {
    products: number
    customers: number
    sales: number
    workers: number
    payroll: number
  }
}

interface SuperAdminBackupsProps {
  businesses: Business[]
  onRefresh: () => void
}

export function SuperAdminBackups({ businesses, onRefresh }: SuperAdminBackupsProps) {
  console.log("SuperAdminBackups component rendered")
  const [selectedBusiness, setSelectedBusiness] = useState<string>("all")
  const [backups, setBackups] = useState<Backup[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showCreateBackup, setShowCreateBackup] = useState(false)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null)
  const [deployProgress, setDeployProgress] = useState(0)
  const [isDeploying, setIsDeploying] = useState(false)

  // Mock backup data
  useEffect(() => {
    // Only load backups if we have businesses loaded
    if (businesses && businesses.length >= 0) {
      loadBackups()
    }

    // Subscribe to backup updates for realtime refresh
    const subscription = superAdminService.subscribeToBackupUpdates((payload) => {
      console.log('Backup update received:', payload)
      loadBackups()
    })

    return () => {
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businesses])
  
  // Show loading state if loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center space-y-4">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-lg font-medium">Loading backups...</p>
        </div>
      </div>
    )
  }

  const loadBackups = async () => {
    try {
      setLoading(true)
      const { data, error } = await superAdminService.getBackupHistory()
      
      if (error) {
        console.error('Error loading backups:', error)
        setBackups([])
      } else if (data && data.length > 0) {
        // Transform database backup records to our Backup interface
        const transformedBackups: Backup[] = data.map(record => ({
          id: record.id,
          businessId: record.business_id,
          businessName: businesses.find(b => b.id === record.business_id)?.businessName || 'Unknown Business',
          timestamp: record.created_at,
          size: (record.data_size || 0) / (1024 * 1024), // Convert bytes to MB
          type: record.backup_type === 'full' ? 'automatic' : 'manual',
          status: record.status === 'completed' ? 'completed' : record.status === 'failed' ? 'failed' : 'in_progress',
          description: `${record.backup_type} backup`,
          dataPoints: { products: 0, customers: 0, sales: 0, workers: 0, payroll: 0 }
        }))
        setBackups(transformedBackups)
      } else {
        setBackups([])
      }
    } catch (error: any) {
      console.error('Error loading backups:', error)
      setBackups([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBackup = async () => {
    if (!selectedBusiness || selectedBusiness === "all") {
      toast.error("Please select a specific business first")
      return
    }

    setLoading(true)
    try {
      const { success, error } = await superAdminService.triggerBackup(selectedBusiness, 'full')
      
      if (success) {
        toast.success("Backup initiated successfully")
        setShowCreateBackup(false)
        // Reload backups after a short delay to see the new backup
        setTimeout(() => loadBackups(), 2000)
      } else {
        toast.error(error || "Failed to create backup")
      }
    } catch (error: any) {
      console.error('Backup creation error:', error)
      toast.error(`Failed to create backup: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeployToBusiness = async (backup: Backup) => {
    if (!confirm(`Are you sure you want to restore data from this backup to ${backup.businessName}? This will overwrite their current data.`)) {
      return
    }

    setIsDeploying(true)
    setDeployProgress(0)
    
    try {
      // Show progress animation
      const progressInterval = setInterval(() => {
        setDeployProgress(prev => Math.min(prev + 10, 90))
      }, 200)
      
      const { success, error } = await superAdminService.restoreBackup(
        backup.businessId,
        backup.id
      )
      
      clearInterval(progressInterval)
      
      if (success) {
        setDeployProgress(100)
        toast.success(`Data restored to ${backup.businessName} successfully!`)
        setTimeout(() => {
          setIsDeploying(false)
          setDeployProgress(0)
        }, 1000)
      } else {
        toast.error(error || "Failed to restore data")
        setIsDeploying(false)
        setDeployProgress(0)
      }
    } catch (error: any) {
      console.error('Restore error:', error)
      toast.error(`Failed to restore data: ${error.message}`)
      setIsDeploying(false)
      setDeployProgress(0)
    }
  }

  const filteredBackups = backups.filter(backup => {
    const matchesSearch = backup.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         backup.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || backup.status === filterStatus
    const matchesBusiness = selectedBusiness === "all" || !selectedBusiness || backup.businessId === selectedBusiness
    
    return matchesSearch && matchesStatus && matchesBusiness
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'failed': return 'bg-red-500'
      case 'in_progress': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'automatic': return <RefreshCw className="h-4 w-4" />
      case 'manual': return <Database className="h-4 w-4" />
      case 'scheduled': return <Clock className="h-4 w-4" />
      default: return <Database className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6" />
            Business Backups & Data Recovery
          </h2>
          <p className="text-muted-foreground">Manage backups and restore data for any business</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateBackup(true)}>
            <Database className="h-4 w-4 mr-2" />
            Create Backup
          </Button>
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Business Selection & Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Backup Management</CardTitle>
          <CardDescription>Select a business to manage their backups and data recovery</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Select Business</Label>
              <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a business" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Businesses</SelectItem>
                  {businesses.map(business => (
                    <SelectItem key={business.id} value={business.id}>
                      {business.businessName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Search Backups</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search backups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label>Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{backups.length}</p>
                <p className="text-sm text-muted-foreground">Total Backups</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <HardDrive className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {backups.reduce((acc, backup) => acc + backup.size, 0).toFixed(1)}GB
                </p>
                <p className="text-sm text-muted-foreground">Total Storage</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {backups.filter(b => b.status === 'completed').length}
                </p>
                <p className="text-sm text-muted-foreground">Successful</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">
                  {backups.filter(b => b.status === 'failed').length}
                </p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backups Table */}
      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <CardDescription>All backups with restore and deploy options</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Points</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBackups.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{backup.businessName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(backup.type)}
                      <span className="capitalize">{backup.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(backup.timestamp).toLocaleDateString()}
                    <br />
                    <span className="text-xs text-muted-foreground">
                      {new Date(backup.timestamp).toLocaleTimeString()}
                    </span>
                  </TableCell>
                  <TableCell>{backup.size.toFixed(1)}GB</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(backup.status)} text-white`}>
                      {backup.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {backup.dataPoints.products} products
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {backup.dataPoints.customers} customers
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {backup.dataPoints.sales} sales
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedBackup(backup)
                          setShowRestoreDialog(true)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDeployToBusiness(backup)}
                        disabled={isDeploying}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Deploy
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Backup Dialog */}
      <Dialog open={showCreateBackup} onOpenChange={setShowCreateBackup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Manual Backup</DialogTitle>
            <DialogDescription>
              Create a backup for the selected business. This will capture all their current data.
            </DialogDescription>
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
                      {business.businessName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Backup Description</Label>
              <Textarea
                placeholder="Describe this backup (e.g., 'Before major update', 'Monthly backup')"
                className="min-h-20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateBackup(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBackup} disabled={loading || !selectedBusiness}>
              {loading ? "Creating..." : "Create Backup"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore/Deploy Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Backup Details & Recovery Options</DialogTitle>
            <DialogDescription>
              View backup details and choose recovery options for this business.
            </DialogDescription>
          </DialogHeader>
          {selectedBackup && (
            <div className="space-y-6">
              {/* Backup Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Backup Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Business:</span>
                      <span className="font-medium">{selectedBackup.businessName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{new Date(selectedBackup.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span>{selectedBackup.size.toFixed(1)}GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="capitalize">{selectedBackup.type}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Data Contents</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Products:</span>
                      <span>{selectedBackup.dataPoints.products}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Customers:</span>
                      <span>{selectedBackup.dataPoints.customers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sales Records:</span>
                      <span>{selectedBackup.dataPoints.sales}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Workers:</span>
                      <span>{selectedBackup.dataPoints.workers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payroll Records:</span>
                      <span>{selectedBackup.dataPoints.payroll}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recovery Options */}
              <div>
                <h4 className="font-semibold mb-3">Recovery Options</h4>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium">Deploy to Business System</h5>
                        <p className="text-sm text-muted-foreground">
                          Send this backup data to the business's system to restore their data
                        </p>
                      </div>
                      <Button onClick={() => handleDeployToBusiness(selectedBackup)}>
                        <Send className="h-4 w-4 mr-2" />
                        Deploy Now
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium">Download Backup File</h5>
                        <p className="text-sm text-muted-foreground">
                          Download the backup file for manual restoration
                        </p>
                      </div>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deployment Progress */}
              {isDeploying && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Deploying data to {selectedBackup.businessName}...</span>
                    <span>{deployProgress}%</span>
                  </div>
                  <Progress value={deployProgress} className="w-full" />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
