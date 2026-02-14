/**
 * Twilio SMS helper for OTP delivery.
 * Requires: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 */

export function isTwilioConfigured() {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  )
}

/**
 * Format phone to E.164 for Twilio.
 * Assumes US (+1) if 10 digits, otherwise passes through with + prefix.
 */
export function formatPhoneE164(phone) {
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`
  return `+${digits}`
}

export async function sendSms(to, body) {
  const twilio = (await import("twilio")).default
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  )
  return client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: formatPhoneE164(to),
  })
}
