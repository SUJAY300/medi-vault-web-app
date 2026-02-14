import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getUserByEmail } from "@/lib/auth"
import { professionalLoginSchema } from "@/lib/auth-schemas"

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

    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
