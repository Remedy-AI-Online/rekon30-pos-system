import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"
import { Plus, Search, Filter, Eye, Edit, Trash2, ShoppingCart, Loader2, Calendar, DollarSign } from "lucide-react"
import { dataService } from "../utils/dataService"
import { toast } from "sonner"

interface Order {
  id: string
  customer: {
    name: string
    phone?: string
    address?: string
  }
  items: Array<{
    name: string
    sku: string
    quantity: number
    price: number
  }>
  total: number
  paymentMethod: string
  status: string
  date: string
  shop?: string
  cashier?: string
  notes?: string
  createdAt: string
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    status: "Processing",
    notes: ""
  })

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)

      // Get sales data from the last 7 days (optimized for faster loading)
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const response = await dataService.getSalesRange(startDate, endDate)
      if (response.success) {
        // Convert sales data to orders format
        const allSales = response.data.flatMap((day: any) =>
          (day.sales || []).map((sale: any) => ({
            id: sale.id,
            customer: sale.customer || { name: "Walk-in Customer" },
            items: sale.items || [],
            total: sale.total,
            paymentMethod: sale.paymentMethod || "cash",
            status: "Completed", // All sales are completed
            date: sale.date,
            shop: sale.shop || "Main Branch",
            cashier: sale.cashier || "Unknown",
            notes: sale.notes || "",
            createdAt: sale.date
          }))
        )

        // Sort by date, newest first
        allSales.sort((a: Order, b: Order) => new Date(b.date).getTime() - new Date(a.date).getTime())

        setOrders(allSales)
      } else {
        toast.error("Failed to load orders")
        setOrders([])
      }
    } catch (error) {
      console.error("Error loading orders:", error)
      toast.error("Error loading orders")
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateOrder = async () => {
    try {
      if (!editingOrder) return

      // Update the order data
      const updatedOrder = {
        ...editingOrder,
        customer: {
          ...editingOrder.customer,
          name: formData.customerName,
          phone: formData.customerPhone,
          address: formData.customerAddress
        },
        status: formData.status,
        notes: formData.notes
      }

      // Here you would typically call an API to update the order
      // For now, we'll update the local state
      setOrders(orders.map(order => 
        order.id === editingOrder.id ? updatedOrder : order
      ))
      
      toast.success("Order updated successfully")
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error updating order:", error)
      toast.error("Error updating order")
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    // Use regular browser confirm dialog
    const confirmed = window.confirm(`Are you sure you want to delete order "${orderId}"? This action cannot be undone.`)
    
    if (!confirmed) return
    
    try {
      // Delete from backend via sales endpoint
      const response = await dataService.deleteSale(orderId)
      if (response.success) {
        setOrders(orders.filter(order => order.id !== orderId))
        toast.success("Order deleted successfully")
      } else {
        toast.error("Failed to delete order")
      }
    } catch (error) {
      console.error("Error deleting order:", error)
      toast.error("Error deleting order")
    }
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setDialogOpen(true)
  }

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order)
    setFormData({
      customerName: order.customer.name,
      customerPhone: order.customer.phone || "",
      customerAddress: order.customer.address || "",
      status: order.status,
      notes: order.notes || ""
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingOrder(null)
    setSelectedOrder(null)
    setFormData({
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      status: "Processing",
      notes: ""
    })
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.customer.phone && order.customer.phone.includes(searchTerm))
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    
    const today = new Date()
    const orderDate = new Date(order.date)
    let matchesDate = true
    
    if (dateFilter === "today") {
      matchesDate = orderDate.toDateString() === today.toDateString()
    } else if (dateFilter === "week") {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      matchesDate = orderDate >= weekAgo
    } else if (dateFilter === "month") {
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      matchesDate = orderDate >= monthAgo
    }
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge variant="default">Completed</Badge>
      case "Processing":
        return <Badge variant="secondary">Processing</Badge>
      case "Cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      case "Refunded":
        return <Badge variant="outline">Refunded</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 h-full overflow-auto flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading orders...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 h-full overflow-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">View and manage customer orders</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="compact-card-header flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs">Total Orders</CardTitle>
            <ShoppingCart className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="compact-card-content">
            <div className="text-lg font-semibold">{orders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="compact-card-header flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs">Today's Orders</CardTitle>
            <Calendar className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="compact-card-content">
            <div className="text-lg font-semibold">
              {orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString()).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="compact-card-header flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs">Completed</CardTitle>
            <ShoppingCart className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="compact-card-content">
            <div className="text-lg font-semibold text-green-600">
              {orders.filter(o => o.status === 'Completed').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="compact-card-header flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs">Total Revenue</CardTitle>
            <DollarSign className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="compact-card-content">
            <div className="text-lg font-semibold">
              ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
            </div>
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search orders..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-2 md:gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Orders ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No orders found</p>
              <p className="text-muted-foreground text-sm">Orders will appear here when customers make purchases</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Order ID</TableHead>
                    <TableHead className="min-w-[150px]">Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Items</TableHead>
                    <TableHead className="min-w-[100px]">Total</TableHead>
                    <TableHead className="hidden lg:table-cell">Payment</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="hidden xl:table-cell">Date</TableHead>
                    <TableHead className="min-w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer.name}</p>
                        {order.customer.phone && (
                          <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{order.items.length} items</TableCell>
                    <TableCell className="font-medium">${order.total.toFixed(2)}</TableCell>
                    <TableCell className="hidden lg:table-cell capitalize">{order.paymentMethod}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="hidden xl:table-cell">{new Date(order.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditOrder(order)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleDeleteOrder(order.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOrder ? "Edit Order" : "Order Details"}
            </DialogTitle>
            <DialogDescription>
              {editingOrder ? "Update order information" : "View order details"}
            </DialogDescription>
          </DialogHeader>
          {(selectedOrder || editingOrder) && (
            <div className="space-y-4">
              {/* Order Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Order Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Order ID</Label>
                      <Input value={(selectedOrder || editingOrder)?.id} disabled />
                    </div>
                    <div>
                      <Label>Date</Label>
                      <Input value={new Date((selectedOrder || editingOrder)?.date || "").toLocaleString()} disabled />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Customer Name</Label>
                    <Input 
                      value={editingOrder ? formData.customerName : (selectedOrder?.customer.name || "")}
                      onChange={(e) => editingOrder && setFormData({ ...formData, customerName: e.target.value })}
                      disabled={!editingOrder}
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input 
                      value={editingOrder ? formData.customerPhone : (selectedOrder?.customer.phone || "")}
                      onChange={(e) => editingOrder && setFormData({ ...formData, customerPhone: e.target.value })}
                      disabled={!editingOrder}
                    />
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Textarea 
                      value={editingOrder ? formData.customerAddress : (selectedOrder?.customer.address || "")}
                      onChange={(e) => editingOrder && setFormData({ ...formData, customerAddress: e.target.value })}
                      disabled={!editingOrder}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(selectedOrder || editingOrder)?.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{item.quantity}x ${item.price}</p>
                          <p className="text-sm text-muted-foreground">${(item.quantity * item.price).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between items-center font-semibold">
                        <span>Total:</span>
                        <span>${(selectedOrder || editingOrder)?.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status and Notes */}
              {editingOrder && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Order Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Processing">Processing</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                          <SelectItem value="Refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Textarea 
                        placeholder="Add notes about this order..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {editingOrder ? "Cancel" : "Close"}
            </Button>
            {editingOrder && (
              <Button onClick={handleUpdateOrder}>Update Order</Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}