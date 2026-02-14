import { NextResponse } from "next/server"
import { verifyOtpController } from "../../../../../backend/controllers/otpController"
import { patientOtpVerifySchema } from "../../../../../shared/schemas/authSchemas"

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

    const result = await verifyOtpController(phone, otp)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status || 500 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("OTP verify error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
