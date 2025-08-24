"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, TrendingUp, BookOpen, Smile, Meh, Frown } from "lucide-react"
import { useRouter } from "next/navigation"

interface MoodLog {
  id: string
  mood_score: number
  mood_label: string
  notes: string | null
  created_at: string
}

interface JournalEntry {
  id: string
  title: string | null
  content: string
  mood_score: number | null
  created_at: string
}

const moodOptions = [
  { score: 1, label: "Terrible", color: "bg-red-500", icon: Frown },
  { score: 2, label: "Very Bad", color: "bg-red-400", icon: Frown },
  { score: 3, label: "Bad", color: "bg-orange-500", icon: Frown },
  { score: 4, label: "Poor", color: "bg-orange-400", icon: Meh },
  { score: 5, label: "Okay", color: "bg-yellow-500", icon: Meh },
  { score: 6, label: "Fair", color: "bg-yellow-400", icon: Meh },
  { score: 7, label: "Good", color: "bg-green-400", icon: Smile },
  { score: 8, label: "Very Good", color: "bg-green-500", icon: Smile },
  { score: 9, label: "Great", color: "bg-blue-500", icon: Smile },
  { score: 10, label: "Excellent", color: "bg-purple-500", icon: Smile },
]

export function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [notes, setNotes] = useState("")
  const [journalTitle, setJournalTitle] = useState("")
  const [journalContent, setJournalContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [recentMoods, setRecentMoods] = useState<MoodLog[]>([])
  const [recentJournals, setRecentJournals] = useState<JournalEntry[]>([])
  const [activeTab, setActiveTab] = useState<"mood" | "journal">("mood")
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
      loadRecentData()
    }
  }, [sessionToken])

  const loadRecentData = async () => {
    try {
      // Load recent mood logs
      const moodResponse = await fetch(`/api/mood-logs?sessionToken=${sessionToken}`)
      if (moodResponse.ok) {
        const moodData = await moodResponse.json()
        setRecentMoods(moodData.moodLogs?.slice(0, 7) || [])
      }

      // Load recent journal entries
      const journalResponse = await fetch(`/api/journal-entries?sessionToken=${sessionToken}`)
      if (journalResponse.ok) {
        const journalData = await journalResponse.json()
        setRecentJournals(journalData.journalEntries?.slice(0, 5) || [])
      }
    } catch (error) {
      console.error("Error loading recent data:", error)
    }
  }

  const logMood = async () => {
    if (!selectedMood || !sessionToken) return

    setIsLoading(true)
    try {
      const moodOption = moodOptions.find((m) => m.score === selectedMood)

      const response = await fetch("/api/mood-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionToken,
          moodScore: selectedMood,
          moodLabel: moodOption?.label || "",
          notes: notes.trim() || null,
        }),
      })

      if (!response.ok) throw new Error("Failed to log mood")

      // Reset form
      setSelectedMood(null)
      setNotes("")

      // Reload data
      await loadRecentData()
    } catch (error) {
      console.error("Error logging mood:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveJournalEntry = async () => {
    if (!journalContent.trim() || !sessionToken) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/journal-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionToken,
          title: journalTitle.trim() || null,
          content: journalContent.trim(),
          moodScore: selectedMood,
        }),
      })

      if (!response.ok) throw new Error("Failed to save journal entry")

      // Reset form
      setJournalTitle("")
      setJournalContent("")
      setSelectedMood(null)

      // Reload data
      await loadRecentData()
    } catch (error) {
      console.error("Error saving journal entry:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getMoodIcon = (score: number) => {
    const mood = moodOptions.find((m) => m.score === score)
    const IconComponent = mood?.icon || Meh
    return <IconComponent className="h-4 w-4" />
  }

  const getMoodColor = (score: number) => {
    return moodOptions.find((m) => m.score === score)?.color || "bg-gray-400"
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/chat")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Chat
            </Button>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Mood Tracker</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
            <Button
              variant={activeTab === "mood" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("mood")}
              className="rounded-md"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Log Mood
            </Button>
            <Button
              variant={activeTab === "journal" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("journal")}
              className="rounded-md"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Journal
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === "mood" && (
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <span>How are you feeling today?</span>
                    </CardTitle>
                    <CardDescription>
                      Select your current mood on a scale from 1-10 and add any notes you'd like.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Mood Selection */}
                    <div>
                      <Label className="text-base font-medium mb-4 block">Mood Level</Label>
                      <div className="grid grid-cols-5 gap-3">
                        {moodOptions.map((mood) => {
                          const IconComponent = mood.icon
                          return (
                            <button
                              key={mood.score}
                              onClick={() => setSelectedMood(mood.score)}
                              className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                                selectedMood === mood.score
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded-full ${mood.color} flex items-center justify-center mx-auto mb-2`}
                              >
                                <IconComponent className="h-4 w-4 text-white" />
                              </div>
                              <div className="text-xs font-medium text-gray-900">{mood.score}</div>
                              <div className="text-xs text-gray-600">{mood.label}</div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <Label htmlFor="notes" className="text-base font-medium">
                        Notes (Optional)
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="What's contributing to this mood? Any thoughts you'd like to capture..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-2"
                        rows={4}
                      />
                    </div>

                    <Button onClick={logMood} disabled={!selectedMood || isLoading} className="w-full">
                      {isLoading ? "Saving..." : "Log Mood"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {activeTab === "journal" && (
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                      <span>Journal Entry</span>
                    </CardTitle>
                    <CardDescription>
                      Write about your thoughts, feelings, and experiences. Optionally link it to your current mood.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Optional Mood for Journal */}
                    <div>
                      <Label className="text-base font-medium mb-4 block">Current Mood (Optional)</Label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={selectedMood === null ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedMood(null)}
                        >
                          No mood
                        </Button>
                        {moodOptions.map((mood) => (
                          <Button
                            key={mood.score}
                            variant={selectedMood === mood.score ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedMood(mood.score)}
                            className="flex items-center space-x-1"
                          >
                            <div className={`w-3 h-3 rounded-full ${mood.color}`} />
                            <span>{mood.score}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Journal Title */}
                    <div>
                      <Label htmlFor="journal-title" className="text-base font-medium">
                        Title (Optional)
                      </Label>
                      <Input
                        id="journal-title"
                        placeholder="Give your entry a title..."
                        value={journalTitle}
                        onChange={(e) => setJournalTitle(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    {/* Journal Content */}
                    <div>
                      <Label htmlFor="journal-content" className="text-base font-medium">
                        Your Thoughts
                      </Label>
                      <Textarea
                        id="journal-content"
                        placeholder="What's on your mind today? How are you feeling? What happened that was significant..."
                        value={journalContent}
                        onChange={(e) => setJournalContent(e.target.value)}
                        className="mt-2"
                        rows={8}
                      />
                    </div>

                    <Button
                      onClick={saveJournalEntry}
                      disabled={!journalContent.trim() || isLoading}
                      className="w-full"
                    >
                      {isLoading ? "Saving..." : "Save Journal Entry"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Moods */}
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Moods</CardTitle>
                  <CardDescription>Your mood over the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {recentMoods.map((mood) => (
                        <div key={mood.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-8 h-8 rounded-full ${getMoodColor(mood.mood_score)} flex items-center justify-center`}
                            >
                              {getMoodIcon(mood.mood_score)}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{mood.mood_label}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(mood.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Badge variant="secondary">{mood.mood_score}</Badge>
                        </div>
                      ))}
                      {recentMoods.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">No mood logs yet</p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Recent Journal Entries */}
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Journals</CardTitle>
                  <CardDescription>Your latest thoughts and reflections</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {recentJournals.map((entry) => (
                        <div key={entry.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm truncate">{entry.title || "Untitled Entry"}</h4>
                            {entry.mood_score && (
                              <Badge variant="secondary" className="ml-2">
                                {entry.mood_score}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">{entry.content}</p>
                          <div className="text-xs text-gray-500">{new Date(entry.created_at).toLocaleDateString()}</div>
                        </div>
                      ))}
                      {recentJournals.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">No journal entries yet</p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
