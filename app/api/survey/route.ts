import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { responses, score, riskLevel, recommendations } = await request.json()

    // Generate a session token for the user
    const sessionToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    // In a real implementation, you would store this in your database
    // For now, we'll just return the session token
    console.log("[v0] Survey submitted:", { responses, score, riskLevel, sessionToken })

    return NextResponse.json({
      success: true,
      sessionToken,
      message: "Survey completed successfully",
    })
  } catch (error) {
    console.error("[v0] Survey submission error:", error)
    return NextResponse.json({ error: "Failed to submit survey" }, { status: 500 })
  }
}
