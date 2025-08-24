"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Settings, Download, Trash2, Shield, User, Database } from "lucide-react"
import { useRouter } from "next/navigation"

interface DataStats {
  moodLogs: number
  journalEntries: number
  chatSessions: number
  messages: number
}

export function DataManagement() {
  const [displayName, setDisplayName] = useState("")
  const [dataStats, setDataStats] = useState<DataStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("sessionToken")
    if (token) {
      setSessionToken(token)
      loadDataStats(token)
    } else {
    
      const newToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      localStorage.setItem("sessionToken", newToken)
      setSessionToken(newToken)
      loadDataStats(newToken)
    }
  }, [])

  const loadDataStats = async (token: string) => {
    try {
      const [moodResponse, journalResponse, sessionsResponse, messagesResponse] = await Promise.all([
        fetch(`/api/mood-logs?sessionToken=${token}`),
        fetch(`/api/journal-entries?sessionToken=${token}`),
        fetch(`/api/sessions?token=${token}`),
        fetch(`/api/messages?sessionId=all&sessionToken=${token}`),
      ])

      const moodData = moodResponse.ok ? await moodResponse.json() : { moodLogs: [] }
      const journalData = journalResponse.ok ? await journalResponse.json() : { journalEntries: [] }
      const sessionsData = sessionsResponse.ok ? await sessionsResponse.json() : { sessions: [] }
      const messagesData = messagesResponse.ok ? await messagesResponse.json() : { messages: [] }

      setDataStats({
        moodLogs: moodData.moodLogs?.length || 0,
        journalEntries: journalData.journalEntries?.length || 0,
        chatSessions: sessionsData.sessions?.length || 0,
        messages: messagesData.messages?.length || 0,
      })
    } catch (error) {
      console.error("Error loading data stats:", error)
      setDataStats({
        moodLogs: 0,
        journalEntries: 0,
        chatSessions: 0,
        messages: 0,
      })
    }
  }

  const updateProfile = async () => {
    setIsLoading(true)
    try {
      
      localStorage.setItem("displayName", displayName.trim())
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportData = async () => {
    if (!sessionToken) return

    setIsExporting(true)
    try {
  
      const [moodResponse, journalResponse, sessionsResponse, messagesResponse] = await Promise.all([
        fetch(`/api/mood-logs?sessionToken=${sessionToken}`),
        fetch(`/api/journal-entries?sessionToken=${sessionToken}`),
        fetch(`/api/sessions?token=${sessionToken}`),
        fetch(`/api/messages?sessionId=all&sessionToken=${sessionToken}`),
      ])

      const moodData = moodResponse.ok ? await moodResponse.json() : { moodLogs: [] }
      const journalData = journalResponse.ok ? await journalResponse.json() : { journalEntries: [] }
      const sessionsData = sessionsResponse.ok ? await sessionsResponse.json() : { sessions: [] }
      const messagesData = messagesResponse.ok ? await messagesResponse.json() : { messages: [] }

      const exportData = {
        export_date: new Date().toISOString(),
        session_info: {
          token: sessionToken,
          display_name: displayName || localStorage.getItem("displayName"),
        },
        mood_logs: moodData.moodLogs || [],
        journal_entries: journalData.journalEntries || [],
        chat_sessions: sessionsData.sessions || [],
        messages: messagesData.messages || [],
        statistics: dataStats,
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `mindfulchat-data-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting data:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const deleteMoodLogs = async () => {
    if (!sessionToken) return
    setIsLoading(true)
    try {
      await fetch(`/api/mood-logs?sessionToken=${sessionToken}`, { method: "DELETE" })
      await loadDataStats(sessionToken)
    } catch (error) {
      console.error("Error deleting mood logs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteJournalEntries = async () => {
    if (!sessionToken) return
    setIsLoading(true)
    try {
      await fetch(`/api/journal-entries?sessionToken=${sessionToken}`, { method: "DELETE" })
      await loadDataStats(sessionToken)
    } catch (error) {
      console.error("Error deleting journal entries:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteChatHistory = async () => {
    if (!sessionToken) return
    setIsLoading(true)
    try {
      await fetch(`/api/sessions?token=${sessionToken}`, { method: "DELETE" })
      await loadDataStats(sessionToken)
    } catch (error) {
      console.error("Error deleting chat history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAccount = async () => {
    setIsLoading(true)
    try {
      // Clear all localStorage data
      localStorage.removeItem("sessionToken")
      localStorage.removeItem("displayName")

      // Redirect to home
      router.push("/")
    } catch (error) {
      console.error("Error deleting account:", error)
      setIsLoading(false)
    }
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
              <Settings className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Settings & Privacy</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Settings */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Session Settings</span>
              </CardTitle>
              <CardDescription>Manage your session information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="session-token">Session Token</Label>
                  <Input id="session-token" value={sessionToken || ""} disabled className="bg-gray-50" />
                  <p className="text-xs text-gray-500 mt-1">Your anonymous session identifier</p>
                </div>
                <div>
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                  />
                </div>
              </div>
              <Button onClick={updateProfile} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {/* Data Overview */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-green-600" />
                <span>Your Data</span>
              </CardTitle>
              <CardDescription>Overview of your stored information</CardDescription>
            </CardHeader>
            <CardContent>
              {dataStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{dataStats.moodLogs}</div>
                    <div className="text-sm text-gray-600">Mood Logs</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{dataStats.journalEntries}</div>
                    <div className="text-sm text-gray-600">Journal Entries</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{dataStats.chatSessions}</div>
                    <div className="text-sm text-gray-600">Chat Sessions</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{dataStats.messages}</div>
                    <div className="text-sm text-gray-600">Messages</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Export */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5 text-green-600" />
                <span>Export Your Data</span>
              </CardTitle>
              <CardDescription>Download a complete copy of your data in JSON format</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                This will create a downloadable file containing all your mood logs, journal entries, chat history, and
                session information.
              </p>
              <Button onClick={exportData} disabled={isExporting} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? "Exporting..." : "Export All Data"}
              </Button>
            </CardContent>
          </Card>

          {/* Data Deletion */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                <span>Delete Data</span>
              </CardTitle>
              <CardDescription>Permanently remove specific types of data or your entire session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Mood Logs
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete All Mood Logs?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all your mood logs and cannot be undone. Your analytics data will
                        be affected.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={deleteMoodLogs} className="bg-red-600 hover:bg-red-700">
                        Delete Mood Logs
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Journal Entries
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete All Journal Entries?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all your journal entries and cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={deleteJournalEntries} className="bg-red-600 hover:bg-red-700">
                        Delete Journal Entries
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Chat History
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete All Chat History?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all your chat sessions and messages and cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={deleteChatHistory} className="bg-red-600 hover:bg-red-700">
                        Delete Chat History
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <Separator />

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">Danger Zone</h4>
                <p className="text-sm text-red-700 mb-4">
                  Clear your session and all associated data. This will reset your anonymous session.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Session
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear Your Session?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will clear your session and all associated data including mood logs, journal entries, and
                        chat history. You will start with a fresh anonymous session.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={deleteAccount} className="bg-red-600 hover:bg-red-700">
                        Clear Session
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Information */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>Privacy & Security</span>
              </CardTitle>
              <CardDescription>How we protect and handle your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <p>Your session is completely anonymous with no personal information required.</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <p>Your conversations with the AI are private and stored only in your browser session.</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <p>You have full control over your data and can export or delete it at any time.</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <p>No account creation or personal information is required to use this service.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
