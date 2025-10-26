# 🖥️ Rekon360 Desktop App Guide

## ✅ Desktop-Ready Features

Your Rekon360 app is now fully desktop-ready with the following features:

### 🔌 Offline Support
- **Automatic offline detection** - App detects when internet is unavailable
- **Local data storage** - All data saved to `~/.rekon360/offline-data.json`
- **Deduplication** - Prevents duplicate records when saving offline
- **Atomic writes** - Safe file writing with temporary files
- **Automatic backups** - Corrupted data backed up automatically

### 🔄 Sync Capabilities
- **Auto-sync** - Every 5 minutes when online
- **Manual sync** - Force sync via UI indicator
- **Smart merging** - Avoids duplicates by checking IDs
- **Progress tracking** - Visual indicator shows pending records
- **Sync history** - Track last sync time

### 💾 Data Management
- **Sales** - Save and sync sales offline
- **Customers** - Customer data persists offline
- **Products** - Product catalog available offline
- **Workers** - Worker information cached
- **Corrections** - Stock corrections tracked

### 🎨 Desktop UI Features
- **Sync indicator** - Shows online/offline status
- **Pending count** - Displays unsyncedrecords
- **Quick actions** - Sync, export, clear data
- **Native menus** - File, Edit, View, Window menus
- **Keyboard shortcuts** - Cmd/Ctrl+N, Cmd/Ctrl+Q, etc.

---

## 🚀 Running the Desktop App

### Development Mode
```bash
npm run electron:dev
```
This starts both the Vite dev server and Electron

### Production Build
```bash
npm run electron:build
```
Creates installable packages for your OS

### Platform-Specific Builds
```bash
# Windows (.exe installer)
npm run electron:dist -- --win

# macOS (.dmg)
npm run electron:dist -- --mac

# Linux (.AppImage)
npm run electron:dist -- --linux
```

---

## 📂 Data Storage Locations

### Desktop App Data
```
Windows: C:\Users\<username>\.rekon360\
macOS:   /Users/<username>/.rekon360/
Linux:   /home/<username>/.rekon360/
```

### Files Created
- `offline-data.json` - Cached sales, customers, products, workers
- `settings.json` - App settings (theme, sync interval, etc.)
- `cache.json` - Additional cached data
- `offline-data.json.backup` - Auto-created if data is corrupted

---

## 🎯 How Offline Mode Works

### When You Go Offline:
1. ✅ App detects network loss
2. ✅ Shows "Offline Mode" indicator
3. ✅ All new data saved locally to PC
4. ✅ User can continue working normally
5. ✅ Toast notification: "📴 Offline mode - data will be saved locally"

### When You Come Back Online:
1. ✅ App detects network restoration
2. ✅ Shows "Syncing..." indicator
3. ✅ Uploads all offline data to Supabase
4. ✅ Clears local cache after successful sync
5. ✅ Toast notification: "🌐 Back online! Data synced successfully"

### Auto-Sync:
- Every 5 minutes (configurable)
- Only when online
- Only if there's pending data
- Non-blocking (runs in background)

---

## 🛠️ Desktop API Reference

### For Developers - Using Electron APIs

#### Save Offline Data
```typescript
import { offlineSync } from './utils/offlineSync'

// Save any data offline
await offlineSync.saveOffline({
  sales: [sale1, sale2],
  customers: [customer1],
  products: [product1, product2],
  workers: [worker1]
})
```

#### Get Offline Statistics
```typescript
const stats = await offlineSync.getOfflineStats()
// Returns: {
//   totalRecords: 150,
//   sales: 45,
//   customers: 30,
//   products: 50,
//   workers: 25,
//   lastSync: "2025-10-17T10:30:00Z",
//   hasPendingData: true
// }
```

#### Force Manual Sync
```typescript
const result = await offlineSync.forceSync()
if (result.success) {
  console.log('Sync complete!')
}
```

#### Export Offline Data (Desktop Only)
```typescript
const result = await offlineSync.exportOfflineData()
// Saves to ~/Downloads/rekon360-export-<timestamp>.json
```

#### Check Connection Status
```typescript
const status = await offlineSync.getConnectionStatus()
// Returns: { online: true, lastSync: "..." }
```

#### Check if Desktop App
```typescript
if (offlineSync.isDesktopApp()) {
  // Desktop-specific features
}
```

---

## 🎨 Using the Sync Indicator

### Add to Your Component
```tsx
import { DesktopSyncIndicator } from './components/DesktopSyncIndicator'

function MyApp() {
  return (
    <div>
      {/* Other UI */}
      <DesktopSyncIndicator />
    </div>
  )
}
```

The indicator shows:
- 🌐 **Online** - Green cloud icon
- 📴 **Offline** - Yellow cloud-off icon
- 🔄 **Syncing** - Spinning refresh icon
- 📊 **Pending** - Blue upload icon + count

---

## ⚙️ Configuration

### Electron Main Process
File: `electron/main.js`

Customize:
- Window size/position
- Auto-sync interval (currently 5 minutes)
- File storage paths
- Menu items

### Offline Sync Service
File: `src/utils/offlineSync.ts`

Customize:
- Sync interval
- Data types to cache
- Merge strategies
- Error handling

---

## 🔒 Security Features

### Data Protection
- ✅ Local data stored in user's home directory
- ✅ Atomic file writes prevent corruption
- ✅ Automatic backups of corrupted data
- ✅ No data lost if app crashes

### Access Control
- ✅ Desktop app uses same Supabase auth
- ✅ RLS policies enforced on sync
- ✅ Business isolation maintained
- ✅ Multi-tenancy preserved

---

## 📦 Build Configuration

### Electron Builder Settings
File: `package.json` → `build` section

Current settings:
- **App ID**: com.rekon360.desktop
- **Product Name**: Rekon360
- **Windows**: NSIS installer
- **macOS**: DMG disk image
- **Linux**: AppImage

### Customize Build
```json
{
  "build": {
    "appId": "com.your-company.rekon360",
    "productName": "Your Brand",
    "copyright": "© 2025 Your Company",
    "publish": null
  }
}
```

---

## 🐛 Troubleshooting

### "Data not syncing"
1. Check internet connection
2. Click "Sync Now" in indicator
3. Check console for errors
4. Verify Supabase credentials

### "Offline data lost"
1. Check `~/.rekon360/offline-data.json.backup`
2. Manually restore from backup
3. Report bug if data truly lost

### "App won't build"
1. Run `npm install`
2. Delete `node_modules` and reinstall
3. Check `package.json` dependencies
4. Verify Electron and Electron Builder versions

### "Can't connect to backend"
1. Check Supabase URL in code
2. Verify API keys
3. Check RLS policies
4. Test in browser first

---

## 📊 Performance Tips

### Optimize Sync Performance
- Don't sync too frequently (5 min is good)
- Batch data before syncing
- Use deduplication to avoid duplicates
- Clear old offline data periodically

### Reduce App Size
- Remove unused dependencies
- Use production builds
- Compress assets
- Optimize images

### Improve Offline Experience
- Cache frequently accessed data
- Preload products and customers
- Show helpful offline indicators
- Provide manual sync option

---

## 🎉 Desktop App Benefits

### For Users
- ✅ Works without internet
- ✅ Fast local performance
- ✅ Data always available
- ✅ No browser required
- ✅ Native OS integration
- ✅ Auto-updates possible

### For Business
- ✅ Reliable in poor connectivity
- ✅ Better user experience
- ✅ Professional appearance
- ✅ Easier deployment
- ✅ Works offline in shops
- ✅ Data never lost

---

## 📞 Support

### For Issues
1. Check console logs
2. Check `~/.rekon360/` directory
3. Try clearing offline data
4. Reinstall app
5. Report bug with logs

### For Features
1. Request in GitHub issues
2. Suggest improvements
3. Contribute code
4. Share feedback

---

## 🚀 Next Steps

### After Reading This Guide
1. ✅ Run `npm run electron:dev` to test
2. ✅ Try going offline and creating sales
3. ✅ Come back online and watch sync
4. ✅ Build desktop installer
5. ✅ Deploy to users!

### Recommended Enhancements
- Add update notification system
- Implement auto-updater
- Add more keyboard shortcuts
- Enhance offline indicators
- Add data export scheduling
- Implement conflict resolution

---

**Your desktop app is ready! 🎊**

Users can now work offline, and all data will automatically sync when they reconnect! 🚀

