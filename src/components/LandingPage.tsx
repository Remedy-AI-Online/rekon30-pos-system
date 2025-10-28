import { useState } from "react"
import { Button } from "./ui/button"
import { 
  Menu,
  X,
  ArrowRight,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
  Star
} from "lucide-react"

interface LandingPageProps {
  onGetStarted: () => void
}

// Logo Component
function Rekon360Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo Icon */}
      <div className="relative w-11 h-11 mr-3">
        <svg 
          viewBox="0 0 32 32" 
          className="w-11 h-11"
          fill="none"
        >
          {/* Dark blue ring */}
          <circle 
            cx="16" 
            cy="16" 
            r="14" 
            stroke="#1e3a8a" 
            strokeWidth="4"
            fill="none"
            strokeDasharray="88 22"
            strokeDashoffset="0"
            transform="rotate(-45 16 16)"
          />
          {/* Mint green segment */}
          <circle 
            cx="16" 
            cy="16" 
            r="14" 
            stroke="#10b981" 
            strokeWidth="4"
            fill="none"
            strokeDasharray="22 88"
            strokeDashoffset="-66"
            transform="rotate(-45 16 16)"
          />
        </svg>
      </div>
      {/* Logo Text */}
      <span className="text-2xl font-bold text-gray-900">
        Rekon360
      </span>
    </div>
  )
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <nav className="max-w-6xl mx-auto px-8 py-6 flex justify-between items-center">
          <Rekon360Logo />
          
          {/* Desktop Navigation */}
          <ul className="hidden md:flex gap-8 list-none">
            <li><a href="#features" className="text-gray-700 font-medium hover:text-blue-600 transition-colors">Features</a></li>
            <li><a href="#how-it-works" className="text-gray-700 font-medium hover:text-blue-600 transition-colors">How It Works</a></li>
            <li><a href="#pricing" className="text-gray-700 font-medium hover:text-blue-600 transition-colors">Pricing</a></li>
            <li><a href="#testimonials" className="text-gray-700 font-medium hover:text-blue-600 transition-colors">Testimonials</a></li>
          </ul>
          
          <Button 
            onClick={onGetStarted}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-semibold rounded-lg"
          >
            Get Started
          </Button>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 px-8 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <a href="#features" className="text-gray-700 font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-700 font-medium">How It Works</a>
              <a href="#pricing" className="text-gray-700 font-medium">Pricing</a>
              <a href="#testimonials" className="text-gray-700 font-medium">Testimonials</a>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="hero-content">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            One Omnichannel Point of Sale Solution
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Run and grow your entire business—from taking payments in person and online, to managing inventory, bookings and more—all with Rekon360's powerful POS designed specifically for Ghanaian businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={onGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg flex items-center gap-2"
            >
              Shop POS
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button 
              variant="outline"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-lg"
            >
              How It Works
            </Button>
          </div>
        </div>

        {/* POS Demo */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 shadow-2xl">
          <div className="bg-white rounded-xl p-6 h-[500px] overflow-hidden">
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
              <div className="text-xl font-bold text-gray-900">Rekon360 POS</div>
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                Online
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { name: "Rice & Stew", price: "₵25.00" },
                { name: "Coca Cola", price: "₵8.00" },
                { name: "Bread", price: "₵12.00" },
                { name: "Water", price: "₵5.00" },
                { name: "Chicken", price: "₵35.00" },
                { name: "Juice", price: "₵15.00" }
              ].map((product, index) => (
                <div key={index} className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg text-center cursor-pointer transition-all hover:-translate-y-1 hover:border-2 hover:border-blue-500 hover:shadow-lg">
                  <div className="font-semibold text-gray-900 mb-1">{product.name}</div>
                  <div className="text-blue-600 font-bold text-lg">{product.price}</div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="font-bold mb-4 text-gray-900">Cart Items</div>
              <div className="space-y-2">
                {[
                  { item: "Rice & Stew", amount: "₵25.00" },
                  { item: "Coca Cola", amount: "₵8.00" },
                  { item: "Bread", amount: "₵12.00" }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-700">{item.item}</span>
                    <span className="font-semibold text-gray-900">{item.amount}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-xl mt-4 pt-4 border-t-2 border-blue-600">
                <span>Total</span>
                <span>₵45.00</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div>
              <h3 className="text-5xl font-bold mb-2 text-green-400">5,000+</h3>
              <p className="text-lg opacity-90">Active Businesses</p>
            </div>
            <div>
              <h3 className="text-5xl font-bold mb-2 text-green-400">₵2B+</h3>
              <p className="text-lg opacity-90">Processed Annually</p>
            </div>
            <div>
              <h3 className="text-5xl font-bold mb-2 text-green-400">99.9%</h3>
              <p className="text-lg opacity-90">Uptime Guarantee</p>
            </div>
            <div>
              <h3 className="text-5xl font-bold mb-2 text-green-400">24/7</h3>
              <p className="text-lg opacity-90">Support Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Succeed with Our Advanced POS Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to run your business efficiently, from inventory management to customer insights. Built for the unique needs of Ghanaian businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "📊",
                title: "Inventory Management",
                description: "Track stock levels in real-time, set up automatic reorder points, and never run out of your best-selling items. Get low-stock alerts and manage multiple locations from one dashboard."
              },
              {
                icon: "💳",
                title: "Payment Processing",
                description: "Accept all payment methods including Mobile Money (MTN, Vodafone, AirtelTigo), Visa, Mastercard, and cash with instant reconciliation and automatic receipt generation."
              },
              {
                icon: "📈",
                title: "Sales Analytics",
                description: "Get detailed insights into your sales trends, peak hours, best-performing products, and customer behavior. Make data-driven decisions to grow your business."
              },
              {
                icon: "👥",
                title: "Customer Management",
                description: "Build customer profiles, track purchase history, and create loyalty programs that drive repeat business. Send automated SMS promotions to your customers."
              },
              {
                icon: "📱",
                title: "Multi-Device Support",
                description: "Access your POS from any device - tablet, phone, or computer. Work from anywhere, anytime. Your data syncs automatically across all devices."
              },
              {
                icon: "🔒",
                title: "Secure & Reliable",
                description: "Bank-level security with automatic backups ensures your data is always safe and accessible. Compliant with Ghana Revenue Authority requirements."
              },
              {
                icon: "👨‍💼",
                title: "Employee Management",
                description: "Create staff accounts with custom permissions, track employee sales performance, and manage shifts. Monitor who does what in your business."
              },
              {
                icon: "🧾",
                title: "Receipt & Invoice",
                description: "Generate professional receipts and invoices instantly. Print, email, or send via SMS. Customize with your business logo and details."
              },
              {
                icon: "🌐",
                title: "Online Store Integration",
                description: "Sell both in-store and online with unified inventory. Take orders through WhatsApp, Facebook, and your own online store - all managed in one place."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                <div className="w-15 h-15 bg-gradient-to-br from-blue-600 to-green-500 rounded-xl flex items-center justify-center text-white text-2xl mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get started with Rekon360 in just 4 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                number: "1",
                title: "Sign Up",
                description: "Create your account in minutes. No credit card required to get started. Choose the plan that fits your business."
              },
              {
                number: "2",
                title: "Setup Your Products",
                description: "Add your products, set prices, and organize your inventory. Import from Excel or enter manually - it's easy either way."
              },
              {
                number: "3",
                title: "Start Selling",
                description: "Accept payments through Mobile Money, cards, or cash. Your sales are tracked automatically with every transaction."
              },
              {
                number: "4",
                title: "Grow Your Business",
                description: "Use analytics to understand your customers, optimize inventory, and increase profits. Scale seamlessly as you grow."
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-green-500 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Perfect for Every Business Type</h2>
            <p className="text-xl text-gray-600">Rekon360 adapts to your industry's unique needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🍽️",
                title: "Restaurants & Cafes",
                features: ["Table management system", "Kitchen order printing", "Menu customization", "Delivery tracking", "Split bills & tipping"]
              },
              {
                icon: "🛒",
                title: "Retail Stores",
                features: ["Barcode scanning", "Multi-location inventory", "Supplier management", "Product variants (size, color)", "Loyalty programs"]
              },
              {
                icon: "💇",
                title: "Salons & Spas",
                features: ["Appointment booking", "Staff scheduling", "Service packages", "Customer notes & history", "SMS reminders"]
              },
              {
                icon: "🏋️",
                title: "Gyms & Fitness",
                features: ["Membership management", "Class scheduling", "Recurring billing", "Access control integration", "Personal trainer bookings"]
              },
              {
                icon: "🏪",
                title: "Supermarkets",
                features: ["Fast checkout process", "Bulk product management", "Expiry date tracking", "Wholesale pricing", "Multi-checkout support"]
              },
              {
                icon: "🎓",
                title: "Schools & Education",
                features: ["Fee collection management", "Student records", "Bookshop integration", "Installment payments", "Parent notifications"]
              }
            ].map((industry, index) => (
              <div key={index} className="bg-white p-10 rounded-xl shadow-sm hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                <div className="text-5xl mb-4">{industry.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{industry.title}</h3>
                <ul className="space-y-2">
                  {industry.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that's right for your business. No hidden fees, cancel anytime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "₵199",
                period: "/month",
                features: ["Up to 100 products", "1 user account", "Basic inventory tracking", "Mobile Money payments", "Email support", "Sales reports", "Receipt printing"],
                buttonText: "Get Started",
                featured: false
              },
              {
                name: "Professional",
                price: "₵499",
                period: "/month",
                features: ["Unlimited products", "5 user accounts", "Advanced inventory management", "All payment methods", "Priority support (24/7)", "Advanced analytics", "Customer loyalty program", "Online store integration", "Employee management"],
                buttonText: "Get Started",
                featured: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "pricing",
                features: ["Everything in Professional", "Unlimited users", "Multiple locations", "Custom integrations", "Dedicated account manager", "Custom reports", "API access", "Training & onboarding", "White-label option"],
                buttonText: "Contact Sales",
                featured: false
              }
            ].map((plan, index) => (
              <div key={index} className={`bg-white border-2 rounded-2xl p-10 transition-all hover:-translate-y-2 hover:shadow-xl ${plan.featured ? 'border-blue-600 bg-gradient-to-br from-blue-900 to-blue-800 text-white' : 'border-gray-200'}`}>
                {plan.featured && (
                  <div className="absolute -top-4 right-8 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                    Most Popular
                  </div>
                )}
                <h3 className={`text-xl font-semibold mb-4 ${plan.featured ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                <div className={`text-5xl font-bold mb-2 ${plan.featured ? 'text-green-400' : 'text-blue-600'}`}>
                  {plan.price}
                  <span className={`text-lg font-normal ${plan.featured ? 'text-white opacity-80' : 'text-gray-600'}`}>{plan.period}</span>
                </div>
                <ul className="space-y-3 my-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className={`w-4 h-4 mr-3 flex-shrink-0 ${plan.featured ? 'text-green-400' : 'text-green-500'}`} />
                      <span className={plan.featured ? 'text-white opacity-90' : 'text-gray-600'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={onGetStarted}
                  className={`w-full py-4 text-lg font-semibold rounded-lg ${plan.featured ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                  {plan.buttonText}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">Join thousands of satisfied business owners across Ghana</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                text: "Rekon360 has completely transformed how we manage our restaurant. The kitchen order system and table management features are exactly what we needed. Our service is faster and customers are happier!",
                author: "Akosua Osei",
                business: "Owner, Mama's Kitchen - Accra",
                avatar: "AO"
              },
              {
                text: "Before Rekon360, we were losing track of inventory and money. Now everything is organized. The Mobile Money integration is perfect for our customers, and the reports help us make better business decisions.",
                author: "Kwame Asante",
                business: "Manager, KwikMart Supermarket - Kumasi",
                avatar: "KA"
              },
              {
                text: "The appointment booking feature has saved us so much time! Clients can book online and we get reminders. Plus, the customer history helps us provide better personalized service. Best investment we've made!",
                author: "Esi Amankwah",
                business: "Owner, Glamour Beauty Salon - Tema",
                avatar: "EA"
              },
              {
                text: "Managing three stores was a nightmare until we switched to Rekon360. Now I can see everything from my phone - inventory, sales, staff performance. It's like having a business manager in my pocket!",
                author: "Yaw Mensah",
                business: "CEO, YM Fashion Boutiques - Takoradi",
                avatar: "YM"
              },
              {
                text: "The loyalty program feature has increased our repeat customers by 40%! Students love collecting points and redeeming rewards. The support team is also very helpful and responds quickly.",
                author: "Fatima Abdul",
                business: "Owner, Campus Café - Legon",
                avatar: "FA"
              },
              {
                text: "Rekon360 made our gym operations so much smoother. Membership renewals are automatic, class bookings are organized, and our members can pay through Mobile Money. Highly recommend it!",
                author: "Kofi Danquah",
                business: "Director, FitLife Gym - East Legon",
                avatar: "KD"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm">
                <p className="italic text-gray-600 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.business}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-900 to-blue-800 text-white text-center">
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Business?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join over 5,000 businesses already using Rekon360 to grow their operations. Start your 14-day free trial today - no credit card required!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onGetStarted}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg"
            >
              Start Free Trial
            </Button>
            <Button 
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-lg"
            >
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <Rekon360Logo className="mb-4" />
              <p className="text-gray-400 leading-relaxed">
                The leading point of sale solution for Ghanaian businesses. Manage payments, inventory, and customer relationships all in one place.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6 text-green-400">Product</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Mobile App</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6 text-green-400">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Video Tutorials</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Rekon360. Built for Ghanaian Businesses. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}