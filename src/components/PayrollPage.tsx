import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Textarea } from "./ui/textarea"
import { DollarSign, Calendar, Download, Filter, TrendingUp, Users, Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { projectId } from "../utils/supabase/info"
import { getSupabaseClient } from "../utils/authService"

interface PayrollRecord {
  id: string
  workerId: string
  workerName: string
  position: string
  shopId: string
  shopName: string
  baseSalary: number
  bonus: number
  deductions: number
  overtime: number
  totalPay: number
  payPeriod: string
  status: 'Pending' | 'Processed' | 'Paid'
  notes?: string
  processedDate?: string
  createdAt: string
}

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
}

export function PayrollPage() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [shopFilter, setShopFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<string | undefined>(undefined)
  const [formData, setFormData] = useState({
    bonus: "",
    deductions: "",
    overtime: "",
    notes: "",
    payPeriod: new Date().toISOString().slice(0, 7)
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    await Promise.all([loadWorkers(), loadPayroll()])
    setLoading(false)
  }

  const loadWorkers = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-86b98184/workers`,
        {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      const data = await response.json()
      if (data.success) {
        const activeWorkers = data.workers.filter((w: Worker) => w.status === 'Active')
        setWorkers(activeWorkers)
        console.log('✅ Loaded workers for payroll:', activeWorkers.length)
      } else {
        console.error('Failed to load workers:', data.error)
        toast.error('Failed to load workers')
      }
    } catch (error) {
      console.error("Error loading workers:", error)
      toast.error('Error loading workers')
    }
  }

  const loadPayroll = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-86b98184/payroll`,
        {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      const data = await response.json()
      if (data.success) {
        setPayrollRecords(data.payroll)
        console.log('✅ Loaded payroll records:', data.payroll.length)
      } else {
        console.error('Failed to load payroll:', data.error)
      }
    } catch (error) {
      console.error("Error loading payroll:", error)
    }
  }

  const generateCurrentMonthPayroll = async () => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7)
      
      const existingPayroll = payrollRecords.filter(record => 
        record.payPeriod === currentMonth
      )
      
      if (existingPayroll.length > 0) {
        toast.error("Payroll for this month has already been generated")
        return
      }

      if (workers.length === 0) {
        toast.error("No active workers found")
        return
      }

      // Generate payroll for all workers
      for (const worker of workers) {
        const record: PayrollRecord = {
          id: `payroll_${Date.now()}_${worker.id}_${Math.random().toString(36).substr(2, 9)}`,
          workerId: worker.id,
          workerName: worker.name,
          position: worker.position,
          shopId: worker.shopId,
          shopName: worker.shopName,
          baseSalary: worker.salary,
          bonus: 0,
          deductions: 0,
          overtime: 0,
          totalPay: worker.salary,
          payPeriod: currentMonth,
          status: 'Pending',
          createdAt: new Date().toISOString()
        }

        await savePayrollRecord(record)
      }

      await loadPayroll()
      toast.success(`Generated payroll for ${workers.length} workers`)
      
    } catch (error) {
      console.error("Error generating payroll:", error)
      toast.error("Error generating payroll")
    }
  }

  const savePayrollRecord = async (record: PayrollRecord) => {
    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-86b98184/payroll`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify(record)
        }
      )
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error saving payroll record:", error)
      throw error
    }
  }

  const handleProcessPayroll = async (recordId: string) => {
    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-86b98184/payroll/${recordId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            status: 'Processed',
            processedDate: new Date().toISOString()
          })
        }
      )

      const data = await response.json()
      if (data.success) {
        loadPayroll()
        toast.success("Payroll processed successfully")
      } else {
        toast.error("Failed to process payroll")
      }
    } catch (error) {
      console.error("Error processing payroll:", error)
      toast.error("Error processing payroll")
    }
  }

  const handleMarkAsPaid = async (recordId: string) => {
    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-86b98184/payroll/${recordId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({ status: 'Paid' })
        }
      )

      const data = await response.json()
      if (data.success) {
        loadPayroll()
        toast.success("Payroll marked as paid")
      } else {
        toast.error("Failed to mark as paid")
      }
    } catch (error) {
      console.error("Error updating payroll:", error)
      toast.error("Error updating payroll")
    }
  }

  const handleDeletePayroll = async (payrollId: string, workerName: string) => {
    // Use regular browser confirm dialog
    const confirmed = window.confirm(`Are you sure you want to delete the payroll record for "${workerName}"? This action cannot be undone.`)
    
    if (!confirmed) return
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-86b98184/payroll/${payrollId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      )

      const data = await response.json()
      if (data.success) {
        toast.success(`Payroll record for "${workerName}" deleted successfully`)
        loadPayroll()
      } else {
        toast.error("Failed to delete payroll record")
      }
    } catch (error) {
      console.error("Error deleting payroll:", error)
      toast.error("Error deleting payroll record")
    }
  }

  const handleAddAdjustment = async () => {
    try {
      if (!selectedWorker || !formData.payPeriod) {
        toast.error("Please select worker and pay period")
        return
      }

      const worker = workers.find(w => w.id === selectedWorker)
      if (!worker) {
        toast.error("Worker not found")
        return
      }

      const bonus = parseFloat(formData.bonus) || 0
      const deductions = parseFloat(formData.deductions) || 0
      const overtime = parseFloat(formData.overtime) || 0
      const totalPay = worker.salary + bonus + overtime - deductions

      const newRecord: PayrollRecord = {
        id: `payroll_${Date.now()}_${selectedWorker}_${Math.random().toString(36).substr(2, 9)}`,
        workerId: selectedWorker,
        workerName: worker.name,
        position: worker.position,
        shopId: worker.shopId,
        shopName: worker.shopName,
        baseSalary: worker.salary,
        bonus,
        deductions,
        overtime,
        totalPay,
        payPeriod: formData.payPeriod,
        status: 'Pending',
        notes: formData.notes,
        createdAt: new Date().toISOString()
      }

      await savePayrollRecord(newRecord)
      await loadPayroll()
      setDialogOpen(false)
      resetForm()
      toast.success("Payroll adjustment added successfully")
      
    } catch (error) {
      console.error("Error adding payroll adjustment:", error)
      toast.error("Error adding payroll adjustment")
    }
  }

  const resetForm = () => {
    setSelectedWorker(undefined)
    setFormData({
      bonus: "",
      deductions: "",
      overtime: "",
      notes: "",
      payPeriod: new Date().toISOString().slice(0, 7)
    })
  }

  const exportPayrollReport = () => {
    try {
      const filteredData = getFilteredRecords()
      
      if (filteredData.length === 0) {
        toast.error("No data to export")
        return
      }

      const headers = "Worker Name,Position,Shop,Base Salary,Bonus,Overtime,Deductions,Total Pay,Pay Period,Status,Processed Date\n"
      
      const csvRows = filteredData.map(record => [
        record.workerName,
        record.position,
        record.shopName,
        record.baseSalary.toFixed(2),
        record.bonus.toFixed(2),
        record.overtime.toFixed(2),
        record.deductions.toFixed(2),
        record.totalPay.toFixed(2),
        record.payPeriod,
        record.status,
        record.processedDate ? new Date(record.processedDate).toLocaleDateString() : 'N/A'
      ].join(','))

      const csvContent = headers + csvRows.join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `payroll-report-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
      
      toast.success("Payroll report exported successfully")
    } catch (error) {
      console.error("Error exporting payroll:", error)
      toast.error("Error exporting payroll")
    }
  }

  const getFilteredRecords = () => {
    return payrollRecords.filter(record => {
      const matchesPeriod = selectedPeriod === "all" || record.payPeriod === selectedPeriod
      const matchesStatus = statusFilter === "all" || record.status === statusFilter
      const matchesShop = shopFilter === "all" || record.shopId === shopFilter
      return matchesPeriod && matchesStatus && matchesShop
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge variant="secondary">Pending</Badge>
      case "Processed":
        return <Badge variant="default">Processed</Badge>
      case "Paid":
        return <Badge className="bg-green-600">Paid</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredRecords = getFilteredRecords()
  
  const totalPayroll = filteredRecords.reduce((sum, record) => sum + record.totalPay, 0)
  const pendingCount = filteredRecords.filter(r => r.status === 'Pending').length
  const paidCount = filteredRecords.filter(r => r.status === 'Paid').length

  const uniquePeriods = [...new Set(payrollRecords.map(r => r.payPeriod))].sort().reverse()
  const uniqueShops = [...new Set(workers.map(w => w.shopId))]

  if (loading) {
    return (
      <div className="p-6 space-y-6 h-full overflow-auto flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading payroll data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 h-full overflow-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h2 className="text-xl md:text-2xl">Payroll Management</h2>
          <p className="text-sm text-muted-foreground">Manage worker salaries and payments</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={generateCurrentMonthPayroll} size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Generate This Month
          </Button>
          <Button onClick={() => setDialogOpen(true)} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Adjustment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Workers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="text-2xl font-bold">{workers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Payroll
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="text-2xl font-bold">${totalPayroll.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-yellow-600" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Paid
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="text-2xl font-bold text-green-600">{paidCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Periods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="all-periods" value="all">All Periods</SelectItem>
            {uniquePeriods.map(period => (
              <SelectItem key={period} value={period}>
                {new Date(period + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={shopFilter} onValueChange={setShopFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Shops" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="all-shops" value="all">All Shops</SelectItem>
            {uniqueShops.map(shop => (
              <SelectItem key={shop} value={shop}>{shop}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="all-status" value="all">All Status</SelectItem>
            <SelectItem key="pending" value="Pending">Pending</SelectItem>
            <SelectItem key="processed" value="Processed">Processed</SelectItem>
            <SelectItem key="paid" value="Paid">Paid</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={exportPayrollReport} variant="outline" size="sm" className="md:ml-auto">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Payroll Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker</TableHead>
                  <TableHead className="hidden md:table-cell">Position</TableHead>
                  <TableHead className="hidden lg:table-cell">Shop</TableHead>
                  <TableHead>Base Salary</TableHead>
                  <TableHead className="hidden md:table-cell">Adjustments</TableHead>
                  <TableHead>Total Pay</TableHead>
                  <TableHead className="hidden lg:table-cell">Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No payroll records found. Click "Generate This Month" to create payroll for all workers.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.workerName}</div>
                          <div className="text-xs text-muted-foreground md:hidden">{record.position}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{record.position}</TableCell>
                      <TableCell className="hidden lg:table-cell">{record.shopName}</TableCell>
                      <TableCell>${record.baseSalary.toFixed(2)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-xs space-y-1">
                          {record.bonus > 0 && <div className="text-green-600">+${record.bonus.toFixed(2)} bonus</div>}
                          {record.overtime > 0 && <div className="text-blue-600">+${record.overtime.toFixed(2)} OT</div>}
                          {record.deductions > 0 && <div className="text-red-600">-${record.deductions.toFixed(2)} ded.</div>}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">${record.totalPay.toFixed(2)}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {new Date(record.payPeriod + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {record.status === 'Pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleProcessPayroll(record.id)}
                            >
                              Process
                            </Button>
                          )}
                          {record.status === 'Processed' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleMarkAsPaid(record.id)}
                            >
                              Mark Paid
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeletePayroll(record.id, record.workerName)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Adjustment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payroll Adjustment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Worker *</Label>
              <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                <SelectTrigger>
                  <SelectValue placeholder="Select worker" />
                </SelectTrigger>
                <SelectContent>
                  {workers.map((worker) => (
                    <SelectItem key={worker.id} value={worker.id}>
                      {worker.name} - {worker.position} ({worker.shopName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Pay Period *</Label>
              <Input
                type="month"
                value={formData.payPeriod}
                onChange={(e) => setFormData({ ...formData, payPeriod: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Bonus</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.bonus}
                  onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                />
              </div>
              <div>
                <Label>Overtime</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.overtime}
                  onChange={(e) => setFormData({ ...formData, overtime: e.target.value })}
                />
              </div>
              <div>
                <Label>Deductions</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.deductions}
                  onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                placeholder="Optional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddAdjustment}>Add Adjustment</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
