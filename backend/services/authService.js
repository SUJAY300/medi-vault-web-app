/**
 * Auth service - uses MySQL when DATABASE_URL is set, otherwise in-memory demo.
 * Falls back to in-memory if DB connection fails.
 */

const hasDatabase = !!process.env.DATABASE_URL

async function getAuth() {
  if (hasDatabase) {
    try {
      return await import("./authDbService")
    } catch (e) {
      console.warn("Database unavailable, using in-memory auth:", e.message)
    }
  }
  return import("./authStoreService")
}

async function withFallback(fn, ...args) {
  try {
    const auth = await getAuth()
    const result = await auth[fn](...args)
    return result
  } catch (e) {
    if (hasDatabase) {
      console.warn("Auth DB error, falling back to in-memory:", e.message)
      const auth = await import("./authStoreService")
      return await auth[fn](...args)
    }
    throw e
  }
}

export async function getUserByEmail(email) {
  return withFallback("getUserByEmail", email)
}

export async function getPatientByPhone(phone) {
  return withFallback("getPatientByPhone", phone)
}

export async function createUser(data) {
  return withFallback("createUser", data)
}

export async function createPatient(data) {
  return withFallback("createPatient", data)
}

export async function storeOTP(phone, otp) {
  return withFallback("storeOTP", phone, otp)
}

export async function verifyOTP(phone, otp) {
  return withFallback("verifyOTP", phone, otp)
}

export async function canResendOTP(phone) {
  return withFallback("canResendOTP", phone)
}

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
