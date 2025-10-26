import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Textarea } from "./ui/textarea"
import { Badge } from "./ui/badge"
import { Building2, Store, Warehouse, Users, TrendingUp, DollarSign, MapPin } from "lucide-react"

interface BusinessSetupProps {
  onComplete: (businessConfig: BusinessConfig & { accountEmail?: string; accountPassword?: string }) => void
  onBack?: () => void
}

export interface BusinessConfig {
  // Business Basic Info
  businessName: string
  businessType: 'retail' | 'wholesale' | 'manufacturing' | 'restaurant' | 'pharmacy' | 'other'
  businessSize: 'startup' | 'small' | 'medium' | 'enterprise'
  
  // Contact Information
  ownerName: string
  ownerPhone: string
  businessEmail: string
  businessPhone: string
  businessAddress: string
  city: string
  region: string
  
  // Business Details
  registrationNumber: string
  tinNumber: string
  yearEstablished: string
  numberOfEmployees: number
  locationCount: number
  
  // Operations
  description: string
  productsCount: number
  averageMonthlySales: string
  
  // Features & Plan
  selectedFeatures: string[]
  paymentMethod: 'monthly' | 'yearly' | 'one-time'
  dashboardType: 'simple' | 'advanced' | 'enterprise'
}

export function BusinessSetup({ onComplete, onBack }: BusinessSetupProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Business Basic Info
    businessName: "",
    businessType: "" as BusinessConfig['businessType'],
    businessSize: "" as BusinessConfig['businessSize'],
    
    // Contact Information
    ownerName: "",
    ownerPhone: "",
    businessEmail: "",
    businessPhone: "",
    businessAddress: "",
    city: "",
    region: "",
    
    // Business Details
    registrationNumber: "",
    tinNumber: "",
    yearEstablished: "",
    numberOfEmployees: 1,
    locationCount: 1,
    
    // Operations
    description: "",
    productsCount: 0,
    averageMonthlySales: "",
    
    // Account Credentials
    accountEmail: "",
    accountPassword: "",
    confirmPassword: "",
    
    // Features & Plan
    selectedFeatures: [] as string[],
    paymentMethod: "" as 'monthly' | 'yearly' | 'one-time'
  })

  const businessTypes = [
    { value: 'retail', label: 'Retail Store', icon: Store, description: 'Sell products directly to customers' },
    { value: 'wholesale', label: 'Wholesale', icon: Warehouse, description: 'Bulk sales to retailers' },
    { value: 'manufacturing', label: 'Manufacturing', icon: Building2, description: 'Produce and sell products' },
    { value: 'restaurant', label: 'Restaurant', icon: Users, description: 'Food service business' },
    { value: 'pharmacy', label: 'Pharmacy', icon: TrendingUp, description: 'Healthcare and medicine' },
    { value: 'other', label: 'Other', icon: Building2, description: 'Custom business type' }
  ]

  const businessSizes = [
    { value: 'startup', label: 'Startup', description: '1-5 employees, just starting' },
    { value: 'small', label: 'Small Business', description: '6-20 employees' },
    { value: 'medium', label: 'Medium Business', description: '21-50 employees' },
    { value: 'enterprise', label: 'Enterprise', description: '50+ employees' }
  ]

  const ghanaRegions = [
    'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central', 
    'Northern', 'Upper East', 'Upper West', 'Volta', 'Bono', 
    'Bono East', 'Ahafo', 'Savannah', 'North East', 'Oti', 'Western North'
  ]

  const featureGroups = {
    core: {
      title: "Core Features (Included)",
      features: [
        { id: 'dashboard', name: 'Dashboard', description: 'Main business dashboard and overview', price: 0, included: true },
        { id: 'products', name: 'Products', description: 'Product management and inventory', price: 0, included: true },
        { id: 'orders', name: 'Orders', description: 'Order processing and management', price: 0, included: true },
        { id: 'workers', name: 'Workers', description: 'Worker management and administration', price: 0, included: true },
        { id: 'reports', name: 'Reports', description: 'Business reports and analytics', price: 0, included: true },
        { id: 'settings', name: 'Settings', description: 'System settings and configuration', price: 0, included: true }
      ]
    },
    advanced: {
      title: "Advanced Features",
      features: [
        { id: 'customers', name: 'Customers', description: 'Customer management and database', price: 50, included: false },
        { id: 'workers-management', name: 'Workers Management', description: 'Advanced worker management tools', price: 75, included: false },
        { id: 'payroll', name: 'Payroll', description: 'Payroll processing and management', price: 100, included: false },
        { id: 'suppliers', name: 'Suppliers', description: 'Supplier and vendor management', price: 60, included: false },
        { id: 'location-management', name: 'Location Management', description: 'Multi-location business management', price: 80, included: false },
        { id: 'credit-management', name: 'Credit Management', description: 'Customer credit and payment management', price: 90, included: false }
      ]
    },
    enterprise: {
      title: "Enterprise Features",
      features: [
        { id: 'api-access', name: 'API Access', description: 'REST API for custom integrations', price: 200, included: false },
        { id: 'white-label', name: 'White Label', description: 'Custom branding and white-label options', price: 500, included: false },
        { id: 'priority-support', name: 'Priority Support', description: '24/7 priority customer support', price: 300, included: false },
        { id: 'custom-features', name: 'Custom Features', description: 'Tailored features for specific needs', price: 400, included: false },
        { id: 'enterprise-analytics', name: 'Enterprise Analytics', description: 'Advanced enterprise-level analytics', price: 250, included: false }
      ]
    }
  }

  const paymentMethods = [
    { 
      value: 'monthly', 
      label: 'Monthly Payment', 
      description: 'Pay monthly for flexibility',
      discount: '0%',
      color: 'bg-blue-100 text-blue-800'
    },
    { 
      value: 'yearly', 
      label: 'Yearly Payment', 
      description: 'Save 20% with annual billing',
      discount: '20% OFF',
      color: 'bg-green-100 text-green-800'
    },
    { 
      value: 'one-time', 
      label: 'One-time Payment', 
      description: 'Pay once, use forever',
      discount: '50% OFF',
      color: 'bg-purple-100 text-purple-800'
    }
  ]

  const getBusinessConfig = (): BusinessConfig & { accountEmail: string; accountPassword: string } => {
    return {
      ...formData,
      businessSize: formData.businessSize || 'small',
      dashboardType: formData.businessSize === 'enterprise' ? 'enterprise' : 
                     formData.businessSize === 'medium' ? 'advanced' : 'simple',
      accountEmail: formData.accountEmail,
      accountPassword: formData.accountPassword
    }
  }

  const handleNext = () => {
    if (step < 3) {
      // When moving from Step 1 to Step 2, auto-fill account credentials
      if (step === 1) {
        setFormData(prev => ({
          ...prev,
          accountEmail: prev.businessEmail || prev.accountEmail,
          // Keep businessPhone in the phone field for Step 2
        }))
      }
      setStep(step + 1)
    } else {
      onComplete(getBusinessConfig())
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else if (step === 1 && onBack) {
      onBack()
    }
  }

  const renderStep1 = () => (
    <div className="space-y-4 pb-6 max-h-[65vh] overflow-y-auto pr-2">
      <div className="text-center sticky top-0 bg-white z-10 pb-2">
        <h2 className="text-xl font-bold mb-1">Business Information</h2>
        <p className="text-muted-foreground text-xs">Tell us about your business</p>
      </div>

      <div className="space-y-4">
        {/* Business Basic Info */}
        <div className="space-y-3">
          <h3 className="font-semibold text-xs text-primary flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            Basic Information
          </h3>
          
        <div>
            <Label htmlFor="businessName" className="text-xs">Business Name *</Label>
          <Input
            id="businessName"
              placeholder="e.g., Accra Business Center"
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              required
              className="text-sm h-8"
          />
        </div>

        <div>
            <Label htmlFor="description" className="text-xs">Business Description *</Label>
          <Textarea
            id="description"
              placeholder="Brief description..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              required
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="businessType" className="text-xs">Business Type *</Label>
              <Select 
                value={formData.businessType} 
                onValueChange={(value: string) => setFormData({ ...formData, businessType: value as BusinessConfig['businessType'] })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map(type => (
                    <SelectItem key={type.value} value={type.value} className="text-xs">{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="businessSize" className="text-xs">Business Size *</Label>
              <Select 
                value={formData.businessSize} 
                onValueChange={(value: string) => setFormData({ ...formData, businessSize: value as BusinessConfig['businessSize'] })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {businessSizes.map(size => (
                    <SelectItem key={size.value} value={size.value} className="text-xs">{size.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-xs text-primary flex items-center gap-1">
            <Users className="h-3 w-3" />
            Contact Information
          </h3>
          
          <div>
            <Label htmlFor="ownerName" className="text-xs">Owner/Manager Name *</Label>
            <Input
              id="ownerName"
              placeholder="Full name"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              required
              className="text-sm h-8"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="ownerPhone" className="text-xs">Owner Phone *</Label>
              <Input
                id="ownerPhone"
                type="tel"
                placeholder="+233 XX XXX XXXX"
                value={formData.ownerPhone}
                onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                required
                className="text-sm h-8"
              />
            </div>

            <div>
              <Label htmlFor="businessPhone" className="text-xs">Business Phone</Label>
              <Input
                id="businessPhone"
                type="tel"
                placeholder="+233 XX XXX XXXX"
                value={formData.businessPhone}
                onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
                className="text-sm h-8"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="businessEmail" className="text-xs">Business Email</Label>
            <Input
              id="businessEmail"
              type="email"
              placeholder="business@example.com"
              value={formData.businessEmail}
              onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
              className="text-sm h-8"
            />
          </div>
        </div>

        {/* Location Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-xs text-primary flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Location
          </h3>
          
          <div>
            <Label htmlFor="businessAddress" className="text-xs">Business Address *</Label>
            <Input
              id="businessAddress"
              placeholder="Street address"
              value={formData.businessAddress}
              onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
              required
              className="text-sm h-8"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="city" className="text-xs">City/Town *</Label>
              <Input
                id="city"
                placeholder="e.g., Accra"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
                className="text-sm h-8"
              />
            </div>

            <div>
              <Label htmlFor="region" className="text-xs">Region *</Label>
              <Select 
                value={formData.region} 
                onValueChange={(value: string) => setFormData({ ...formData, region: value })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {ghanaRegions.map(region => (
                    <SelectItem key={region} value={region} className="text-xs">{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="space-y-3">
          <h3 className="font-semibold text-xs text-primary flex items-center gap-1">
            <Store className="h-3 w-3" />
            Business Details
          </h3>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="registrationNumber" className="text-xs">Registration Number</Label>
              <Input
                id="registrationNumber"
                placeholder="Company reg. no."
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                className="text-sm h-8"
              />
            </div>

            <div>
              <Label htmlFor="tinNumber" className="text-xs">TIN Number</Label>
              <Input
                id="tinNumber"
                placeholder="Tax identification"
                value={formData.tinNumber}
                onChange={(e) => setFormData({ ...formData, tinNumber: e.target.value })}
                className="text-sm h-8"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="yearEstablished" className="text-xs">Year Est.</Label>
              <Input
                id="yearEstablished"
                type="number"
                placeholder="2020"
                value={formData.yearEstablished}
                onChange={(e) => setFormData({ ...formData, yearEstablished: e.target.value })}
                min="1900"
                max={new Date().getFullYear()}
                className="text-sm h-8"
              />
            </div>

            <div>
              <Label htmlFor="numberOfEmployees" className="text-xs">Employees *</Label>
              <Input
                id="numberOfEmployees"
                type="number"
                placeholder="10"
                value={formData.numberOfEmployees}
                onChange={(e) => setFormData({ ...formData, numberOfEmployees: parseInt(e.target.value) || 1 })}
                min="1"
                required
                className="text-sm h-8"
              />
            </div>

            <div>
              <Label htmlFor="locationCount" className="text-xs">Locations</Label>
              <Input
                id="locationCount"
                type="number"
                placeholder="1"
                value={formData.locationCount}
                onChange={(e) => setFormData({ ...formData, locationCount: parseInt(e.target.value) || 1 })}
                min="1"
                className="text-sm h-8"
              />
            </div>
          </div>
        </div>

        {/* Operations */}
        <div className="space-y-3">
          <h3 className="font-semibold text-xs text-primary flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Operations
          </h3>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="productsCount" className="text-xs">Est. Product Count</Label>
              <Input
                id="productsCount"
                type="number"
                placeholder="100"
                value={formData.productsCount}
                onChange={(e) => setFormData({ ...formData, productsCount: parseInt(e.target.value) || 0 })}
                min="0"
                className="text-sm h-8"
              />
            </div>

            <div>
              <Label htmlFor="averageMonthlySales" className="text-xs">Avg Monthly Sales</Label>
              <Select 
                value={formData.averageMonthlySales} 
                onValueChange={(value: string) => setFormData({ ...formData, averageMonthlySales: value })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-5000" className="text-xs">Below GHS 5K</SelectItem>
                  <SelectItem value="5000-20000" className="text-xs">GHS 5K - 20K</SelectItem>
                  <SelectItem value="20000-50000" className="text-xs">GHS 20K - 50K</SelectItem>
                  <SelectItem value="50000-100000" className="text-xs">GHS 50K - 100K</SelectItem>
                  <SelectItem value="100000+" className="text-xs">Above GHS 100K</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6 pb-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Setup Your Account</h2>
        <p className="text-muted-foreground">Create your admin login credentials</p>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Important:</strong> These credentials will be used to log in to your admin dashboard after your account is activated by the Super Admin.
          </p>
        </div>

        <div>
          <Label htmlFor="accountEmail">Email Address *</Label>
          <Input
            id="accountEmail"
            type="email"
            placeholder="your.email@example.com"
            value={formData.accountEmail}
            onChange={(e) => setFormData({ ...formData, accountEmail: e.target.value })}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">You'll use this email to log in</p>
        </div>

        <div>
          <Label htmlFor="accountPhone">Phone Number (Optional)</Label>
          <Input
            id="accountPhone"
            type="tel"
            placeholder="+233 XX XXX XXXX"
            value={formData.businessPhone}
            onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
          />
          <p className="text-xs text-muted-foreground mt-1">For account recovery and notifications</p>
        </div>

                <div>
          <Label htmlFor="accountPassword">Password *</Label>
          <Input
            id="accountPassword"
            type="password"
            placeholder="Create a strong password (min. 8 characters)"
            value={formData.accountPassword}
            onChange={(e) => setFormData({ ...formData, accountPassword: e.target.value })}
            required
            minLength={8}
          />
          <p className="text-xs text-muted-foreground mt-1">Minimum 8 characters, include letters and numbers</p>
                </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />
          {formData.confirmPassword && formData.accountPassword !== formData.confirmPassword && (
            <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
          )}
              </div>

        <div className="flex items-start space-x-2 pt-4">
          <input type="checkbox" id="terms" className="mt-1" required />
          <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
            I agree to the terms and conditions and privacy policy
          </Label>
            </div>
      </div>
    </div>
  )


  const renderStep3 = () => (
    <div className="space-y-6 pb-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Business Setup Complete!</h2>
        <p className="text-muted-foreground">Your business profile has been created successfully</p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-800">Pending Activation</h3>
            <p className="text-sm text-blue-700 mt-2">
              Your business registration has been submitted successfully. Please contact the Super Admin to activate your account.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Available Plans:</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Basic Plan:</span>
            <span className="font-semibold">₵1,500 + ₵200 maintenance</span>
          </div>
          <div className="flex justify-between">
            <span>Pro Plan:</span>
            <span className="font-semibold">₵3,000 + ₵400 maintenance</span>
          </div>
          <div className="flex justify-between">
            <span>Enterprise Plan:</span>
            <span className="font-semibold">₵5,000 + ₵800 maintenance</span>
          </div>
        </div>
      </div>
    </div>
  )


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Business Setup</CardTitle>
            <div className="flex space-x-2">
              {[1, 2, 3].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    stepNum <= step ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {stepNum}
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          <div className="flex justify-between mt-12">
            <Button 
              variant={step === 1 ? "default" : "outline"} 
              onClick={handleBack}
            >
              Back
            </Button>
            <Button onClick={handleNext} disabled={
              (step === 1 && (!formData.businessName || !formData.description || !formData.ownerName || 
               !formData.ownerPhone || !formData.businessAddress || !formData.city || !formData.region || 
               !formData.businessType || !formData.businessSize || !formData.numberOfEmployees)) ||
              (step === 2 && (!formData.accountEmail || !formData.accountPassword || !formData.confirmPassword ||
               formData.accountPassword !== formData.confirmPassword || formData.accountPassword.length < 8))
            }>
              {step === 3 ? 'Complete Setup' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
