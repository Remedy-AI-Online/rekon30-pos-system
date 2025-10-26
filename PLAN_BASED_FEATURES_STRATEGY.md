# 📋 Plan-Based Features Strategy

## 🎯 **Recommended Approach: Hybrid Dynamic System**

### **Core Principle:**
- Each plan has **default features**
- Super Admin can **customize per business**
- Features cached for **offline access**
- Real-time updates when **online**

---

## 📊 **Feature Matrix:**

### **Basic Plan (₵0 - ₵50/month)**
**Target:** Single location, 1-5 employees, startup businesses

**Default Features:**
- ✅ Inventory Management (Core)
- ✅ Sales & POS (Core)
- ✅ Worker Management (Core)
- ✅ Basic Reports (Core)
- ❌ Customer Management (Add-on: +₵10/month)
- ❌ Multi-Location (Requires Pro)
- ❌ Advanced Analytics (Requires Pro)
- ❌ API Access (Requires Enterprise)

**Use Case:**
- Small foam shop
- Single owner + 2-3 workers
- Walk-in sales only
- Basic inventory tracking

---

### **Pro Plan (₵50 - ₵200/month)**
**Target:** Growing businesses, 5-20 employees, multiple products

**Default Features:**
- ✅ Everything in Basic
- ✅ Customer Management (Included)
- ✅ Advanced Analytics (Included)
- ✅ Email Reports (Included)
- ✅ Loyalty Programs (Included)
- ✅ Multi-Location (Up to 3 locations)
- ❌ API Access (Requires Enterprise)
- ❌ White Label (Requires Enterprise)
- ❌ Priority Support (Requires Enterprise)

**Use Case:**
- Chain of 2-3 shops
- Customer loyalty programs
- Need analytics for decisions
- Email reports to owner

---

### **Enterprise Plan (₵200+/month)**
**Target:** Large businesses, 20+ employees, complex needs

**Default Features:**
- ✅ Everything in Pro
- ✅ Unlimited Locations
- ✅ API Access (Full REST API)
- ✅ White Label (Custom branding)
- ✅ Priority Support (24/7)
- ✅ Custom Features (On request)
- ✅ Advanced Integrations
- ✅ Dedicated Account Manager

**Use Case:**
- Large chains (10+ locations)
- Custom integrations needed
- High-volume sales
- Enterprise requirements

---

## 🔄 **Feature Lifecycle:**

### **1. Signup Flow:**
```
Step 1: Business Details (name, type, size)
  ↓
Step 2: Select Plan (Basic/Pro/Enterprise)
  ↓
Step 3: Review Features (show what they get)
  ↓
Step 4: Account Creation
  ↓
Step 5: Pending Super Admin Approval
  ↓
Step 6: Approval → Features Assigned
```

### **2. Feature Assignment:**
```javascript
// On approval, Super Admin can:
function approveBusinessSignup(requestId, plan) {
  const defaultFeatures = PLAN_FEATURES[plan];
  
  // Create business with default features
  const business = {
    plan: plan,
    features: defaultFeatures,
    customFeatures: [] // Super Admin can add later
  };
  
  // Create admin user with feature metadata
  const adminUser = {
    email: request.email,
    user_metadata: {
      business_id: business.id,
      plan: plan,
      features: defaultFeatures
    }
  };
}
```

### **3. Feature Updates:**
```javascript
// Super Admin enables new feature
function enableFeature(businessId, featureId) {
  // 1. Update business record
  business.features.push(featureId);
  
  // 2. Update all users for this business
  updateAllBusinessUsers(businessId, {
    features: business.features
  });
  
  // 3. Broadcast update (if users online)
  broadcastFeatureUpdate(businessId, featureId);
}
```

---

## 💾 **Offline Strategy:**

### **1. Feature Caching:**
```typescript
// On login (online)
interface UserFeatureCache {
  plan: 'basic' | 'pro' | 'enterprise';
  features: string[];
  businessId: string;
  lastSync: string;
  expiresAt: string; // Cache for 24 hours
}

// Save to localStorage
localStorage.setItem('rekon360-features', JSON.stringify({
  plan: "basic",
  features: ["inventory", "sales", "workers", "reports"],
  businessId: "abc-123",
  lastSync: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 24*60*60*1000).toISOString()
}));
```

### **2. Offline Behavior:**
```javascript
// Check if online
if (navigator.onLine) {
  // Fetch latest features from server
  const features = await fetchBusinessFeatures();
  updateFeatureCache(features);
} else {
  // Use cached features
  const cached = getFeatureCacheOrDefault();
  showFeaturesFromCache(cached);
}
```

### **3. Sync on Reconnect:**
```javascript
window.addEventListener('online', async () => {
  console.log('Back online! Syncing features...');
  
  const cachedFeatures = getFeatureCache();
  const serverFeatures = await fetchBusinessFeatures();
  
  if (hasFeatureChanges(cachedFeatures, serverFeatures)) {
    updateFeatureCache(serverFeatures);
    reloadSidebar(); // Show new features
    toast.success('New features available!');
  }
});
```

---

## 🎨 **Dynamic Sidebar Implementation:**

### **Current Implementation (Static):**
```typescript
// src/components/Sidebar.tsx (OLD)
const menuItems = [
  { id: "dashboard", label: "Dashboard", show: true },
  { id: "products", label: "Inventory", show: true },
  { id: "orders", label: "Sales", show: true },
  { id: "workers", label: "Workers", show: true },
  { id: "reports", label: "Reports", show: true },
  { id: "customers", label: "Customers", show: false } // Hardcoded!
];
```

### **New Implementation (Dynamic):**
```typescript
// src/components/Sidebar.tsx (NEW)
interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  user?: any;
  userFeatures?: string[]; // From auth or cache
}

export function Sidebar({ activeSection, setActiveSection, user, userFeatures }: SidebarProps) {
  const allMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, feature: null }, // Always show
    { id: "products", label: "Inventory", icon: Package, feature: "inventory" },
    { id: "orders", label: "Sales", icon: ShoppingCart, feature: "sales" },
    { id: "workers", label: "Workers", icon: UserPlus, feature: "workers" },
    { id: "reports", label: "Reports", icon: BarChart3, feature: "reports" },
    { id: "customers", label: "Customers", icon: Users, feature: "customers" },
    { id: "locations", label: "Locations", icon: MapPin, feature: "multi-location" },
    { id: "analytics", label: "Analytics", icon: Building2, feature: "analytics" },
    { id: "settings", label: "Settings", icon: Settings, feature: null } // Always show
  ];

  // Filter menu items based on user features
  const menuItems = allMenuItems.filter(item => {
    // Always show items without feature requirement
    if (!item.feature) return true;
    
    // Show if user has this feature
    return userFeatures?.includes(item.feature);
  });

  return (
    // ... render filtered menuItems
  );
}
```

---

## 🔧 **Implementation Steps:**

### **Phase 1: Update Approval Function** ✅
```sql
-- supabase/migrations/018_plan_based_features.sql
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'basic' CHECK (plan IN ('basic', 'pro', 'enterprise'));

-- Update approve_business_signup to assign features
CREATE OR REPLACE FUNCTION approve_business_signup(p_request_id UUID)
RETURNS JSON AS $$
DECLARE
  request_record business_signup_requests%ROWTYPE;
  new_business_id UUID;
  default_features JSONB;
  business_plan TEXT;
BEGIN
  -- Get the request
  SELECT * INTO request_record
  FROM business_signup_requests
  WHERE id = p_request_id AND status = 'pending';

  -- Determine plan from business config
  business_plan := COALESCE(request_record.business_config->>'plan', 'basic');
  
  -- Assign default features based on plan
  IF business_plan = 'enterprise' THEN
    default_features := '["inventory", "sales", "workers", "reports", "customers", "analytics", "multi-location", "api-access"]'::jsonb;
  ELSIF business_plan = 'pro' THEN
    default_features := '["inventory", "sales", "workers", "reports", "customers", "analytics"]'::jsonb;
  ELSE
    default_features := '["inventory", "sales", "workers", "reports"]'::jsonb;
  END IF;

  -- Create business with features
  INSERT INTO businesses (
    business_name,
    email,
    business_type,
    plan,
    features,
    status
  ) VALUES (
    request_record.business_config->>'businessName',
    request_record.email,
    request_record.business_config->>'businessType',
    business_plan,
    default_features,
    'active'
  ) RETURNING id INTO new_business_id;

  -- Continue with approval...
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **Phase 2: Update Frontend Auth**
```typescript
// src/utils/authService.ts
export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (data.user) {
    // Fetch business features
    const { data: business } = await supabase
      .from('businesses')
      .select('plan, features')
      .eq('id', data.user.user_metadata.business_id)
      .single();

    // Cache features
    if (business) {
      localStorage.setItem('rekon360-features', JSON.stringify({
        plan: business.plan,
        features: business.features || [],
        lastSync: new Date().toISOString()
      }));
    }
  }

  return { data, error };
}
```

### **Phase 3: Update App Component**
```typescript
// src/App.tsx
function App() {
  const [userFeatures, setUserFeatures] = useState<string[]>([]);

  useEffect(() => {
    // Load features from cache or server
    const cached = localStorage.getItem('rekon360-features');
    if (cached) {
      const { features } = JSON.parse(cached);
      setUserFeatures(features);
    }

    // Subscribe to feature updates
    const channel = supabase
      .channel('feature-updates')
      .on('broadcast', { event: 'feature-update' }, (payload) => {
        if (payload.business_id === user?.user_metadata?.business_id) {
          setUserFeatures(payload.features);
          localStorage.setItem('rekon360-features', JSON.stringify({
            features: payload.features,
            lastSync: new Date().toISOString()
          }));
          toast.success('New features available!');
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  return (
    <Sidebar 
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      user={user}
      userFeatures={userFeatures} // Pass to sidebar
    />
  );
}
```

---

## 📱 **Offline Desktop App Considerations:**

### **Electron Feature Sync:**
```javascript
// electron/main.js
// Store features in local SQLite
ipcMain.handle('sync-features', async (event, businessId) => {
  try {
    // If online, fetch from server
    const response = await fetch(`${API_URL}/businesses/${businessId}/features`);
    const { features, plan } = await response.json();
    
    // Save to local DB
    db.run(`
      UPDATE business_settings 
      SET features = ?, plan = ?, last_sync = ?
      WHERE business_id = ?
    `, [JSON.stringify(features), plan, Date.now(), businessId]);
    
    return { features, plan };
  } catch (error) {
    // Offline - return cached features
    const cached = db.get(`
      SELECT features, plan 
      FROM business_settings 
      WHERE business_id = ?
    `, businessId);
    
    return cached;
  }
});
```

---

## 🎯 **Recommended Workflow:**

### **For Basic Plan Businesses:**
```
1. Signup → Select "Basic Plan"
2. Get approved → Receive 4 features
3. Use offline → Features work
4. Want customers? → Contact Super Admin
5. Super Admin enables "customers" → Appears after refresh
```

### **For Pro Plan Businesses:**
```
1. Signup → Select "Pro Plan"
2. Get approved → Receive 6 features
3. All features work offline
4. Auto-renewal → Keep all features
```

### **For Upgrades:**
```
1. Basic user wants upgrade
2. Contacts Super Admin
3. Super Admin changes plan: basic → pro
4. Super Admin enables new features
5. User refreshes → Sees new features
6. Works offline with new features
```

---

## ✅ **Summary:**

**Use Dynamic Sidebar with:**
1. ✅ Default features per plan
2. ✅ Super Admin can customize
3. ✅ Features cached for offline
4. ✅ Real-time updates when online
5. ✅ Flexible upgrades/downgrades

**Don't use:**
- ❌ Hardcoded features
- ❌ Setup-only selection
- ❌ No offline support

**This gives you:**
- Maximum flexibility
- Works offline
- Easy upgrades
- Custom per-business
- Production-ready

---

**Ready to implement? Let me know and I'll code it!** 🚀

