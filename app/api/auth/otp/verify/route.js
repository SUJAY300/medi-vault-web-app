import { NextResponse } from "next/server"
import { verifyOTP, getPatientByPhone } from "@/lib/auth"
import { patientOtpVerifySchema } from "@/lib/auth-schemas"

export async function POST(request) {
  try {
    const body = await request.json()
    const parsed = patientOtpVerifySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid request" },
        { status: 400 }
      )
    }
    const { phone, otp } = parsed.data

    const result = await verifyOTP(phone, otp)
    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const patient = await getPatientByPhone(phone)
    if (!patient) {
      return NextResponse.json(
        { error: "Account not found. Please sign up first." },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: patient.id,
        role: patient.role,
        fullName: patient.fullName,
        phone: patient.phone,
      },
    })
  } catch (error) {
    console.error("OTP verify error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
