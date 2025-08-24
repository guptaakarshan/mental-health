import axios from "axios"
import { NextResponse } from "next/server"

// External API details
const url = "http://as1.nerdysid.in:5000/getanswer"
const username = "admin"
const password = "d4rk"

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    if (!messages) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const lastUserMessage = messages[messages.length - 1]
    const userQuestion = lastUserMessage.content

    // Call external API
    const response = await axios.post(
      url,
      { question: userQuestion },
      { auth: { username, password } }
    )

    if (response.status === 200) {
      return NextResponse.json({ answer: response.data.answer }, { status: 200 })
    } else {
      console.error("Error from external API:", response.status, response.data)
      return NextResponse.json({ error: "Failed to get answer" }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Request failed:", error.message)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
