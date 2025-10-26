import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"
import { Label } from "./ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Plus, Search, Users, Key, RefreshCw, UserX, UserCheck, ArrowRightLeft, Clock, Copy, Check } from "lucide-react"
import { projectId, publicAnonKey } from "../utils/supabase/info"
import { getSupabaseClient } from "../utils/authService"
import { toast } from "sonner"

interface Worker {
  id: string
  name: string
  phone: string
  position: string
  shopId: string
  shopName: string
  salary: number
  hireDate: string
  status: 'Active' | 'Inactive'
  hasLogin: boolean
  cashierId?: string
  createdAt: string
}

interface CashierCredentials {
  cashierId: string
  shopId: string
  shopName: string
  password: string
  email: string
}

interface Cashier {
  id: string
  workerId: string
  workerName: string
  shopId: string
  shopName: string
  email: string
  password: string
  active: boolean
  lastLogin: string | null
  loginCount: number
  createdAt: string
  cashierId?: string
}

export function WorkersManagementPage() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [cashiers, setCashiers] = useState<Cashier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [shopFilter, setShopFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [credentialsDialog, setCredentialsDialog] = useState<{ open: boolean, credentials: CashierCredentials | null }>({ open: false, credentials: null })
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    position: "",
    shopId: "",
    shopName: "",
    salary: "",
    hireDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    await Promise.all([loadWorkers(), loadCashiers()])
    setLoading(false)
  }

  const loadWorkers = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        toast.error("Please login to view workers")
        return
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-86b98184/workers`,
        {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        }
      )
      const data = await response.json()
      if (data.success) {
        setWorkers(data.workers)
      } else {
        toast.error(data.error || "Failed to load workers")
      }
    } catch (error) {
      console.error("Error loading workers:", error)
      toast.error("Error loading workers")
    }
  }

  const loadCashiers = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        return
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-86b98184/cashiers`,
        {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        }
      )
      const data = await response.json()
      if (data.success) {
        setCashiers(data.cashiers)
      }
    } catch (error) {
      console.error("Error loading cashiers:", error)
    }
  }

  const handleAddWorker = async () => {
    if (!formData.name || !formData.phone || !formData.position || !formData.shopId || !formData.shopName || !formData.salary) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        toast.error("Please login to add workers")
        return
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-86b98184/workers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            position: formData.position,
            shop_id: formData.shopId,  // Convert to snake_case for database
            shop_name: formData.shopName,  // Convert to snake_case for database
            salary: parseFloat(formData.salary),
            hire_date: formData.hireDate,
            status: 'Active',
            department: formData.position  // Use position as department if not provided
          })
        }
      )

      const data = await response.json()
      if (data.success) {
        toast.success("Worker added successfully")
        setDialogOpen(false)
        resetForm()
        loadWorkers()
      } else {
        toast.error(data.error || "Failed to add worker")
      }
    } catch (error) {
      toast.error("Error adding worker")
    }
  }

  const handleCreateCashierLogin = async (worker: Worker) => {
    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        toast.error("Please login to create cashier logins")
        return
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-86b98184/auth/create-cashier`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            workerId: worker.id,
            workerName: worker.name,
            shopId: worker.shopId,
            shopName: worker.shopName
          })
        }
      )

      const data = await response.json()
      if (data.success) {
        toast.success("Cashier login created successfully!")
        setCredentialsDialog({ open: true, credentials: data.credentials })
        await loadData()
      } else {
        toast.error(data.error || "Failed to create cashier login")
      }
    } catch (error) {
      toast.error("Error creating cashier login")
    }
  }

  const handleToggleCashierStatus = async (cashierId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate'
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-86b98184/cashiers/${cashierId}/${action}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      )

      const data = await response.json()
      if (data.success) {
        toast.success(`Cashier ${action}d successfully`)
        loadCashiers()
      } else {
        toast.error(`Failed to ${action} cashier`)
      }
    } catch (error) {
      toast.error(`Error ${action}ing cashier`)
    }
  }

  const handleResetPassword = async (cashierId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-86b98184/cashiers/${cashierId}/reset-password`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      )

      const data = await response.json()
      if (data.success) {
        toast.success("Password reset successfully!")
        setCredentialsDialog({
          open: true,
          credentials: {
            cashierId: cashierId,
            shopId: cashiers.find(c => c.id === cashierId)?.shopId || '',
            shopName: cashiers.find(c => c.id === cashierId)?.shopName || '',
            password: data.newPassword,
            email: cashiers.find(c => c.id === cashierId)?.email || ''
          }
        })
        loadCashiers()
      } else {
        toast.error("Failed to reset password")
      }
    } catch (error) {
      toast.error("Error resetting password")
    }
  }

  const handleTransferCashier = async (cashierId: string) => {
    const newShopId = prompt("Enter new Shop ID:")
    const newShopName = prompt("Enter new Shop Name:")
    
    if (!newShopId || !newShopName) return

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-86b98184/cashiers/${cashierId}/transfer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ newShopId, newShopName })
        }
      )

      const data = await response.json()
      if (data.success) {
        toast.success("Cashier transferred successfully")
        loadCashiers()
      } else {
        toast.error("Failed to transfer cashier")
      }
    } catch (error) {
      toast.error("Error transferring cashier")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      position: "",
      shopId: "",
      shopName: "",
      salary: "",
      hireDate: new Date().toISOString().split('T')[0]
    })
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
    toast.success("Copied to clipboard!")
  }

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.position.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesShop = shopFilter === "all" || worker.shopId === shopFilter
    return matchesSearch && matchesShop
  })

  const filteredCashiers = cashiers.filter(cashier => {
    const matchesSearch = cashier.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cashier.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesShop = shopFilter === "all" || cashier.shopId === shopFilter
    return matchesSearch && matchesShop
  })

  const uniqueShops = [...new Set(workers.map(w => w.shopId))]

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 h-full overflow-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h2 className="text-xl md:text-2xl">Workers & Cashiers</h2>
          <p className="text-sm text-muted-foreground">Manage workers and their cashier logins</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Worker
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Workers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="text-2xl font-bold">{workers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Key className="h-4 w-4" />
              With Logins
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="text-2xl font-bold">{workers.filter(w => w.hasLogin).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              Active Cashiers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="text-2xl font-bold text-green-600">{cashiers.filter(c => c.active).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <UserX className="h-4 w-4 text-red-600" />
              Inactive
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="text-2xl font-bold text-red-600">{cashiers.filter(c => !c.active).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workers or cashiers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={shopFilter} onValueChange={setShopFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by shop" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="all" value="all">All Shops</SelectItem>
            {uniqueShops.map(shop => (
              <SelectItem key={shop} value={shop}>{shop}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="workers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="workers">Workers</TabsTrigger>
          <TabsTrigger value="cashiers">Cashiers</TabsTrigger>
        </TabsList>

        <TabsContent value="workers" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Position</TableHead>
                      <TableHead>Shop</TableHead>
                      <TableHead className="hidden lg:table-cell">Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWorkers.map((worker) => (
                      <TableRow key={worker.id}>
                        <TableCell>{worker.name}</TableCell>
                        <TableCell className="hidden md:table-cell">{worker.position}</TableCell>
                        <TableCell>{worker.shopId}</TableCell>
                        <TableCell className="hidden lg:table-cell">{worker.phone}</TableCell>
                        <TableCell>
                          {worker.hasLogin ? (
                            <Badge variant="default">Has Login</Badge>
                          ) : (
                            <Badge variant="outline">No Login</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {!worker.hasLogin && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCreateCashierLogin(worker)}
                            >
                              <Key className="h-3 w-3 mr-1" />
                              Create Login
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashiers" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cashier ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Shop</TableHead>
                      <TableHead className="hidden lg:table-cell">Last Login</TableHead>
                      <TableHead className="hidden lg:table-cell">Login Count</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCashiers.map((cashier) => (
                      <TableRow key={cashier.id}>
                        <TableCell className="font-mono text-xs">{cashier.id}</TableCell>
                        <TableCell>{cashier.workerName}</TableCell>
                        <TableCell className="hidden md:table-cell">{cashier.shopId}</TableCell>
                        <TableCell className="hidden lg:table-cell text-xs">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(cashier.lastLogin)}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{cashier.loginCount}</TableCell>
                        <TableCell>
                          {cashier.active ? (
                            <Badge variant="default" className="bg-green-600">Active</Badge>
                          ) : (
                            <Badge variant="destructive">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setCredentialsDialog({ open: true, credentials: { ...cashier, cashierId: cashier.id } })}
                              title="View Credentials"
                            >
                              <Key className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleCashierStatus(cashier.id, cashier.active)}
                            >
                              {cashier.active ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResetPassword(cashier.id)}
                              title="Reset Password"
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTransferCashier(cashier.id)}
                              title="Transfer to Another Shop"
                            >
                              <ArrowRightLeft className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Worker Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Worker</DialogTitle>
            <DialogDescription>Add a new worker to the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Worker name"
              />
            </div>
            <div>
              <Label>Phone *</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1234567890"
              />
            </div>
            <div>
              <Label>Position *</Label>
              <Select value={formData.position} onValueChange={(value) => setFormData({ ...formData, position: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="cashier" value="Cashier">Cashier</SelectItem>
                  <SelectItem key="sales-associate" value="Sales Associate">Sales Associate</SelectItem>
                  <SelectItem key="store-manager" value="Store Manager">Store Manager</SelectItem>
                  <SelectItem key="inventory-clerk" value="Inventory Clerk">Inventory Clerk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Shop ID *</Label>
                <Input
                  value={formData.shopId}
                  onChange={(e) => setFormData({ ...formData, shopId: e.target.value })}
                  placeholder="SHOP001"
                />
              </div>
              <div>
                <Label>Shop Name *</Label>
                <Input
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  placeholder="Main Branch"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Salary *</Label>
                <Input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Hire Date *</Label>
                <Input
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddWorker}>Add Worker</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog open={credentialsDialog.open} onOpenChange={(open) => setCredentialsDialog({ ...credentialsDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cashier Login Credentials</DialogTitle>
            <DialogDescription>Share these credentials with the cashier. They won't be shown again.</DialogDescription>
          </DialogHeader>
          {credentialsDialog.credentials && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Shop ID</Label>
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-sm">{credentialsDialog.credentials.shopId}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(credentialsDialog.credentials?.shopId || '', 'shopId')}
                    >
                      {copiedField === 'shopId' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Cashier ID</Label>
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-sm">{credentialsDialog.credentials?.cashierId}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(credentialsDialog.credentials?.cashierId || '', 'cashierId')}
                    >
                      {copiedField === 'cashierId' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Password</Label>
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-sm">{credentialsDialog.credentials.password}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(credentialsDialog.credentials?.password || '', 'password')}
                    >
                      {copiedField === 'password' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="pt-2 border-t border-green-200 dark:border-green-800">
                  <Label className="text-xs text-muted-foreground">Login Email (System Generated)</Label>
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-xs break-all">{credentialsDialog.credentials.email}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(credentialsDialog.credentials?.email || '', 'email')}
                    >
                      {copiedField === 'email' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                ⓘ Make sure to save these credentials. The password cannot be retrieved later.
              </div>
              <Button onClick={() => setCredentialsDialog({ open: false, credentials: null })} className="w-full">
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
