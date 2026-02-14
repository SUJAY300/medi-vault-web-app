import { NextResponse } from "next/server"
import { loginController } from "../../../../backend/controllers/authController"
import { professionalLoginSchema } from "../../../../shared/schemas/authSchemas"

export async function POST(request) {
  try {
    const body = await request.json()
    const parsed = professionalLoginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      )
    }
    const { email, password } = parsed.data

    const result = await loginController(email, password)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status || 500 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
