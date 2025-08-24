import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { MessageCircle, TrendingUp, BookOpen, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-green-600 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">MindPulse</h1>
          </div>
          <div className="space-x-2">
            <Button asChild>
              <Link href="/chat">Start Chatting</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Personal Mental Health
            <span className="text-green-600"> Companion</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            A safe, empathetic AI chatbot designed specifically for students. Track your mood, journal your thoughts,
            and get supportive guidance whenever you need it.
          </p>
          <div className="space-x-4">
            <Button size="lg" asChild>
              <Link href="/survey">Take Mental Health Survey</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/chat">Start Chatting</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need for Mental Wellness</h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive tools designed to support your mental health journey with privacy and care.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <MessageCircle className="h-12 w-12 text-blue-600 mb-2" />
              <CardTitle>AI Chat Support</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                24/7 empathetic AI companion trained to provide supportive, non-judgmental conversations.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-green-600 mb-2" />
              <CardTitle>Mood Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Daily mood logging with visual analytics to help you understand patterns and progress.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <BookOpen className="h-12 w-12 text-purple-600 mb-2" />
              <CardTitle>Digital Journaling</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Private journaling space to express thoughts and feelings with optional mood correlation.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <Shield className="h-12 w-12 text-red-600 mb-2" />
              <CardTitle>Privacy First</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your data is encrypted and secure. Full control over your information with easy deletion options.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Start Your Mental Health Journey?</h3>
          <p className="text-xl mb-8 text-blue-100">
            Begin with a quick mental health assessment to get personalized support.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/survey">Take Assessment</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <MessageCircle className="h-6 w-6" />
            <span className="text-lg font-semibold">MindPulse</span>
          </div>
          <p className="text-gray-400">Supporting student mental health with empathy and technology.</p>
        </div>
      </footer>
    </div>
  )
}
