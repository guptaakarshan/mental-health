import { type NextRequest, NextResponse } from "next/server"

// Mock storage for journal entries (in production, use your database)
const journalEntries = new Map<string, any[]>()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionToken = searchParams.get("sessionToken")
    const startDate = searchParams.get("startDate")

    if (!sessionToken) {
      return NextResponse.json({ error: "Session token required" }, { status: 400 })
    }

    let userJournalEntries = journalEntries.get(sessionToken) || []

    // Filter by start date if provided
    if (startDate) {
      const filterDate = new Date(startDate)
      userJournalEntries = userJournalEntries.filter((entry) => new Date(entry.created_at) >= filterDate)
    }

    return NextResponse.json({ journalEntries: userJournalEntries })
  } catch (error) {
    console.error("[v0] Error loading journal entries:", error)
    return NextResponse.json({ error: "Failed to load journal entries" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionToken, title, content, moodScore } = await request.json()

    if (!sessionToken || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newJournalEntry = {
      id: Math.random().toString(36).substring(2, 15),
      title: title || null,
      content,
      mood_score: moodScore || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const userJournalEntries = journalEntries.get(sessionToken) || []
    userJournalEntries.push(newJournalEntry)
    journalEntries.set(sessionToken, userJournalEntries)

    return NextResponse.json({ journalEntry: newJournalEntry })
  } catch (error) {
    console.error("[v0] Error saving journal entry:", error)
    return NextResponse.json({ error: "Failed to save journal entry" }, { status: 500 })
  }
}
