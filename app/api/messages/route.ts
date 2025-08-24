import { type NextRequest, NextResponse } from "next/server"


const messages = new Map<string, any[]>()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    const sessionMessages = messages.get(sessionId) || []
    return NextResponse.json({ messages: sessionMessages })
  } catch (error) {
    console.error("[v0] Error loading messages:", error)
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, content, role } = await request.json()

    if (!sessionId || !content || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newMessage = {
      id: Math.random().toString(36).substring(2, 15),
      content,
      role,
      created_at: new Date().toISOString(),
    }

    const sessionMessages = messages.get(sessionId) || []
    sessionMessages.push(newMessage)
    messages.set(sessionId, sessionMessages)

    return NextResponse.json({ message: newMessage })
  } catch (error) {
    console.error("[v0] Error saving message:", error)
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 })
  }
}
