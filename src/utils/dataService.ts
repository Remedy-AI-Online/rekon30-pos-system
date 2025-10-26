import { projectId, publicAnonKey } from './supabase/info'
import { getSupabaseClient } from './authService'

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-86b98184`

class DataService {
  private async getAuthToken(): Promise<string> {
    const supabase = getSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    console.log("DataService auth check:", {
      hasSession: !!session,
      hasToken: !!session?.access_token,
      tokenPreview: session?.access_token ? `${session.access_token.substring(0, 20)}...` : 'null'
    })
    
    if (!session) {
      throw new Error('You must be logged in to perform this action. Please log in and try again.')
    }
    
    return session.access_token
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${BASE_URL}${endpoint}`
    const authToken = await this.getAuthToken()
    
    console.log("DataService request:", {
      url,
      endpoint,
      authToken: authToken ? `${authToken.substring(0, 20)}...` : 'null',
      method: options.method || 'GET'
    })
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `HTTP error! status: ${response.status}`
      
      try {
        const errorData = JSON.parse(errorText)
        if (errorData.error) {
          errorMessage = errorData.error
        }
      } catch (e) {
        // If not JSON, use the text as is
        errorMessage = errorText || errorMessage
      }
      
      throw new Error(errorMessage)
    }

    return response.json()
  }

  // PRODUCTS
  async getProducts() {
    return this.request('/products')
  }

  async saveProduct(product: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    })
  }

  async deleteProduct(productId: string) {
    return this.request(`/products/${productId}`, {
      method: 'DELETE',
    })
  }

  // BUSINESS FEATURES
  async getBusinessFeatures() {
    try {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user?.user_metadata?.business_id) {
        throw new Error('No business ID found in user metadata')
      }

      const { data, error } = await supabase
        .from('businesses')
        .select('features, plan')
        .eq('id', user.user_metadata.business_id)
        .single()

      if (error) {
        throw new Error(`Failed to load business features: ${error.message}`)
      }

      return {
        features: data?.features || [],
        plan: data?.plan || 'basic'
      }
    } catch (error: any) {
      console.error('Error loading business features:', error)
      // Return default features for basic plan
      return {
        features: ['dashboard', 'products', 'orders', 'workers', 'reports', 'settings'],
        plan: 'basic'
      }
    }
  }

  // WORKERS
  async getWorkers() {
    return this.request('/workers')
  }

  async saveWorker(worker: any) {
    console.log('💾 Saving worker:', worker)
    try {
      const result = await this.request('/workers', {
        method: 'POST',
        body: JSON.stringify(worker),
      })
      console.log('✅ Worker saved successfully:', result)
      return result
    } catch (error) {
      console.error('❌ Failed to save worker:', error)
      throw error
    }
  }

  async updateWorker(workerId: string, updates: any) {
    return this.request(`/workers/${workerId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deleteWorker(workerId: string) {
    return this.request(`/workers/${workerId}`, {
      method: 'DELETE',
    })
  }

  // CORRECTIONS
  async getCorrections() {
    return this.request('/corrections')
  }

  async submitCorrection(correction: any) {
    return this.request('/corrections', {
      method: 'POST',
      body: JSON.stringify(correction),
    })
  }

  async updateCorrectionStatus(correctionId: string, updates: any) {
    return this.request(`/corrections/${correctionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  // CUSTOMERS
  async getCustomers() {
    return this.request('/customers')
  }

  async saveCustomer(customer: any) {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    })
  }

  // SALES
  async saveSale(sale: any) {
    return this.request('/sales', {
      method: 'POST',
      body: JSON.stringify(sale),
    })
  }

  async getSales(date: string) {
    return this.request(`/sales/${date}`)
  }

  async getSalesRange(startDate: string, endDate: string) {
    return this.request(`/sales-range/${startDate}/${endDate}`)
  }

  // DASHBOARD
  async getDashboardSummary() {
    return this.request('/dashboard-summary')
  }

  // REPORTS
  async getAllReports() {
    return this.request('/all-reports')
  }

  async generateDailyReport(date?: string, shopInfo?: any) {
    return this.request('/generate-auto-report', {
      method: 'POST',
      body: JSON.stringify({ date, shopInfo }),
    })
  }

  async getDailyReportCSV(date: string) {
    const url = `${BASE_URL}/daily-report/${date}`
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.blob()
  }

  // SHOP SETTINGS
  async getShopSettings() {
    return this.request('/shop-settings')
  }

  async updateShopSettings(settings: any) {
    return this.request('/shop-settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    })
  }

  // PAYROLL
  async getPayroll() {
    return this.request('/payroll')
  }

  async savePayroll(payroll: any) {
    return this.request('/payroll', {
      method: 'POST',
      body: JSON.stringify(payroll),
    })
  }

  async updatePayroll(payrollId: string, updates: any) {
    return this.request(`/payroll/${payrollId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  // INVENTORY
  async updateInventory(productId: string, quantityChange: number) {
    return this.request('/update-inventory', {
      method: 'POST',
      body: JSON.stringify({ productId, quantityChange }),
    })
  }

  // PROFIT ANALYSIS
  async getProfitAnalysis(period: 'daily' | 'weekly' | 'monthly') {
    return this.request(`/profit-analysis/${period}`)
  }

  // DELETE FUNCTIONS
  async deleteCustomer(customerId: string) {
    return this.request(`/customers/${customerId}`, {
      method: 'DELETE',
    })
  }

  async deletePayroll(payrollId: string) {
    return this.request(`/payroll/${payrollId}`, {
      method: 'DELETE',
    })
  }

  async deleteSale(saleId: string) {
    return this.request(`/sales/${saleId}`, {
      method: 'DELETE',
    })
  }

  // Custom Features API methods
  async getCustomFeatures() {
    return this.request('/make-server-86b98184/custom-features', {
      method: 'GET',
    })
  }

  async submitCustomFeature(featureData: {
    title: string
    description: string
    businessValue: string
    priority: 'low' | 'medium' | 'high'
  }) {
    return this.request('/make-server-86b98184/custom-features', {
      method: 'POST',
      body: JSON.stringify(featureData),
    })
  }

  async updateCustomFeature(featureId: string, updates: Partial<{
    status: 'submitted' | 'reviewing' | 'approved' | 'in-development' | 'completed' | 'rejected'
    estimatedCost: number
    estimatedTime: string
  }>) {
    return this.request(`/custom-features/${featureId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  // Super Admin methods for managing all custom features
  async getAllCustomFeatures() {
    return this.request('/make-server-86b98184/super-admin/custom-features', {
      method: 'GET',
    })
  }
}

export const dataService = new DataService()