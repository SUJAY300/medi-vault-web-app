import { NextResponse } from "next/server"
import { sendOtpController } from "../../../../../backend/controllers/otpController"
import { patientOtpSendSchema } from "../../../../../shared/schemas/authSchemas"

export async function POST(request) {
  try {
    const body = await request.json()
    const parsed = patientOtpSendSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid phone number" },
        { status: 400 }
      )
    }
    const { phone } = parsed.data

    const result = await sendOtpController(phone)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status || 500 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("OTP send error:", error)
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 })
  }
}
