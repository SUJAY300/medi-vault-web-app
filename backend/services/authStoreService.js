/**
 * In-memory stores for auth (dev/demo).
 * Replace with MongoDB database for production.
 */

// OTP store: { phone: { otp, expiresAt } }
const otpStore = new Map()

// User store: { email: { id, email, passwordHash, role, fullName, ... } }
const userStore = new Map()

// Patient store by phone: { phone: { id, phone, fullName, role } }
const patientStore = new Map()

const OTP_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes
const OTP_COOLDOWN_MS = 60 * 1000 // 60 seconds before resend

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function storeOTP(phone, otp) {
  const normalizedPhone = phone.replace(/\D/g, "").slice(-10)
  otpStore.set(normalizedPhone, {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    createdAt: Date.now(),
  })
  return normalizedPhone
}

export function verifyOTP(phone, otp) {
  const normalizedPhone = phone.replace(/\D/g, "").slice(-10)
  const stored = otpStore.get(normalizedPhone)
  if (!stored) return { valid: false, error: "OTP not found or expired" }
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(normalizedPhone)
    return { valid: false, error: "OTP has expired" }
  }
  if (stored.otp !== otp) return { valid: false, error: "Invalid OTP" }
  otpStore.delete(normalizedPhone)
  return { valid: true }
}

export function canResendOTP(phone) {
  const normalizedPhone = phone.replace(/\D/g, "").slice(-10)
  const stored = otpStore.get(normalizedPhone)
  if (!stored) return true
  return Date.now() - stored.createdAt > OTP_COOLDOWN_MS
}

export function getStoredOTPForDev(phone) {
  const normalizedPhone = phone.replace(/\D/g, "").slice(-10)
  const stored = otpStore.get(normalizedPhone)
  return stored?.otp ?? null
}

export function createUser({ email, passwordHash, role, fullName, phone, license }) {
  const id = `${role}-${Date.now()}`
  const user = { id, email, passwordHash, role, fullName, phone, license }
  if (email) userStore.set(email.toLowerCase(), user)
  return user
}

export function createPatient({ phone, fullName }) {
  const normalizedPhone = phone.replace(/\D/g, "").slice(-10)
  const id = `Patient-${Date.now()}`
  const patient = { id, phone: normalizedPhone, fullName, role: "Patient" }
  patientStore.set(normalizedPhone, patient)
  return patient
}

export function getUserByEmail(email) {
  return userStore.get(email?.toLowerCase()) ?? null
}

export function getPatientByPhone(phone) {
  const normalizedPhone = phone.replace(/\D/g, "").slice(-10)
  return patientStore.get(normalizedPhone) ?? null
}

// Seed demo admin (password: Admin@123) - for development/testing
userStore.set("admin@medivault.com", {
  id: "Admin-1",
  email: "admin@medivault.com",
  passwordHash: "$2b$10$WsrhvggHu3kkWD4hXQz72OCSZk7deaRmiwk/EUKXcB865FM/imUN6",
  role: "Admin",
  fullName: "System Admin",
})
