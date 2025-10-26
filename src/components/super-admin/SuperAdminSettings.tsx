import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Switch } from "../ui/switch"
import { Textarea } from "../ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { 
  Settings, 
  DollarSign, 
  Users, 
  Shield, 
  Palette, 
  Download, 
  Upload, 
  RefreshCw,
  Save,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  FileText,
  Database,
  Bell,
  Mail,
  Phone,
  Building2,
  Star,
  Zap,
  Key,
  Copy,
  Plus,
  Trash2
} from "lucide-react"
import { superAdminService, ApiKey } from "../../utils/superAdminService"

interface SuperAdminSettingsProps {
  onRefresh: () => void
}

export function SuperAdminSettings({ onRefresh }: SuperAdminSettingsProps) {
  const [activeTab, setActiveTab] = useState("system")
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showDangerDialog, setShowDangerDialog] = useState(false)

  // API Keys
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false)
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>([])
  const [newKeyRateLimit, setNewKeyRateLimit] = useState("1000")
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // System Settings
  const [syncInterval, setSyncInterval] = useState("5")
  const [reminderDays, setReminderDays] = useState("30")
  const [autoReminders, setAutoReminders] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  // Pricing Settings
  const [basicUpfront, setBasicUpfront] = useState("1500")
  const [basicMaintenance, setBasicMaintenance] = useState("200")
  const [proUpfront, setProUpfront] = useState("3000")
  const [proMaintenance, setProMaintenance] = useState("400")
  const [enterpriseUpfront, setEnterpriseUpfront] = useState("5000")
  const [enterpriseMaintenance, setEnterpriseMaintenance] = useState("800")

  // Roles & Access
  const [superAdminAssistants, setSuperAdminAssistants] = useState(false)
  const [lockDangerousOps, setLockDangerousOps] = useState(true)
  const [requireTwoFactor, setRequireTwoFactor] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState("8")

  // Branding
  const [appName, setAppName] = useState("Rekon360")
  const [appLogo, setAppLogo] = useState("")
  const [primaryColor, setPrimaryColor] = useState("#3b82f6")
  const [secondaryColor, setSecondaryColor] = useState("#64748b")

  // Load API keys on mount
  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    const { data, error } = await superAdminService.getAllApiKeys()
    if (data && !error) {
      setApiKeys(data)
    }
  }

  const handleCreateApiKey = async () => {
    if (!newKeyName || newKeyPermissions.length === 0) {
      alert('Please provide a key name and at least one permission')
      return
    }

    const { data, error } = await superAdminService.createApiKey({
      key_name: newKeyName,
      permissions: newKeyPermissions,
      rate_limit: parseInt(newKeyRateLimit)
    })

    if (error) {
      alert(`Failed to create API key: ${error}`)
    } else if (data) {
      setApiKeys([data, ...apiKeys])
      setShowNewKeyDialog(false)
      setNewKeyName("")
      setNewKeyPermissions([])
      setNewKeyRateLimit("1000")
      setSelectedApiKey(data)
      setShowApiKeyDialog(true)
    }
  }

  const handleDeleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This cannot be undone.')) {
      return
    }

    const { error } = await superAdminService.deleteApiKey(id)
    if (error) {
      alert(`Failed to delete API key: ${error}`)
    } else {
      setApiKeys(apiKeys.filter(k => k.id !== id))
    }
  }

  const handleToggleApiKey = async (id: string, isActive: boolean) => {
    const { error } = await superAdminService.updateApiKey(id, { is_active: !isActive })
    if (error) {
      alert(`Failed to update API key: ${error}`)
    } else {
      setApiKeys(apiKeys.map(k => k.id === id ? { ...k, is_active: !isActive } : k))
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(text)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const togglePermission = (permission: string) => {
    if (newKeyPermissions.includes(permission)) {
      setNewKeyPermissions(newKeyPermissions.filter(p => p !== permission))
    } else {
      setNewKeyPermissions([...newKeyPermissions, permission])
    }
  }

  const handleSaveSettings = () => {
    // TODO: Implement settings save
    console.log('Saving settings...')
  }

  const handleExportConfig = () => {
    // TODO: Implement config export
    console.log('Exporting configuration...')
    setShowExportDialog(false)
  }

  const handleImportConfig = () => {
    // TODO: Implement config import
    console.log('Importing configuration...')
    setShowImportDialog(false)
  }

  const handleDangerousAction = () => {
    // TODO: Implement dangerous action
    console.log('Performing dangerous action...')
    setShowDangerDialog(false)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">System Settings</h2>
          <p className="text-muted-foreground">Configure system behavior, pricing, and access controls</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleSaveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Save All
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
          <TabsTrigger value="system" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">System</TabsTrigger>
          <TabsTrigger value="pricing" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Pricing</TabsTrigger>
          <TabsTrigger value="api" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">API Keys</TabsTrigger>
          <TabsTrigger value="roles" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Roles & Access</TabsTrigger>
          <TabsTrigger value="branding" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Branding</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Configuration
                </CardTitle>
                <CardDescription>Core system settings and behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="sync-interval">Sync Interval (minutes)</Label>
                  <Input
                    id="sync-interval"
                    value={syncInterval}
                    onChange={(e) => setSyncInterval(e.target.value)}
                    placeholder="5"
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">How often to sync data with Supabase</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminder-days">Payment Reminder Days</Label>
                  <Input
                    id="reminder-days"
                    value={reminderDays}
                    onChange={(e) => setReminderDays(e.target.value)}
                    placeholder="30"
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">Days before due date to send reminders</p>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="auto-reminders" className="text-sm font-medium">Auto Reminders</Label>
                    <p className="text-xs text-muted-foreground">Automatically send payment reminders</p>
                  </div>
                  <Switch
                    id="auto-reminders"
                    checked={autoReminders}
                    onCheckedChange={setAutoReminders}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="maintenance-mode" className="text-sm font-medium">Maintenance Mode</Label>
                    <p className="text-xs text-muted-foreground">Temporarily disable system access</p>
                  </div>
                  <Switch
                    id="maintenance-mode"
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Configure system notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Email Notifications</Label>
                      <p className="text-xs text-muted-foreground">Send email alerts for important events</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Payment Alerts</Label>
                      <p className="text-xs text-muted-foreground">Alert on overdue payments</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">System Alerts</Label>
                      <p className="text-xs text-muted-foreground">Alert on system issues</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Feature Updates</Label>
                      <p className="text-xs text-muted-foreground">Notify about new features</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-4 w-4" />
                Pricing Configuration
              </CardTitle>
              <CardDescription className="text-sm">Set pricing for different business plans (hidden from end-users)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2 max-w-2xl mx-auto">
                <Card className="border-blue-200">
                  <CardHeader className="text-center pb-0 px-2 pt-1 flex items-center justify-center">
                    <h3 className="text-lg font-bold text-blue-600 mb-0">Basic</h3>
                  </CardHeader>
                  <CardContent className="space-y-1 p-2">
                    <div className="space-y-1">
                      <Label htmlFor="basic-upfront" className="text-xs">Upfront (₵)</Label>
                      <Input
                        id="basic-upfront"
                        value={basicUpfront}
                        onChange={(e) => setBasicUpfront(e.target.value)}
                        className="w-full h-6 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="basic-maintenance" className="text-xs">Maintenance (₵)</Label>
                      <Input
                        id="basic-maintenance"
                        value={basicMaintenance}
                        onChange={(e) => setBasicMaintenance(e.target.value)}
                        className="w-full h-6 text-xs"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200">
                  <CardHeader className="text-center pb-0 px-2 pt-1 flex items-center justify-center">
                    <h3 className="text-lg font-bold text-purple-600 mb-0">Pro</h3>
                  </CardHeader>
                  <CardContent className="space-y-1 p-2">
                    <div className="space-y-1">
                      <Label htmlFor="pro-upfront" className="text-xs">Upfront (₵)</Label>
                      <Input
                        id="pro-upfront"
                        value={proUpfront}
                        onChange={(e) => setProUpfront(e.target.value)}
                        className="w-full h-6 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="pro-maintenance" className="text-xs">Maintenance (₵)</Label>
                      <Input
                        id="pro-maintenance"
                        value={proMaintenance}
                        onChange={(e) => setProMaintenance(e.target.value)}
                        className="w-full h-6 text-xs"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-amber-200">
                  <CardHeader className="text-center pb-0 px-2 pt-1 flex items-center justify-center">
                    <h3 className="text-lg font-bold text-amber-600 mb-0">Enterprise</h3>
                  </CardHeader>
                  <CardContent className="space-y-1 p-2">
                    <div className="space-y-1">
                      <Label htmlFor="enterprise-upfront" className="text-xs">Upfront (₵)</Label>
                      <Input
                        id="enterprise-upfront"
                        value={enterpriseUpfront}
                        onChange={(e) => setEnterpriseUpfront(e.target.value)}
                        className="w-full h-6 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="enterprise-maintenance" className="text-xs">Maintenance (₵)</Label>
                      <Input
                        id="enterprise-maintenance"
                        value={enterpriseMaintenance}
                        onChange={(e) => setEnterpriseMaintenance(e.target.value)}
                        className="w-full h-6 text-xs"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-base font-semibold mb-3">Current Pricing Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl mx-auto">
                  <div className="p-3 border rounded-lg text-center bg-blue-50">
                    <div className="text-xl font-bold text-blue-600">₵{basicUpfront}</div>
                    <p className="text-sm text-muted-foreground">Basic Upfront</p>
                    <p className="text-xs text-muted-foreground">₵{basicMaintenance}/month</p>
                  </div>
                  <div className="p-3 border rounded-lg text-center bg-purple-50">
                    <div className="text-xl font-bold text-purple-600">₵{proUpfront}</div>
                    <p className="text-sm text-muted-foreground">Pro Upfront</p>
                    <p className="text-xs text-muted-foreground">₵{proMaintenance}/month</p>
                  </div>
                  <div className="p-3 border rounded-lg text-center bg-amber-50">
                    <div className="text-xl font-bold text-amber-600">₵{enterpriseUpfront}</div>
                    <p className="text-sm text-muted-foreground">Enterprise Upfront</p>
                    <p className="text-xs text-muted-foreground">₵{enterpriseMaintenance}/month</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">API Keys Management</h3>
              <p className="text-sm text-muted-foreground">Manage API keys for external integrations</p>
            </div>
            <Button onClick={() => setShowNewKeyDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </div>

          <div className="grid gap-4">
            {apiKeys.map((key) => (
              <Card key={key.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Key className="h-5 w-5 text-blue-500" />
                        <h4 className="font-medium">{key.key_name}</h4>
                        <Badge variant={key.is_active ? "default" : "secondary"}>
                          {key.is_active ? "Active" : "Disabled"}
                        </Badge>
                      </div>
                      
                      <div className="bg-gray-100 p-2 rounded flex items-center gap-2 mb-2">
                        <code className="text-sm font-mono flex-1">
                          {key.key_value.substring(0, 20)}...{key.key_value.substring(key.key_value.length - 10)}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(key.key_value)}
                        >
                          {copiedKey === key.key_value ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {key.permissions.map((perm) => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Rate Limit: {key.rate_limit}/hr</span>
                        <span>Created: {new Date(key.created_at).toLocaleDateString()}</span>
                        {key.last_used && (
                          <span>Last Used: {new Date(key.last_used).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleApiKey(key.id, key.is_active)}
                      >
                        {key.is_active ? (
                          <><Lock className="h-4 w-4 mr-1" /> Disable</>
                        ) : (
                          <><Unlock className="h-4 w-4 mr-1" /> Enable</>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteApiKey(key.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {apiKeys.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-600 mb-2">No API Keys</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first API key to enable external integrations
                  </p>
                  <Button onClick={() => setShowNewKeyDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create API Key
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Access Control
                </CardTitle>
                <CardDescription>Manage user roles and permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Super Admin Assistants</Label>
                      <p className="text-xs text-muted-foreground">Allow assistants to help with admin tasks</p>
                    </div>
                    <Switch
                      checked={superAdminAssistants}
                      onCheckedChange={setSuperAdminAssistants}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Lock Dangerous Operations</Label>
                      <p className="text-xs text-muted-foreground">Require confirmation for destructive actions</p>
                    </div>
                    <Switch
                      checked={lockDangerousOps}
                      onCheckedChange={setLockDangerousOps}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Require Two-Factor Authentication</Label>
                      <p className="text-xs text-muted-foreground">Force 2FA for all admin accounts</p>
                    </div>
                    <Switch
                      checked={requireTwoFactor}
                      onCheckedChange={setRequireTwoFactor}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
                    <Input
                      id="session-timeout"
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      placeholder="8"
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">Auto-logout after inactivity</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>Configure security policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">IP Whitelist</Label>
                      <p className="text-xs text-muted-foreground">Restrict access to specific IP addresses</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Login Attempts Limit</Label>
                      <p className="text-xs text-muted-foreground">Block after failed login attempts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Audit Logging</Label>
                      <p className="text-xs text-muted-foreground">Log all admin actions</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Data Encryption</Label>
                      <p className="text-xs text-muted-foreground">Encrypt sensitive data at rest</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Branding Configuration
              </CardTitle>
              <CardDescription>Customize app appearance and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="app-name">Application Name</Label>
                    <Input
                      id="app-name"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      placeholder="Rekon360"
                    />
                  </div>

                  <div>
                    <Label htmlFor="app-logo">Logo URL</Label>
                    <Input
                      id="app-logo"
                      value={appLogo}
                      onChange={(e) => setAppLogo(e.target.value)}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  <div>
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary-color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        placeholder="#3b82f6"
                      />
                      <div 
                        className="w-10 h-10 border rounded cursor-pointer"
                        style={{ backgroundColor: primaryColor }}
                        onClick={() => {/* TODO: Open color picker */}}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondary-color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        placeholder="#64748b"
                      />
                      <div 
                        className="w-10 h-10 border rounded cursor-pointer"
                        style={{ backgroundColor: secondaryColor }}
                        onClick={() => {/* TODO: Open color picker */}}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Preview</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <div className="w-6 h-6 bg-blue-500 rounded"></div>
                        <span className="text-sm font-medium">{appName}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Colors and branding will appear in the desktop app header and sidebar
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Export Type</Label>
              <Select defaultValue="full">
                <SelectTrigger>
                  <SelectValue placeholder="Select export type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Configuration</SelectItem>
                  <SelectItem value="settings">Settings Only</SelectItem>
                  <SelectItem value="pricing">Pricing Only</SelectItem>
                  <SelectItem value="branding">Branding Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Include Sensitive Data</Label>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="include-sensitive" />
                <Label htmlFor="include-sensitive" className="text-sm">
                  Include API keys and passwords (not recommended for sharing)
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportConfig}>
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Configuration File</Label>
              <Input type="file" accept=".json" />
              <p className="text-xs text-muted-foreground mt-1">
                Select a JSON configuration file to import
              </p>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-600">
                <strong>Note:</strong> This will overwrite current settings. Make sure to backup first.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportConfig}>
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Danger Dialog */}
      <Dialog open={showDangerDialog} onOpenChange={setShowDangerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirm Dangerous Action
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">
              This action will permanently delete all business data, user accounts, and system settings. 
              This cannot be undone.
            </p>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                <strong>Warning:</strong> Type "DELETE ALL DATA" to confirm this action.
              </p>
            </div>
            <Input placeholder="Type DELETE ALL DATA to confirm" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDangerDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDangerousAction}>
              Delete All Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create API Key Dialog */}
      <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Create New API Key
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="key-name">Key Name</Label>
              <Input
                id="key-name"
                placeholder="e.g., Mobile App Integration"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                A descriptive name to identify this key
              </p>
            </div>

            <div>
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {['analytics', 'backup_status', 'realtime_events', 'read_sales', 'write_products', 'manage_customers'].map((perm) => (
                  <div key={perm} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`perm-${perm}`}
                      checked={newKeyPermissions.includes(perm)}
                      onChange={() => togglePermission(perm)}
                      className="rounded"
                    />
                    <Label htmlFor={`perm-${perm}`} className="text-sm font-normal cursor-pointer">
                      {perm.replace(/_/g, ' ')}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Select what this key can access
              </p>
            </div>

            <div>
              <Label htmlFor="rate-limit">Rate Limit (requests/hour)</Label>
              <Input
                id="rate-limit"
                type="number"
                placeholder="1000"
                value={newKeyRateLimit}
                onChange={(e) => setNewKeyRateLimit(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum number of requests per hour
              </p>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-600">
                <strong>Important:</strong> The API key will only be shown once. Make sure to copy and save it securely.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewKeyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateApiKey}>
              <Plus className="h-4 w-4 mr-2" />
              Create Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View API Key Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              API Key Created Successfully
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600 mb-2">
                <strong>Your API Key:</strong>
              </p>
              <div className="bg-white p-3 rounded flex items-center gap-2">
                <code className="text-sm font-mono flex-1 break-all">
                  {selectedApiKey?.key_value}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => selectedApiKey && copyToClipboard(selectedApiKey.key_value)}
                >
                  {copiedKey === selectedApiKey?.key_value ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                <strong>Warning:</strong> This is the only time you'll see this key. Make sure to copy it now!
              </p>
            </div>

            {selectedApiKey && (
              <div className="space-y-2 text-sm">
                <p><strong>Key Name:</strong> {selectedApiKey.key_name}</p>
                <p><strong>Permissions:</strong> {selectedApiKey.permissions.join(', ')}</p>
                <p><strong>Rate Limit:</strong> {selectedApiKey.rate_limit} requests/hour</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowApiKeyDialog(false)}>
              I've Saved the Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
