import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Badge } from "../ui/badge"
import { Receipt, User, DollarSign } from "lucide-react"

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
  items: CartItem[]
  total: number
  paymentMethod: string
  customer?: Customer
}

interface SalesSectionProps {
  sales: Sale[]
  onPrintReceipt: (sale: Sale) => void
}

export function SalesSection({ sales, onPrintReceipt }: SalesSectionProps) {
  const todayTotal = sales.reduce((sum, sale) => sum + sale.total, 0)

  return (
    <div className="p-6 space-y-6 h-full overflow-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-muted-foreground">Total Sales</div>
                <div className="text-2xl font-bold text-green-600">${todayTotal}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm text-muted-foreground">Total Orders</div>
                <div className="text-2xl font-bold text-blue-600">{sales.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-sm text-muted-foreground">With Customer Info</div>
                <div className="text-2xl font-bold text-purple-600">
                  {sales.filter(sale => sale.customer?.name).length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Sales History</CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No sales recorded today</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-mono text-sm">
                      {sale.id}
                    </TableCell>
                    <TableCell>{sale.time}</TableCell>
                    <TableCell>
                      {sale.customer?.name ? (
                        <div>
                          <div className="font-medium">{sale.customer.name}</div>
                          {sale.customer.phone && (
                            <div className="text-sm text-muted-foreground">
                              {sale.customer.phone}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Walk-in</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {sale.items.map((item, idx) => (
                          <div key={idx} className="text-sm">
                            {item.quantity}x {item.name}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {sale.paymentMethod.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold">
                      ${sale.total}
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onPrintReceipt(sale)}
                      >
                        <Receipt className="h-3 w-3 mr-1" />
                        Print
                      </Button>
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