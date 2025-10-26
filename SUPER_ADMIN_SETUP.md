# 🚀 Super Admin Setup Guide

## Step 1: Create Auth User in Supabase

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **Users**
3. Click **"Add User"**
4. Fill in:
   - **Email:** `admin@rekon360.com`
   - **Password:** `YourStrongPassword123!`
   - **Confirm:** `false` (skip email confirmation)
5. Click **"Create User"**

## Step 2: Run SQL Setup

1. Go to **SQL Editor** in Supabase
2. Copy and paste the contents of `setup-super-admin.sql`
3. Click **"Run"**

## Step 3: Update User Metadata

Run this SQL to set your role as super_admin:

```sql
UPDATE auth.users 
SET user_metadata = jsonb_set(
    COALESCE(user_metadata, '{}'), 
    '{role}', 
    '"super_admin"'
)
WHERE email = 'admin@rekon360.com';
```

## Step 4: Login to Your App

1. Open your Rekon360 app
2. Login with:
   - **Email:** `admin@rekon360.com`
   - **Password:** `YourStrongPassword123!`
3. You'll see the **Super Admin Panel**!

## 🎯 What You'll Have Access To:

- **All Businesses** - View and manage every business
- **Activate/Deactivate** - Control business access
- **Feature Management** - Toggle features per business
- **Payment Tracking** - Monitor payments and renewals
- **System Statistics** - Revenue and usage analytics
- **Settings Management** - Configure system-wide settings

## 🔧 Super Admin Features:

### Business Management:
- View all businesses and their status
- Activate/deactivate any business
- Toggle features for each business
- Track payment status

### Payment Management:
- Confirm upfront payments
- Track maintenance renewals
- Generate payment reports
- Manage overdue accounts

### System Control:
- Configure pricing plans
- Set sync intervals
- Manage system settings
- Monitor system health

## 🚨 Important Notes:

- **Keep your credentials secure**
- **Regular backups** of the database
- **Monitor system usage** regularly
- **Update pricing** as needed

## 📞 Support:

If you need help with setup, check:
1. Supabase logs for errors
2. Database permissions
3. RLS policies are enabled
4. User metadata is set correctly

---

**🎉 Once setup is complete, you'll have full control over the entire Rekon360 system!**
