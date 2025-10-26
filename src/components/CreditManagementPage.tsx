import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { toast } from 'sonner'
import { DollarSign, TrendingUp, Users, AlertTriangle, Plus, Eye, Wallet, Phone, CreditCard } from 'lucide-react'
import { getSupabaseClient } from '../utils/authService'
import { projectId } from '../utils/supabase/info'

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-86b98184`

interface CreditCustomer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  credit_limit: number
  current_balance: number
  status: string
  notes?: string
  created_at: string
}

interface CreditSale {
  id: string
  receipt_id: string
  customer_id: string
  items: any[]
  total_amount: number
  amount_paid: number
  amount_owed: number
  payment_status: string
  due_date?: string
  cashier_name?: string
  created_at: string
  customers?: { name: string; phone: string; current_balance: number }
}

interface CreditPayment {
  id: string
  amount: number
  payment_method: string
  reference_number?: string
  received_by?: string
  notes?: string
  created_at: string
  credit_sales?: { receipt_id: string; total_amount: number }
}

interface CreditSummary {
  totalOwed: number
  totalOverdue: number
  customersWithDebt: number
  customersTotal: number
}

export default function CreditManagementPage() {
  const [customers, setCustomers] = useState<CreditCustomer[]>([])
  const [summary, setSummary] = useState<CreditSummary | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<CreditCustomer | null>(null)
  const [customerSales, setCustomerSales] = useState<CreditSale[]>([])
  const [customerPayments, setCustomerPayments] = useState<CreditPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [newCustomerDialogOpen, setNewCustomerDialogOpen] = useState(false)
  const [creditSaleDialogOpen, setCreditSaleDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    credit_limit: '500',
    notes: ''
  })

  const [creditSaleForm, setCreditSaleForm] = useState({
    customer_id: '',
    items: [{ name: '', quantity: 1, price: 0 }],
    credit_total: '',
    amount_paid: '',
    due_date: '',
    notes: ''
  })

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'cash',
    reference_number: '',
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      await Promise.all([
        loadCustomers(),
        loadSummary()
      ])
    } catch (error) {
      console.error('Error loading credit management data:', error)
      setError('Failed to load credit management data. Please try refreshing the page.')
    } finally {
      setLoading(false)
    }
  }

  const loadCustomers = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        console.error('No access token found')
        setCustomers([])
        return
      }

      const response = await fetch(`${BASE_URL}/credit-customers`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.error('Failed to fetch customers:', response.status, response.statusText)
        setCustomers([])
        return
      }

      const result = await response.json()
      if (result.success) {
        setCustomers(result.customers || [])
      } else {
        console.error('API error:', result.error)
        setCustomers([])
      }
    } catch (error) {
      console.error('Error loading customers:', error)
      setCustomers([])
      toast.error('Failed to load credit customers')
    }
  }

  const loadSummary = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        console.error('No access token found for summary')
        setSummary({
          totalOwed: 0,
          totalOverdue: 0,
          customersWithDebt: 0,
          customersTotal: 0
        })
        return
      }

      const response = await fetch(`${BASE_URL}/credit-summary`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })

      if (!response.ok) {
        console.error('Failed to fetch summary:', response.status, response.statusText)
        setSummary({
          totalOwed: 0,
          totalOverdue: 0,
          customersWithDebt: 0,
          customersTotal: 0
        })
        return
      }

      const result = await response.json()
      if (result.success) {
        setSummary(result.summary || {
          totalOwed: 0,
          totalOverdue: 0,
          customersWithDebt: 0,
          customersTotal: 0
        })
      } else {
        console.error('API error for summary:', result.error)
        setSummary({
          totalOwed: 0,
          totalOverdue: 0,
          customersWithDebt: 0,
          customersTotal: 0
        })
      }
    } catch (error) {
      console.error('Error loading summary:', error)
      setSummary({
        totalOwed: 0,
        totalOverdue: 0,
        customersWithDebt: 0,
        customersTotal: 0
      })
    }
  }

  const handleCreateCustomer = async () => {
    if (!customerForm.name || !customerForm.phone) {
      toast.error('Please enter customer name and phone number')
      return
    }

    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`${BASE_URL}/credit-customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...customerForm,
          credit_limit: parseFloat(customerForm.credit_limit) || 0
        })
      })

      const result = await response.json()
      if (result.success) {
        toast.success(result.existing ? 'Customer updated' : 'Credit customer created successfully')
        setNewCustomerDialogOpen(false)
        setCustomerForm({
          name: '',
          phone: '',
          email: '',
          address: '',
          credit_limit: '500',
          notes: ''
        })
        loadData()
      } else {
        toast.error(result.error || 'Failed to create customer')
      }
    } catch (error) {
      console.error('Error creating customer:', error)
      toast.error('Failed to create customer')
    }
  }

  const handleCreateCreditSale = async () => {
    if (!creditSaleForm.customer_id || !creditSaleForm.credit_total || !creditSaleForm.due_date) {
      toast.error('Please fill in all required fields')
      return
    }

    const creditTotal = parseFloat(creditSaleForm.credit_total)
    const amountPaid = parseFloat(creditSaleForm.amount_paid) || 0

    if (isNaN(creditTotal) || creditTotal <= 0) {
      toast.error('Please enter a valid credit total amount')
      return
    }

    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`${BASE_URL}/credit-sales`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer_id: creditSaleForm.customer_id,
          items: creditSaleForm.items,
          total_amount: creditTotal,
          amount_paid: amountPaid,
          due_date: creditSaleForm.due_date,
          notes: creditSaleForm.notes
        })
      })

      const result = await response.json()
      if (result.success) {
        toast.success('Credit sale created successfully')
        setCreditSaleForm({
          customer_id: '',
          items: [{ name: '', quantity: 1, price: 0 }],
          credit_total: '',
          amount_paid: '',
          due_date: '',
          notes: ''
        })
        setCreditSaleDialogOpen(false)
        loadData()
      } else {
        toast.error(result.error || 'Failed to create credit sale')
      }
    } catch (error) {
      console.error('Error creating credit sale:', error)
      toast.error('Failed to create credit sale')
    }
  }

  const viewCustomerDetails = async (customer: CreditCustomer) => {
    setSelectedCustomer(customer)
    setDetailsDialogOpen(true)

    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()

      // Load customer's credit sales
      const salesResponse = await fetch(`${BASE_URL}/credit-sales/${customer.id}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })
      const salesResult = await salesResponse.json()
      if (salesResult.success) {
        setCustomerSales(salesResult.creditSales)
      }

      // Load customer's payment history
      const paymentsResponse = await fetch(`${BASE_URL}/credit-payments/${customer.id}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })
      const paymentsResult = await paymentsResponse.json()
      if (paymentsResult.success) {
        setCustomerPayments(paymentsResult.payments)
      }
    } catch (error) {
      console.error('Error loading customer details:', error)
    }
  }

  const handleRecordPayment = async () => {
    if (!selectedCustomer || !paymentForm.amount) {
      toast.error('Please enter payment amount')
      return
    }

    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user

      const response = await fetch(`${BASE_URL}/credit-payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer_id: selectedCustomer.id,
          amount: parseFloat(paymentForm.amount),
          payment_method: paymentForm.payment_method,
          reference_number: paymentForm.reference_number,
          received_by: user?.user_metadata?.name || 'Admin',
          notes: paymentForm.notes
        })
      })

      const result = await response.json()
      if (result.success) {
        toast.success(`Payment of GHS ${paymentForm.amount} recorded successfully`)
        setPaymentDialogOpen(false)
        setPaymentForm({
          amount: '',
          payment_method: 'cash',
          reference_number: '',
          notes: ''
        })

        // Refresh data
        loadData()
        if (selectedCustomer) {
          viewCustomerDetails(selectedCustomer)
        }
      } else {
        toast.error(result.error || 'Failed to record payment')
      }
    } catch (error) {
      console.error('Error recording payment:', error)
      toast.error('Failed to record payment')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-500">Active</Badge>
      case 'Suspended':
        return <Badge className="bg-yellow-500 text-black">Suspended</Badge>
      case 'Blocked':
        return <Badge variant="destructive">Blocked</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <Badge className="bg-green-500">Paid</Badge>
      case 'Partial':
        return <Badge className="bg-yellow-500 text-black">Partial</Badge>
      case 'Unpaid':
        return <Badge variant="destructive">Unpaid</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg">Loading credit management...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">{error}</div>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Credit Management</h1>
          <p className="text-gray-500 mt-1">Track book sales and customer credit balances</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={newCustomerDialogOpen} onOpenChange={setNewCustomerDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Credit Customer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Credit Customer</DialogTitle>
                <DialogDescription>
                  Create a new customer who can buy on credit (book sales)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Customer Name *</Label>
                  <Input
                    placeholder="Enter customer name"
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Phone Number *</Label>
                  <Input
                    placeholder="Enter phone number"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email (Optional)</Label>
                  <Input
                    placeholder="Enter email address"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Address (Optional)</Label>
                  <Input
                    placeholder="Enter address"
                    value={customerForm.address}
                    onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Credit Limit (GHS) *</Label>
                  <Input
                    type="number"
                    placeholder="500"
                    value={customerForm.credit_limit}
                    onChange={(e) => setCustomerForm({ ...customerForm, credit_limit: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    placeholder="Any additional notes about this customer..."
                    value={customerForm.notes}
                    onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
                  />
                </div>
                <Button onClick={handleCreateCustomer} className="w-full">Create Customer</Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={creditSaleDialogOpen} onOpenChange={setCreditSaleDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CreditCard className="h-4 w-4 mr-2" />
                Create Credit Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Credit Sale (Book Sale)</DialogTitle>
                <DialogDescription>
                  Record a sale where the customer will pay later
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Customer *</Label>
                  <Select 
                    value={creditSaleForm.customer_id} 
                    onValueChange={(value) => setCreditSaleForm({ ...creditSaleForm, customer_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.phone} (Limit: GHS {customer.credit_limit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Items *</Label>
                  <div className="space-y-2">
                    {creditSaleForm.items.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Item name"
                          value={item.name}
                          onChange={(e) => {
                            const newItems = [...creditSaleForm.items]
                            newItems[index] = { ...item, name: e.target.value }
                            setCreditSaleForm({ ...creditSaleForm, items: newItems })
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...creditSaleForm.items]
                            newItems[index] = { ...item, quantity: parseInt(e.target.value) || 1 }
                            setCreditSaleForm({ ...creditSaleForm, items: newItems })
                          }}
                          className="w-20"
                        />
                        <Input
                          type="number"
                          placeholder="Price"
                          value={item.price}
                          onChange={(e) => {
                            const newItems = [...creditSaleForm.items]
                            newItems[index] = { ...item, price: parseFloat(e.target.value) || 0 }
                            setCreditSaleForm({ ...creditSaleForm, items: newItems })
                          }}
                          className="w-24"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newItems = creditSaleForm.items.filter((_, i) => i !== index)
                            setCreditSaleForm({ ...creditSaleForm, items: newItems })
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCreditSaleForm({
                          ...creditSaleForm,
                          items: [...creditSaleForm.items, { name: '', quantity: 1, price: 0 }]
                        })
                      }}
                    >
                      Add Item
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Credit Total (GHS) *</Label>
                    <Input
                      type="text"
                      placeholder="Enter credit total amount"
                      value={creditSaleForm.credit_total}
                      onChange={(e) => setCreditSaleForm({ ...creditSaleForm, credit_total: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Amount Paid Now (GHS)</Label>
                    <Input
                      type="text"
                      placeholder="Enter amount paid now"
                      value={creditSaleForm.amount_paid}
                      onChange={(e) => setCreditSaleForm({ ...creditSaleForm, amount_paid: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Due Date *</Label>
                  <Input
                    type="date"
                    value={creditSaleForm.due_date}
                    onChange={(e) => setCreditSaleForm({ ...creditSaleForm, due_date: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Any notes about this credit sale..."
                    value={creditSaleForm.notes}
                    onChange={(e) => setCreditSaleForm({ ...creditSaleForm, notes: e.target.value })}
                  />
                </div>

                <Button onClick={handleCreateCreditSale} className="w-full">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Create Credit Sale
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Credit Owed</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">GHS {(summary?.totalOwed || 0).toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">Amount customers owe</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">GHS {(summary?.totalOverdue || 0).toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">Past due date</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Customers with Debt</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.customersWithDebt}</div>
              <p className="text-xs text-gray-500 mt-1">Out of {summary.customersTotal} total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(summary?.totalOwed || 0) > 0
                  ? ((1 - ((summary?.totalOverdue || 0) / (summary?.totalOwed || 1))) * 100).toFixed(1)
                  : '100'}%
              </div>
              <p className="text-xs text-gray-500 mt-1">On-time payments</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Customers</CardTitle>
          <CardDescription>Customers who can buy on credit (book sales)</CardDescription>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No credit customers yet</p>
              <p className="text-sm">Click "Add Credit Customer" to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Current Balance</TableHead>
                  <TableHead>Credit Limit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => {
                  const utilizationPercent = (customer.credit_limit || 0) > 0
                    ? ((customer.current_balance || 0) / (customer.credit_limit || 1)) * 100
                    : 0

                  return (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {customer.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={customer.current_balance > 0 ? 'font-bold text-orange-600' : ''}>
                          GHS {(customer.current_balance || 0).toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          GHS {(customer.credit_limit || 0).toFixed(2)}
                          {utilizationPercent > 0 && (
                            <div className="text-xs text-gray-500">
                              {utilizationPercent.toFixed(0)}% used
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(customer.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewCustomerDetails(customer)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                          {customer.current_balance > 0 && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedCustomer(customer)
                                setPaymentDialogOpen(true)
                              }}
                            >
                              <Wallet className="h-3 w-3 mr-1" />
                              Record Payment
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Customer Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details: {selectedCustomer?.name}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center">
                  <Phone className="h-3 w-3 mr-1" />
                  {selectedCustomer?.phone}
                </span>
                <span className="font-bold text-orange-600">
                  Owes: GHS {(selectedCustomer?.current_balance || 0).toFixed(2)}
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Credit Sales */}
            <div>
              <h3 className="font-semibold mb-2">Credit Sales (Book)</h3>
              {customerSales.length === 0 ? (
                <p className="text-sm text-gray-500">No credit sales yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Owed</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-mono text-xs">{sale.receipt_id}</TableCell>
                        <TableCell>{new Date(sale.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>GHS {(sale.total_amount || 0).toFixed(2)}</TableCell>
                        <TableCell>GHS {(sale.amount_paid || 0).toFixed(2)}</TableCell>
                        <TableCell className="font-bold text-orange-600">
                          GHS {(sale.amount_owed || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>{getPaymentStatusBadge(sale.payment_status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Payment History */}
            <div>
              <h3 className="font-semibold mb-2">Payment History</h3>
              {customerPayments.length === 0 ? (
                <p className="text-sm text-gray-500">No payments recorded yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Received By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{new Date(payment.created_at).toLocaleString()}</TableCell>
                        <TableCell className="font-bold text-green-600">
                          GHS {(payment.amount || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="capitalize">{payment.payment_method.replace('-', ' ')}</TableCell>
                        <TableCell className="font-mono text-xs">{payment.reference_number || '-'}</TableCell>
                        <TableCell>{payment.received_by || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>


      {/* Record Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment from {selectedCustomer?.name}
              <div className="mt-2 font-bold text-orange-600">
                Current Balance: GHS {(selectedCustomer?.current_balance || 0).toFixed(2)}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Payment Amount (GHS) *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              />
            </div>
            <div>
              <Label>Payment Method *</Label>
              <Select
                value={paymentForm.payment_method}
                onValueChange={(value) => setPaymentForm({ ...paymentForm, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="mtn-momo">MTN Mobile Money</SelectItem>
                  <SelectItem value="vodafone-cash">Vodafone Cash</SelectItem>
                  <SelectItem value="airteltigo-money">AirtelTigo Money</SelectItem>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {paymentForm.payment_method !== 'cash' && (
              <div>
                <Label>Reference Number (Optional)</Label>
                <Input
                  placeholder="Transaction reference"
                  value={paymentForm.reference_number}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                />
              </div>
            )}
            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Any notes about this payment..."
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              />
            </div>
            <Button onClick={handleRecordPayment} className="w-full">
              <CreditCard className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
