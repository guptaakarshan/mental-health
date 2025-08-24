"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, Calendar, BookOpen, MessageCircle, Target } from "lucide-react"
import { useRouter } from "next/navigation"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"

interface MoodData {
  date: string
  mood_score: number
  mood_label: string
  notes: string | null
}

interface JournalData {
  date: string
  count: number
}

interface AnalyticsData {
  totalMoodLogs: number
  totalJournalEntries: number
  averageMood: number
  moodTrend: "up" | "down" | "stable"
  streakDays: number
  moodDistribution: { mood: string; count: number; color: string }[]
  weeklyMoodData: { day: string; mood: number }[]
  monthlyJournalData: { month: string; entries: number }[]
  recentInsights: string[]
}

const moodColors = {
  1: "#ef4444",
  2: "#f97316",
  3: "#f59e0b",
  4: "#eab308",
  5: "#84cc16",
  6: "#22c55e",
  7: "#10b981",
  8: "#06b6d4",
  9: "#3b82f6",
  10: "#8b5cf6",
}

const chartConfig = {
  mood: {
    label: "Mood Score",
    color: "hsl(var(--chart-1))",
  },
  entries: {
    label: "Journal Entries",
    color: "hsl(var(--chart-2))",
  },
}

export function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month")
  const [isLoading, setIsLoading] = useState(true)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("sessionToken")
    if (token) {
      setSessionToken(token)
    } else {
      // Generate a new session token if none exists
      const newToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      localStorage.setItem("sessionToken", newToken)
      setSessionToken(newToken)
    }
  }, [])

  useEffect(() => {
    if (sessionToken) {
      loadAnalyticsData()
    }
  }, [timeRange, sessionToken])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    try {
      const now = new Date()
      let startDate: Date

      switch (timeRange) {
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case "year":
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
      }

      const [moodResponse, journalResponse] = await Promise.all([
        fetch(`/api/mood-logs?sessionToken=${sessionToken}&startDate=${startDate.toISOString()}`),
        fetch(`/api/journal-entries?sessionToken=${sessionToken}&startDate=${startDate.toISOString()}`),
      ])

      const moodLogs = moodResponse.ok ? (await moodResponse.json()).moodLogs || [] : []
      const journalEntries = journalResponse.ok ? (await journalResponse.json()).journalEntries || [] : []

      const analytics = processAnalyticsData(moodLogs, journalEntries)
      setAnalyticsData(analytics)
    } catch (error) {
      console.error("Error loading analytics:", error)
      setAnalyticsData({
        totalMoodLogs: 0,
        totalJournalEntries: 0,
        averageMood: 0,
        moodTrend: "stable",
        streakDays: 0,
        moodDistribution: [],
        weeklyMoodData: [],
        monthlyJournalData: [],
        recentInsights: ["Start tracking your mood to see personalized insights here!"],
      })
    } finally {
      setIsLoading(false)
    }
  }

  const processAnalyticsData = (moodLogs: any[], journalEntries: any[]): AnalyticsData => {
    // Basic stats
    const totalMoodLogs = moodLogs.length
    const totalJournalEntries = journalEntries.length
    const averageMood =
      moodLogs.length > 0
        ? Math.round((moodLogs.reduce((sum, log) => sum + log.mood_score, 0) / moodLogs.length) * 10) / 10
        : 0

    // Mood trend calculation
    const recentMoods = moodLogs.slice(-7)
    const olderMoods = moodLogs.slice(-14, -7)
    const recentAvg =
      recentMoods.length > 0 ? recentMoods.reduce((sum, log) => sum + log.mood_score, 0) / recentMoods.length : 0
    const olderAvg =
      olderMoods.length > 0 ? olderMoods.reduce((sum, log) => sum + log.mood_score, 0) / olderMoods.length : 0

    let moodTrend: "up" | "down" | "stable" = "stable"
    if (recentAvg > olderAvg + 0.5) moodTrend = "up"
    else if (recentAvg < olderAvg - 0.5) moodTrend = "down"

    // Streak calculation (consecutive days with mood logs)
    const streakDays = calculateStreak(moodLogs)

    // Mood distribution
    const moodCounts: { [key: number]: number } = {}
    moodLogs.forEach((log) => {
      moodCounts[log.mood_score] = (moodCounts[log.mood_score] || 0) + 1
    })

    const moodDistribution = Object.entries(moodCounts).map(([mood, count]) => ({
      mood: `${mood}/10`,
      count,
      color: moodColors[Number.parseInt(mood) as keyof typeof moodColors] || "#gray",
    }))

    // Weekly mood data
    const weeklyMoodData = generateWeeklyMoodData(moodLogs)

    // Monthly journal data
    const monthlyJournalData = generateMonthlyJournalData(journalEntries)

    // Generate insights
    const recentInsights = generateInsights(moodLogs, journalEntries, averageMood, moodTrend)

    return {
      totalMoodLogs,
      totalJournalEntries,
      averageMood,
      moodTrend,
      streakDays,
      moodDistribution,
      weeklyMoodData,
      monthlyJournalData,
      recentInsights,
    }
  }

  const calculateStreak = (moodLogs: any[]): number => {
    if (moodLogs.length === 0) return 0

    const today = new Date()
    let streak = 0
    const currentDate = new Date(today)

    // Check each day going backwards
    for (let i = 0; i < 30; i++) {
      const dateStr = currentDate.toISOString().split("T")[0]
      const hasLogForDay = moodLogs.some((log) => log.created_at.split("T")[0] === dateStr)

      if (hasLogForDay) {
        streak++
      } else if (i > 0) {
        // If we miss a day after starting the streak, break
        break
      }

      currentDate.setDate(currentDate.getDate() - 1)
    }

    return streak
  }

  const generateWeeklyMoodData = (moodLogs: any[]) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const weekData = days.map((day) => ({ day, mood: 0, count: 0 }))

    moodLogs.forEach((log) => {
      const date = new Date(log.created_at)
      const dayIndex = (date.getDay() + 6) % 7 // Convert Sunday=0 to Monday=0
      weekData[dayIndex].mood += log.mood_score
      weekData[dayIndex].count += 1
    })

    return weekData.map((day) => ({
      day: day.day,
      mood: day.count > 0 ? Math.round((day.mood / day.count) * 10) / 10 : 0,
    }))
  }

  const generateMonthlyJournalData = (journalEntries: any[]) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthData = months.map((month) => ({ month, entries: 0 }))

    journalEntries.forEach((entry) => {
      const date = new Date(entry.created_at)
      const monthIndex = date.getMonth()
      monthData[monthIndex].entries += 1
    })

    return monthData.filter((month) => month.entries > 0)
  }

  const generateInsights = (
    moodLogs: any[],
    journalEntries: any[],
    averageMood: number,
    moodTrend: string,
  ): string[] => {
    const insights: string[] = []

    if (moodLogs.length === 0) {
      insights.push("Start logging your mood daily to track patterns and improve your mental wellbeing.")
      insights.push("Consider taking our mental health survey to get personalized recommendations.")
      insights.push("Regular mood tracking can help you identify triggers and positive patterns.")
      return insights
    }

    if (averageMood >= 7) {
      insights.push("Your overall mood has been quite positive! Keep up the great work.")
    } else if (averageMood >= 5) {
      insights.push("Your mood has been fairly balanced. Consider what activities boost your wellbeing.")
    } else {
      insights.push("Your mood has been lower recently. Remember that it's okay to seek support when needed.")
    }

    if (moodTrend === "up") {
      insights.push("Great news! Your mood trend is improving over time.")
    } else if (moodTrend === "down") {
      insights.push(
        "Your mood has been declining lately. Consider reaching out for support or trying new coping strategies.",
      )
    }

    if (journalEntries.length > moodLogs.length * 0.5) {
      insights.push("You're doing great with journaling! Writing regularly can help process emotions.")
    }

    const recentMoods = moodLogs.slice(-7)
    const lowMoodDays = recentMoods.filter((log) => log.mood_score <= 4).length
    if (lowMoodDays >= 3) {
      insights.push("You've had several challenging days recently. Consider talking to someone you trust.")
    }

    return insights.slice(0, 3) // Limit to 3 insights
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your analytics...</p>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No data available yet. Start logging your mood to see insights!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/chat")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Chat
            </Button>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            </div>
          </div>
          <div className="flex space-x-2">
            {(["week", "month", "year"] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Mood</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.averageMood}/10</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  {analyticsData.moodTrend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                  {analyticsData.moodTrend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
                  <span
                    className={
                      analyticsData.moodTrend === "up"
                        ? "text-green-500"
                        : analyticsData.moodTrend === "down"
                          ? "text-red-500"
                          : ""
                    }
                  >
                    {analyticsData.moodTrend === "up"
                      ? "Improving"
                      : analyticsData.moodTrend === "down"
                        ? "Declining"
                        : "Stable"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mood Logs</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.totalMoodLogs}</div>
                <p className="text-xs text-muted-foreground">{analyticsData.streakDays} day streak</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Journal Entries</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.totalJournalEntries}</div>
                <p className="text-xs text-muted-foreground">Written thoughts</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Survey Taken</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sessionToken ? "Yes" : "No"}</div>
                <p className="text-xs text-muted-foreground">Mental health assessment</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Mood Trend Chart */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Weekly Mood Trend</CardTitle>
                <CardDescription>Your average mood by day of the week</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.weeklyMoodData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis domain={[0, 10]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="mood"
                        stroke="var(--color-mood)"
                        strokeWidth={2}
                        dot={{ fill: "var(--color-mood)" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Mood Distribution */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Mood Distribution</CardTitle>
                <CardDescription>How often you experience different mood levels</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.moodDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mood" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="var(--color-mood)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Journal Activity */}
          {analyticsData.monthlyJournalData.length > 0 && (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Journal Activity</CardTitle>
                <CardDescription>Number of journal entries by month</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.monthlyJournalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="entries" fill="var(--color-entries)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Insights */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Personal Insights</CardTitle>
              <CardDescription>Personalized insights based on your mood and journaling patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.recentInsights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
