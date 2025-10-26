# Backend Integration Guide

## 🎉 Overview

This guide explains how the backend system is integrated with the Super Admin frontend and how to use all the features.

## 📚 **What's Been Implemented**

### 1. **Super Admin Service** (`src/utils/superAdminService.ts`)

A comprehensive service that connects the frontend to all backend functions:

- **Businesses**: CRUD operations for business management
- **Payments**: Manual payment verification and history tracking
- **Backups**: Automated backups every 5 minutes + manual triggers
- **API Keys**: Full API key management (create, view, disable, delete)
- **Analytics**: Get business insights and statistics
- **Realtime**: Live updates for businesses, payments, and backups

### 2. **API Keys Management** (Settings Page)

Located in the "API Keys" tab of the Super Admin Settings page:

- View all API keys with permissions and status
- Create new API keys with custom permissions
- Copy API keys to clipboard
- Enable/disable API keys
- Delete API keys
- Rate limiting per key

### 3. **Backend Functions Deployed**

All 7 Edge Functions are live:

1. **`backup-system`**: Individual business backups
2. **`backup-scheduler`**: Orchestrates backups for all businesses
3. **`cron-backup`**: Triggered by cron jobs every 5 minutes
4. **`data-restore`**: Restore business data from backups
5. **`payment-verification`**: Manual payment verification
6. **`api-security`**: API key validation and rate limiting
7. **`analytics`**: Business analytics and insights

### 4. **Database Tables**

- **`backup_records`**: Tracks all backup operations
- **`api_keys`**: Stores API keys with permissions and rate limits
- **`payments`**: Payment history and verification records
- **`businesses`**: Business information and status

### 5. **Automated Cron Jobs**

- Backups run every 5 minutes automatically
- Windows Task Scheduler configured
- Logs saved to `C:\temp\rekon30-backup.log`

## 🚀 **How to Use**

### **1. View All Businesses**

The Super Admin dashboard automatically fetches and displays all businesses from the database.

To manually fetch:

```typescript
import { superAdminService } from '../utils/superAdminService'

const { data, error } = await superAdminService.getAllBusinesses()
if (data) {
  console.log('All businesses:', data)
}
```

### **2. Verify Payments**

```typescript
const { success, error } = await superAdminService.verifyPayment({
  business_id: 'uuid-here',
  amount: 400,
  payment_type: 'maintenance', // or 'upfront'
  payment_method: 'MoMo',
  notes: 'Payment verified manually'
})
```

### **3. Trigger Manual Backup**

```typescript
// Backup specific business
const { success, error } = await superAdminService.triggerBackup('business-id', 'full')

// Backup all businesses
const { success, error } = await superAdminService.triggerBackup()
```

### **4. Restore Business Data**

```typescript
const { success, error } = await superAdminService.restoreBackup(
  'business-id',
  'backup-id',
  ['products', 'customers'] // optional: selective restore
)
```

### **5. Manage API Keys**

Go to: **Super Admin Dashboard → Settings → API Keys**

Or programmatically:

```typescript
// Create new API key
const { data, error } = await superAdminService.createApiKey({
  key_name: 'Mobile App Key',
  permissions: ['read_sales', 'write_products'],
  rate_limit: 1000
})

// Get all API keys
const { data, error } = await superAdminService.getAllApiKeys()

// Disable/Enable API key
await superAdminService.updateApiKey('key-id', { is_active: false })

// Delete API key
await superAdminService.deleteApiKey('key-id')
```

### **6. Get Analytics**

```typescript
const { data, error} = await superAdminService.getAnalytics('month')
// timeframe: 'day' | 'week' | 'month' | 'year'
```

### **7. Real-Time Updates**

Subscribe to live changes:

```typescript
// Subscribe to business changes
const subscription = superAdminService.subscribeToBusinessUpdates((payload) => {
  console.log('Business updated:', payload)
  // Update your UI here
})

// Unsubscribe when done
subscription.unsubscribe()
```

## 🔐 **API Keys Created**

Three system-wide API keys were created:

### **1. System Integration Key**
```
sk_42c8edcdf271cea64720054076d713e0
```
- **Permissions**: analytics, backup_status, realtime_events
- **Rate Limit**: 1000 requests/hour

### **2. Analytics API Key**
```
sk_analytics_47d042178f0938b916be81134ce4
```
- **Permissions**: analytics
- **Rate Limit**: 500 requests/hour

### **3. Backup Monitor Key**
```
sk_backup_493ea2b6862b953bd69428039e6d
```
- **Permissions**: backup_status, realtime_events
- **Rate Limit**: 200 requests/hour

## 📡 **API Endpoints**

All endpoints are available at:
```
https://cddoboboxeangripcqrn.supabase.co/functions/v1/
```

### **Example API Call**

```bash
curl -X POST "https://cddoboboxeangripcqrn.supabase.co/functions/v1/analytics" \
  -H "Authorization: Bearer sk_42c8edcdf271cea64720054076d713e0" \
  -H "Content-Type: application/json" \
  -d '{"timeframe": "month"}'
```

## 📋 **Monitoring**

### **Check Backup Logs**

```cmd
type C:\temp\rekon30-backup.log
```

### **View Scheduled Task**

```cmd
schtasks /query /tn "Rekon30-Backup"
```

### **Test Backup Manually**

```cmd
curl -X POST "https://cddoboboxeangripcqrn.supabase.co/functions/v1/cron-backup" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZG9ib2JveGVhbmdyaXBjcXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc1ODI1NCwiZXhwIjoyMDc1MzM0MjU0fQ.CbCMnclEfF2iWZzLeI4VGIgKYEPuYAt7P-kSAfPr83Q" -H "Content-Type: application/json"
```

## 🎯 **Next Steps**

1. **Connect Dashboard Stats**: Update `SuperAdminPanel.tsx` to fetch real data from `superAdminService`
2. **Add Payment Verification UI**: Create a dialog in the dashboard to verify payments
3. **Test Backup & Restore**: Add a business and test the backup/restore flow
4. **Monitor API Usage**: Track API key usage in the dashboard
5. **Set Up Alerts**: Configure alerts for failed backups or overdue payments

## 🐛 **Troubleshooting**

### **Backups Not Running?**

Check the scheduled task:
```cmd
schtasks /query /tn "Rekon30-Backup" /v
```

### **API Calls Failing?**

1. Check API key is active
2. Verify rate limits haven't been exceeded
3. Check network connection
4. View browser console for errors

### **Database Connection Issues?**

Check Supabase project status and credentials in `src/utils/supabase/info.tsx`

## 📞 **Support**

If you need help:
1. Check the logs: `C:\temp\rekon30-backup.log`
2. View Supabase logs in your dashboard
3. Check browser console for frontend errors

---

**✅ Everything is set up and ready to go!**

