import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Badge } from "./ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { 
  Target, 
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Code,
  DollarSign,
  Calendar,
  Send
} from "lucide-react"
import { toast } from "sonner"
import { dataService } from "../utils/dataService"

interface CustomFeature {
  id: string
  title: string
  description: string
  businessValue: string
  status: 'submitted' | 'reviewing' | 'approved' | 'in-development' | 'completed' | 'rejected'
  priority: 'low' | 'medium' | 'high'
  estimatedCost: number
  estimatedTime: string
  submittedDate: string
  updatedDate: string
}

export function CustomFeaturesPage() {
  const [features, setFeatures] = useState<CustomFeature[]>([])
  const [loading, setLoading] = useState(true)

  // Load custom features on component mount
  useEffect(() => {
    loadCustomFeatures()
  }, [])

  const loadCustomFeatures = async () => {
    try {
      setLoading(true)
      console.log("Loading custom features...")
      const response = await dataService.getCustomFeatures()
      console.log("Custom features response:", response)
      if (response.success) {
        setFeatures(response.features || [])
        console.log("Features loaded:", response.features)
      } else {
        console.error("Error loading custom features:", response.error)
        // Don't show error toast for empty results, just set empty array
        setFeatures([])
      }
    } catch (error) {
      console.error("Error loading custom features:", error)
      // For now, just set empty array instead of showing error
      setFeatures([])
      console.log("Using empty features array as fallback")
    } finally {
      setLoading(false)
    }
  }

  const [dialogOpen, setDialogOpen] = useState(false)
  const [newFeature, setNewFeature] = useState({
    title: "",
    description: "",
    businessValue: "",
    priority: "medium" as CustomFeature['priority']
  })

  const handleSubmitFeature = async () => {
    if (!newFeature.title || !newFeature.description || !newFeature.businessValue) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      console.log("Submitting custom feature:", newFeature)
      const response = await dataService.submitCustomFeature({
        title: newFeature.title,
        description: newFeature.description,
        businessValue: newFeature.businessValue,
        priority: newFeature.priority
      })
      console.log("Submit response:", response)
      
      if (response.success) {
        // Reload features to get the latest data
        await loadCustomFeatures()
        toast.success("Custom feature request submitted successfully")
        setDialogOpen(false)
        setNewFeature({ title: "", description: "", businessValue: "", priority: "medium" })
      } else {
        toast.error(response.error || "Failed to submit custom feature request")
      }
    } catch (error) {
      console.error("Error submitting custom feature:", error)
      // For now, add to local state as fallback
      const feature: CustomFeature = {
        id: `CF-${Date.now()}`,
        title: newFeature.title,
        description: newFeature.description,
        businessValue: newFeature.businessValue,
        status: 'submitted',
        priority: newFeature.priority,
        estimatedCost: 0,
        estimatedTime: 'TBD',
        submittedDate: new Date().toISOString().split('T')[0],
        updatedDate: new Date().toISOString().split('T')[0]
      }
      
      setFeatures([feature, ...features])
      toast.success("Custom feature request submitted (saved locally)")
      setDialogOpen(false)
      setNewFeature({ title: "", description: "", businessValue: "", priority: "medium" })
    }
  }

  const getStatusBadge = (status: string) => {
    const config: { [key: string]: { label: string, icon: any, className: string } } = {
      submitted: { label: "Submitted", icon: Clock, className: "bg-blue-100 text-blue-800" },
      reviewing: { label: "Reviewing", icon: AlertCircle, className: "bg-yellow-100 text-yellow-800" },
      approved: { label: "Approved", icon: CheckCircle, className: "bg-green-100 text-green-800" },
      'in-development': { label: "In Development", icon: Code, className: "bg-purple-100 text-purple-800" },
      completed: { label: "Completed", icon: CheckCircle, className: "bg-green-100 text-green-800" },
      rejected: { label: "Rejected", icon: AlertCircle, className: "bg-red-100 text-red-800" }
    }
    const { label, icon: Icon, className } = config[status]
    return (
      <Badge className={className}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const config: { [key: string]: { label: string, className: string } } = {
      high: { label: "High", className: "bg-red-100 text-red-800" },
      medium: { label: "Medium", className: "bg-yellow-100 text-yellow-800" },
      low: { label: "Low", className: "bg-blue-100 text-blue-800" }
    }
    const { label, className } = config[priority]
    return <Badge className={className}>{label}</Badge>
  }

  const submittedFeatures = features.filter(f => f.status === 'submitted' || f.status === 'reviewing').length
  const inDevelopment = features.filter(f => f.status === 'in-development').length
  const completed = features.filter(f => f.status === 'completed').length

  if (loading) {
    return (
      <div className="p-4 md:p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading custom features...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 h-full overflow-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Target className="h-7 w-7" />
            Custom Features
          </h1>
          <p className="text-muted-foreground">Request and track custom feature development</p>
        </div>
        
        <div className="ml-auto">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Request Custom Feature
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Request Custom Feature</DialogTitle>
              <DialogDescription>
                Describe your custom feature requirement and our team will review it
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Feature Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief title for the feature"
                  value={newFeature.title}
                  onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  rows={5}
                  placeholder="Describe the feature in detail - what it should do, how it should work, etc."
                  value={newFeature.description}
                  onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="businessValue">Business Value *</Label>
                <Textarea
                  id="businessValue"
                  rows={3}
                  placeholder="Explain how this feature will benefit your business (e.g., increase sales, reduce costs, improve efficiency)"
                  value={newFeature.businessValue}
                  onChange={(e) => setNewFeature({ ...newFeature, businessValue: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newFeature.priority} onValueChange={(value: CustomFeature['priority']) => setNewFeature({ ...newFeature, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Nice to have</SelectItem>
                    <SelectItem value="medium">Medium - Important for growth</SelectItem>
                    <SelectItem value="high">High - Critical for operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitFeature}>
                <Send className="h-4 w-4 mr-2" />
                Submit Request
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
            <CardTitle className="text-sm">Submitted</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submittedFeatures}</div>
            <p className="text-xs text-muted-foreground">
              Under review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">In Development</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inDevelopment}</div>
            <p className="text-xs text-muted-foreground">
              Being built
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completed}</div>
            <p className="text-xs text-muted-foreground">
              Delivered features
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Requests</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{features.length}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">My Requests</TabsTrigger>
          <TabsTrigger value="process">Development Process</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Model</TabsTrigger>
        </TabsList>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Feature Requests</CardTitle>
              <CardDescription>Track the status of your custom feature requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Feature</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Estimated Cost</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {features.map((feature) => (
                    <TableRow key={feature.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{feature.id}</TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="font-medium">{feature.title}</p>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {feature.businessValue}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(feature.priority)}</TableCell>
                      <TableCell>{getStatusBadge(feature.status)}</TableCell>
                      <TableCell>
                        {feature.estimatedCost > 0 ? (
                          <span className="font-semibold">${feature.estimatedCost.toLocaleString()}</span>
                        ) : (
                          <span className="text-muted-foreground">Pending</span>
                        )}
                      </TableCell>
                      <TableCell>{feature.estimatedTime}</TableCell>
                      <TableCell className="text-sm">{new Date(feature.submittedDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Process Tab */}
        <TabsContent value="process" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Feature Development Process</CardTitle>
              <CardDescription>How we handle custom feature requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="font-bold text-blue-800">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Submission & Review</h4>
                    <p className="text-sm text-muted-foreground">
                      Submit your feature request with detailed requirements and business value. Our team reviews within 2-3 business days.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <span className="font-bold text-yellow-800">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Scope & Estimation</h4>
                    <p className="text-sm text-muted-foreground">
                      We analyze the technical requirements and provide an estimate for cost and timeline. You'll receive a detailed proposal.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="font-bold text-green-800">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Approval & Payment</h4>
                    <p className="text-sm text-muted-foreground">
                      Once you approve the proposal and provide payment, we add the feature to our development queue.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="font-bold text-purple-800">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Development & Testing</h4>
                    <p className="text-sm text-muted-foreground">
                      Our team develops and tests the feature. You'll receive regular updates and can provide feedback during development.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="font-bold text-green-800">5</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Delivery & Training</h4>
                    <p className="text-sm text-muted-foreground">
                      The feature is deployed to your account. We provide training and documentation to ensure successful adoption.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Custom Feature Pricing
              </CardTitle>
              <CardDescription>Transparent pricing for custom development</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Pricing Model</h4>
                  <p className="text-sm text-muted-foreground">
                    Custom features are priced based on complexity, development time, and required resources. Our standard rate is $150/hour for development time.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Typical Cost Ranges</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <span>Simple Features</span>
                      <span className="font-semibold">$1,500 - $3,000</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <span>Medium Complexity</span>
                      <span className="font-semibold">$3,000 - $7,000</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <span>Complex Features</span>
                      <span className="font-semibold">$7,000 - $15,000+</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">What's Included</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Requirements analysis and technical design</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Full development and quality assurance testing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Documentation and user training materials</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Deployment to production environment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>30 days of post-launch support and bug fixes</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Payment Terms
                  </h4>
                  <p className="text-sm text-blue-800">
                    50% upfront upon approval, 50% upon completion and delivery. For features exceeding $10,000, milestone-based payment schedules are available.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

