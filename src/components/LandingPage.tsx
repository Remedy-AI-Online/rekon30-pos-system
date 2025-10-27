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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent">
                Rekon360
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Phone className="w-4 h-4 mr-2" />
                +233 546 887 539
              </Button>
              <Button onClick={onGetStarted} className="bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600">
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-green-100 text-green-800 border-green-200">
            🎉 First 3 months completely FREE!
          </Badge>
          
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Complete POS System for{" "}
            <span className="bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent">
              Every Ghanaian Business
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            E-receipts via SMS • Mobile Money Integration • Bargaining System • Multi-location Support
            <br />
            <span className="text-lg text-gray-500">Perfect for shops, restaurants, and businesses of all sizes</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              onClick={onGetStarted} 
              size="lg" 
              className="bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600 text-lg px-8 py-4"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Free Trial
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-4"
              onClick={() => window.open('https://wa.me/233533009352', '_blank')}
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              WhatsApp Us
            </Button>
            
            <Button 
              variant="ghost" 
              size="lg"
              className="text-lg px-8 py-4"
            >
              <Play className="w-5 h-5 mr-2" />
              See Demo
            </Button>
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              No setup fees
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Mobile-friendly
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Works offline
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything Your Business Needs
            </h2>
            <p className="text-xl text-gray-600">
              Built specifically for Ghanaian businesses with local features
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
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
      <section className="py-20 bg-gradient-to-r from-red-50 to-yellow-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Start free, scale smart. No hidden fees, no surprises.
          </p>
          
          <Card className="max-w-md mx-auto shadow-2xl border-2 border-red-200">
            <CardHeader className="text-center pb-4">
              <Badge className="w-fit mx-auto mb-4 bg-green-100 text-green-800">
                Most Popular
              </Badge>
              <CardTitle className="text-2xl">Free Trial</CardTitle>
              <CardDescription className="text-lg">
                Perfect for getting started
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">₵0</span>
                <span className="text-gray-600">/month</span>
                <p className="text-sm text-gray-500 mt-2">First 3 months</p>
              </div>
              
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  All features included
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  SMS E-receipts
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Mobile money integration
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Multi-location support
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Bargaining system
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Real-time analytics
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  WhatsApp support
                </li>
              </ul>
              
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>After 3 months:</strong> ₵50/month
                </p>
              </div>
              
              <Button 
                onClick={onGetStarted}
                className="w-full bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600 text-lg py-3"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Businesses Across Ghana
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers are saying
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">
                    "{testimonial.text}"
                  </p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.business}</p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Get in touch with our team. We're here to help!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">WhatsApp</h3>
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
              <h3 className="text-xl font-semibold mb-2">Phone</h3>
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
              <h3 className="text-xl font-semibold mb-2">Email</h3>
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
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600 text-lg px-8 py-4"
            >
              <Users className="w-5 h-5 mr-2" />
              Start Your Free Trial
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-xl font-bold">Rekon360</span>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400 mb-2">
                © 2024 Rekon360. All rights reserved.
              </p>
              <p className="text-sm text-gray-500">
                Made with ❤️ for Ghanaian businesses
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
