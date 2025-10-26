import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Search, Package, Loader2, AlertCircle } from "lucide-react"
import { dataService } from "../../utils/dataService"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  category: string
  sku: string
  price: number
  stock: number
  status: string
}

export function InventorySection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadProducts()
    // Refresh inventory every 30 seconds
    const interval = setInterval(loadProducts, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await dataService.getProducts()
      if (response.success) {
        setProducts(response.products)
      } else {
        toast.error("Failed to load inventory")
      }
    } catch (error) {
      console.error("Error loading inventory:", error)
      toast.error("Error loading inventory")
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Stock":
        return <Badge variant="default">In Stock</Badge>
      case "Low Stock":
        return <Badge variant="secondary">Low Stock</Badge>
      case "Out of Stock":
        return <Badge variant="destructive">Out of Stock</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStockColor = (stock: number) => {
    if (stock === 0) return "text-red-600"
    if (stock < 10) return "text-yellow-600"
    return "text-green-600"
  }

  if (loading) {
    return (
      <div className="p-4 compact-spacing h-full overflow-auto">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading inventory...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 compact-spacing h-full overflow-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl">Inventory</h1>
        <p className="text-muted-foreground text-sm">Available products for sale</p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader className="compact-card-header">
          <CardTitle className="text-sm">Search Products</CardTitle>
        </CardHeader>
        <CardContent className="compact-card-content">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, SKU, or category..." 
              className="pl-10 compact-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card>
          <CardHeader className="compact-card-header">
            <CardTitle className="text-xs">Total Products</CardTitle>
          </CardHeader>
          <CardContent className="compact-card-content">
            <div className="text-lg font-semibold">{products.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="compact-card-header">
            <CardTitle className="text-xs">In Stock</CardTitle>
          </CardHeader>
          <CardContent className="compact-card-content">
            <div className="text-lg font-semibold text-green-600">
              {products.filter(p => p.status === 'In Stock').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="compact-card-header">
            <CardTitle className="text-xs">Low/Out Stock</CardTitle>
          </CardHeader>
          <CardContent className="compact-card-content">
            <div className="text-lg font-semibold text-red-600">
              {products.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader className="compact-card-header">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4" />
            Products ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="compact-card-content">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">No products found</p>
            </div>
          ) : (
            <Table className="compact-table">
              <TableHeader>
                <TableRow>
                  <TableHead className="compact-table">Product</TableHead>
                  <TableHead className="compact-table">Price</TableHead>
                  <TableHead className="compact-table">Stock</TableHead>
                  <TableHead className="compact-table">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="compact-table">
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.sku}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                    </TableCell>
                    <TableCell className="compact-table">
                      <span className="font-medium">${product.price}</span>
                    </TableCell>
                    <TableCell className="compact-table">
                      <span className={`font-medium ${getStockColor(product.stock)}`}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell className="compact-table">
                      {getStatusBadge(product.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      {products.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock').length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader className="compact-card-header">
            <CardTitle className="flex items-center gap-2 text-sm text-yellow-700">
              <AlertCircle className="h-4 w-4" />
              Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="compact-card-content">
            <div className="space-y-2">
              {products
                .filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock')
                .slice(0, 5)
                .map(product => (
                  <div key={product.id} className="flex justify-between items-center text-sm">
                    <span>{product.name}</span>
                    <Badge 
                      variant={product.status === 'Out of Stock' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {product.stock} left
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}