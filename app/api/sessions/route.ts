import { type NextRequest, NextResponse } from "next/server"

// Mock storage for sessions (in production, use your database)
const sessions = new Map<string, any[]>()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Session token required" }, { status: 400 })
    }

    const userSessions = sessions.get(token) || []
    return NextResponse.json({ sessions: userSessions })
  } catch (error) {
    console.error("[v0] Error loading sessions:", error)
    return NextResponse.json({ error: "Failed to load sessions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionToken } = await request.json()

    if (!sessionToken) {
      return NextResponse.json({ error: "Session token required" }, { status: 400 })
    }

    const newSession = {
      id: Math.random().toString(36).substring(2, 15),
      title: "New Chat Session",
      created_at: new Date().toISOString(),
    }

    const userSessions = sessions.get(sessionToken) || []
    userSessions.unshift(newSession)
    sessions.set(sessionToken, userSessions)

    return NextResponse.json({ session: newSession })
  } catch (error) {
    console.error("[v0] Error creating session:", error)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { sessionId, title } = await request.json()

    // In production, update the session title in your database
    console.log(" session title:", { sessionId, title })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating session:", error)
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 })
  }
}
