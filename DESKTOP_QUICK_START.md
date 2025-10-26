# 🚀 Rekon360 Desktop - Quick Start

## 📦 Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run electron:dev

# Build for production
npm run electron:build
```

---

## 🎯 What You Get

### ✅ Offline Mode
- **Works without internet** - All operations saved locally
- **Auto-sync when online** - Data automatically uploaded to Supabase
- **Zero data loss** - Everything preserved on PC

### ✅ Desktop Features
- **Native app** - No browser required
- **Fast performance** - Local data access
- **System integration** - Native menus, shortcuts
- **Auto-updates ready** - Easy deployment

---

## 📂 Where Data is Stored

```
Windows: C:\Users\<username>\.rekon360\
macOS:   /Users/<username>/.rekon360/
Linux:   /home/<username>/.rekon360/

Files:
  - offline-data.json   (Sales, customers, products)
  - settings.json       (App preferences)
  - cache.json          (Additional cache)
```

---

## 🔄 How It Works

### When Offline:
1. ❌ Internet disconnects
2. 💾 Data saved to PC
3. ✅ User continues working
4. 📊 All changes tracked

### When Online:
1. ✅ Internet reconnects
2. 🔄 Auto-sync triggers
3. ☁️ Data uploads to Supabase
4. 🗑️ Local cache cleared

---

## 🎨 Add Sync Indicator to Your UI

```tsx
import { DesktopSyncIndicator } from './components/DesktopSyncIndicator'

function YourLayout() {
  return (
    <div>
      {/* Your header/navbar */}
      <DesktopSyncIndicator />
    </div>
  )
}
```

Shows:
- 🌐 Online status
- 📊 Pending records count
- 🔄 Sync progress
- ⚙️ Quick actions

---

## 💻 Using Offline APIs

```typescript
import { offlineSync } from './utils/offlineSync'

// Check if desktop app
if (offlineSync.isDesktopApp()) {
  // Desktop-specific features
}

// Save data offline
await offlineSync.saveOffline({
  sales: [sale1, sale2],
  customers: [customer1],
  products: [product1]
})

// Get offline statistics
const stats = await offlineSync.getOfflineStats()
console.log(`Pending: ${stats.totalRecords}`)

// Force manual sync
await offlineSync.forceSync()

// Export data (Desktop only)
await offlineSync.exportOfflineData()

// Check connection
const status = await offlineSync.getConnectionStatus()
```

---

## 🛠️ Build Commands

```bash
# Development (with live reload)
npm run electron:dev

# Build for all platforms
npm run electron:build

# Build for Windows only
npm run electron:dist -- --win

# Build for macOS only
npm run electron:dist -- --mac

# Build for Linux only
npm run electron:dist -- --linux
```

---

## 🧪 Testing

Open `test-desktop-features.html` in the desktop app to test:
- ✅ Platform detection
- ✅ Offline data storage
- ✅ Sync features
- ✅ Data export
- ✅ Connection status
- ✅ Stress tests

---

## 🔧 Configuration

### Sync Interval
Edit `electron/main.js`:
```javascript
setInterval(() => {
  // Change 300000 (5 minutes) to your preference
  mainWindow.webContents.send('auto-sync')
}, 300000)
```

### Data Storage Path
Edit `electron/main.js`:
```javascript
const rekon360Dir = path.join(os.homedir(), '.rekon360')
// Change '.rekon360' to your preferred folder name
```

---

## 📊 Data Types Supported

- ✅ **Sales** - Complete sale records
- ✅ **Customers** - Customer information
- ✅ **Products** - Product catalog
- ✅ **Workers** - Employee data
- ✅ **Corrections** - Stock adjustments

---

## 🐛 Troubleshooting

### "Data not syncing"
```bash
# Check logs
npm run electron:dev
# Look for sync errors in console
```

### "Can't connect to Supabase"
1. Verify `.env` or config has correct Supabase URL
2. Check API keys
3. Test in browser first

### "Offline data corrupted"
1. Go to `~/.rekon360/`
2. Find `offline-data.json.backup`
3. Rename to `offline-data.json`

---

## 🎯 Best Practices

### For Developers
- Always use `offlineSync.saveOffline()` for critical data
- Check `isDesktopApp()` before using desktop features
- Handle sync errors gracefully
- Show sync status to users

### For Deployment
- Test offline mode thoroughly
- Test sync after coming back online
- Verify data integrity
- Include sync indicator in UI
- Provide manual sync option

---

## 📚 Full Documentation

Read `DESKTOP_APP_GUIDE.md` for complete details on:
- Architecture
- API reference
- Security features
- Performance tips
- Advanced configuration

---

## 🎉 You're Ready!

Your app now works offline and syncs automatically! 🚀

### Key Benefits:
- ✅ Reliable in poor connectivity
- ✅ Fast local performance
- ✅ Professional desktop app
- ✅ Zero data loss
- ✅ Happy users!

**Start building:** `npm run electron:dev` 🖥️

