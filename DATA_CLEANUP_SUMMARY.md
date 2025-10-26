# Data Cleanup Summary

## Overview
Created a complete system to remove all admin and cashier data while preserving Super Admin functionality.

---

## Files Created

### 1. **clear-admin-cashier-auth.js**
- **Purpose:** Removes all admin and cashier users from Supabase Auth
- **Preserves:** Super Admin accounts
- **Technology:** Node.js script using Supabase Admin API
- **Requirements:** Service Role Key

### 2. **clear-admin-cashier-data.sql**
- **Purpose:** Removes all business-related data from database
- **Tables Cleared:**
  - `businesses`
  - `products`
  - `customers`
  - `workers`
  - `sales`
  - `payroll`
  - `payments`
  - `backup_records`
  - `locations`
  - `business_feature_log`
- **Preserves:** Super Admin data, schema, custom features, API keys

### 3. **clear-admin-cashier-data.bat**
- **Purpose:** Windows batch script for easy one-click execution
- **Features:**
  - Checks for service role key
  - Runs both auth and data cleanup
  - Error handling
  - User-friendly prompts

### 4. **CLEAR_DATA_GUIDE.md**
- **Purpose:** Comprehensive documentation
- **Includes:**
  - Step-by-step instructions
  - Prerequisites
  - Troubleshooting guide
  - Verification queries
  - Safety features
  - Quick reset commands

---

## How to Use

### Quick Start (Windows)

1. **Set Service Role Key:**
   ```powershell
   $env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
   ```

2. **Run Cleanup:**
   ```powershell
   .\clear-admin-cashier-data.bat
   ```

### Quick Start (Linux/Mac)

1. **Set Service Role Key:**
   ```bash
   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
   ```

2. **Run Cleanup:**
   ```bash
   node clear-admin-cashier-auth.js
   supabase db execute -f clear-admin-cashier-data.sql
   ```

---

## What Gets Deleted

### ✅ Authentication (Supabase Auth)
- All `admin` users
- All `cashier` users
- **Preserved:** `super_admin` users

### ✅ Database Tables
- All business records
- All products/inventory
- All customers
- All workers/employees
- All sales transactions
- All payroll records
- All payment records
- All backup records
- All location data
- All feature change logs

### ❌ NOT Deleted
- Super Admin users
- Super Admin authentication
- Database schema/structure
- Custom feature definitions
- API key definitions
- Table structure

---

## Safety Features

1. **Super Admin Protection**
   - Script explicitly skips `super_admin` role users
   - Never touches Super Admin data

2. **Confirmation Prompts**
   - Batch script requires user confirmation
   - Clear warnings before execution

3. **Transaction Safety**
   - SQL script uses BEGIN/COMMIT for atomic operations
   - Rollback on errors

4. **Detailed Logging**
   - Shows exactly what's being deleted
   - Counts deleted vs skipped items
   - Clear success/error messages

5. **Verification Queries**
   - Included in SQL script
   - Easy to confirm cleanup success

---

## Use Cases

### 1. **Development Reset**
Clear all test data and start fresh with a clean database.

### 2. **Demo Environment**
Reset demo data after presentations or testing.

### 3. **Staging to Production**
Clean staging environment before syncing production data.

### 4. **Bug Testing**
Reproduce issues in a clean environment.

### 5. **Audit Cleanup**
Remove old/invalid business data while preserving system structure.

---

## Workflow

```
┌─────────────────────────────────────┐
│  1. Set Service Role Key            │
│     (Environment Variable)          │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  2. Run Auth Cleanup Script         │
│     (clear-admin-cashier-auth.js)   │
│     - Deletes admin users           │
│     - Deletes cashier users         │
│     - Preserves super_admin         │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  3. Run Database Cleanup Script     │
│     (clear-admin-cashier-data.sql)  │
│     - Deletes all business data     │
│     - Preserves schema              │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  4. Verify Cleanup                  │
│     - Run verification queries      │
│     - Check counts = 0              │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  5. System Ready                    │
│     - Clean state                   │
│     - Super Admin intact            │
│     - Ready for new data            │
└─────────────────────────────────────┘
```

---

## Technical Details

### Authentication Cleanup
- Uses `supabase.auth.admin.listUsers()` to get all users
- Filters by `user_metadata.role`
- Calls `supabase.auth.admin.deleteUser()` for admin/cashier
- Requires Service Role Key (elevated permissions)

### Database Cleanup
- Deletes in proper order (child tables first)
- Uses `DELETE FROM` for each table
- Respects foreign key constraints
- Transaction-wrapped for safety

---

## Error Handling

### Common Errors

1. **"Service role key not set"**
   - **Fix:** Set the environment variable correctly

2. **"Permission denied"**
   - **Fix:** Use service_role key, not anon key

3. **"Foreign key constraint"**
   - **Fix:** Run SQL script (it deletes in correct order)

4. **"User not found"**
   - **Fix:** User might already be deleted, safe to ignore

---

## Post-Cleanup State

After running the cleanup scripts:

```
Database State:
├── Super Admin Data ✅ (Intact)
│   ├── Super Admin users
│   ├── API keys table structure
│   └── Custom features table structure
│
├── Admin Data ❌ (Cleared)
│   ├── Admin users → DELETED
│   ├── Businesses → DELETED
│   ├── Products → DELETED
│   ├── Customers → DELETED
│   └── Workers → DELETED
│
├── Cashier Data ❌ (Cleared)
│   ├── Cashier users → DELETED
│   ├── Sales → DELETED
│   └── Payments → DELETED
│
└── System Structure ✅ (Intact)
    ├── Database schema
    ├── Tables (empty)
    ├── Functions
    └── Policies
```

---

## Best Practices

1. **Always backup first** (even though you're clearing, have a restore point)
2. **Test in staging** before running in production
3. **Verify counts** after cleanup
4. **Document the cleanup** (date, reason, who ran it)
5. **Clear browser cache** (localStorage) after cleanup

---

## Maintenance

### When to Use
- Monthly cleanup in development
- After major testing phases
- Before major releases
- When resetting demo environments

### When NOT to Use
- In production with live businesses
- Without proper backups
- Without Super Admin access verification

---

## Integration with System

These cleanup scripts work with:
- ✅ Super Admin Panel (remains functional)
- ✅ Business signup (can create new businesses after)
- ✅ Feature management (structure intact)
- ✅ Backup system (structure intact)
- ✅ API security (keys preserved)

---

**Created:** Today
**Status:** Ready for use
**Version:** 1.0

