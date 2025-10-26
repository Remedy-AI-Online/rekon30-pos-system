import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Badge } from "../ui/badge"
import { Search, User, Phone, MapPin } from "lucide-react"

interface Customer {
  name: string
  phone: string
  address: string
}

interface Sale {
  id: string
  time: string
  items: any[]
  total: number
  paymentMethod: string
  customer?: Customer
}

interface CustomersSectionProps {
  sales: Sale[]
}

export function CustomersSection({ sales }: CustomersSectionProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Extract unique customers from sales
  const customers = sales.reduce((acc, sale) => {
    if (sale.customer?.name) {
      const existingCustomer = acc.find(c => c.name === sale.customer!.name)
      if (existingCustomer) {
        existingCustomer.totalSpent += sale.total
        existingCustomer.visits += 1
        existingCustomer.lastVisit = sale.time
      } else {
        acc.push({
          name: sale.customer.name,
          phone: sale.customer.phone || '',
          address: sale.customer.address || '',
          totalSpent: sale.total,
          visits: 1,
          lastVisit: sale.time
        })
      }
    }
    return acc
  }, [] as Array<Customer & { totalSpent: number, visits: number, lastVisit: string }>)

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  )

  return (
    <div className="p-6 space-y-6 h-full overflow-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm text-muted-foreground">Total Customers</div>
                <div className="text-2xl font-bold text-blue-600">{customers.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-muted-foreground">With Phone Numbers</div>
                <div className="text-2xl font-bold text-green-600">
                  {customers.filter(c => c.phone).length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-sm text-muted-foreground">With Addresses</div>
                <div className="text-2xl font-bold text-purple-600">
                  {customers.filter(c => c.address).length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Database</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {customers.length === 0 ? "No customers recorded yet" : "No customers match your search"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Visits</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Last Visit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {customer.name.charAt(0)}
                          </span>
                        </div>
                        {customer.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.phone ? (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {customer.phone}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {customer.address ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="max-w-xs truncate">{customer.address}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {customer.visits} visit{customer.visits > 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      ${customer.totalSpent}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {customer.lastVisit}
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