import { NextResponse } from "next/server"
import { storeOTP, generateOTP, canResendOTP, getPatientByPhone } from "@/lib/auth"
import { patientOtpSendSchema } from "@/lib/auth-schemas"
import { isTwilioConfigured, sendSms } from "@/lib/twilio"

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

    // Check if patient is registered
    const patient = await getPatientByPhone(phone)
    if (!patient) {
      return NextResponse.json(
        { error: "No account found with this phone number. Please sign up first." },
        { status: 404 }
      )
    }

    if (!(await canResendOTP(phone))) {
      return NextResponse.json(
        { error: "Please wait 60 seconds before requesting a new OTP" },
        { status: 429 }
      )
    }

    const otp = generateOTP()
    await storeOTP(phone, otp)

    const useTwilio = isTwilioConfigured()

    if (useTwilio) {
      try {
        await sendSms(phone, `Your MediVault verification code is: ${otp}. Valid for 5 minutes.`)
      } catch (smsError) {
        console.error("Twilio SMS error:", smsError)
        return NextResponse.json(
          { error: "Failed to send SMS. Please try again later." },
          { status: 500 }
        )
      }
    } else if (process.env.NODE_ENV === "development") {
      console.log(`[DEV] OTP for ${phone}: ${otp}`)
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      // In dev without Twilio, return OTP for testing
      ...(process.env.NODE_ENV === "development" && !useTwilio && { devOtp: otp }),
    })
  } catch (error) {
    console.error("OTP send error:", error)
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 })
  }
}
