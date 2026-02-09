import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function PUT(request: NextRequest) {
  try {
    // Get token from HTTP-only cookie
    const cookieStore = await cookies()
    let token = cookieStore.get("token")?.value

    // If no token in cookies, try Authorization header
    if (!token) {
      const authHeader = request.headers.get("Authorization")
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.replace("Bearer ", "")
      }
    }

    const laravelUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

    // Parse request body
    const body = await request.json()

    // Send request to Laravel
    const response = await fetch(`${laravelUrl}/api/settings/update-contact`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json", // ensure Laravel parses JSON
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Error updating contact:", error)
    return NextResponse.json({ success: false, message: "Internal server error", error: String(error) }, { status: 500 })
  }
}
