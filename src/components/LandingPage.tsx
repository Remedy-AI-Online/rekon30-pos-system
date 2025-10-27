import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { 
  Smartphone, 
  CreditCard, 
  DollarSign, 
  Building2, 
  BarChart3, 
  Package, 
  MessageSquare, 
  Phone, 
  Mail, 
  CheckCircle,
  Star,
  Users,
  ArrowRight,
  Play,
  Shield,
  Zap,
  Menu,
  X,
  Globe,
  Award,
  TrendingUp,
  Headphones
} from "lucide-react"

interface LandingPageProps {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const features = [
    {
      icon: MessageSquare,
      title: "E-Receipts via SMS",
      description: "Send digital receipts via SMS - no printer needed! Perfect for Ghanaian businesses.",
      color: "text-green-600"
    },
    {
      icon: Smartphone,
      title: "Mobile Money Integration",
      description: "Accept MoMo, AirtelTigo Money, and other mobile payments seamlessly.",
      color: "text-blue-600"
    },
    {
      icon: DollarSign,
      title: "Bargaining System",
      description: "Set price ranges for products. Let customers bargain within your limits.",
      color: "text-orange-600"
    },
    {
      icon: Building2,
      title: "Multi-Location Support",
      description: "Manage multiple shops, branches, or locations from one dashboard.",
      color: "text-purple-600"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Track sales, inventory, and performance with live dashboards.",
      color: "text-red-600"
    },
    {
      icon: Package,
      title: "Inventory Management",
      description: "Keep track of stock levels, low stock alerts, and product management.",
      color: "text-indigo-600"
    }
  ]

  const testimonials = [
    {
      name: "Kwame Asante",
      business: "Asante Electronics",
      location: "Accra",
      text: "Rekon360 has transformed my business. The SMS receipts are a game-changer!",
      rating: 5
    },
    {
      name: "Ama Serwaa",
      business: "Serwaa's Kitchen",
      location: "Kumasi", 
      text: "Managing multiple locations is now so easy. My sales have increased by 40%!",
      rating: 5
    },
    {
      name: "Kofi Mensah",
      business: "Mensah Stores",
      location: "Tamale",
      text: "The mobile money integration is perfect for my customers. Highly recommended!",
      rating: 5
    }
  ]

  const stats = [
    { number: "500+", label: "Active Businesses" },
    { number: "₵2M+", label: "Transactions Processed" },
    { number: "99.9%", label: "Uptime Guarantee" },
    { number: "24/7", label: "Support Available" }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Tally Solutions Style */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-yellow-500 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent">
                Rekon360
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-red-600 font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-red-600 font-medium transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-700 hover:text-red-600 font-medium transition-colors">Reviews</a>
              <a href="#contact" className="text-gray-700 hover:text-red-600 font-medium transition-colors">Contact</a>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                <Phone className="w-4 h-4 mr-2" />
                +233 546 887 539
              </Button>
              <Button 
                onClick={onGetStarted} 
                size="sm"
                className="bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600 text-white px-6 py-2 font-semibold"
              >
                Get Started Free
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-700 hover:text-red-600 font-medium">Features</a>
                <a href="#pricing" className="text-gray-700 hover:text-red-600 font-medium">Pricing</a>
                <a href="#testimonials" className="text-gray-700 hover:text-red-600 font-medium">Reviews</a>
                <a href="#contact" className="text-gray-700 hover:text-red-600 font-medium">Contact</a>
                <div className="pt-4 border-t border-gray-200">
                  <Button 
                    onClick={onGetStarted}
                    className="w-full bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600 text-white font-semibold"
                  >
                    Get Started Free
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Tally Solutions Style */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              <Badge className="mb-6 bg-green-100 text-green-800 border-green-200 text-sm px-4 py-2 font-semibold">
                🎉 First 3 months completely FREE!
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Complete POS System for{" "}
                <span className="bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent">
                  Every Ghanaian Business
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                E-receipts via SMS • Mobile Money Integration • Bargaining System • Multi-location Support
              </p>
              
              <p className="text-lg text-gray-500 mb-10">
                Perfect for shops, restaurants, and businesses of all sizes
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  onClick={onGetStarted} 
                  size="lg" 
                  className="bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600 text-white text-lg px-8 py-4 font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Start Free Trial
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-lg px-8 py-4 font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
                  onClick={() => window.open('https://wa.me/233533009352', '_blank')}
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  WhatsApp Us
                </Button>
              </div>
              
              <div className="flex items-center justify-center lg:justify-start space-x-8 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  No setup fees
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  Mobile-friendly
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  Works offline
                </div>
              </div>
            </div>

            {/* Right Column - Visual/Dashboard Preview */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <div className="space-y-6">
                  {/* Mock Dashboard Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-yellow-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">R</span>
                      </div>
                      <span className="font-semibold text-gray-900">Rekon360 Dashboard</span>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>

                  {/* Mock Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900">₵12,450</div>
                      <div className="text-sm text-gray-600">Today's Sales</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900">47</div>
                      <div className="text-sm text-gray-600">Transactions</div>
                    </div>
                  </div>

                  {/* Mock Recent Transactions */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Recent Sales</h3>
                    <div className="space-y-2">
                      {[
                        { item: "Rice & Stew", amount: "₵25", method: "MoMo" },
                        { item: "Coca Cola", amount: "₵8", method: "Cash" },
                        { item: "Bread", amount: "₵12", method: "AirtelTigo" }
                      ].map((transaction, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <div>
                            <div className="font-medium text-gray-900">{transaction.item}</div>
                            <div className="text-sm text-gray-500">{transaction.method}</div>
                          </div>
                          <div className="font-semibold text-gray-900">{transaction.amount}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Tally Solutions Style */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Tally Solutions Style */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything Your Business Needs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built specifically for Ghanaian businesses with local features
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 border border-gray-200">
                  <CardHeader className="pb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section - Tally Solutions Style */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Start free, scale smart. No hidden fees, no surprises.
          </p>
          
          <Card className="max-w-md mx-auto shadow-xl border border-gray-200">
            <CardHeader className="text-center pb-6 pt-8">
              <Badge className="w-fit mx-auto mb-4 bg-green-100 text-green-800 text-sm px-4 py-2 font-semibold">
                Most Popular
              </Badge>
              <CardTitle className="text-2xl font-bold text-gray-900">Free Trial</CardTitle>
              <CardDescription className="text-lg text-gray-600 mt-2">
                Perfect for getting started
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-8 px-8">
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">₵0</span>
                <span className="text-xl text-gray-600 ml-2">/month</span>
                <p className="text-sm text-gray-500 mt-2">First 3 months</p>
              </div>
              
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  All features included
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  SMS E-receipts
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  Mobile money integration
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  Multi-location support
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  Bargaining system
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  Real-time analytics
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  WhatsApp support
                </li>
              </ul>
              
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800 font-semibold">
                  <strong>After 3 months:</strong> ₵50/month
                </p>
              </div>
              
              <Button 
                onClick={onGetStarted}
                className="w-full bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600 text-white text-lg py-3 font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials Section - Tally Solutions Style */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Businesses Across Ghana
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our customers are saying
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="text-center border border-gray-200">
                <CardContent className="pt-8 pb-8 px-6">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-gray-600">{testimonial.business}</p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section - Tally Solutions Style */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Get in touch with our team. We're here to help!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">WhatsApp</h3>
              <p className="text-gray-300 mb-4">+233 533 009 352</p>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-gray-900"
                onClick={() => window.open('https://wa.me/233533009352', '_blank')}
              >
                Chat Now
              </Button>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Phone</h3>
              <p className="text-gray-300 mb-4">+233 546 887 539</p>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-gray-900"
                onClick={() => window.open('tel:+233546887539', '_self')}
              >
                Call Now
              </Button>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Email</h3>
              <p className="text-gray-300 mb-4">rekon360@gmail.com</p>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-gray-900"
                onClick={() => window.open('mailto:rekon360@gmail.com', '_self')}
              >
                Send Email
              </Button>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600 text-white text-lg px-8 py-4 font-bold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Users className="w-5 h-5 mr-2" />
              Start Your Free Trial
            </Button>
          </div>
        </div>
      </section>

      {/* Footer - Tally Solutions Style */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-yellow-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <span className="text-2xl font-bold">Rekon360</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Complete POS system designed specifically for Ghanaian businesses. 
                E-receipts, mobile money, bargaining, and multi-location support.
              </p>
              <div className="flex space-x-4">
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  <Globe className="w-4 h-4 mr-2" />
                  Website
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Reviews</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#contact" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 mb-4 md:mb-0">
              © 2024 Rekon360. All rights reserved.
            </div>
            <div className="text-gray-400 text-sm">
              Made with ❤️ for Ghanaian businesses
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
