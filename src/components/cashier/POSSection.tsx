import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Separator } from "../ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Textarea } from "../ui/textarea"
import { Plus, Minus, Trash2, Receipt, DollarSign, ShoppingCart, User, Edit3, AlertTriangle, Loader2, Package, MessageSquare } from "lucide-react"
import { Alert, AlertDescription } from "../ui/alert"
import { reportingService } from "../../utils/reportingService"
import { dataService } from "../../utils/dataService"
import { toast } from "sonner"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  originalPrice?: number
  isBargained?: boolean
}

interface Customer {
  name: string
  phone: string
  address: string
}

interface Sale {
  id: string
  time: string
  items: {
    id: string
    name: string
    price: number
    quantity: number
  }[]
  total: number
  paymentMethod: string
  customer?: Customer
}

interface POSSectionProps {
  onSaleComplete: (sale: Sale) => void
  onPrintReceipt: (sale: Sale) => void
  recentSales?: Sale[]
}

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  status: string
  bargainingEnabled?: boolean
  minBargainPrice?: number
  maxBargainPrice?: number
}

export function POSSection({ onSaleComplete, onPrintReceipt, recentSales = [] }: POSSectionProps) {
  // Product loading state
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>(undefined)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false)
  const [customer, setCustomer] = useState<Customer>({ name: '', phone: '', address: '' })
  const [customPrice, setCustomPrice] = useState<string>('')
  const [showBargainingDialog, setShowBargainingDialog] = useState(false)
  const [lastReceiptId, setLastReceiptId] = useState('')
  const [lastSale, setLastSale] = useState<Sale | null>(null)
  const [correctionDialogOpen, setCorrectionDialogOpen] = useState(false)
  const [selectedSaleForCorrection, setSelectedSaleForCorrection] = useState<Sale | null>(null)
  const [correctionReason, setCorrectionReason] = useState('')
  const [correctedCart, setCorrectedCart] = useState<CartItem[]>([])
  const [correctedPaymentMethod, setCorrectedPaymentMethod] = useState('')
  const [smsDialogOpen, setSmsDialogOpen] = useState(false)
  const [smsPhone, setSmsPhone] = useState('')
  const [smsSending, setSmsSending] = useState(false)

  // Load products from database
  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoadingProducts(true)
      const response = await dataService.getProducts()
      if (response.success) {
        setProducts(response.products.filter((p: any) => p.status !== 'Out of Stock'))
      } else {
        toast.error("Failed to load products")
      }
    } catch (error) {
      console.error("Error loading products:", error)
      toast.error("Failed to load products")
    } finally {
      setLoadingProducts(false)
    }
  }

  const selectedProductData = products.find(p => p.id === selectedProduct)

  const addToCart = () => {
    if (!selectedProduct || !selectedProductData) return

    // Check if product allows bargaining
    if (selectedProductData.bargainingEnabled) {
      setShowBargainingDialog(true)
      return
    }

    // Add to cart with regular price
    addItemToCart(selectedProductData.price)
  }

  const addItemToCart = (price: number) => {
    if (!selectedProduct || !selectedProductData) return

    const existingItem = cart.find(item => item.id === selectedProduct)
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === selectedProduct
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      const newItem: CartItem = {
        id: selectedProduct,
        name: selectedProductData.name,
        price: price,
        quantity: 1,
        originalPrice: selectedProductData.price,
        isBargained: price !== selectedProductData.price
      }
      setCart([...cart, newItem])
    }

    setSelectedProduct(undefined)
  }

  const handleBargainingConfirm = () => {
    if (!selectedProduct || !selectedProductData) return

    const bargainPrice = parseFloat(customPrice)
    const minPrice = selectedProductData.minBargainPrice || 0
    const maxPrice = selectedProductData.maxBargainPrice || selectedProductData.price

    if (bargainPrice < minPrice || bargainPrice > maxPrice) {
      toast.error(`Price must be between ₵${minPrice} and ₵${maxPrice}`)
      return
    }

    addItemToCart(bargainPrice)
    setShowBargainingDialog(false)
    setCustomPrice('')
  }

  const updateQuantity = (id: string, change: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + change)
        return newQuantity === 0 ? null : { ...item, quantity: newQuantity }
      }
      return item
    }).filter(Boolean) as CartItem[])
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id))
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const processSale = async () => {
    if (cart.length === 0) return

    try {
      const receiptId = `RCP${Date.now()}`
      const newSale: Sale = {
        id: receiptId,
        time: new Date().toLocaleTimeString(),
        items: [...cart],
        total: calculateTotal(),
        paymentMethod,
        customer: customer.name ? { ...customer } : undefined
      }

      // Save to backend for automatic reporting
      await reportingService.saveSale({
        receiptId,
        customer: customer.name ? { 
          name: customer.name, 
          phone: customer.phone,
          email: customer.address 
        } : undefined,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        paymentMethod,
        total: calculateTotal()
      })

      onSaleComplete(newSale)
      setLastReceiptId(receiptId)
      setLastSale(newSale)
      setCart([])
      setPaymentMethod('cash')
      setCustomer({ name: '', phone: '', address: '' })
    } catch (error) {
      console.error('Error saving sale to backend:', error)
      // Still complete the sale locally even if backend fails
      const receiptId = `RCP${Date.now()}`
      const newSale: Sale = {
        id: receiptId,
        time: new Date().toLocaleTimeString(),
        items: [...cart],
        total: calculateTotal(),
        paymentMethod,
        customer: customer.name ? { ...customer } : undefined
      }

      onSaleComplete(newSale)
      setLastReceiptId(receiptId)
      setLastSale(newSale)
      setCart([])
      setPaymentMethod('cash')
      setCustomer({ name: '', phone: '', address: '' })
    }
  }

  const clearCustomer = () => {
    setCustomer({ name: '', phone: '', address: '' })
  }

  const sendSMSReceipt = async () => {
    if (!smsPhone || !lastSale) {
      toast.error("Please enter a valid phone number")
      return
    }

    try {
      setSmsSending(true)

      // Format receipt message for SMS (within SMS character limits)
      const smsMessage = `${lastSale.items.map(item =>
        `${item.name} ${item.quantity}x GHS${item.price}=GHS${(item.quantity * item.price).toFixed(2)}`
      ).join(', ')}. Total: GHS${lastSale.total.toFixed(2)}. Payment: ${lastSale.paymentMethod.toUpperCase()}. Receipt#: ${lastSale.id}. Powered by Rekon360`

      console.log('📱 Sending SMS to:', smsPhone)
      console.log('📝 Message:', smsMessage)

      // Send SMS via backend (Arkesel)
      const response = await fetch('https://cddoboboxeangripcqrn.supabase.co/functions/v1/make-server-86b98184/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: smsPhone,
          message: smsMessage
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`✅ Receipt sent to ${smsPhone} via SMS!`)
        setSmsDialogOpen(false)
        setSmsPhone('')
      } else {
        console.error('SMS send failed:', result.error)
        toast.error(`Failed to send SMS: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error sending SMS:', error)
      toast.error("Failed to send SMS receipt. Check your internet connection.")
    } finally {
      setSmsSending(false)
    }
  }

  return (
    <div className="p-4 compact-spacing h-full overflow-auto">
      {/* Product Selection */}
      <Card className="compact-card">
        <CardHeader className="compact-card-header">
          <CardTitle className="flex items-center gap-2 text-sm">
            <ShoppingCart className="h-4 w-4" />
            Add Products
          </CardTitle>
        </CardHeader>
        <CardContent className="compact-card-content compact-spacing">
          {loadingProducts ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading products...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Product</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="compact-input">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.filter(p => p.status !== 'Out of Stock').map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - ${product.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={addToCart} disabled={!selectedProduct} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </div>
            <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  {customer.name ? 'Edit Customer' : 'Add Customer'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Customer Details</DialogTitle>
                  <DialogDescription>
                    Add customer information for this sale (optional)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Customer Name</Label>
                    <Input
                      id="name"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      placeholder="Enter address"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setCustomerDialogOpen(false)} className="flex-1">
                      Save Customer
                    </Button>
                    <Button onClick={clearCustomer} variant="outline">
                      Clear
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        {customer.name && (
          <CardContent>
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <div className="font-medium">{customer.name}</div>
              {customer.phone && <div className="text-sm text-muted-foreground">{customer.phone}</div>}
              {customer.address && <div className="text-sm text-muted-foreground">{customer.address}</div>}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Shopping Cart */}
      <Card>
        <CardHeader>
          <CardTitle>Shopping Cart</CardTitle>
          <CardDescription>{cart.length} items in cart</CardDescription>
        </CardHeader>
        <CardContent>
          {cart.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Cart is empty</p>
          ) : (
            <div className="space-y-4">
              {cart.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex flex-col md:flex-row md:items-center justify-between p-3 border rounded-lg gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">₵{item.price} each</p>
                      {item.isBargained && item.originalPrice && (
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                            Bargained
                          </Badge>
                          <span className="text-xs text-muted-foreground line-through">₵{item.originalPrice}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-lg">
                  <span>Total:</span>
                  <span className="font-bold">${calculateTotal()}</span>
                </div>
                
                <div>
                  <Label>Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="mtn-momo">MTN Mobile Money</SelectItem>
                      <SelectItem value="vodafone-cash">Vodafone Cash</SelectItem>
                      <SelectItem value="airteltigo-money">AirtelTigo Money</SelectItem>
                      <SelectItem value="mobile">Other Mobile Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={processSale} className="w-full" size="lg">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Process Sale
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {lastReceiptId && lastSale && (
        <Alert>
          <Receipt className="h-4 w-4" />
          <AlertDescription>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span>Sale completed! Receipt #{lastReceiptId} has been generated.</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onPrintReceipt(lastSale)}
                >
                  <Receipt className="h-3 w-3 mr-1" />
                  Print
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSmsPhone(customer.phone || '')
                    setSmsDialogOpen(true)
                  }}
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  SMS Receipt
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* SMS Receipt Dialog */}
      <Dialog open={smsDialogOpen} onOpenChange={setSmsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Receipt via SMS</DialogTitle>
            <DialogDescription>
              Enter customer's phone number to send receipt via SMS
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sms-phone">Phone Number *</Label>
              <Input
                id="sms-phone"
                type="tel"
                value={smsPhone}
                onChange={(e) => setSmsPhone(e.target.value)}
                placeholder="0241234567"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Include watermark: "Powered by Rekon360"
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSmsDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={sendSMSReceipt}
                disabled={!smsPhone || smsSending}
                className="flex-1"
              >
                {smsSending ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-3 w-3 mr-2" />
                    Send SMS
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bargaining Dialog */}
      <Dialog open={showBargainingDialog} onOpenChange={setShowBargainingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Bargain Price</DialogTitle>
            <DialogDescription>
              This product allows bargaining. Enter the final selling price within the allowed range.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedProductData && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{selectedProductData.name}</span>
                  <span className="text-sm text-muted-foreground">{selectedProductData.category}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Original Price: ₵{selectedProductData.price}</p>
                  <p>Allowed Range: ₵{selectedProductData.minBargainPrice} - ₵{selectedProductData.maxBargainPrice}</p>
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="bargain-price">Final Selling Price (₵)</Label>
              <Input
                id="bargain-price"
                type="number"
                placeholder="Enter final price"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                min={selectedProductData?.minBargainPrice || 0}
                max={selectedProductData?.maxBargainPrice || selectedProductData?.price || 0}
              />
              {selectedProductData && (
                <p className="text-xs text-muted-foreground mt-1">
                  Must be between ₵{selectedProductData.minBargainPrice} and ₵{selectedProductData.maxBargainPrice}
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleBargainingConfirm}
                disabled={!customPrice || parseFloat(customPrice) <= 0}
                className="flex-1"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setShowBargainingDialog(false)
                  setCustomPrice('')
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}