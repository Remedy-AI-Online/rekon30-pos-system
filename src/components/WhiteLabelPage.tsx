import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { 
  Shield, 
  Upload,
  Palette,
  Globe,
  Mail,
  Smartphone,
  Save,
  Eye,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"

export function WhiteLabelPage() {
  const [branding, setBranding] = useState({
    companyName: "",
    tagline: "",
    primaryColor: "",
    secondaryColor: "",
    accentColor: "",
    logoUrl: "",
    faviconUrl: "",
    customDomain: "",
    supportEmail: "",
    companyWebsite: ""
  })

  const [emailTemplates, setEmailTemplates] = useState({
    welcomeSubject: "",
    welcomeBody: "",
    orderConfirmationSubject: "",
    orderConfirmationBody: "",
    passwordResetSubject: "",
    passwordResetBody: ""
  })

  const [mobileApp, setMobileApp] = useState({
    appName: "",
    bundleId: "",
    appIconUrl: "",
    splashScreenUrl: "",
    primaryColor: "",
    accentColor: ""
  })

  const handleSaveBranding = () => {
    toast.success("Branding settings saved successfully")
  }

  const handleSaveEmailTemplates = () => {
    toast.success("Email templates saved successfully")
  }

  const handleSaveMobileApp = () => {
    toast.success("Mobile app settings saved successfully")
  }

  const handleFileUpload = (field: string) => {
    // Simulate file upload
    toast.success("File uploaded successfully")
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 h-full overflow-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Shield className="h-7 w-7" />
            White Label Settings
          </h1>
          <p className="text-muted-foreground">Customize your brand identity and appearance</p>
        </div>
      </div>

      {/* Alert */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="flex items-start gap-3 pt-6">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Enterprise Feature</p>
            <p>White label branding allows you to completely customize the platform with your own brand identity. Changes will be reflected across all user interfaces.</p>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="branding" className="space-y-4">
        <TabsList>
          <TabsTrigger value="branding">Brand Identity</TabsTrigger>
          <TabsTrigger value="domain">Domain & URLs</TabsTrigger>
          <TabsTrigger value="email">Email Templates</TabsTrigger>
          <TabsTrigger value="mobile">Mobile App</TabsTrigger>
        </TabsList>

        {/* Brand Identity Tab */}
        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Brand Identity
              </CardTitle>
              <CardDescription>Customize your company's visual identity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={branding.companyName}
                      onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      value={branding.tagline}
                      onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Logo & Assets */}
              <div className="space-y-4">
                <h3 className="font-semibold">Logo & Assets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Company Logo</Label>
                    <div className="flex items-center gap-2 mt-2">
                      {branding.logoUrl && (
                        <div className="w-16 h-16 border rounded flex items-center justify-center bg-muted">
                          <img src={branding.logoUrl} alt="Logo" className="max-w-full max-h-full" />
                        </div>
                      )}
                      <Button variant="outline" onClick={() => handleFileUpload('logo')}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 200x200px, PNG or SVG
                    </p>
                  </div>
                  <div>
                    <Label>Favicon</Label>
                    <div className="flex items-center gap-2 mt-2">
                      {branding.faviconUrl && (
                        <div className="w-8 h-8 border rounded flex items-center justify-center bg-muted">
                          <img src={branding.faviconUrl} alt="Favicon" className="max-w-full max-h-full" />
                        </div>
                      )}
                      <Button variant="outline" onClick={() => handleFileUpload('favicon')}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Favicon
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 32x32px, PNG or ICO
                    </p>
                  </div>
                </div>
              </div>

              {/* Color Scheme */}
              <div className="space-y-4">
                <h3 className="font-semibold">Color Scheme</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={branding.primaryColor}
                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={branding.primaryColor}
                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={branding.secondaryColor}
                        onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={branding.secondaryColor}
                        onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="accentColor"
                        type="color"
                        value={branding.accentColor}
                        onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={branding.accentColor}
                        onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={handleSaveBranding}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Domain & URLs Tab */}
        <TabsContent value="domain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Custom Domain
              </CardTitle>
              <CardDescription>Configure your custom domain and URLs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customDomain">Custom Domain</Label>
                  <Input
                    id="customDomain"
                    placeholder="app.yourdomain.com"
                    value={branding.customDomain}
                    onChange={(e) => setBranding({ ...branding, customDomain: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Point your domain's CNAME record to: app.foamshop.com
                  </p>
                </div>

                <div>
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    placeholder="support@yourdomain.com"
                    value={branding.supportEmail}
                    onChange={(e) => setBranding({ ...branding, supportEmail: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="companyWebsite">Company Website</Label>
                  <Input
                    id="companyWebsite"
                    type="url"
                    placeholder="https://www.yourdomain.com"
                    value={branding.companyWebsite}
                    onChange={(e) => setBranding({ ...branding, companyWebsite: e.target.value })}
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">DNS Configuration</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>To use a custom domain, add the following CNAME record:</p>
                  <code className="block bg-white p-2 rounded">
                    CNAME: app → app.foamshop.com
                  </code>
                  <p className="mt-2">SSL certificates will be automatically provisioned once DNS is configured.</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveBranding}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Domain Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Templates Tab */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Templates
              </CardTitle>
              <CardDescription>Customize email templates sent to users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Welcome Email</h4>
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="welcomeSubject">Subject Line</Label>
                      <Input
                        id="welcomeSubject"
                        value={emailTemplates.welcomeSubject}
                        onChange={(e) => setEmailTemplates({ ...emailTemplates, welcomeSubject: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="welcomeBody">Email Body</Label>
                      <Textarea
                        id="welcomeBody"
                        rows={4}
                        value={emailTemplates.welcomeBody}
                        onChange={(e) => setEmailTemplates({ ...emailTemplates, welcomeBody: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Order Confirmation</h4>
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="orderSubject">Subject Line</Label>
                      <Input
                        id="orderSubject"
                        value={emailTemplates.orderConfirmationSubject}
                        onChange={(e) => setEmailTemplates({ ...emailTemplates, orderConfirmationSubject: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="orderBody">Email Body</Label>
                      <Textarea
                        id="orderBody"
                        rows={4}
                        value={emailTemplates.orderConfirmationBody}
                        onChange={(e) => setEmailTemplates({ ...emailTemplates, orderConfirmationBody: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Password Reset</h4>
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="resetSubject">Subject Line</Label>
                      <Input
                        id="resetSubject"
                        value={emailTemplates.passwordResetSubject}
                        onChange={(e) => setEmailTemplates({ ...emailTemplates, passwordResetSubject: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="resetBody">Email Body</Label>
                      <Textarea
                        id="resetBody"
                        rows={4}
                        value={emailTemplates.passwordResetBody}
                        onChange={(e) => setEmailTemplates({ ...emailTemplates, passwordResetBody: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-semibold mb-2">Available Variables:</p>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <code>{"{{company_name}}"}</code>
                  <code>{"{{user_name}}"}</code>
                  <code>{"{{user_email}}"}</code>
                  <code>{"{{order_id}}"}</code>
                  <code>{"{{reset_link}}"}</code>
                  <code>{"{{support_email}}"}</code>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveEmailTemplates}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Templates
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mobile App Tab */}
        <TabsContent value="mobile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Mobile App Branding
              </CardTitle>
              <CardDescription>Customize your mobile app appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="appName">App Name</Label>
                    <Input
                      id="appName"
                      value={mobileApp.appName}
                      onChange={(e) => setMobileApp({ ...mobileApp, appName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bundleId">Bundle ID</Label>
                    <Input
                      id="bundleId"
                      value={mobileApp.bundleId}
                      onChange={(e) => setMobileApp({ ...mobileApp, bundleId: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>App Icon</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="outline" onClick={() => handleFileUpload('appIcon')}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Icon
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 1024x1024px, PNG
                    </p>
                  </div>
                  <div>
                    <Label>Splash Screen</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="outline" onClick={() => handleFileUpload('splashScreen')}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Splash Screen
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 1242x2688px, PNG
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="appPrimaryColor">Primary Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="appPrimaryColor"
                        type="color"
                        value={mobileApp.primaryColor}
                        onChange={(e) => setMobileApp({ ...mobileApp, primaryColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={mobileApp.primaryColor}
                        onChange={(e) => setMobileApp({ ...mobileApp, primaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="appAccentColor">Accent Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="appAccentColor"
                        type="color"
                        value={mobileApp.accentColor}
                        onChange={(e) => setMobileApp({ ...mobileApp, accentColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={mobileApp.accentColor}
                        onChange={(e) => setMobileApp({ ...mobileApp, accentColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveMobileApp}>
                  <Save className="h-4 w-4 mr-2" />
                  Save App Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

