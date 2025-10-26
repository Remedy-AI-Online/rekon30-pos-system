import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { 
  Key, 
  Plus, 
  Copy, 
  Eye, 
  EyeOff, 
  Trash2, 
  RefreshCw,
  Code,
  Book,
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react"
import { toast } from "sonner"

interface APIKey {
  id: string
  name: string
  key: string
  createdAt: string
  lastUsed: string | null
  requests: number
  status: 'active' | 'revoked'
}

interface APILog {
  id: string
  endpoint: string
  method: string
  status: number
  timestamp: string
  responseTime: number
}

export function APIAccessPage() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  
  const [apiLogs, setApiLogs] = useState<APILog[]>([])

  const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")

  const handleGenerateKey = () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for the API key")
      return
    }

    const newKey: APIKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: null,
      requests: 0,
      status: 'active'
    }

    setApiKeys([...apiKeys, newKey])
    toast.success("API key generated successfully")
    setDialogOpen(false)
    setNewKeyName("")
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast.success("API key copied to clipboard")
  }

  const handleRevokeKey = (keyId: string) => {
    const confirmed = window.confirm("Are you sure you want to revoke this API key? This action cannot be undone.")
    if (!confirmed) return

    setApiKeys(apiKeys.map(k => k.id === keyId ? { ...k, status: 'revoked' } : k))
    toast.success("API key revoked")
  }

  const toggleShowKey = (keyId: string) => {
    setShowKey({ ...showKey, [keyId]: !showKey[keyId] })
  }

  const maskKey = (key: string) => {
    return key.substring(0, 12) + '•'.repeat(key.length - 12)
  }

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
      : <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Revoked</Badge>
  }

  const getMethodBadge = (method: string) => {
    const config: { [key: string]: string } = {
      GET: "bg-blue-100 text-blue-800",
      POST: "bg-green-100 text-green-800",
      PUT: "bg-yellow-100 text-yellow-800",
      DELETE: "bg-red-100 text-red-800"
    }
    return <Badge className={config[method] || ""}>{method}</Badge>
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-green-600"
    if (status >= 400 && status < 500) return "text-yellow-600"
    if (status >= 500) return "text-red-600"
    return "text-gray-600"
  }

  const totalRequests = apiKeys.reduce((sum, key) => sum + key.requests, 0)
  const activeKeys = apiKeys.filter(k => k.status === 'active').length

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 h-full overflow-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Zap className="h-7 w-7" />
            API Access
          </h1>
          <p className="text-muted-foreground">Manage API keys and monitor usage</p>
        </div>
        
        <div className="ml-auto">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate New Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate New API Key</DialogTitle>
              <DialogDescription>
                Create a new API key for your application
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="keyName">API Key Name</Label>
                <Input
                  id="keyName"
                  placeholder="e.g., Production API, Mobile App"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerateKey}>
                Generate Key
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeKeys}</div>
            <p className="text-xs text-muted-foreground">
              {apiKeys.length} total keys
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Rate Limit</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10,000</div>
            <p className="text-xs text-muted-foreground">
              Per hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">65ms</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="keys" className="space-y-4">
        <TabsList>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="logs">Request Logs</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage your API keys for accessing the REST API</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{key.name}</p>
                        <p className="text-sm text-muted-foreground">Created {key.createdAt}</p>
                      </div>
                      {getStatusBadge(key.status)}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono">
                        {showKey[key.id] ? key.key : maskKey(key.key)}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleShowKey(key.id)}
                      >
                        {showKey[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyKey(key.key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {key.status === 'active' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevokeKey(key.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{key.requests.toLocaleString()} requests</span>
                      {key.lastUsed && <span>Last used: {key.lastUsed}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Request Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Request Logs</CardTitle>
              <CardDescription>Recent API requests and their responses</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Response Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">{log.timestamp}</TableCell>
                      <TableCell>{getMethodBadge(log.method)}</TableCell>
                      <TableCell>
                        <code className="text-sm">{log.endpoint}</code>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </TableCell>
                      <TableCell>{log.responseTime}ms</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                API Documentation
              </CardTitle>
              <CardDescription>Learn how to integrate with our REST API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Authentication</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Include your API key in the Authorization header:
                </p>
                <code className="block bg-muted p-3 rounded text-sm">
                  Authorization: Bearer sk_live_your_api_key_here
                </code>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Base URL</h3>
                <code className="block bg-muted p-3 rounded text-sm">
                  https://api.yourapp.com/v1
                </code>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Example Request</h3>
                <code className="block bg-muted p-3 rounded text-sm whitespace-pre">
{`GET /api/products
Authorization: Bearer sk_live_your_api_key_here
Content-Type: application/json`}
                </code>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Rate Limits</h3>
                <p className="text-sm text-muted-foreground">
                  • 10,000 requests per hour<br />
                  • 1,000 requests per minute<br />
                  • Rate limit headers included in all responses
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Available Endpoints</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    {getMethodBadge('GET')}
                    <code>/api/products</code>
                    <span className="text-muted-foreground">- Get all products</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getMethodBadge('POST')}
                    <code>/api/products</code>
                    <span className="text-muted-foreground">- Create product</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getMethodBadge('GET')}
                    <code>/api/orders</code>
                    <span className="text-muted-foreground">- Get all orders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getMethodBadge('POST')}
                    <code>/api/orders</code>
                    <span className="text-muted-foreground">- Create order</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getMethodBadge('GET')}
                    <code>/api/customers</code>
                    <span className="text-muted-foreground">- Get all customers</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

