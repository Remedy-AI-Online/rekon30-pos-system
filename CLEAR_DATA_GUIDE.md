# Clear Admin & Cashier Data Guide

## ⚠️ WARNING
This process will **permanently delete ALL admin and cashier data** including:
- All businesses
- All products/inventory
- All customers
- All workers
- All sales records
- All payments
- All backups
- All admin and cashier authentication accounts

**Super Admin data will remain intact.**

---

## Prerequisites

1. **Supabase Service Role Key** - Get it from your Supabase Dashboard:
   - Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api
   - Copy the `service_role` key (not the `anon` key)

2. **Database Access** - Ensure you have Supabase CLI installed:
   ```bash
   npm install -g supabase
   ```

---

## Step-by-Step Process

### **Step 1: Clear Authentication (Admin & Cashier Users)**

This removes all admin and cashier users from Supabase Auth, keeping only Super Admins.

#### Windows (PowerShell):
```powershell
# Set your service role key
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# Run the script
node clear-admin-cashier-auth.js
```

#### Linux/Mac:
```bash
# Set your service role key
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# Run the script
node clear-admin-cashier-auth.js
```

**Expected Output:**
```
🔄 Starting to clear admin and cashier authentication...

📊 Fetching all auth users...
✅ Found 5 total users

⏭️  Skipping Super Admin: superadmin@example.com
🗑️  Deleting admin: business1@example.com
   ✅ Deleted successfully
🗑️  Deleting cashier: cashier1@example.com
   ✅ Deleted successfully

==================================================
📊 Summary:
   Total users processed: 5
   Deleted: 4
   Skipped (Super Admin + Unknown): 1
==================================================

✅ Authentication cleanup complete!
```

---

### **Step 2: Clear Database Data**

This removes all business-related data from the database.

#### Option A: Using Supabase CLI (Recommended)

```bash
# Link to your project (if not already linked)
supabase link --project-ref YOUR_PROJECT_ID

# Run the SQL script
supabase db execute -f clear-admin-cashier-data.sql
```

#### Option B: Using Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new
2. Copy the contents of `clear-admin-cashier-data.sql`
3. Paste into the SQL Editor
4. Click "Run"

#### Option C: Manual SQL Execution

If you prefer to run commands one by one:

```sql
-- Delete all business data
DELETE FROM sales;
DELETE FROM payroll;
DELETE FROM workers;
DELETE FROM customers;
DELETE FROM products;
DELETE FROM locations;
DELETE FROM business_feature_log;
DELETE FROM backup_records;
DELETE FROM payments;
DELETE FROM businesses;
```

---

### **Step 3: Verify Cleanup**

Run these verification queries to ensure data is cleared:

```sql
-- Should all return 0
SELECT COUNT(*) as businesses_count FROM businesses;
SELECT COUNT(*) as products_count FROM products;
SELECT COUNT(*) as customers_count FROM customers;
SELECT COUNT(*) as workers_count FROM workers;
SELECT COUNT(*) as sales_count FROM sales;
SELECT COUNT(*) as payments_count FROM payments;
SELECT COUNT(*) as backups_count FROM backup_records;
```

---

### **Step 4: Clear Local Storage (Optional)**

If you want to clear cached business configs from the browser:

1. Open your application in the browser
2. Open Developer Tools (F12)
3. Go to "Application" or "Storage" tab
4. Clear localStorage:
   ```javascript
   localStorage.removeItem('businessConfig')
   localStorage.clear()
   ```
5. Refresh the page

---

## What Gets Deleted

### ✅ Deleted:
- All `admin` role users in Supabase Auth
- All `cashier` role users in Supabase Auth
- All records in `businesses` table
- All records in `products` table
- All records in `customers` table
- All records in `workers` table
- All records in `sales` table
- All records in `payroll` table
- All records in `payments` table
- All records in `backup_records` table
- All records in `locations` table
- All records in `business_feature_log` table

### ❌ NOT Deleted (Preserved):
- `super_admin` role users
- `api_keys` table (Super Admin API keys)
- `custom_features` table (Custom feature definitions)
- Database schema and structure

---

## Troubleshooting

### Issue: "SUPABASE_SERVICE_ROLE_KEY not set"

**Solution:** You must provide your service role key as an environment variable:

```bash
# Windows
$env:SUPABASE_SERVICE_ROLE_KEY="your-key-here"

# Linux/Mac
export SUPABASE_SERVICE_ROLE_KEY="your-key-here"
```

### Issue: "Permission denied" errors

**Solution:** Make sure you're using the `service_role` key, not the `anon` key. The service role key has admin privileges.

### Issue: Foreign key constraint errors

**Solution:** The SQL script deletes data in the correct order. If you're running commands manually, ensure you delete child tables before parent tables.

### Issue: "Cannot read property 'role' of undefined"

**Solution:** This means the auth script couldn't read user metadata. The script will skip these users and log a warning.

---

## Post-Cleanup

After clearing the data:

1. **Super Admin access remains** - You can still log in as Super Admin
2. **No businesses exist** - The system is in a clean state
3. **Ready for fresh data** - You can now:
   - Create new businesses via Super Admin
   - Let new businesses sign up
   - Import data if needed

---

## Safety Features

The scripts include several safety features:

1. **Super Admin Protection** - Never deletes super_admin users
2. **Confirmation Required** - Scripts log what they're doing
3. **Transaction Safety** - SQL script uses BEGIN/COMMIT
4. **Detailed Logging** - Shows exactly what was deleted
5. **Verification Queries** - Confirms cleanup success

---

## Need to Restore?

If you have backups and need to restore:

1. Use the Super Admin Dashboard → Backups tab
2. Select a backup to restore
3. Click "Restore" for the specific business

Note: Only restore backups if you want to bring back specific business data.

---

## Quick Reset Script (Windows)

For convenience, here's a one-liner:

```powershell
$env:SUPABASE_SERVICE_ROLE_KEY="your-key-here"; node clear-admin-cashier-auth.js; supabase db execute -f clear-admin-cashier-data.sql
```

## Quick Reset Script (Linux/Mac)

```bash
export SUPABASE_SERVICE_ROLE_KEY="your-key-here" && node clear-admin-cashier-auth.js && supabase db execute -f clear-admin-cashier-data.sql
```

---

**Last Updated:** $(date)
**Status:** Ready for use

