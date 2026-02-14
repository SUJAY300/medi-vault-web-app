import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createUser, createPatient, getUserByEmail, getPatientByPhone } from "@/lib/auth"
import { createSignupSchema } from "@/lib/auth-schemas"

export async function POST(request) {
  try {
    const body = await request.json()
    const { role, ...formData } = body

    const schema = createSignupSchema(role)
    const parsed = schema.safeParse(formData)
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return NextResponse.json(
        { error: firstError?.message ?? "Invalid input" },
        { status: 400 }
      )
    }
    const data = parsed.data

    if (role === "Patient") {
      const existing = await getPatientByPhone(data.phone)
      if (existing) {
        return NextResponse.json(
          { error: "An account with this phone number already exists" },
          { status: 409 }
        )
      }
      const patient = await createPatient({ phone: data.phone, fullName: data.fullName })
      return NextResponse.json({
        success: true,
        user: { id: patient.id, role: patient.role, fullName: patient.fullName, phone: patient.phone },
      })
    }

    // Professional signup
    const existing = await getUserByEmail(data.email)
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(data.password, 10)
    const user = await createUser({
      email: data.email,
      passwordHash,
      role,
      fullName: data.fullName,
      phone: data.phone,
      license: data.license,
    })

    return NextResponse.json({
      success: true,
      user: { id: user.id, role: user.role, fullName: user.fullName, email: user.email },
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Signup failed" }, { status: 500 })
  }
}
