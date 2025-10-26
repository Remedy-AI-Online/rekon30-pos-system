const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Offline data management
  saveOfflineData: (data) => ipcRenderer.invoke('save-offline-data', data),
  getOfflineData: () => ipcRenderer.invoke('get-offline-data'),
  clearOfflineData: () => ipcRenderer.invoke('clear-offline-data'),
  getOfflineStats: () => ipcRenderer.invoke('get-offline-stats'),
  exportOfflineData: () => ipcRenderer.invoke('export-offline-data'),
  
  // Settings management
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  
  // Connection status
  checkConnection: () => ipcRenderer.invoke('check-connection'),
  
  // Event listeners
  onAutoSync: (callback) => {
    const subscription = (event) => callback(event)
    ipcRenderer.on('auto-sync', subscription)
    return () => ipcRenderer.removeListener('auto-sync', subscription)
  },
  
  onMenuNewBusiness: (callback) => {
    const subscription = (event) => callback(event)
    ipcRenderer.on('menu-new-business', subscription)
    return () => ipcRenderer.removeListener('menu-new-business', subscription)
  },
  
  // Utility
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  isDesktop: () => true // Always true in Electron context
})
