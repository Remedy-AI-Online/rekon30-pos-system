import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Alert, AlertDescription } from "./ui/alert"
import { Plus, Search, Filter, Edit, Trash2, Users, Loader2, UserCheck, UserX, Calendar, AlertTriangle } from "lucide-react"
import { dataService } from "../utils/dataService"
import { toast } from "sonner"

interface Worker {
  id: string
  name: string
  email?: string
  phone: string
  position: string
  department: string
  salary: number
  hireDate: string
  status: 'Active' | 'Inactive' | 'On Leave'
  address?: string
  emergencyContact?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null)

  useEffect(() => {
    loadWorkers()
  }, [])

  const loadWorkers = async () => {
    try {
      setLoading(true)
      const response = await dataService.getWorkers()
      setWorkers(response.workers || [])
    } catch (error) {
      console.error("Error loading workers:", error)
      toast.error("Failed to load workers")
    } finally {
      setLoading(false)
    }
  }
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    shopId: "",
    shopName: "",
    salary: "",
    hireDate: "",
    status: "Active" as const,
    address: "",
    emergencyContact: "",
    notes: ""
  })

  const handleSaveWorker = async () => {
    try {
      if (!formData.name || !formData.phone || !formData.position || !formData.department || !formData.shopId || !formData.shopName || !formData.salary || !formData.hireDate) {
        toast.error("Please fill in all required fields")
        return
      }

      const workerData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        department: formData.department,
        shop_id: formData.shopId,  // Add shop_id for database
        shop_name: formData.shopName,  // Add shop_name for database
        salary: parseFloat(formData.salary),
        hire_date: formData.hireDate, // Map hireDate to hire_date for database
        status: formData.status,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        notes: formData.notes,
        id: editingWorker?.id
      }

      if (editingWorker) {
        await dataService.updateWorker(editingWorker.id, workerData)
        toast.success("Worker updated successfully")
      } else {
        await dataService.saveWorker(workerData)
        toast.success("Worker added successfully")
      }

      setDialogOpen(false)
      resetForm()
      loadWorkers()
    } catch (error) {
      console.error("Error saving worker:", error)
      toast.error("Error saving worker")
    }
  }

  const handleDeleteWorker = async (workerId: string, workerName: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${workerName}"? This action cannot be undone.`)
    
    if (!confirmed) return
    
    try {
      await dataService.deleteWorker(workerId)
      toast.success(`Worker "${workerName}" deleted successfully`)
      loadWorkers()
    } catch (error) {
      console.error("Error deleting worker:", error)
      toast.error("Error deleting worker")
    }
  }

  const handleEditWorker = (worker: Worker) => {
    setEditingWorker(worker)
    setFormData({
      name: worker.name,
      email: worker.email || "",
      phone: worker.phone,
      position: worker.position,
      department: worker.department,
      shopId: (worker as any).shop_id || "",  // Get shop_id from worker
      shopName: (worker as any).shop_name || "",  // Get shop_name from worker
      salary: worker.salary.toString(),
      hireDate: worker.hireDate || (worker as any).hire_date || "", // Handle both field names
      status: worker.status as "Active",
      address: worker.address || "",
      emergencyContact: worker.emergencyContact || "",
      notes: worker.notes || ""
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingWorker(null)
    setFormData({
      name: "",
      email: "",
      phone: "",
      position: "",
      department: "",
      shopId: "",
      shopName: "",
      salary: "",
      hireDate: "",
      status: "Active",
      address: "",
      emergencyContact: "",
      notes: ""
    })
  }

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (worker.phone && worker.phone.includes(searchTerm))
    const matchesDepartment = departmentFilter === "all" || worker.department === departmentFilter
    const matchesStatus = statusFilter === "all" || worker.status === statusFilter
    
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="default">Active</Badge>
      case "Inactive":
        return <Badge variant="destructive">Inactive</Badge>
      case "On Leave":
        return <Badge variant="secondary">On Leave</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const departments = [...new Set(workers.map(w => w.department))]

  if (loading) {
    return (
      <div className="p-6 space-y-6 h-full overflow-auto flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading workers...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1>Workers Management</h1>
          <p className="text-muted-foreground">Manage your employees and staff members</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Worker
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingWorker ? "Edit Worker" : "Add New Worker"}</DialogTitle>
              <DialogDescription>
                {editingWorker ? "Update the worker details." : "Enter the details for the new worker."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input 
                      id="name" 
                      placeholder="Enter full name" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input 
                      id="phone" 
                      placeholder="Enter phone number" 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email"
                      placeholder="Enter email address" 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address" 
                      placeholder="Enter home address" 
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input 
                      id="emergencyContact" 
                      placeholder="Emergency contact person and phone" 
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Job Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Job Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Position *</Label>
                    <Input 
                      id="position" 
                      placeholder="Enter job position" 
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Input
                      id="department"
                      placeholder="Enter department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shopId">Shop ID *</Label>
                    <Input
                      id="shopId"
                      placeholder="e.g. SHOP001"
                      value={formData.shopId}
                      onChange={(e) => setFormData({ ...formData, shopId: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shopName">Shop Name *</Label>
                    <Input
                      id="shopName"
                      placeholder="e.g. Main Branch"
                      value={formData.shopName}
                      onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary">Monthly Salary (GHS) *</Label>
                    <Input
                      id="salary"
                      type="number"
                      placeholder="Enter monthly salary"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hireDate">Hire Date *</Label>
                    <Input 
                      id="hireDate" 
                      type="date" 
                      value={formData.hireDate}
                      onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="On Leave">On Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea 
                      id="notes" 
                      placeholder="Additional notes about the worker" 
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveWorker}>
                {editingWorker ? "Update Worker" : "Add Worker"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="compact-card-header flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs">Total Workers</CardTitle>
            <Users className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="compact-card-content">
            <div className="text-lg font-semibold">{workers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="compact-card-header flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs">Active Workers</CardTitle>
            <UserCheck className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="compact-card-content">
            <div className="text-lg font-semibold">
              {workers.filter(w => w.status === 'Active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="compact-card-header flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs">On Leave</CardTitle>
            <Calendar className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="compact-card-content">
            <div className="text-lg font-semibold">
              {workers.filter(w => w.status === 'On Leave').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="compact-card-header flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs">Departments</CardTitle>
            <Users className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="compact-card-content">
            <div className="text-lg font-semibold">{departments.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search workers..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="On Leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Workers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Workers ({filteredWorkers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredWorkers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No workers found</p>
              <p className="text-muted-foreground text-sm">Add your first worker to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Hire Date</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkers.map((worker) => (
                  <TableRow key={worker.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{worker.name}</p>
                        <p className="text-sm text-muted-foreground">{worker.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{worker.position}</TableCell>
                    <TableCell>{worker.department}</TableCell>
                    <TableCell>{worker.phone}</TableCell>
                    <TableCell>{new Date(worker.hireDate).toLocaleDateString()}</TableCell>
                    <TableCell>${worker.salary.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(worker.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditWorker(worker)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteWorker(worker.id, worker.name)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}