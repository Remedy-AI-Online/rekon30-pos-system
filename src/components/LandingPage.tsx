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
  Headphones,
  ChevronDown,
  ShoppingCart,
  Tablet,
  Monitor
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

  const posSystems = [
    {
      name: "Rekon360 Register",
      description: "Complete POS system for your store with tablet, card reader, and cash drawer.",
      image: "register",
      features: ["Tablet Display", "Card Reader", "Cash Drawer", "Receipt Printer"]
    },
    {
      name: "Rekon360 Mobile",
      description: "Sell anywhere with our mobile POS solution. Perfect for markets and pop-ups.",
      image: "mobile",
      features: ["Mobile App", "Card Reader", "SMS Receipts", "Offline Mode"]
    },
    {
      name: "Rekon360 Go",
      description: "Handheld device for quick transactions. Ideal for restaurants and services.",
      image: "handheld",
      features: ["Handheld Device", "Quick Checkout", "Inventory Sync", "Real-time Reports"]
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Wix Style */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-yellow-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-2xl font-bold text-black">
                REKON360
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <div className="flex items-center space-x-1">
                <span className="text-gray-700 font-medium">Product</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-gray-700 font-medium">Solutions</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-gray-700 font-medium">Resources</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
              <span className="text-gray-700 font-medium">Pricing</span>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center space-x-4">
              <Globe className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700 underline cursor-pointer">Log In</span>
              <Button 
                onClick={onGetStarted} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-semibold"
              >
                Get Started
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
                <span className="text-gray-700 font-medium">Product</span>
                <span className="text-gray-700 font-medium">Solutions</span>
                <span className="text-gray-700 font-medium">Resources</span>
                <span className="text-gray-700 font-medium">Pricing</span>
                <div className="pt-4 border-t border-gray-200">
                  <Button 
                    onClick={onGetStarted}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    Get Started
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Wix Style */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl sm:text-6xl font-bold text-black mb-8 leading-tight">
                One omnichannel point of sale solution
              </h1>
              
              <p className="text-xl text-gray-700 mb-12 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Run and grow your entire business—from taking payments in person and online, to managing inventory, bookings and more—all with Rekon360's powerful POS.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="bg-black hover:bg-gray-800 text-white text-lg px-8 py-4 font-semibold rounded-lg"
                >
                  Talk to Sales
                </Button>
                
                <div className="flex items-center justify-center lg:justify-start">
                  <span className="text-lg text-black underline cursor-pointer hover:text-gray-700">
                    Shop POS
                  </span>
                  <ArrowRight className="w-5 h-5 ml-2 text-black" />
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
                      <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-yellow-500 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-sm">R</span>
                      </div>
                      <span className="font-semibold text-gray-900">Rekon360 Checkout</span>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>

                  {/* Mock Product Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { name: "Rice & Stew", price: "₵25.00", color: "bg-blue-100" },
                      { name: "Coca Cola", price: "₵8.00", color: "bg-red-100" },
                      { name: "Bread", price: "₵12.00", color: "bg-yellow-100" },
                      { name: "Water", price: "₵5.00", color: "bg-blue-100" },
                      { name: "Chicken", price: "₵35.00", color: "bg-orange-100" },
                      { name: "Juice", price: "₵15.00", color: "bg-green-100" }
                    ].map((product, index) => (
                      <div key={index} className={`${product.color} rounded-lg p-4 text-center`}>
                        <div className="w-8 h-8 bg-white rounded mx-auto mb-2"></div>
                        <div className="text-xs font-medium text-gray-700">{product.name}</div>
                        <div className="text-xs text-gray-600">{product.price}</div>
                      </div>
                    ))}
                  </div>

                  {/* Mock Cart */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Cart Items</h3>
                    <div className="space-y-2">
                      {[
                        { item: "Rice & Stew", amount: "₵25.00" },
                        { item: "Coca Cola", amount: "₵8.00" },
                        { item: "Bread", amount: "₵12.00" }
                      ].map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <div className="font-medium text-gray-900">{item.item}</div>
                          <div className="font-semibold text-gray-900">{item.amount}</div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-black text-white p-4 rounded-lg">
                      <div className="text-center font-bold text-lg">Charge ₵45.00</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Wix Style */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-6">
              Succeed with our advanced Point of Sale features
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Smartphone,
                title: "Omnichannel solution",
                description: "Sell wherever is best for you—in-person, online via your eCommerce site or social media. Take payments in your store, salon or gym and on the go at your next pop-up."
              },
              {
                icon: BarChart3,
                title: "Integrated payments dashboard",
                description: "Control your business transactions right from your dashboard. Review payments, handle refunds, schedule payouts and more."
              },
              {
                icon: Zap,
                title: "Ready-to-go software",
                description: "Rekon360 POS hardware comes with its software pre-installed. Just plug it in, log in to your account and start selling—no need for any third-party setup."
              },
              {
                icon: Package,
                title: "Synced inventory",
                description: "Manage your inventory for both your online and in-person sales from one place. Each sale you make automatically syncs with your dashboard."
              },
              {
                icon: TrendingUp,
                title: "Unified reporting",
                description: "Track your sales, taxes, employee reports and more for online and in-person sales—conveniently from one place."
              },
              {
                icon: Users,
                title: "Built-in marketing tools",
                description: "Attract new customers with built-in tools. Encourage return customers with personalized checkout, discounts and loyalty rewards."
              }
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-gray-700" />
                  </div>
                  <h3 className="text-xl font-bold text-black mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* POS Systems Section - Wix Style */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-6">
              POS systems tailored to your business
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posSystems.map((system, index) => (
              <Card key={index} className="border border-gray-200 shadow-sm">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    {system.image === 'register' && <Monitor className="w-8 h-8 text-gray-700" />}
                    {system.image === 'mobile' && <Smartphone className="w-8 h-8 text-gray-700" />}
                    {system.image === 'handheld' && <Tablet className="w-8 h-8 text-gray-700" />}
                  </div>
                  <CardTitle className="text-xl font-bold text-black">{system.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 mb-6 leading-relaxed">
                    {system.description}
                  </CardDescription>
                  <ul className="space-y-2 mb-6 text-left">
                    {system.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={onGetStarted}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    Talk to Sales
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Wix Style */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-black mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Start free, scale smart. No hidden fees, no surprises.
          </p>
          
          <Card className="max-w-md mx-auto shadow-lg border border-gray-200">
            <CardHeader className="text-center pb-6 pt-8">
              <Badge className="w-fit mx-auto mb-4 bg-green-100 text-green-800 text-sm px-4 py-2 font-semibold">
                Most Popular
              </Badge>
              <CardTitle className="text-2xl font-bold text-black">Free Trial</CardTitle>
              <CardDescription className="text-lg text-gray-600 mt-2">
                Perfect for getting started
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-8 px-8">
              <div className="mb-6">
                <span className="text-5xl font-bold text-black">₵0</span>
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-3 font-bold"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section - Wix Style */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-black mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Get in touch with our team. We're here to help!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">WhatsApp</h3>
              <p className="text-gray-600 mb-4">+233 533 009 352</p>
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
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
              <p className="text-gray-600 mb-4">+233 546 887 539</p>
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
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
              <p className="text-gray-600 mb-4">rekon360@gmail.com</p>
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
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
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 font-bold"
            >
              <Users className="w-5 h-5 mr-2" />
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* Footer - Wix Style */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-yellow-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <span className="text-2xl font-bold">REKON360</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Complete POS system designed specifically for Ghanaian businesses. 
                E-receipts, mobile money, bargaining, and multi-location support.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Reviews</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
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
