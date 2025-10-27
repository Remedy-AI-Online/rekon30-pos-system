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
  Zap
} from "lucide-react"

interface LandingPageProps {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [activeFeature, setActiveFeature] = useState(0)

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
      text: "Rekon360 has transformed my business. The SMS receipts are a game-changer!"
    },
    {
      name: "Ama Serwaa",
      business: "Serwaa's Kitchen",
      location: "Kumasi", 
      text: "Managing multiple locations is now so easy. My sales have increased by 40%!"
    },
    {
      name: "Kofi Mensah",
      business: "Mensah Stores",
      location: "Tamale",
      text: "The mobile money integration is perfect for my customers. Highly recommended!"
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent">
                Rekon360
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <Button variant="outline" size="lg" className="text-gray-700 border-gray-300 hover:bg-gray-50">
                <Phone className="w-5 h-5 mr-2" />
                +233 546 887 539
              </Button>
              <Button 
                onClick={onGetStarted} 
                size="lg"
                className="bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-8 bg-green-100 text-green-800 border-green-200 text-lg px-6 py-3 font-semibold">
            🎉 First 3 months completely FREE!
          </Badge>
          
          <h1 className="text-5xl sm:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            Complete POS System for{" "}
            <span className="bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent">
              Every Ghanaian Business
            </span>
          </h1>
          
          <p className="text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            E-receipts via SMS • Mobile Money Integration • Bargaining System • Multi-location Support
          </p>
          
          <p className="text-xl text-gray-500 mb-16 max-w-3xl mx-auto">
            Perfect for shops, restaurants, and businesses of all sizes
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
            <Button 
              onClick={onGetStarted} 
              size="lg" 
              className="bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600 text-white text-xl px-12 py-6 font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <Zap className="w-6 h-6 mr-3" />
              Start Free Trial
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="text-xl px-12 py-6 font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
              onClick={() => window.open('https://wa.me/233533009352', '_blank')}
            >
              <MessageSquare className="w-6 h-6 mr-3" />
              WhatsApp Us
            </Button>
            
            <Button 
              variant="ghost" 
              size="lg"
              className="text-xl px-12 py-6 font-semibold hover:bg-gray-100 transition-all duration-300"
            >
              <Play className="w-6 h-6 mr-3" />
              See Demo
            </Button>
          </div>
          
          <div className="flex items-center justify-center space-x-12 text-lg text-gray-600">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 mr-3 text-green-500" />
              No setup fees
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 mr-3 text-green-500" />
              Mobile-friendly
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 mr-3 text-green-500" />
              Works offline
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Everything Your Business Needs
            </h2>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
              Built specifically for Ghanaian businesses with local features
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
                  <CardHeader className="pb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-6`}>
                      <Icon className={`w-8 h-8 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-lg text-gray-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 lg:px-8 bg-gradient-to-r from-red-50 to-yellow-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-2xl text-gray-600 mb-16 max-w-3xl mx-auto">
            Start free, scale smart. No hidden fees, no surprises.
          </p>
          
          <Card className="max-w-lg mx-auto shadow-2xl border-0 bg-white">
            <CardHeader className="text-center pb-8 pt-12">
              <Badge className="w-fit mx-auto mb-6 bg-green-100 text-green-800 text-lg px-6 py-3 font-semibold">
                Most Popular
              </Badge>
              <CardTitle className="text-3xl font-bold text-gray-900">Free Trial</CardTitle>
              <CardDescription className="text-xl text-gray-600 mt-2">
                Perfect for getting started
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-12 px-12">
              <div className="mb-8">
                <span className="text-6xl font-bold text-gray-900">₵0</span>
                <span className="text-2xl text-gray-600 ml-2">/month</span>
                <p className="text-lg text-gray-500 mt-3">First 3 months</p>
              </div>
              
              <ul className="space-y-4 mb-10 text-left">
                <li className="flex items-center text-lg">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                  All features included
                </li>
                <li className="flex items-center text-lg">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                  SMS E-receipts
                </li>
                <li className="flex items-center text-lg">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                  Mobile money integration
                </li>
                <li className="flex items-center text-lg">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                  Multi-location support
                </li>
                <li className="flex items-center text-lg">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                  Bargaining system
                </li>
                <li className="flex items-center text-lg">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                  Real-time analytics
                </li>
                <li className="flex items-center text-lg">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                  WhatsApp support
                </li>
              </ul>
              
              <div className="mb-8 p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                <p className="text-lg text-yellow-800 font-semibold">
                  <strong>After 3 months:</strong> ₵50/month
                </p>
              </div>
              
              <Button 
                onClick={onGetStarted}
                className="w-full bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600 text-white text-xl py-6 font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
              >
                Start Free Trial
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Trusted by Businesses Across Ghana
            </h2>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
              See what our customers are saying
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-12 pb-12 px-8">
                  <div className="flex justify-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-xl text-gray-600 mb-8 italic leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <div>
                    <p className="font-bold text-xl text-gray-900">{testimonial.name}</p>
                    <p className="text-lg text-gray-600">{testimonial.business}</p>
                    <p className="text-lg text-gray-500">{testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-2xl text-gray-300 mb-16 max-w-3xl mx-auto">
            Get in touch with our team. We're here to help!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">WhatsApp</h3>
              <p className="text-xl text-gray-300 mb-6">+233 533 009 352</p>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-gray-900 text-lg px-8 py-4 font-semibold"
                onClick={() => window.open('https://wa.me/233533009352', '_blank')}
              >
                Chat Now
              </Button>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Phone className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Phone</h3>
              <p className="text-xl text-gray-300 mb-6">+233 546 887 539</p>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-gray-900 text-lg px-8 py-4 font-semibold"
                onClick={() => window.open('tel:+233546887539', '_self')}
              >
                Call Now
              </Button>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Mail className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Email</h3>
              <p className="text-xl text-gray-300 mb-6">rekon360@gmail.com</p>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-gray-900 text-lg px-8 py-4 font-semibold"
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
              className="bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600 text-white text-xl px-12 py-6 font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <Users className="w-6 h-6 mr-3" />
              Start Your Free Trial
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-8 md:mb-0">
              <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="text-3xl font-bold">Rekon360</span>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-xl text-gray-400 mb-3">
                © 2024 Rekon360. All rights reserved.
              </p>
              <p className="text-lg text-gray-500">
                Made with ❤️ for Ghanaian businesses
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
