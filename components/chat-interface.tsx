"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, Plus, Bot, TrendingUp, BarChart3, Home } from "lucide-react"
import { useRouter } from "next/navigation"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  created_at: string
}

interface ChatSession {
  id: string
  title: string
  created_at: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("sessionToken")
    if (token) {
      setSessionToken(token)
    } else {
      const newToken =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
      localStorage.setItem("sessionToken", newToken)
      setSessionToken(newToken)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (sessionToken) {
      loadChatSessions()
    }
  }, [sessionToken])

  useEffect(() => {
    if (currentSessionId) {
      loadMessages(currentSessionId)
    }
  }, [currentSessionId])

  const loadChatSessions = async () => {
    try {
      const response = await fetch(`/api/sessions?token=${sessionToken}`)
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
        if (data.sessions && data.sessions.length > 0 && !currentSessionId) {
          setCurrentSessionId(data.sessions[0].id)
        }
      }
    } catch (error) {
      console.error("Error loading sessions:", error)
    }
  }

  const loadMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/messages?sessionId=${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error("Error loading messages:", error)
    }
  }

  const createNewSession = async () => {
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken }),
      })

      if (response.ok) {
        const data = await response.json()
        setSessions([data.session, ...sessions])
        setCurrentSessionId(data.session.id)
        setMessages([])
      }
    } catch (error) {
      console.error("Error creating session:", error)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentSessionId || isLoading) return

    const userMessage = inputMessage.trim()
    setInputMessage("")
    setIsLoading(true)

    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      content: userMessage,
      role: "user",
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempUserMessage])

    try {
      const saveResponse = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSessionId,
          content: userMessage,
          role: "user",
        }),
      })

      if (!saveResponse.ok) throw new Error("Failed to save message")
      const savedMessage = await saveResponse.json()

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempUserMessage.id ? savedMessage.message : msg,
        ),
      )

      const conversationMessages = [...messages, savedMessage.message].map(
        (msg) => ({
          role: msg.role,
          content: msg.content,
        }),
      )

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversationMessages }),
      })

      if (!response.ok) throw new Error("Failed to get AI response")

      const data = await response.json()
      const aiContent =
        data.answer || "I'm sorry, I couldn't process your request."

      const aiSaveResponse = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSessionId,
          content: aiContent,
          role: "assistant",
        }),
      })

      if (aiSaveResponse.ok) {
        const finalAiMessage = await aiSaveResponse.json()
        setMessages((prev) => [...prev, finalAiMessage.message])
      }

      if (messages.length === 0) {
        const title =
          userMessage.length > 30
            ? userMessage.substring(0, 30) + "..."
            : userMessage
        await fetch("/api/sessions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: currentSessionId, title }),
        })
        setSessions((prev) =>
          prev.map((session) =>
            session.id === currentSessionId ? { ...session, title } : session,
          ),
        )
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prev) => prev.filter((msg) => !msg.id.startsWith("temp")))

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content:
          "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        role: "assistant",
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 overflow-hidden bg-white border-r`}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">MindPulse</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(false)}
            >
              ×
            </Button>
          </div>
          <div className="space-y-2">
            <Button onClick={createNewSession} className="w-full" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-transparent"
              onClick={() => router.push("/mood")}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Mood Tracker
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-transparent"
              onClick={() => router.push("/analytics")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-transparent"
              onClick={() => router.push("/")}
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className={`cursor-pointer transition-colors hover:bg-blue-50 ${
                  currentSessionId === session.id
                    ? "bg-blue-100 border-blue-300"
                    : ""
                }`}
                onClick={() => setCurrentSessionId(session.id)}
              >
                <CardContent className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {session.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(session.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex items-center space-x-2 mb-2">
            <Bot className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600">Anonymous Session</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/survey")}
            className="w-full bg-transparent"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Take Survey
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b p-4 flex items-center justify-between">
          {!isSidebarOpen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(true)}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          )}
          <h2 className="text-lg font-semibold text-gray-900">
            {currentSessionId
              ? sessions.find((s) => s.id === currentSessionId)?.title || "Chat"
              : "Select a chat"}
          </h2>
          <div className="w-8" />
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 && currentSessionId && (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Start a conversation
                </h3>
                <p className="text-gray-600">
                  I'm here to listen and support you. What's on your mind?
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-200 text-gray-900"
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.role === "assistant" && (
                      <Bot className="h-4 w-4 mt-1 text-blue-600" />
                    )}
                    <p className="text-sm leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                  <p
                    className={`text-xs mt-1 ${
                      message.role === "user"
                        ? "text-blue-100"
                        : "text-gray-500"
                    }`}
                  >
                    {new Date(message.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-blue-600" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        {currentSessionId && (
          <div className="bg-white border-t p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        )}

        {!currentSessionId && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Welcome to MindPulse
              </h3>
              <p className="text-gray-600 mb-4">
                Create a new chat session to get started
              </p>
              <Button onClick={createNewSession}>
                <Plus className="h-4 w-4 mr-2" />
                Start New Chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
