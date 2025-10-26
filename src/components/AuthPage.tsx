import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Building2, CreditCard, AlertCircle, UserPlus, MapPin, Edit } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"
import { Badge } from "./ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { BusinessSetup, BusinessConfig } from "./BusinessSetup"
import { authService } from "../utils/authService"
import { projectId, publicAnonKey } from "../utils/supabase/info"
import { toast } from "sonner"

interface AuthPageProps {
  onLogin: (role: 'admin' | 'cashier' | 'super_admin', userInfo: any, accessToken: string) => void
  onBusinessSetupComplete?: (config: BusinessConfig & { accountEmail?: string; accountPassword?: string }) => void
}

export function AuthPage({ onLogin, onBusinessSetupComplete }: AuthPageProps) {
  const [showBusinessSetup, setShowBusinessSetup] = useState(false)
  
  const [adminCredentials, setAdminCredentials] = useState({
    email: '',
    password: ''
  })
  
  const [superAdminCredentials, setSuperAdminCredentials] = useState({
    email: '',
    password: ''
  })
  
  const [cashierCredentials, setCashierCredentials] = useState({
    shopId: '',
    cashierId: '',
    password: ''
  })

  const [setupForm, setSetupForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [setupDialogOpen, setSetupDialogOpen] = useState(false)

  const handleBusinessSetupComplete = async (config: BusinessConfig & { accountEmail?: string; accountPassword?: string }) => {
    setShowBusinessSetup(false)
    onBusinessSetupComplete?.(config)
    
    // Submit registration immediately with the credentials from setup
    setLoading(true)
    setError(null)
    
    try {
      console.log('Submitting signup request:', {
        email: config.accountEmail,
        businessConfig: config
      })
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/business-signup-requests`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            action: 'submit-request',
            email: config.accountEmail,
            password: config.accountPassword,
            businessConfig: config
          })
        }
      )

      const result = await response.json()
      console.log('Signup response:', result)

      if (result.success) {
        toast.success("Registration submitted! Please contact Super Admin for activation.")
        handleBackToLogin()
      } else {
        setError(result.error || 'Signup request failed')
      }
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.message || 'Signup request failed')
    } finally {
      setLoading(false)
    }
  }


  const handleBackToLogin = () => {
    setShowBusinessSetup(false)
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const { user, error: authError, accessToken } = await authService.signIn(
        adminCredentials.email,
        adminCredentials.password
      )

      if (authError || !user) {
        setError(authError || 'Login failed')
        setLoading(false)
        return
      }

      if (user.role !== 'admin') {
        setError('Access denied. Admin credentials required.')
        await authService.signOut()
        setLoading(false)
        return
      }

      onLogin('admin', user, accessToken || '')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSuperAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const { user, error: authError, accessToken } = await authService.signIn(
        superAdminCredentials.email,
        superAdminCredentials.password
      )

      if (authError || !user) {
        setError(authError || 'Login failed')
        setLoading(false)
        return
      }

      if (user.role !== 'super_admin') {
        setError('Access denied. Super Admin credentials required.')
        await authService.signOut()
        setLoading(false)
        return
      }

      onLogin('super_admin', user, accessToken || '')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }


  const handleCashierLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      // Construct email from cashier credentials
      const email = `${cashierCredentials.cashierId.toLowerCase()}@${cashierCredentials.shopId.toLowerCase().replace(/\s/g, '')}.local`
      
      console.log('=== Attempting Cashier Login ===')
      console.log('Shop ID (raw):', cashierCredentials.shopId)
      console.log('Cashier ID (raw):', cashierCredentials.cashierId)
      console.log('Constructed email:', email)
      console.log('Password length:', cashierCredentials.password.length)
      
      const { user, error: authError, accessToken } = await authService.signIn(
        email,
        cashierCredentials.password
      )

      if (authError || !user) {
        console.error('❌ Login failed')
        console.error('Error:', authError)
        console.error('User object:', user)
        
        // Call debug endpoint to help diagnose the issue
        try {
          const debugResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-86b98184/auth/debug-cashier`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicAnonKey}`
              },
              body: JSON.stringify({
                shopId: cashierCredentials.shopId,
                cashierId: cashierCredentials.cashierId
              })
            }
          )
          const debugData = await debugResponse.json()
          console.log('Debug info:', debugData)
          
          if (!debugData.found) {
            setError(`Cashier ID "${cashierCredentials.cashierId}" not found. Available IDs: ${debugData.availableCashierIds?.join(', ') || 'none'}`)
          } else if (debugData.supabaseError) {
            setError(`Authentication system error: ${debugData.supabaseError}. Please contact admin.`)
          } else {
            setError('Invalid credentials. Please check your Shop ID, Cashier ID, and Password.')
          }
        } catch (debugError) {
          console.error('Debug endpoint error:', debugError)
          setError('Invalid credentials. Please check your Shop ID, Cashier ID, and Password.')
        }
        
        setLoading(false)
        return
      }
      
      console.log('✅ Login successful')
      console.log('User role:', user.role)
      console.log('User active status:', user.active)

      if (user.role !== 'cashier') {
        setError('Access denied. Cashier credentials required.')
        await authService.signOut()
        setLoading(false)
        return
      }

      if (!user.active) {
        setError('Your account has been deactivated. Please contact your administrator.')
        await authService.signOut()
        setLoading(false)
        return
      }

      onLogin('cashier', user, accessToken || '')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (setupForm.password !== setupForm.confirmPassword) {
      toast.error("Passwords don't match!")
      return
    }

    if (setupForm.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-86b98184/auth/create-admin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            email: setupForm.email,
            password: setupForm.password,
            name: setupForm.name
          })
        }
      )

      const data = await response.json()

      if (data.success) {
        toast.success("Admin account created successfully! You can now log in.")
        setSetupDialogOpen(false)
        setAdminCredentials({
          email: setupForm.email,
          password: setupForm.password
        })
        setSetupForm({
          email: '',
          password: '',
          confirmPassword: '',
          name: ''
        })
      } else {
        toast.error(data.error || "Failed to create admin account")
      }
    } catch (error: any) {
      toast.error("Error creating admin account: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Show business setup first for new users
  if (showBusinessSetup) {
    return <BusinessSetup onComplete={handleBusinessSetupComplete} onBack={handleBackToLogin} />
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center space-y-1">
          <h1 className="text-xl text-gray-900">Business Manager</h1>
          <p className="text-sm text-gray-600">Digital Sales & Management System</p>
        </div>

        <Card className="compact-card">
          <CardHeader className="compact-card-header">
            <CardTitle className="text-lg">Login to Dashboard</CardTitle>
            <CardDescription className="text-sm">Select your role to continue</CardDescription>
          </CardHeader>
          <CardContent className="compact-card-content">
            <Tabs defaultValue="cashier" className="compact-spacing">
              <TabsList className="grid w-full grid-cols-3 h-8">
                <TabsTrigger value="cashier" className="flex items-center gap-1 text-sm h-6">
                  <CreditCard className="h-3 w-3" />
                  Cashier
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-1 text-sm h-6">
                  <Building2 className="h-3 w-3" />
                  Admin
                </TabsTrigger>
                <TabsTrigger value="super-admin" className="flex items-center gap-1 text-sm h-6">
                  <UserPlus className="h-3 w-3" />
                  Super Admin
                </TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mb-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="cashier">
                <form onSubmit={handleCashierLogin} className="compact-form">
                  <div className="space-y-1">
                    <Label htmlFor="shopId" className="text-sm">Shop ID</Label>
                    <Input
                      id="shopId"
                      placeholder="e.g., SHOP001"
                      value={cashierCredentials.shopId}
                      onChange={(e) => setCashierCredentials(prev => ({ ...prev, shopId: e.target.value }))}
                      className="compact-input"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cashierId" className="text-sm">Cashier ID</Label>
                    <Input
                      id="cashierId"
                      placeholder="e.g., CSH123456"
                      value={cashierCredentials.cashierId}
                      onChange={(e) => setCashierCredentials(prev => ({ ...prev, cashierId: e.target.value }))}
                      className="compact-input"
                      required
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Will login as: {cashierCredentials.cashierId.toLowerCase()}@{cashierCredentials.shopId.toLowerCase().replace(/\s/g, '')}.local
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cashierPassword" className="text-sm">Password</Label>
                    <Input
                      id="cashierPassword"
                      type="password"
                      placeholder="Enter password"
                      value={cashierCredentials.password}
                      onChange={(e) => setCashierCredentials(prev => ({ ...prev, password: e.target.value }))}
                      className="compact-input"
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full compact-button" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login as Cashier'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="compact-form">
                  <div className="space-y-1">
                    <Label htmlFor="adminEmail" className="text-sm">Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      placeholder="admin@business.com"
                      value={adminCredentials.email}
                      onChange={(e) => setAdminCredentials(prev => ({ ...prev, email: e.target.value }))}
                      className="compact-input"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="adminPassword" className="text-sm">Password</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      placeholder="Enter password"
                      value={adminCredentials.password}
                      onChange={(e) => setAdminCredentials(prev => ({ ...prev, password: e.target.value }))}
                      className="compact-input"
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full compact-button" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login as Admin'}
                  </Button>
                </form>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-center text-gray-600 mb-3">Don't have an account?</p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full compact-button"
                    onClick={() => setShowBusinessSetup(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Sign Up for New Business
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="super-admin">
                <form onSubmit={handleSuperAdminLogin} className="compact-form">
                  <div className="space-y-1">
                    <Label htmlFor="superAdminEmail" className="text-sm">Email</Label>
                    <Input
                      id="superAdminEmail"
                      type="email"
                      placeholder="admin@rekon360.com"
                      value={superAdminCredentials.email}
                      onChange={(e) => setSuperAdminCredentials(prev => ({ ...prev, email: e.target.value }))}
                      className="compact-input"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="superAdminPassword" className="text-sm">Password</Label>
                    <Input
                      id="superAdminPassword"
                      type="password"
                      placeholder="Enter password"
                      value={superAdminCredentials.password}
                      onChange={(e) => setSuperAdminCredentials(prev => ({ ...prev, password: e.target.value }))}
                      className="compact-input"
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full compact-button" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login as Super Admin'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>


          </CardContent>
        </Card>
      </div>
    </div>
  )
}