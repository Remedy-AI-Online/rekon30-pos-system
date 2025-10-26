import { useState, useEffect } from "react"
import { Menu } from "lucide-react"
import { CashierSidebar } from "./CashierSidebar"
import { POSSection } from "./cashier/POSSection"
import { InventorySection } from "./cashier/InventorySection"
import { SalesSection } from "./cashier/SalesSection"
import { CustomersSection } from "./cashier/CustomersSection"
import { ReportsSection } from "./cashier/ReportsSection"
import { Button } from "./ui/button"
import { Sheet, SheetContent } from "./ui/sheet"

interface CashierDashboardProps {
  user: any
  accessToken: string
  onLogout: () => void
  selectedFeatures?: string[]
}

interface CartItem {
  id: string
  name: string
  size: string
  price: number
  quantity: number
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

export function CashierDashboard({ user, accessToken, onLogout, selectedFeatures = [] }: CashierDashboardProps) {
  const [activeSection, setActiveSection] = useState("pos")
  const [todaySales, setTodaySales] = useState<Sale[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768)

  // Handle window resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSaleComplete = (sale: Sale) => {
    setTodaySales([sale, ...todaySales])
  }

  const printReceipt = (sale: Sale) => {
    // Create a printable receipt HTML
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt ${sale.id}</title>
        <style>
          @media print {
            @page { margin: 0; }
            body { margin: 1cm; }
          }
          body {
            font-family: 'Courier New', monospace;
            width: 80mm;
            margin: 0 auto;
            padding: 10px;
            font-size: 12px;
          }
          .receipt-header {
            text-align: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .shop-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .receipt-info {
            font-size: 11px;
            line-height: 1.4;
          }
          .items {
            border-bottom: 2px dashed #000;
            padding: 10px 0;
            margin-bottom: 10px;
          }
          .item {
            margin-bottom: 8px;
          }
          .item-name {
            font-weight: bold;
          }
          .item-details {
            margin-left: 10px;
          }
          .totals {
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .total-line {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
          }
          .grand-total {
            font-size: 14px;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            font-size: 11px;
            line-height: 1.6;
          }
          .watermark {
            text-align: center;
            margin-top: 15px;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 8px;
          }
          .watermark-brand {
            font-weight: bold;
            color: #000;
          }
        </style>
      </head>
      <body>
        <div class="receipt-header">
          <div class="shop-name">${user.shopName}</div>
          <div class="receipt-info">
            Receipt #: ${sale.id}<br/>
            Date: ${new Date().toLocaleDateString()}<br/>
            Time: ${sale.time}<br/>
            Cashier: ${user.name}
          </div>
        </div>

        <div class="items">
          ${sale.items.map(item => `
            <div class="item">
              <div class="item-name">${item.name} (${item.size})</div>
              <div class="item-details">
                ${item.quantity} x GHS ${item.price.toFixed(2)} = GHS ${(item.quantity * item.price).toFixed(2)}
              </div>
            </div>
          `).join('')}
        </div>

        ${sale.customer ? `
          <div style="margin-bottom: 10px; font-size: 11px;">
            <strong>Customer:</strong><br/>
            ${sale.customer.name}<br/>
            ${sale.customer.phone ? `Phone: ${sale.customer.phone}<br/>` : ''}
            ${sale.customer.address ? `Address: ${sale.customer.address}<br/>` : ''}
          </div>
        ` : ''}

        <div class="totals">
          <div class="total-line grand-total">
            <span>TOTAL:</span>
            <span>GHS ${sale.total.toFixed(2)}</span>
          </div>
          <div class="total-line">
            <span>Payment Method:</span>
            <span>${sale.paymentMethod.toUpperCase()}</span>
          </div>
        </div>

        <div class="footer">
          Thank you for your business!<br/>
          Please come again
        </div>

        <div class="watermark">
          Powered by <span class="watermark-brand">Rekon360</span><br/>
          www.rekon360.com
        </div>
      </body>
      </html>
    `

    // Open print window
    const printWindow = window.open('', '', 'width=300,height=600')
    if (printWindow) {
      printWindow.document.write(receiptHTML)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    }
  }

  const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0)

  const renderContent = () => {
    switch (activeSection) {
      case "pos":
        return <POSSection onSaleComplete={handleSaleComplete} onPrintReceipt={printReceipt} />
      case "inventory":
        return <InventorySection />
      case "sales":
        return <SalesSection sales={todaySales} onPrintReceipt={printReceipt} />
      case "customers":
        return <CustomersSection sales={todaySales} />
      case "reports":
        return <ReportsSection sales={todaySales} />
      default:
        return <POSSection onSaleComplete={handleSaleComplete} onPrintReceipt={printReceipt} />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar - rendered only on desktop */}
      {isDesktop && (
        <div className="w-64 flex-shrink-0">
          <CashierSidebar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            user={user}
            onLogout={onLogout}
            todayTotal={todayTotal}
            todaySalesCount={todaySales.length}
            selectedFeatures={selectedFeatures}
          />
        </div>
      )}

      {/* Mobile Sidebar - Sheet overlay for mobile */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64" aria-describedby={undefined}>
          <CashierSidebar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            user={user}
            onLogout={onLogout}
            todayTotal={todayTotal}
            todaySalesCount={todaySales.length}
            onNavigate={() => setMobileMenuOpen(false)}
            selectedFeatures={selectedFeatures}
          />
        </SheetContent>
      </Sheet>

      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Mobile Menu Button - visible only on mobile */}
        {!isDesktop && (
          <div className="p-4 border-b border-border bg-card">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(true)}
              className="gap-2"
            >
              <Menu className="h-5 w-5" />
              <span>Menu</span>
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}