"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, Heart } from "lucide-react"
import { useRouter } from "next/navigation"

interface Question {
  id: string
  question: string
  options: { value: string; label: string; score: number }[]
}

const questions: Question[] = [
  {
    id: "mood",
    question: "Over the past two weeks, how often have you felt down, depressed, or hopeless?",
    options: [
      { value: "not_at_all", label: "Not at all", score: 0 },
      { value: "several_days", label: "Several days", score: 1 },
      { value: "more_than_half", label: "More than half the days", score: 2 },
      { value: "nearly_every_day", label: "Nearly every day", score: 3 },
    ],
  },
  {
    id: "anxiety",
    question: "How often have you felt nervous, anxious, or on edge?",
    options: [
      { value: "not_at_all", label: "Not at all", score: 0 },
      { value: "several_days", label: "Several days", score: 1 },
      { value: "more_than_half", label: "More than half the days", score: 2 },
      { value: "nearly_every_day", label: "Nearly every day", score: 3 },
    ],
  },
  {
    id: "sleep",
    question: "How would you rate your sleep quality over the past month?",
    options: [
      { value: "excellent", label: "Excellent - I sleep well and feel rested", score: 0 },
      { value: "good", label: "Good - Minor sleep issues occasionally", score: 1 },
      { value: "poor", label: "Poor - Frequent sleep problems", score: 2 },
      { value: "very_poor", label: "Very poor - Severe sleep difficulties", score: 3 },
    ],
  },
  {
    id: "stress",
    question: "How often do you feel overwhelmed by academic or personal responsibilities?",
    options: [
      { value: "rarely", label: "Rarely or never", score: 0 },
      { value: "sometimes", label: "Sometimes", score: 1 },
      { value: "often", label: "Often", score: 2 },
      { value: "constantly", label: "Almost constantly", score: 3 },
    ],
  },
  {
    id: "social_support",
    question: "How satisfied are you with your social support system (friends, family, etc.)?",
    options: [
      { value: "very_satisfied", label: "Very satisfied", score: 0 },
      { value: "satisfied", label: "Satisfied", score: 1 },
      { value: "dissatisfied", label: "Dissatisfied", score: 2 },
      { value: "very_dissatisfied", label: "Very dissatisfied", score: 3 },
    ],
  },
  {
    id: "concentration",
    question: "How often do you have trouble concentrating on tasks or studies?",
    options: [
      { value: "not_at_all", label: "Not at all", score: 0 },
      { value: "several_days", label: "Several days", score: 1 },
      { value: "more_than_half", label: "More than half the days", score: 2 },
      { value: "nearly_every_day", label: "Nearly every day", score: 3 },
    ],
  },
  {
    id: "self_care",
    question: "How often do you engage in self-care activities (exercise, hobbies, relaxation)?",
    options: [
      { value: "daily", label: "Daily or almost daily", score: 0 },
      { value: "weekly", label: "Several times a week", score: 1 },
      { value: "monthly", label: "A few times a month", score: 2 },
      { value: "rarely", label: "Rarely or never", score: 3 },
    ],
  },
  {
    id: "energy",
    question: "How would you describe your energy levels recently?",
    options: [
      { value: "high", label: "High - I feel energetic most days", score: 0 },
      { value: "moderate", label: "Moderate - Some ups and downs", score: 1 },
      { value: "low", label: "Low - Often feeling tired or drained", score: 2 },
      { value: "very_low", label: "Very low - Constantly exhausted", score: 3 },
    ],
  },
  {
    id: "help_seeking",
    question: "How comfortable are you with seeking help when you're struggling?",
    options: [
      { value: "very_comfortable", label: "Very comfortable", score: 0 },
      { value: "somewhat_comfortable", label: "Somewhat comfortable", score: 1 },
      { value: "uncomfortable", label: "Uncomfortable", score: 2 },
      { value: "very_uncomfortable", label: "Very uncomfortable", score: 3 },
    ],
  },
  {
    id: "overall_wellbeing",
    question: "Overall, how would you rate your mental health and wellbeing right now?",
    options: [
      { value: "excellent", label: "Excellent", score: 0 },
      { value: "good", label: "Good", score: 1 },
      { value: "fair", label: "Fair", score: 2 },
      { value: "poor", label: "Poor", score: 3 },
    ],
  },
]

export function MentalHealthSurvey() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<{
    score: number
    riskLevel: string
    recommendations: string[]
  } | null>(null)
  const router = useRouter()

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const calculateResults = () => {
    let totalScore = 0

    questions.forEach((question) => {
      const answer = answers[question.id]
      if (answer) {
        const option = question.options.find((opt) => opt.value === answer)
        if (option) {
          totalScore += option.score
        }
      }
    })

    let riskLevel: string
    let recommendations: string[]

    if (totalScore <= 8) {
      riskLevel = "low"
      recommendations = [
        "Your mental health appears to be in a good place! Keep up the positive habits.",
        "Continue engaging in self-care activities and maintaining your support network.",
        "Consider sharing your coping strategies with friends who might benefit.",
        "Stay aware of your mental health and don't hesitate to seek support if things change.",
      ]
    } else if (totalScore <= 16) {
      riskLevel = "moderate"
      recommendations = [
        "You may be experiencing some mental health challenges that could benefit from attention.",
        "Consider speaking with a counselor, therapist, or trusted friend about how you're feeling.",
        "Focus on improving sleep hygiene, regular exercise, and stress management techniques.",
        "Explore campus mental health resources or online therapy options.",
        "Practice mindfulness, meditation, or other relaxation techniques daily.",
      ]
    } else {
      riskLevel = "high"
      recommendations = [
        "Your responses suggest you may be experiencing significant mental health challenges.",
        "It's important to reach out for professional support as soon as possible.",
        "Contact your campus counseling center, a mental health professional, or a crisis helpline.",
        "Consider speaking with a trusted friend, family member, or advisor about how you're feeling.",
        "Remember that seeking help is a sign of strength, not weakness.",
        "If you're having thoughts of self-harm, please contact emergency services or a crisis hotline immediately.",
      ]
    }

    return { score: totalScore, riskLevel, recommendations }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    const surveyResults = calculateResults()

    try {
      // Store survey results in database
      const response = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responses: answers,
          score: surveyResults.score,
          riskLevel: surveyResults.riskLevel,
          recommendations: surveyResults.recommendations.join("\n"),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("sessionToken", data.sessionToken)
        setResults(surveyResults)
        setShowResults(true)
      }
    } catch (error) {
      console.error("Error submitting survey:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const isLastQuestion = currentQuestion === questions.length - 1
  const canProceed = answers[questions[currentQuestion].id]

  if (showResults && results) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {results.riskLevel === "low" && <CheckCircle className="h-16 w-16 text-green-500" />}
              {results.riskLevel === "moderate" && <AlertTriangle className="h-16 w-16 text-yellow-500" />}
              {results.riskLevel === "high" && <Heart className="h-16 w-16 text-red-500" />}
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">Your Mental Health Assessment</CardTitle>
            <CardDescription className="text-lg">
              Based on your responses, here's your personalized wellness plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{results.score}/30</div>
              <div className="text-lg font-medium capitalize text-gray-700">{results.riskLevel} Risk Level</div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">Personalized Recommendations:</h3>
              <ul className="space-y-3">
                {results.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-gray-700 leading-relaxed">{rec}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button onClick={() => router.push("/chat")} className="flex-1" size="lg">
                Start AI Chat Support
              </Button>
              <Button onClick={() => router.push("/mood")} variant="outline" className="flex-1" size="lg">
                Track Your Mood
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Mental Health Assessment</h1>
          <span className="text-sm text-gray-500">
            Question {currentQuestion + 1} of {questions.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">{questions[currentQuestion].question}</CardTitle>
          <CardDescription>Please select the option that best describes your experience</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[questions[currentQuestion].id] || ""}
            onValueChange={(value) => handleAnswer(questions[currentQuestion].id, value)}
            className="space-y-4"
          >
            {questions[currentQuestion].options.map((option) => (
              <div
                key={option.value}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer text-gray-700 leading-relaxed">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion((prev) => prev - 1)}
          disabled={currentQuestion === 0}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>

        {isLastQuestion ? (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed || isSubmitting}
            className="flex items-center space-x-2"
            size="lg"
          >
            {isSubmitting ? "Analyzing..." : "Complete Assessment"}
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentQuestion((prev) => prev + 1)}
            disabled={!canProceed}
            className="flex items-center space-x-2"
          >
            <span>Next</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
