# 🔧 Apply Offline Support to All Pages - Complete Guide

## ✅ Pattern to Apply to Every Page

### Step 1: Import the Hook
```typescript
import { useOfflineData } from '../utils/useOfflineData'
```

### Step 2: Replace useState with useOfflineData

**BEFORE:**
```typescript
const [items, setItems] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  loadItems()
}, [])

const loadItems = async () => {
  const response = await dataService.getItems()
  if (response.success) {
    setItems(response.items)
  }
  setLoading(false)
}
```

**AFTER:**
```typescript
const {
  data: items,
  loading,
  isOffline,
  saveData,
  deleteData,
  setData: setItems
} = useOfflineData({
  cacheKey: 'items-cache',
  fetchOnline: async () => {
    const response = await dataService.getItems()
    return response.items || []
  },
  offlineKey: 'products', // Change based on data type
  enableAutoRefresh: true
})
```

### Step 3: Update Save Functions

**BEFORE:**
```typescript
const handleSave = async (item) => {
  const response = await dataService.saveItem(item)
  if (response.success) {
    toast.success("Saved!")
    loadItems()
  }
}
```

**AFTER:**
```typescript
const handleSave = async (item) => {
  const result = await saveData(
    item,
    (data) => dataService.saveItem(data),
    !!item.id // true if editing
  )
  
  if (result.success) {
    toast.success(result.offline 
      ? "📴 Saved offline (will sync when online)" 
      : "✅ Saved successfully"
    )
  } else {
    toast.error("Failed to save")
  }
}
```

### Step 4: Update Delete Functions

**BEFORE:**
```typescript
const handleDelete = async (id) => {
  const response = await dataService.deleteItem(id)
  if (response.success) {
    toast.success("Deleted!")
    loadItems()
  }
}
```

**AFTER:**
```typescript
const handleDelete = async (id) => {
  const result = await deleteData(
    id,
    (itemId) => dataService.deleteItem(itemId)
  )
  
  if (result.success) {
    toast.success("Deleted successfully")
  } else {
    toast.error("Failed to delete")
  }
}
```

### Step 5: Add Offline Indicator (Optional but Recommended)

```typescript
return (
  <div>
    {isOffline && (
      <Alert className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          📴 Offline Mode - Data will sync when connection is restored
        </AlertDescription>
      </Alert>
    )}
    {/* Rest of your UI */}
  </div>
)
```

---

## 📋 Complete Page-by-Page Guide

### 1. CustomersPage.tsx
```typescript
// Change offlineKey to: 'customers'
// Change cacheKey to: 'customers-cache'
// fetchOnline returns: dataService.getCustomers()
```

### 2. SuppliersPage.tsx
```typescript
// Change offlineKey to: 'products' // Suppliers go in products for now
// Change cacheKey to: 'suppliers-cache'
// fetchOnline returns: dataService.getSuppliers()
```

### 3. WorkersPage.tsx
```typescript
// Change offlineKey to: 'workers'
// Change cacheKey to: 'workers-cache'
// fetchOnline returns: dataService.getWorkers()
```

### 4. CorrectionsPage.tsx
```typescript
// Change offlineKey to: 'corrections'
// Change cacheKey to: 'corrections-cache'
// fetchOnline returns: dataService.getCorrections()
```

### 5. OrdersPage.tsx
```typescript
// Change offlineKey to: 'sales' // Orders treated as sales
// Change cacheKey to: 'orders-cache'
// fetchOnline returns: dataService.getOrders()
```

### 6. cashier/POSSection.tsx
```typescript
// For cart items - use localStorage directly
// For completed sales - use offlineKey: 'sales'
// Change cacheKey to: 'pos-sales-cache'
```

### 7. cashier/SalesSection.tsx
```typescript
// Change offlineKey to: 'sales'
// Change cacheKey to: 'sales-cache'
// fetchOnline returns: dataService.getSales()
```

### 8. cashier/InventorySection.tsx
```typescript
// Change offlineKey to: 'products'
// Change cacheKey to: 'inventory-cache'
// fetchOnline returns: dataService.getProducts()
```

### 9. cashier/CustomersSection.tsx
```typescript
// Change offlineKey to: 'customers'
// Change cacheKey to: 'cashier-customers-cache'
// fetchOnline returns: dataService.getCustomers()
```

---

## 🚀 Quick Implementation Script

For each page, follow these exact steps:

1. **Add import** at top of file
2. **Replace useState** with useOfflineData hook
3. **Update save function** to use saveData
4. **Update delete function** to use deleteData
5. **Add offline indicator** (optional)
6. **Remove old loadData function** (hook handles it)

---

## ✅ Testing Checklist

For each updated page:
- [ ] Can add items
- [ ] Can edit items
- [ ] Can delete items
- [ ] Items persist when navigating away
- [ ] Items persist when coming back
- [ ] Works when offline
- [ ] Shows offline indicator when offline
- [ ] Syncs when connection restored

---

## 📊 Progress Tracker

- [x] ProductsPage.tsx
- [ ] CustomersPage.tsx
- [ ] SuppliersPage.tsx  
- [ ] WorkersPage.tsx
- [ ] CorrectionsPage.tsx
- [ ] OrdersPage.tsx
- [ ] PayrollPage.tsx
- [ ] ReportsPage.tsx
- [ ] cashier/POSSection.tsx
- [ ] cashier/SalesSection.tsx
- [ ] cashier/InventorySection.tsx
- [ ] cashier/CustomersSection.tsx

---

## 💡 Pro Tips

1. **Always use the same pattern** - Consistency is key
2. **Test each page** after updating
3. **Check console** for sync messages
4. **Verify localStorage** has the cache
5. **Test offline** by disconnecting WiFi

---

## 🔄 After All Updates

1. Rebuild: `npm run build`
2. Restart: `npx electron .`
3. Test each page systematically
4. Verify data persistence
5. Test offline mode

---

**Ready to apply? Start with the highest priority pages first!**

