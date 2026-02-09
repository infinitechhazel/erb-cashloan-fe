import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

const laravelUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  console.log("[API Proxy] User ID:", id)

  // Get token from HTTP-only cookie
  const cookieStore = await cookies()
  let token = cookieStore.get("token")?.value
  console.log("[API Proxy] Token from cookie:", token)

  // If no token in cookies, try Authorization header
  if (!token) {
    const authHeader = req.headers.get("Authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.replace("Bearer ", "")
      console.log("[API Proxy] Token from Authorization header:", token)
    }
  }

  try {
    // Get JSON body from request
    const body = await req.json()
    console.log("[API Proxy] Request body:", body)

    // Forward the request to Laravel
    const response = await fetch(`${laravelUrl}/api/users/${id}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    console.log("[API Proxy] Laravel response status:", response.status)
    console.log("[API Proxy] Laravel response body:", data)

    if (!response.ok) {
      console.error("[API Proxy] Laravel returned error:", data)
      return NextResponse.json(
        { message: data.message || "Error updating user", error: data.error || null },
        { status: response.status }
      )
    }

    console.log("[API Proxy] Update successful")
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error("[API Proxy] Next.js API Proxy Error:", error)
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 })
  }
}
