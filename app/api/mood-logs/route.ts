import { type NextRequest, NextResponse } from "next/server"

// Mock storage for mood logs (in production, use your database)
const moodLogs = new Map<string, any[]>()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionToken = searchParams.get("sessionToken")
    const startDate = searchParams.get("startDate")

    if (!sessionToken) {
      return NextResponse.json({ error: "Session token required" }, { status: 400 })
    }

    let userMoodLogs = moodLogs.get(sessionToken) || []

    // Filter by start date if provided
    if (startDate) {
      const filterDate = new Date(startDate)
      userMoodLogs = userMoodLogs.filter((log) => new Date(log.created_at) >= filterDate)
    }

    return NextResponse.json({ moodLogs: userMoodLogs })
  } catch (error) {
    console.error("[v0] Error loading mood logs:", error)
    return NextResponse.json({ error: "Failed to load mood logs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionToken, moodScore, moodLabel, notes } = await request.json()

    if (!sessionToken || !moodScore || !moodLabel) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newMoodLog = {
      id: Math.random().toString(36).substring(2, 15),
      mood_score: moodScore,
      mood_label: moodLabel,
      notes: notes || null,
      created_at: new Date().toISOString(),
    }

    const userMoodLogs = moodLogs.get(sessionToken) || []
    userMoodLogs.push(newMoodLog)
    moodLogs.set(sessionToken, userMoodLogs)

    return NextResponse.json({ moodLog: newMoodLog })
  } catch (error) {
    console.error("[v0] Error saving mood log:", error)
    return NextResponse.json({ error: "Failed to save mood log" }, { status: 500 })
  }
}
