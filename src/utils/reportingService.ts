import { projectId, publicAnonKey } from './supabase/info'
import { getSupabaseClient } from './authService'

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-86b98184`

export interface Sale {
  id: string
  receiptId: string
  timestamp: string
  date: string
  customer?: {
    name: string
    phone: string
    email?: string
  }
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
  paymentMethod: string
  total: number
  cashier?: {
    id: string
    name: string
  }
  shopId?: string
}

export interface DailyReport {
  date: string
  sales: Sale[]
  totalAmount: number
  totalTransactions: number
  lastUpdated: string
}

export class ReportingService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    // Get user's auth token for business_id isolation
    const supabase = getSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    const authToken = session?.access_token || publicAnonKey

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response
  }

  // Save a sale to the backend
  async saveSale(sale: Omit<Sale, 'id' | 'timestamp' | 'date'>): Promise<string> {
    try {
      const response = await this.makeRequest('/sales', {
        method: 'POST',
        body: JSON.stringify(sale),
      })

      const result = await response.json()
      if (result.success) {
        return result.saleId
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error saving sale:', error)
      throw error
    }
  }

  // Get sales for a specific date
  async getDailySales(date: string): Promise<DailyReport> {
    try {
      const response = await this.makeRequest(`/sales/${date}`)
      const result = await response.json()
      
      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error fetching daily sales:', error)
      // Return fallback data
      return {
        date,
        totalAmount: 0,
        totalTransactions: 0,
        lastUpdated: new Date().toISOString(),
        sales: []
      }
    }
  }

  // Get sales for a date range
  async getSalesRange(startDate: string, endDate: string): Promise<DailyReport[]> {
    try {
      const response = await this.makeRequest(`/sales-range/${startDate}/${endDate}`)
      const result = await response.json()
      
      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error fetching sales range:', error)
      // Return empty array as fallback
      return []
    }
  }

  // Download daily report as CSV/Excel
  async downloadDailyReport(date: string): Promise<Blob> {
    try {
      const response = await this.makeRequest(`/daily-report/${date}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      })

      if (response.ok) {
        return await response.blob()
      } else {
        const error = await response.json()
        throw new Error(error.error)
      }
    } catch (error) {
      console.error('Error downloading report:', error)
      throw error
    }
  }

  // Generate automatic daily report
  async generateAutoReport(date?: string, shopInfo?: any): Promise<any> {
    try {
      const response = await this.makeRequest('/generate-auto-report', {
        method: 'POST',
        body: JSON.stringify({ 
          date: date || new Date().toISOString().split('T')[0],
          shopInfo 
        }),
      })

      const result = await response.json()
      if (result.success) {
        return result.report
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error generating auto report:', error)
      // Return fallback report
      const reportDate = date || new Date().toISOString().split('T')[0]
      return {
        date: reportDate,
        generated: new Date().toISOString(),
        status: 'Generated offline',
        totalSales: 0,
        totalTransactions: 0,
        csvUrl: null
      }
    }
  }

  // Get all reports for admin dashboard
  async getAllReports(): Promise<any[]> {
    try {
      const response = await this.makeRequest('/all-reports')
      const result = await response.json()
      
      if (result.success) {
        return result.reports
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error fetching all reports:', error)
      // Return empty array as fallback
      return []
    }
  }

  // Utility function to format date for filename
  formatDateForFilename(date: string): string {
    return date.replace(/-/g, '')
  }

  // Generate Excel-compatible CSV content
  generateExcelCSV(sales: Sale[], date: string): string {
    const headers = [
      'Time',
      'Receipt ID', 
      'Customer Name',
      'Customer Phone',
      'Items Purchased',
      'Payment Method',
      'Total Amount'
    ].join(',') + '\n'

    const rows = sales.map(sale => {
      const time = new Date(sale.timestamp).toLocaleTimeString()
      const items = sale.items.map(item => 
        `${item.name} x${item.quantity} @₵${item.price}`
      ).join('; ')
      
      return [
        time,
        sale.receiptId || sale.id,
        sale.customer?.name || 'Walk-in Customer',
        sale.customer?.phone || 'N/A',
        `"${items}"`,
        sale.paymentMethod,
        `$${sale.total.toFixed(2)}`
      ].join(',')
    }).join('\n')

    const totalAmount = sales.reduce((sum, sale) => sum + sale.total, 0)
    const summary = [
      '',
      '',
      '',
      '',
      '',
      'DAILY TOTAL:',
      `$${totalAmount.toFixed(2)}`
    ].join(',')

    return headers + rows + '\n' + summary
  }
}

// Create singleton instance
export const reportingService = new ReportingService()