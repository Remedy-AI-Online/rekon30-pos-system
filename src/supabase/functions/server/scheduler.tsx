// @ts-nocheck
// This file is for Supabase Edge Functions (Deno runtime)
// TypeScript errors are expected here as these are Deno-specific imports

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

// Supabase client for KV operations
const supabase = createClient(
  (globalThis as any).Deno?.env?.get('SUPABASE_URL') ?? '',
  (globalThis as any).Deno?.env?.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// KV Store functions
const kv = {
  set: async (key: string, value: any): Promise<void> => {
    const { error } = await supabase.from("kv_store_86b98184").upsert({
      key,
      value
    });
    if (error) {
      throw new Error(error.message);
    }
  },

  get: async (key: string): Promise<any> => {
    const { data, error } = await supabase.from("kv_store_86b98184").select("value").eq("key", key).maybeSingle();
    if (error) {
      throw new Error(error.message);
    }
    return data?.value;
  },

  del: async (key: string): Promise<void> => {
    const { error } = await supabase.from("kv_store_86b98184").delete().eq("key", key);
    if (error) {
      throw new Error(error.message);
    }
  },

  getByPrefix: async (prefix: string): Promise<{ key: string, value: any }[]> => {
    const { data, error } = await supabase.from("kv_store_86b98184").select("key, value").like("key", prefix + "%");
    if (error) {
      throw new Error(error.message);
    }
    return data ?? [];
  }
};

interface ShopSettings {
  name: string
  managerEmail: string
  managerPhone: string
  timezone: string
  reportTime: string // "18:00" for 6 PM
  autoReportEnabled: boolean
}

export class ReportScheduler {
  
  // This function would be called by a cron job or scheduled function
  async generateDailyReports() {
    try {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const dateStr = yesterday.toISOString().split('T')[0]
      
      // Get all sales for yesterday
      const sales = await kv.getByPrefix("sale_")
      const yesterdaySales = sales.filter(sale => sale.value.date === dateStr)
      
      // Calculate totals
      const totalSales = yesterdaySales.length
      const totalRevenue = yesterdaySales.reduce((sum, sale) => sum + sale.value.total, 0)
      
      // Get top products
      const productSales = {}
      yesterdaySales.forEach(sale => {
        if (sale.value.items) {
          sale.value.items.forEach(item => {
            if (!productSales[item.name]) {
              productSales[item.name] = { quantity: 0, revenue: 0 }
            }
            productSales[item.name].quantity += item.quantity
            productSales[item.name].revenue += item.quantity * item.price
          })
        }
      })
      
      const topProducts = Object.entries(productSales)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
      
      // Create daily report
      const dailyReport = {
        date: dateStr,
        totalSales,
        totalRevenue,
        topProducts,
        generatedAt: new Date().toISOString()
      }
      
      // Save daily report
      const reportKey = `daily_${dateStr}`
      await kv.set(reportKey, dailyReport)
      
      console.log(`Daily report generated for ${dateStr}:`, dailyReport)
      return dailyReport
    } catch (error) {
      console.error("Error generating daily report:", error)
      throw error
    }
  }
  
  // Generate weekly reports
  async generateWeeklyReports() {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - 7)
      
      const weeklyData = []
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]
        const dailyReport = await kv.get(`daily_${dateStr}`)
        if (dailyReport) {
          weeklyData.push(dailyReport)
        }
      }
      
      const totalSales = weeklyData.reduce((sum, day) => sum + day.totalSales, 0)
      const totalRevenue = weeklyData.reduce((sum, day) => sum + day.totalRevenue, 0)
      
      const weeklyReport = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        totalSales,
        totalRevenue,
        dailyBreakdown: weeklyData,
        generatedAt: new Date().toISOString()
      }
      
      const reportKey = `weekly_${startDate.toISOString().split('T')[0]}`
      await kv.set(reportKey, weeklyReport)
      
      console.log(`Weekly report generated:`, weeklyReport)
      return weeklyReport
    } catch (error) {
      console.error("Error generating weekly report:", error)
      throw error
    }
  }
  
  // Generate monthly reports
  async generateMonthlyReports() {
    try {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      
      const monthlyData = []
      for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]
        const dailyReport = await kv.get(`daily_${dateStr}`)
        if (dailyReport) {
          monthlyData.push(dailyReport)
        }
      }
      
      const totalSales = monthlyData.reduce((sum, day) => sum + day.totalSales, 0)
      const totalRevenue = monthlyData.reduce((sum, day) => sum + day.totalRevenue, 0)
      
      const monthlyReport = {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        totalSales,
        totalRevenue,
        dailyBreakdown: monthlyData,
        generatedAt: new Date().toISOString()
      }
      
      const reportKey = `monthly_${now.getFullYear()}_${now.getMonth() + 1}`
      await kv.set(reportKey, monthlyReport)
      
      console.log(`Monthly report generated:`, monthlyReport)
      return monthlyReport
    } catch (error) {
      console.error("Error generating monthly report:", error)
      throw error
    }
  }
  
  // Get shop settings
  async getShopSettings(): Promise<ShopSettings> {
    try {
      const settings = await kv.get("shop_settings")
      if (!settings) {
        // Return default settings if none exist
        return {
          name: "Default Shop",
          managerEmail: "manager@shop.com",
          managerPhone: "+1234567890",
          timezone: "UTC",
          reportTime: "18:00",
          autoReportEnabled: false
        }
      }
      return settings
    } catch (error) {
      console.error("Error getting shop settings:", error)
      throw error
    }
  }
  
  // Update shop settings
  async updateShopSettings(settings: ShopSettings) {
    try {
      await kv.set("shop_settings", settings)
      console.log("Shop settings updated:", settings)
    } catch (error) {
      console.error("Error updating shop settings:", error)
      throw error
    }
  }
  
  // Check if it's time to generate reports
  async shouldGenerateReport(): Promise<boolean> {
    try {
      const settings = await this.getShopSettings()
      if (!settings.autoReportEnabled) {
        return false
      }
      
      const now = new Date()
      const currentTime = now.toTimeString().split(' ')[0].substring(0, 5) // HH:MM format
      
      return currentTime === settings.reportTime
    } catch (error) {
      console.error("Error checking report schedule:", error)
      return false
    }
  }
  
  // Main scheduler function
  async runScheduler() {
    try {
      console.log("Running report scheduler...")
      
      const shouldRun = await this.shouldGenerateReport()
      if (!shouldRun) {
        console.log("Not time for report generation yet")
        return
      }
      
      console.log("Generating daily report...")
      await this.generateDailyReports()
      
      // Check if it's Monday (start of week)
      const today = new Date()
      if (today.getDay() === 1) {
        console.log("Generating weekly report...")
        await this.generateWeeklyReports()
      }
      
      // Check if it's the first day of the month
      if (today.getDate() === 1) {
        console.log("Generating monthly report...")
        await this.generateMonthlyReports()
      }
      
      console.log("Report scheduler completed successfully")
    } catch (error) {
      console.error("Error in report scheduler:", error)
      throw error
    }
  }
}

// Export the scheduler instance
export const reportScheduler = new ReportScheduler();