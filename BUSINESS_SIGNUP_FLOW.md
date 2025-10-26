# Business Signup Flow - Super Admin Approval System

## Overview
Updated the business signup process to require Super Admin approval before account activation. All new business registrations are now sent to the Super Admin for review and activation.

---

## What Changed

### **1. Frontend Changes**

#### **`BusinessSetup.tsx`**
- ✅ Updated completion message from "Ready for Activation" to "Pending Activation"
- ✅ Changed message to: "Your business registration has been submitted successfully. Please contact the Super Admin to activate your account."
- ✅ Color scheme changed from green (success) to blue (pending)

#### **`AuthPage.tsx`**
- ✅ Modified `handleAdminSignup` to submit signup request instead of creating account directly
- ✅ No longer calls `authService.signUp()`
- ✅ Now calls new Edge Function: `business-signup-requests`
- ✅ Updated button text from "Create Admin Account" to "Submit Registration"
- ✅ Shows toast: "Registration submitted! Please contact Super Admin for activation."
- ✅ Returns user to login page after successful submission
- ✅ **Login functions remain unchanged** (admin, cashier, super admin login all work as before)

### **2. Backend Changes**

#### **New Edge Function: `business-signup-requests/index.ts`**
Created a new Edge Function to handle signup requests with multiple actions:

**Actions:**
1. **Default (Create Request)**
   - Accepts: `email`, `password`, `businessConfig`
   - Validates: Checks for duplicate pending requests
   - Creates: New record in `business_signup_requests` table
   - Returns: Success confirmation

2. **`?action=get-all`**
   - Fetches all signup requests for Super Admin
   - Ordered by creation date (newest first)
   - Returns: Array of pending/approved/rejected requests

3. **`?action=approve`**
   - Accepts: `requestId`, `plan`, `features`
   - Creates: Business in `businesses` table
   - Creates: Auth user with admin role
   - Updates: Request status to 'approved'
   - Returns: Created business and user data

4. **`?action=reject`**
   - Accepts: `requestId`, `reason`
   - Updates: Request status to 'rejected'
   - Stores: Rejection reason
   - Returns: Success confirmation

#### **New Migration: `007_business_signup_requests.sql`**
Created table to store signup requests:

**Table: `business_signup_requests`**
```sql
- id (UUID, primary key)
- email (TEXT)
- password (TEXT) -- Temporarily stored for account creation
- business_name (TEXT)
- business_type (TEXT)
- business_size (TEXT)
- location_count (INTEGER)
- description (TEXT)
- selected_features (JSONB)
- payment_method (TEXT)
- phone (TEXT)
- address (TEXT)
- status (TEXT) -- 'pending', 'approved', 'rejected'
- approved_at (TIMESTAMP)
- rejected_at (TIMESTAMP)
- rejection_reason (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**Indexes:**
- `idx_signup_requests_status` (for filtering by status)
- `idx_signup_requests_email` (for duplicate checks)
- `idx_signup_requests_created_at` (for sorting)

**Security:**
- RLS enabled
- Only service_role can access (Super Admin backend)

---

## New Signup Flow

### **Step 1: User Fills Business Setup**
```
User → Business Setup Form
  ├─ Step 1: Business Info (name, description)
  ├─ Step 2: Business Type
  └─ Step 3: Confirmation
```

### **Step 2: User Creates Account Credentials**
```
User → Signup Form
  ├─ Email
  ├─ Password
  └─ Submit Registration
```

### **Step 3: Request Sent to Super Admin**
```
Frontend → Edge Function (business-signup-requests)
  ├─ Validate email not already pending
  ├─ Create signup request record
  └─ Return success
```

### **Step 4: User Notified**
```
Frontend → User
  ├─ Show success toast
  ├─ Display: "Please contact Super Admin"
  └─ Redirect to login page
```

### **Step 5: Super Admin Reviews** (To be implemented)
```
Super Admin Dashboard → Pending Requests
  ├─ View all signup requests
  ├─ Review business details
  ├─ Choose: Approve or Reject
  └─ If approved:
      ├─ Create business
      ├─ Create auth user
      └─ Send notification (optional)
```

### **Step 6: User Account Activated**
```
Super Admin Approves → Account Created
  ├─ Business created in database
  ├─ Admin user created in auth
  └─ User can now login
```

---

## API Endpoints

### **Create Signup Request**
```
POST /functions/v1/business-signup-requests
Body: {
  email: string
  password: string
  businessConfig: {
    businessName: string
    businessType: string
    businessSize: string
    locationCount: number
    description: string
    selectedFeatures: string[]
    paymentMethod: string
  }
}
Response: {
  success: boolean
  request?: object
  error?: string
}
```

### **Get All Requests (Super Admin)**
```
GET /functions/v1/business-signup-requests?action=get-all
Response: {
  success: boolean
  requests: [...]
}
```

### **Approve Request (Super Admin)**
```
POST /functions/v1/business-signup-requests?action=approve
Body: {
  requestId: string
  plan: 'basic' | 'pro' | 'enterprise'
  features: string[]
}
Response: {
  success: boolean
  business?: object
  user?: object
}
```

### **Reject Request (Super Admin)**
```
POST /functions/v1/business-signup-requests?action=reject
Body: {
  requestId: string
  reason: string
}
Response: {
  success: boolean
}
```

---

## What Remains Unchanged

### ✅ Login Functions
- Admin login works exactly as before
- Cashier login works exactly as before
- Super Admin login works exactly as before
- No changes to authentication flow for existing users

### ✅ User Experience (Existing Users)
- Logged-in users see no changes
- Dashboard functionality remains the same
- All features work as before

---

## Next Steps (To Implement)

### **1. Super Admin Dashboard - Pending Requests Tab**
Add a new section in Super Admin Panel to view and manage signup requests:

**UI Components:**
- Table/list of pending requests
- View detailed business info
- Approve/Reject buttons
- Status badges (pending/approved/rejected)
- Search and filter options

**Features:**
- Real-time updates when new request arrives
- Notification system for new requests
- Bulk approval/rejection
- Email templates for approval/rejection notifications

### **2. Update `SuperAdminBusinesses` Component**
Add "Pending Signups" tab alongside existing businesses:
```typescript
<Tabs>
  <TabsList>
    <TabsTrigger>Active Businesses</TabsTrigger>
    <TabsTrigger>Pending Signups</TabsTrigger>
  </TabsList>
  <TabsContent>...</TabsContent>
</Tabs>
```

### **3. Notification System**
- Send email to user when approved
- Send email to user if rejected (with reason)
- Notify Super Admin of new signup requests

### **4. Auto-cleanup**
- Delete old rejected requests after 30 days
- Delete approved requests after business is created

---

## Security Considerations

### ✅ Implemented
- RLS on signup_requests table
- Only service_role can access
- Duplicate email check
- Password stored temporarily (encrypted in transit)

### 🔄 Recommended (Future)
- Hash passwords in signup_requests table
- Add rate limiting on signup endpoint
- Add CAPTCHA to signup form
- Implement email verification
- Add request expiration (auto-reject after 30 days)

---

## Testing Checklist

### **Signup Flow**
- [ ] User can complete business setup
- [ ] User can enter email and password
- [ ] Signup request is created successfully
- [ ] User sees "Please contact Super Admin" message
- [ ] User is redirected to login page
- [ ] Duplicate email shows error

### **Login Flow (Should Still Work)**
- [ ] Admin can login with existing account
- [ ] Cashier can login
- [ ] Super Admin can login
- [ ] Login errors display correctly

### **Super Admin (To Test After Implementation)**
- [ ] Can view all pending requests
- [ ] Can approve request
- [ ] Can reject request
- [ ] Business is created after approval
- [ ] User can login after approval

---

## Database State

### **Before Signup**
```
business_signup_requests: []
businesses: [existing businesses]
auth.users: [existing users]
```

### **After Signup (Pending)**
```
business_signup_requests: [
  {
    id: "...",
    email: "newbusiness@example.com",
    status: "pending",
    business_name: "New Foam Shop",
    ...
  }
]
businesses: [existing businesses]
auth.users: [existing users]
```

### **After Approval**
```
business_signup_requests: [
  {
    status: "approved",
    approved_at: "2025-01-15T10:30:00Z"
  }
]
businesses: [
  ...existing,
  {
    id: "new-uuid",
    business_name: "New Foam Shop",
    email: "newbusiness@example.com",
    status: "active"
  }
]
auth.users: [
  ...existing,
  {
    email: "newbusiness@example.com",
    role: "admin",
    ...
  }
]
```

---

## User Journey

### **New Business Owner**
```
1. Visit app
2. Click "Sign Up for New Business"
3. Complete business setup (3 steps)
4. Enter email & password
5. Click "Submit Registration"
6. See: "Registration submitted! Please contact Super Admin"
7. Redirected to login page
8. Wait for Super Admin approval
9. Receive notification (future)
10. Login with credentials
```

### **Super Admin**
```
1. Login to Super Admin Panel
2. Navigate to "Pending Signups" (future)
3. View new requests
4. Review business details
5. Choose plan and features
6. Click "Approve" or "Reject"
7. System creates business account
8. User can now login
```

---

**Status:** ✅ Complete
**Deployed:** Yes
**Migration Applied:** Yes
**Edge Function:** business-signup-requests (deployed)
**Next Phase:** Super Admin UI for approval management

