import { NextResponse } from "next/server"
import { signupController } from "../../../../backend/controllers/authController"

export async function POST(request) {
  try {
    const body = await request.json()
    const { role, ...formData } = body

    const result = await signupController(role, formData)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status || 500 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Signup failed" }, { status: 500 })
  }
}
