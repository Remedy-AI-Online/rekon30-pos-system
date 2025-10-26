import { reportingService } from './reportingService'

export interface EmailNotification {
  to: string
  subject: string
  body: string
  attachments?: {
    filename: string
    content: string
    type: string
  }[]
}

export class EmailService {
  // This would be replaced with actual email service integration
  // For now, it provides the structure for future email functionality
  
  async sendDailyReport(date: string, recipientEmail: string, shopInfo: any) {
    try {
      // Generate the report
      const report = await reportingService.generateAutoReport(date, shopInfo)
      
      // Create CSV content for attachment
      const csvContent = reportingService.generateExcelCSV(report.sales, date)
      
      // Prepare email content
      const emailData: EmailNotification = {
        to: recipientEmail,
        subject: `Daily Sales Report - ${date} - ${shopInfo.name}`,
        body: this.generateEmailBody(report),
        attachments: [{
          filename: `daily-sales-${date}.csv`,
          content: csvContent,
          type: 'text/csv'
        }]
      }
      
      // This is where you would integrate with an actual email service
      // For example: SendGrid, Resend, or Supabase Email
      console.log('Email would be sent:', emailData)
      
      return { success: true, message: 'Email prepared for sending' }
    } catch (error) {
      console.error('Error preparing email:', error)
      return { success: false, error: (error as Error).message }
    }
  }
  
  private generateEmailBody(report: any): string {
    const { date, summary, sales, shopInfo } = report
    
    return `
Dear Uncle,

Here's your daily sales report for ${shopInfo.name} on ${date}:

📊 DAILY SUMMARY:
• Total Sales: $${summary.totalAmount.toFixed(2)}
• Total Transactions: ${summary.totalTransactions}
• Average Transaction: $${summary.averageTransaction.toFixed(2)}

🛏️ TOP SELLING ITEMS:
${this.getTopSellingItems(sales)}

💳 PAYMENT BREAKDOWN:
${this.getPaymentBreakdown(sales)}

⏰ PEAK HOURS:
${this.getPeakHours(sales)}

The detailed Excel report with all transactions is attached to this email.

Best regards,
Your Latex Foam Shop Management System

---
Report generated automatically at ${new Date().toLocaleString()}
    `.trim()
  }
  
  private getTopSellingItems(sales: any[]): string {
    const itemCounts: { [key: string]: number } = {}
    
    sales.forEach(sale => {
      sale.items.forEach((item: any) => {
        const key = `${item.name} (${item.size})`
        itemCounts[key] = (itemCounts[key] || 0) + item.quantity
      })
    })
    
    const sortedItems = Object.entries(itemCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
    
    return sortedItems.map(([item, count]) => `• ${item}: ${count} units`).join('\n')
  }
  
  private getPaymentBreakdown(sales: any[]): string {
    const paymentMethods: { [key: string]: { count: number, amount: number } } = {}
    
    sales.forEach(sale => {
      const method = sale.paymentMethod
      if (!paymentMethods[method]) {
        paymentMethods[method] = { count: 0, amount: 0 }
      }
      paymentMethods[method].count++
      paymentMethods[method].amount += sale.total
    })
    
    return Object.entries(paymentMethods)
      .map(([method, data]) => `• ${method}: ${data.count} transactions ($${data.amount.toFixed(2)})`)
      .join('\n')
  }
  
  private getPeakHours(sales: any[]): string {
    const hourCounts: { [key: string]: number } = {}
    
    sales.forEach(sale => {
      const hour = new Date(sale.timestamp).getHours()
      const hourKey = `${hour}:00 - ${hour + 1}:00`
      hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1
    })
    
    const sortedHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
    
    return sortedHours.map(([hour, count]) => `• ${hour}: ${count} sales`).join('\n')
  }
  
  // Method to send summary SMS (would integrate with SMS service)
  async sendSummarySMS(date: string, phone: string, summary: any) {
    const message = `Daily Sales ${date}: $${summary.totalAmount} from ${summary.totalTransactions} transactions. Avg: $${summary.averageTransaction.toFixed(2)}. Full report emailed.`
    
    console.log('SMS would be sent to', phone, ':', message)
    return { success: true, message: 'SMS prepared for sending' }
  }
}

export const emailService = new EmailService()