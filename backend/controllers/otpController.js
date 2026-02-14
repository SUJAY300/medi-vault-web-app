import { storeOTP, generateOTP, canResendOTP, getPatientByPhone, verifyOTP } from "../services/authService"
import { isTwilioConfigured, sendSms } from "../config/twilio"

export async function sendOtpController(phone) {
  // Check if patient is registered
  const patient = await getPatientByPhone(phone)
  if (!patient) {
    return {
      success: false,
      error: "No account found with this phone number. Please sign up first.",
      status: 404,
    }
  }

  if (!(await canResendOTP(phone))) {
    return {
      success: false,
      error: "Please wait 60 seconds before requesting a new OTP",
      status: 429,
    }
  }

  const otp = generateOTP()
  await storeOTP(phone, otp)

  const useTwilio = isTwilioConfigured()

  if (useTwilio) {
    try {
      await sendSms(phone, `Your MediVault verification code is: ${otp}. Valid for 5 minutes.`)
    } catch (smsError) {
      console.error("Twilio SMS error:", smsError)
      return {
        success: false,
        error: "Failed to send SMS. Please try again later.",
        status: 500,
      }
    }
  } else if (process.env.NODE_ENV === "development") {
    console.log(`[DEV] OTP for ${phone}: ${otp}`)
  }

  return {
    success: true,
    message: "OTP sent successfully",
    // In dev without Twilio, return OTP for testing
    ...(process.env.NODE_ENV === "development" && !useTwilio && { devOtp: otp }),
  }
}

export async function verifyOtpController(phone, otp) {
  const result = await verifyOTP(phone, otp)
  if (!result.valid) {
    return { success: false, error: result.error, status: 400 }
  }

  const patient = await getPatientByPhone(phone)
  if (!patient) {
    return {
      success: false,
      error: "Account not found. Please sign up first.",
      status: 404,
    }
  }

  return {
    success: true,
    user: {
      id: patient.id,
      role: patient.role,
      fullName: patient.fullName,
      phone: patient.phone,
    },
  }
}
