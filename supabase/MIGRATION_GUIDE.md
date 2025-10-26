# Supabase Database Migration Guide

## Quick Setup Instructions

Since direct connection isn't available, follow these steps to set up your database:

### Option 1: Use Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Navigate to your project: `cddoboboxeangripcqrn`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run Migrations in Order**

   **Step 1: Run Initial Schema**
   - Copy the entire content from `migrations/001_initial_schema.sql`
   - Paste into the SQL Editor
   - Click "Run" or press `Ctrl+Enter`
   - Wait for confirmation message

   **Step 2: Run RLS Policies**
   - Open a new query tab
   - Copy content from `migrations/002_rls_policies.sql`
   - Paste and run

   **Step 3: Run Functions & Triggers**
   - Open a new query tab
   - Copy content from `migrations/003_functions_triggers.sql`
   - Paste and run

4. **Verify Installation**
   - Go to "Table Editor" in left sidebar
   - You should now see all these tables:
     - products
     - customers
     - workers
     - cashiers
     - sales
     - sale_items
     - corrections
     - payroll
     - daily_reports
     - notifications
     - shop_settings
     - activity_logs

### Option 2: Use Supabase CLI

If you have Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref cddoboboxeangripcqrn

# Run migrations
supabase db push
```

### Option 3: Use the Web-Based Migrator

We've created a web-based tool that runs directly in your browser:

1. Open `supabase/web_migrator.html` in your browser
2. The migrations will run automatically
3. Check the console for results

## What Gets Created

### Tables (12 total):
1. **products** - Product catalog with inventory
2. **customers** - Customer records with loyalty points
3. **workers** - Employee information
4. **cashiers** - Cashier login credentials
5. **sales** - Transaction records
6. **sale_items** - Line items for each sale
7. **corrections** - Error correction requests
8. **payroll** - Payroll tracking
9. **daily_reports** - Automated daily summaries
10. **notifications** - System notifications
11. **shop_settings** - Shop configuration
12. **activity_logs** - Audit trail

### Security:
- Row Level Security (RLS) enabled on all tables
- Policies configured for authenticated users
- Service role has full access

### Automation:
- Auto-update timestamps on record changes
- Auto-decrement inventory on sales
- Auto-calculate customer loyalty points
- Auto-generate low stock notifications
- Auto-generate sale notifications
- Activity logging on all major tables

### Database Functions:
- `generate_daily_report()` - Generate daily sales report
- `update_product_stock_after_sale()` - Manage inventory
- `update_customer_purchases()` - Update customer stats
- `check_low_stock_notification()` - Alert on low stock
- `create_sale_notification()` - Notify admins of sales

## Troubleshooting

**If migration fails:**
1. Check error message in SQL Editor
2. Make sure you're running them in order (001, 002, 003)
3. If a table already exists, you can skip that CREATE TABLE statement
4. For errors like "already exists", it's usually safe to continue

**To reset and start over:**
```sql
-- WARNING: This will delete ALL data!
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS daily_reports CASCADE;
DROP TABLE IF EXISTS payroll CASCADE;
DROP TABLE IF EXISTS corrections CASCADE;
DROP TABLE IF EXISTS sale_items CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS cashiers CASCADE;
DROP TABLE IF EXISTS workers CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS shop_settings CASCADE;
```

Then run the migrations again from step 1.

## Need Help?

If you encounter any issues:
1. Check the Supabase logs in Dashboard → Logs
2. Verify your service role key is correct
3. Make sure you have sufficient permissions
4. Contact support if database issues persist

