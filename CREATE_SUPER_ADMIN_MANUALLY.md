# 🔧 Create Super Admin Account Manually

## **The Issue:**
The Super Admin account was deleted during the data cleanup. We need to create it again.

## **Solution: Create via Supabase Dashboard**

### **Step 1: Go to Supabase Dashboard**
1. Open: https://supabase.com/dashboard/project/cddoboboxeangripcqrn
2. Login to your Supabase account
3. Navigate to your project: `cddoboboxeangripcqrn`

### **Step 2: Go to Authentication**
1. In the left sidebar, click **"Authentication"**
2. Click **"Users"** tab
3. Click **"Add user"** button

### **Step 3: Create Super Admin**
Fill in the form:
- **Email:** `superadmin@rekon360.com`
- **Password:** `admin123`
- **Auto Confirm User:** ✅ Check this box
- **User Metadata (JSON):**
```json
{
  "role": "super_admin",
  "name": "Super Admin"
}
```

### **Step 4: Save**
1. Click **"Create user"**
2. The user will be created and confirmed automatically

### **Step 5: Test Login**
1. Go back to your app
2. Try logging in with:
   - **Email:** `superadmin@rekon360.com`
   - **Password:** `admin123`

---

## **Alternative: Use Supabase CLI**

If you prefer command line:

```bash
# Get your service role key from Supabase Dashboard
# Go to: Settings → API → service_role key

# Then run:
supabase auth admin create-user \
  --email superadmin@rekon360.com \
  --password admin123 \
  --email-confirm \
  --user-metadata '{"role": "super_admin", "name": "Super Admin"}'
```

---

## **Quick Fix Script (If you have service role key):**

If you have your service role key, create a file called `fix-super-admin.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cddoboboxeangripcqrn.supabase.co';
const SERVICE_ROLE_KEY = 'YOUR_SERVICE_ROLE_KEY_HERE'; // Get from Supabase Dashboard

async function createSuperAdmin() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data, error } = await supabase.auth.admin.createUser({
    email: 'superadmin@rekon360.com',
    password: 'admin123',
    email_confirm: true,
    user_metadata: {
      role: 'super_admin',
      name: 'Super Admin'
    }
  });

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('✅ Super Admin created!');
    console.log('Email: superadmin@rekon360.com');
    console.log('Password: admin123');
  }
}

createSuperAdmin();
```

Then run: `node fix-super-admin.js`

---

## **Recommended: Use Dashboard Method**

The **Supabase Dashboard method** is the easiest and most reliable. Just follow Steps 1-5 above.

---

**After creating the account, you should be able to login with:**
- **Email:** `superadmin@rekon360.com`
- **Password:** `admin123`
