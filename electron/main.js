const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'

// Disable hardware acceleration to fix GPU errors
app.disableHardwareAcceleration()

let mainWindow

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    titleBarStyle: 'default',
    show: false
  })

  // Load the app - always load from build folder for desktop
  mainWindow.loadFile(path.join(__dirname, '../build/index.html'))
  
  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Create application menu
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Business',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-business')
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// App event handlers
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Offline data storage with enhanced features
const fs = require('fs')
const os = require('os')
const rekon360Dir = path.join(os.homedir(), '.rekon360')
const offlineDataPath = path.join(rekon360Dir, 'offline-data.json')
const settingsPath = path.join(rekon360Dir, 'settings.json')
const cachePath = path.join(rekon360Dir, 'cache.json')

// Ensure offline data directory exists
const ensureOfflineDir = () => {
  if (!fs.existsSync(rekon360Dir)) {
    fs.mkdirSync(rekon360Dir, { recursive: true })
    console.log('Created Rekon360 data directory:', rekon360Dir)
  }
}

// Load offline data with better error handling
const loadOfflineData = () => {
  try {
    ensureOfflineDir()
    if (fs.existsSync(offlineDataPath)) {
      const data = fs.readFileSync(offlineDataPath, 'utf8')
      const parsed = JSON.parse(data)
      console.log('Loaded offline data:', {
        sales: parsed.sales?.length || 0,
        customers: parsed.customers?.length || 0,
        products: parsed.products?.length || 0,
        workers: parsed.workers?.length || 0
      })
      return parsed
    }
  } catch (error) {
    console.error('Error loading offline data:', error)
    // Create backup if corrupted
    if (fs.existsSync(offlineDataPath)) {
      const backupPath = offlineDataPath + '.backup'
      fs.copyFileSync(offlineDataPath, backupPath)
      console.log('Created backup at:', backupPath)
    }
  }
  return {
    sales: [],
    customers: [],
    products: [],
    workers: [],
    corrections: [],
    lastSync: null,
    pendingSync: [],
    metadata: {
      version: '1.0.0',
      lastModified: new Date().toISOString()
    }
  }
}

// Save offline data with atomic writes
const saveOfflineData = (data) => {
  try {
    ensureOfflineDir()
    
    // Add metadata
    const dataToSave = {
      ...data,
      metadata: {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        itemCount: {
          sales: data.sales?.length || 0,
          customers: data.customers?.length || 0,
          products: data.products?.length || 0,
          workers: data.workers?.length || 0
        }
      }
    }
    
    // Write to temp file first (atomic write)
    const tempPath = offlineDataPath + '.tmp'
    fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2))
    
    // Move temp file to actual file
    fs.renameSync(tempPath, offlineDataPath)
    
    console.log('✅ Offline data saved successfully:', dataToSave.metadata.itemCount)
    return true
  } catch (error) {
    console.error('❌ Error saving offline data:', error)
    return false
  }
}

// Load settings
const loadSettings = () => {
  try {
    ensureOfflineDir()
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading settings:', error)
  }
  return {
    theme: 'system',
    autoSync: true,
    syncInterval: 5,
    notifications: true
  }
}

// Save settings
const saveSettings = (settings) => {
  try {
    ensureOfflineDir()
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
    console.log('Settings saved successfully')
    return true
  } catch (error) {
    console.error('Error saving settings:', error)
    return false
  }
}

// Enhanced IPC Handlers for Desktop App

// Save offline data (can be called anytime, not just when offline)
ipcMain.handle('save-offline-data', async (event, data) => {
  try {
    console.log('💾 Saving offline data:', {
      sales: data.sales?.length || 0,
      customers: data.customers?.length || 0,
      products: data.products?.length || 0,
      workers: data.workers?.length || 0
    })
    
    const offlineData = loadOfflineData()
    
    // Merge new data with existing (avoid duplicates by ID)
    if (data.sales) {
      const existingIds = new Set(offlineData.sales.map(s => s.id))
      data.sales.forEach(sale => {
        if (!existingIds.has(sale.id)) {
          offlineData.sales.push(sale)
        }
      })
    }
    
    if (data.customers) {
      const existingIds = new Set(offlineData.customers.map(c => c.id))
      data.customers.forEach(customer => {
        if (!existingIds.has(customer.id)) {
          offlineData.customers.push(customer)
        }
      })
    }
    
    if (data.products) {
      const existingIds = new Set(offlineData.products.map(p => p.id))
      data.products.forEach(product => {
        if (!existingIds.has(product.id)) {
          offlineData.products.push(product)
        }
      })
    }
    
    if (data.workers) {
      const existingIds = new Set(offlineData.workers.map(w => w.id))
      data.workers.forEach(worker => {
        if (!existingIds.has(worker.id)) {
          offlineData.workers.push(worker)
        }
      })
    }
    
    if (data.corrections) {
      offlineData.corrections = offlineData.corrections || []
      offlineData.corrections.push(...data.corrections)
    }
    
    offlineData.lastSync = new Date().toISOString()
    
    const success = saveOfflineData(offlineData)
    
    return {
      success,
      message: success ? 'Data saved offline successfully' : 'Failed to save data',
      counts: {
        sales: offlineData.sales.length,
        customers: offlineData.customers.length,
        products: offlineData.products.length,
        workers: offlineData.workers.length
      }
    }
  } catch (error) {
    console.error('❌ Error saving offline data:', error)
    return { success: false, message: error.message }
  }
})

// Get offline data
ipcMain.handle('get-offline-data', async () => {
  try {
    const data = loadOfflineData()
    console.log('📂 Retrieved offline data:', {
      sales: data.sales.length,
      customers: data.customers.length,
      products: data.products.length,
      workers: data.workers?.length || 0
    })
    return { success: true, data }
  } catch (error) {
    console.error('❌ Error getting offline data:', error)
    return { success: false, message: error.message, data: null }
  }
})

// Clear offline data after successful sync
ipcMain.handle('clear-offline-data', async () => {
  try {
    const emptyData = {
      sales: [],
      customers: [],
      products: [],
      workers: [],
      corrections: [],
      lastSync: new Date().toISOString(),
      pendingSync: [],
      metadata: {
        version: '1.0.0',
        lastModified: new Date().toISOString()
      }
    }
    const success = saveOfflineData(emptyData)
    console.log('🗑️  Offline data cleared')
    return { success, message: success ? 'Offline data cleared' : 'Failed to clear data' }
  } catch (error) {
    console.error('❌ Error clearing offline data:', error)
    return { success: false, message: error.message }
  }
})

// Get offline data statistics
ipcMain.handle('get-offline-stats', async () => {
  try {
    const data = loadOfflineData()
    return {
      success: true,
      stats: {
        totalRecords: (data.sales?.length || 0) + (data.customers?.length || 0) + (data.products?.length || 0) + (data.workers?.length || 0),
        sales: data.sales?.length || 0,
        customers: data.customers?.length || 0,
        products: data.products?.length || 0,
        workers: data.workers?.length || 0,
        corrections: data.corrections?.length || 0,
        lastSync: data.lastSync,
        hasPendingData: (data.sales?.length + data.customers?.length + data.products?.length) > 0
      }
    }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

// Settings management
ipcMain.handle('get-settings', async () => {
  try {
    const settings = loadSettings()
    return { success: true, settings }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

ipcMain.handle('save-settings', async (event, settings) => {
  try {
    const success = saveSettings(settings)
    return { success, message: success ? 'Settings saved' : 'Failed to save settings' }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

// Export offline data (for backup)
ipcMain.handle('export-offline-data', async () => {
  try {
    const data = loadOfflineData()
    const exportPath = path.join(os.homedir(), 'Downloads', `rekon360-export-${Date.now()}.json`)
    fs.writeFileSync(exportPath, JSON.stringify(data, null, 2))
    return { success: true, path: exportPath }
  } catch (error) {
    return { success: false, message: error.message }
  }
})

// Check connection status
ipcMain.handle('check-connection', async () => {
  try {
    // Simple ping to check internet connectivity
    const https = require('https')
    return new Promise((resolve) => {
      const req = https.get('https://www.google.com', (res) => {
        resolve({ success: true, online: res.statusCode === 200 })
      })
      req.on('error', () => {
        resolve({ success: true, online: false })
      })
      req.setTimeout(5000, () => {
        req.abort()
        resolve({ success: true, online: false })
      })
    })
  } catch (error) {
    return { success: false, online: false }
  }
})

// Auto-sync every 1-5 minutes
setInterval(() => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('auto-sync')
  }
}, 300000) // 5 minute interval for better performance
