# ✅ Deployment Checklist

## 📋 Pre-Deployment

- [ ] Read `MIGRATION_SUMMARY.md` to understand changes
- [ ] Read `VISUAL_GUIDE.md` to see what you'll get
- [ ] Have Supabase URL and Service Role Key ready
- [ ] Backup your database (optional but recommended)

## 🚀 Deployment Steps

### Option A: Automated (Recommended)

1. **Open Migration Tool**
   - [ ] Open `apply-business-details-migration.html` in your browser
   - [ ] Enter your Supabase URL: `https://cddoboboxeangripcqrn.supabase.co`
   - [ ] Enter your Service Role Key (from Supabase Dashboard → Settings → API)

2. **Run Step 1: Add Columns & Enable RLS**
   - [ ] Click "Step 1: Add Columns & Enable RLS" button
   - [ ] Wait for green success message
   - [ ] If it fails, note the error and try Option B

3. **Run Step 2: Update Approval Function**
   - [ ] Click "Step 2: Update Approval Function" button
   - [ ] Wait for green success message
   - [ ] If it fails, note the error and try Option B

4. **Run Step 3: Test Migration**
   - [ ] Click "Step 3: Test Migration" button
   - [ ] Verify all tests pass
   - [ ] Check output for any warnings

### Option B: Manual SQL (If Option A Fails)

1. **Run Migration 028**
   - [ ] Go to Supabase Dashboard
   - [ ] Click SQL Editor
   - [ ] Copy entire contents of `supabase/migrations/028_add_business_details_and_fix_rls.sql`
   - [ ] Paste into SQL Editor
   - [ ] Click Run
   - [ ] Verify "Success" message

2. **Run Migration 029**
   - [ ] In SQL Editor (still open)
   - [ ] Copy entire contents of `supabase/migrations/029_update_approval_function.sql`
   - [ ] Paste into SQL Editor
   - [ ] Click Run
   - [ ] Verify "Success" message

## 🧪 Testing

### Test 1: Verify Columns
- [ ] Go to Supabase Dashboard → Table Editor
- [ ] Open `businesses` table
- [ ] Scroll right to see new columns:
  - [ ] `owner_name`
  - [ ] `owner_phone`
  - [ ] `business_phone`
  - [ ] `business_address`
  - [ ] `city`
  - [ ] `region`
  - [ ] `registration_number`
  - [ ] `tin_number`
  - [ ] `year_established`
  - [ ] `number_of_employees`
  - [ ] `products_count`
  - [ ] `average_monthly_sales`
  - [ ] `business_size`
  - [ ] `business_config`

### Test 2: Verify RLS
- [ ] Go to Supabase Dashboard → Database → Policies
- [ ] Check that `activity_logs` has RLS enabled
- [ ] Check that `backups` has RLS enabled (if table exists)
- [ ] Check that `businesses` has RLS enabled
- [ ] Check that `payments` has RLS enabled
- [ ] No RLS warnings should appear in dashboard

### Test 3: Verify Frontend
- [ ] Open your app in browser
- [ ] Log in as Super Admin
- [ ] Go to Businesses page
- [ ] Click "View" on any business
- [ ] See new "Business Details" tab
- [ ] Click on "Business Details" tab
- [ ] Verify you see all sections:
  - [ ] Owner Information
  - [ ] Business Contact
  - [ ] Location
  - [ ] Registration Details
  - [ ] Business Metrics
  - [ ] Business Description

### Test 4: Test New Signups
- [ ] Log out of Super Admin
- [ ] Go to signup page
- [ ] Create a test business with all details:
  - [ ] Business name: "Test Business"
  - [ ] Owner name: "Test Owner"
  - [ ] Owner phone: "+233 24 000 0000"
  - [ ] Business phone: "+233 30 000 0000"
  - [ ] Address: "123 Test Street"
  - [ ] City: "Accra"
  - [ ] Region: "Greater Accra"
  - [ ] Registration number: "TEST123"
  - [ ] TIN: "T0000000"
  - [ ] Year: 2024
  - [ ] Employees: 10
  - [ ] Products: 50
  - [ ] Monthly sales: 10000
  - [ ] Description: "Test business description"
- [ ] Submit signup
- [ ] Log in as Super Admin
- [ ] Approve the test business
- [ ] View the test business
- [ ] Check "Business Details" tab
- [ ] Verify ALL fields are populated

## 🎯 Success Criteria

All of these should be ✅:

- [ ] No SQL errors during migration
- [ ] All 14 new columns exist in `businesses` table
- [ ] No RLS warnings in Supabase dashboard
- [ ] Super Admin can see "Business Details" tab
- [ ] Existing businesses show data (or "Not provided")
- [ ] New businesses populate all detail fields
- [ ] No TypeScript/linting errors in console
- [ ] No runtime errors in browser console

## 🔄 Rollback (If Needed)

If something goes wrong and you need to rollback:

1. **Remove columns** (SQL Editor):
```sql
ALTER TABLE public.businesses 
DROP COLUMN IF EXISTS owner_name,
DROP COLUMN IF EXISTS owner_phone,
DROP COLUMN IF EXISTS business_phone,
DROP COLUMN IF EXISTS business_address,
DROP COLUMN IF EXISTS city,
DROP COLUMN IF EXISTS region,
DROP COLUMN IF EXISTS registration_number,
DROP COLUMN IF EXISTS tin_number,
DROP COLUMN IF EXISTS year_established,
DROP COLUMN IF EXISTS number_of_employees,
DROP COLUMN IF EXISTS products_count,
DROP COLUMN IF EXISTS average_monthly_sales,
DROP COLUMN IF EXISTS business_size,
DROP COLUMN IF EXISTS business_config;
```

2. **Restore old function** (if you have a backup)
   - Or just keep the new function, it's backwards compatible

3. **Frontend will still work**
   - New fields are optional
   - Will show "Not provided" for missing data

## 📊 Post-Deployment

### Monitoring
- [ ] Check Supabase logs for any errors
- [ ] Monitor Super Admin usage
- [ ] Ask for feedback from Super Admin users

### Optional: Backfill Existing Data
If you have existing businesses with missing data:
- [ ] Contact business admins to update their information
- [ ] Or manually update from business_config JSON in database

### Documentation
- [ ] Update team documentation
- [ ] Train Super Admin users on new tab
- [ ] Document any custom changes made

## 🎉 Deployment Complete!

Once all checkboxes are ✅:
- ✅ Migration successful
- ✅ No RLS warnings
- ✅ Full business details visible
- ✅ System more secure
- ✅ Better business intelligence

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs
3. Review `DATABASE_STATUS_AND_FIXES.md`
4. Review `MIGRATION_SUMMARY.md`
5. Check that Service Role Key has proper permissions

---

**Good luck with your deployment! 🚀**

