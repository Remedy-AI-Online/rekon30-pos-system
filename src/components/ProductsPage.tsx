import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Switch } from "./ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"
import { Plus, Search, Filter, Edit, Trash2, Package, Loader2, DollarSign } from "lucide-react"
import { dataService } from "../utils/dataService"
import { toast } from "sonner"
import { getSupabaseClient } from "../utils/authService"

interface Product {
  id: string
  name: string
  category: string
  description?: string
  price: number
  cost: number
  stock: number
  status: string
  supplier?: string
  createdAt: string
  updatedAt: string
  // Bargaining fields
  bargainingEnabled?: boolean
  minBargainPrice?: number
  maxBargainPrice?: number
}

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [businessName, setBusinessName] = useState<string>('Loading...')
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    supplier: "",
    cost: "",
    price: "",
    stock: "",
    description: "",
    bargainingEnabled: false,
    minBargainPrice: "",
    maxBargainPrice: ""
  })

  useEffect(() => {
    loadBusinessName()
    loadProducts()
  }, [])

  const loadBusinessName = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user?.user_metadata?.business_id) {
        const { data, error } = await supabase
          .from('businesses')
          .select('business_name')
          .eq('id', user.user_metadata.business_id)
          .single()
        
        if (!error && data) {
          setBusinessName(data.business_name || 'My Business')
        } else {
          setBusinessName('My Business')
        }
      } else {
        setBusinessName('My Business')
      }
    } catch (error) {
      console.error('Error loading business name:', error)
      setBusinessName('My Business')
    }
  }

  const loadProducts = async () => {
    try {
      setLoading(true)

      const response = await dataService.getProducts()
      if (response.success && response.products) {
        setProducts(response.products)
      } else {
        toast.error("Failed to load products")
      }
    } catch (error) {
      console.error("Error loading products:", error)
      toast.error("Error loading products")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProduct = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.category || !formData.price || !formData.cost) {
        toast.error("Please fill in all required fields")
        return
      }

      const productData: any = {
        ...formData,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        stock: parseInt(formData.stock) || 0,
        original_stock: parseInt(formData.stock) || 0,  // Set original_stock on creation
        bargainingEnabled: formData.bargainingEnabled,
        minBargainPrice: formData.bargainingEnabled ? parseFloat(formData.minBargainPrice) || 0 : null,
        maxBargainPrice: formData.bargainingEnabled ? parseFloat(formData.maxBargainPrice) || 0 : null
      }

      // Only add id if editing existing product
      if (editingProduct?.id) {
        productData.id = editingProduct.id
      }

      const response = await dataService.saveProduct(productData)
      if (response.success) {
        toast.success(editingProduct ? "Product updated successfully" : "Product added successfully")
        setDialogOpen(false)
        resetForm()
        loadProducts()
      } else {
        toast.error("Failed to save product. Please try again.")
      }
    } catch (error) {
      console.error("Error saving product:", error)
      toast.error("Error saving product: " + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await dataService.deleteProduct(productId)
      if (response.success) {
        toast.success("Product deleted successfully")
        loadProducts()
      } else {
        toast.error("Failed to delete product")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Error deleting product")
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      category: product.category,
      supplier: product.supplier || "",
      cost: product.cost.toString(),
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description || "",
      bargainingEnabled: product.bargainingEnabled || false,
      minBargainPrice: product.minBargainPrice?.toString() || "",
      maxBargainPrice: product.maxBargainPrice?.toString() || ""
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingProduct(null)
    setFormData({
      name: "",
      category: "",
      supplier: "",
      cost: "",
      price: "",
      stock: "",
      description: "",
      bargainingEnabled: false,
      minBargainPrice: "",
      maxBargainPrice: ""
    })
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.supplier && product.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    const matchesStatus = statusFilter === "all" || product.status === statusFilter
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
      case "In Stock":
        return <Badge variant="default" className="bg-green-500">✓ In Stock</Badge>
      case "Low Stock":
        return <Badge variant="secondary" className="bg-yellow-500 text-black">⚠️ Low Stock</Badge>
      case "Out of Stock":
        return <Badge variant="destructive">✗ Out of Stock</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 h-full overflow-auto flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading products...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1>{businessName} Product Management</h1>
          <p className="text-muted-foreground">Manage your product inventory across all locations</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              <DialogDescription>
                {editingProduct ? "Update the product details." : "Enter the details for the new product."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input 
                  id="name" 
                  placeholder="Enter product name" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Clothing">Clothing</SelectItem>
                      <SelectItem value="Food & Beverages">Food & Beverages</SelectItem>
                      <SelectItem value="Home & Garden">Home & Garden</SelectItem>
                      <SelectItem value="Health & Beauty">Health & Beauty</SelectItem>
                      <SelectItem value="Sports & Outdoors">Sports & Outdoors</SelectItem>
                      <SelectItem value="Books & Media">Books & Media</SelectItem>
                      <SelectItem value="Automotive">Automotive</SelectItem>
                      <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input 
                    id="supplier" 
                    placeholder="Enter supplier name" 
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost Price *</Label>
                  <Input 
                    id="cost" 
                    type="number" 
                    placeholder="0.00" 
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Selling Price *</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    placeholder="0.00" 
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Initial Stock</Label>
                  <Input 
                    id="stock" 
                    type="number" 
                    placeholder="0" 
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Enter product description" 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              {/* Bargaining Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <Label htmlFor="bargaining" className="text-base font-medium">Allow Bargaining</Label>
                  </div>
                  <Switch
                    id="bargaining"
                    checked={formData.bargainingEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, bargainingEnabled: checked })}
                  />
                </div>
                
                {formData.bargainingEnabled && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="minBargainPrice">Minimum Bargain Price (₵)</Label>
                      <Input 
                        id="minBargainPrice" 
                        type="number" 
                        placeholder="180" 
                        value={formData.minBargainPrice}
                        onChange={(e) => setFormData({ ...formData, minBargainPrice: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">Lowest price cashier can sell for</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxBargainPrice">Maximum Bargain Price (₵)</Label>
                      <Input 
                        id="maxBargainPrice" 
                        type="number" 
                        placeholder="220" 
                        value={formData.maxBargainPrice}
                        onChange={(e) => setFormData({ ...formData, maxBargainPrice: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">Highest price cashier can sell for</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveProduct}>
                {editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
                  placeholder="Search products or suppliers..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Clothing">Clothing</SelectItem>
                <SelectItem value="Food & Beverages">Food & Beverages</SelectItem>
                <SelectItem value="Home & Garden">Home & Garden</SelectItem>
                <SelectItem value="Health & Beauty">Health & Beauty</SelectItem>
                <SelectItem value="Sports & Outdoors">Sports & Outdoors</SelectItem>
                <SelectItem value="Books & Media">Books & Media</SelectItem>
                <SelectItem value="Automotive">Automotive</SelectItem>
                <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active / In Stock</SelectItem>
                <SelectItem value="Low Stock">⚠️ Low Stock</SelectItem>
                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No products found</p>
              <p className="text-muted-foreground text-sm">Add your first product to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Margin</TableHead>
                  <TableHead>Bargaining</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const margin = ((product.price - product.cost) / product.cost * 100).toFixed(1)
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.supplier || 'No supplier'}</p>
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>₵{product.cost}</TableCell>
                      <TableCell>₵{product.price}</TableCell>
                      <TableCell>{margin}%</TableCell>
                      <TableCell>
                        {product.bargainingEnabled ? (
                          <div className="text-xs">
                            <Badge variant="secondary" className="text-green-600">₵{product.minBargainPrice} - ₵{product.maxBargainPrice}</Badge>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">Fixed Price</Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(product.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the product "{product.name}". This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
    </div>
  )
}