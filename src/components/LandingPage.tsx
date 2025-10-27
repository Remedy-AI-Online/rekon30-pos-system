import { useState } from "react"
import { Button } from "./ui/button"
import { 
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Monitor,
  Smartphone,
  Tablet,
  CreditCard,
  BarChart3,
  Package,
  Users,
  Phone,
  Mail,
  MessageSquare,
  Globe
} from "lucide-react"

interface LandingPageProps {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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

      {/* Hero Section */}
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

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-6">
              Succeed with our advanced Point of Sale features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to run your business efficiently, from inventory management to customer insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: "Omnichannel",
                description: "Sell everywhere your customers are—online, in-person, and across all channels."
              },
              {
                icon: CreditCard,
                title: "Integrated payments dashboard",
                description: "Accept payments anywhere with our built-in payment processing."
              },
              {
                icon: Package,
                title: "Ready-to-go software",
                description: "Get started instantly with pre-built templates and easy setup."
              },
              {
                icon: BarChart3,
                title: "Synced inventory",
                description: "Keep your inventory in sync across all sales channels automatically."
              },
              {
                icon: Users,
                title: "Unified reporting",
                description: "Get insights from all your sales channels in one comprehensive dashboard."
              },
              {
                icon: MessageSquare,
                title: "Built-in marketing tools",
                description: "Grow your business with integrated email marketing and customer management."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POS Systems Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-6">
              Choose the right POS system for your business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From mobile payments to full register systems, we have the perfect solution for every business type.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Monitor,
                title: "Register",
                description: "Complete POS system for your store",
                features: ["Touch screen", "Receipt printer", "Cash drawer", "Barcode scanner"]
              },
              {
                icon: Smartphone,
                title: "Mobile",
                description: "Take payments anywhere with your phone",
                features: ["Mobile payments", "Card reader", "Receipt via SMS", "Offline mode"]
              },
              {
                icon: Tablet,
                title: "Go",
                description: "Lightweight solution for small businesses",
                features: ["Tablet-based", "Easy setup", "Affordable", "Perfect for startups"]
              }
            ].map((system, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <system.icon className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-2xl font-semibold text-black mb-4">{system.title}</h3>
                <p className="text-gray-600 mb-6">{system.description}</p>
                <ul className="text-left mb-8 space-y-2">
                  {system.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  Talk to Sales
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-black mb-6">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Start free, then choose the plan that fits your business needs.
          </p>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 max-w-md mx-auto">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-black mb-2">Professional</h3>
              <div className="text-4xl font-bold text-black mb-2">₵50<span className="text-lg text-gray-600">/month</span></div>
              <p className="text-gray-600">Perfect for growing businesses</p>
            </div>
            
            <ul className="text-left mb-8 space-y-3">
              <li className="flex items-center text-gray-600">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-xs">✓</span>
                </div>
                All basic features included
              </li>
              <li className="flex items-center text-gray-600">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-xs">✓</span>
                </div>
                Multi-location support
              </li>
              <li className="flex items-center text-gray-600">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-xs">✓</span>
                </div>
                Priority support
              </li>
              <li className="flex items-center text-gray-600">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-xs">✓</span>
                </div>
                Advanced analytics
              </li>
            </ul>

            <Button 
              onClick={onGetStarted}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-4 font-semibold"
            >
              Get Started Free
            </Button>
            
            <p className="text-sm text-gray-500 mt-4">
              First 3 months completely FREE
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-black mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Join thousands of Ghanaian businesses already using Rekon360.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold"
            >
              <Phone className="w-5 h-5 mr-2" />
              +233 546 887 539
            </Button>
            <Button 
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold"
            >
              <Mail className="w-5 h-5 mr-2" />
              rekon360@gmail.com
            </Button>
            <Button 
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              WhatsApp Support
            </Button>
          </div>

          <Button 
            onClick={onGetStarted}
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-12 py-4 font-semibold"
          >
            Start Your Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-yellow-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <span className="text-2xl font-bold">REKON360</span>
              </div>
              <p className="text-gray-400 mb-4">
                Complete POS system designed for Ghanaian businesses. 
                Manage your business efficiently with our powerful tools.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Rekon360. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}