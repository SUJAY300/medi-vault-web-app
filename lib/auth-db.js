/**
 * Auth database layer - Prisma/MySQL for structured user data
 */

import { prisma } from "@/lib/db"

const OTP_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes
const OTP_COOLDOWN_MS = 60 * 1000 // 60 seconds before resend

function normalizePhone(phone) {
  return phone.replace(/\D/g, "").slice(-10)
}

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function storeOTP(phone, otp) {
  const normalized = normalizePhone(phone)
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS)
  await prisma.otpSession.create({
    data: { phone: normalized, otp, expiresAt },
  })
  return normalized
}

export async function verifyOTP(phone, otp) {
  const normalized = normalizePhone(phone)
  const session = await prisma.otpSession.findFirst({
    where: { phone: normalized },
    orderBy: { createdAt: "desc" },
  })
  if (!session) return { valid: false, error: "OTP not found or expired" }
  if (new Date() > session.expiresAt) {
    await prisma.otpSession.deleteMany({ where: { phone: normalized } })
    return { valid: false, error: "OTP has expired" }
  }
  if (session.otp !== otp) return { valid: false, error: "Invalid OTP" }
  await prisma.otpSession.deleteMany({ where: { phone: normalized } })
  return { valid: true }
}

export async function canResendOTP(phone) {
  const normalized = normalizePhone(phone)
  const session = await prisma.otpSession.findFirst({
    where: { phone: normalized },
    orderBy: { createdAt: "desc" },
  })
  if (!session) return true
  return Date.now() - session.createdAt.getTime() > OTP_COOLDOWN_MS
}

export async function createUser({ email, passwordHash, role, fullName, phone, license }) {
  const user = await prisma.user.create({
    data: {
      email: email?.toLowerCase(),
      phone: phone ? normalizePhone(phone) : null,
      passwordHash,
      role,
      fullName,
      license,
    },
  })
  return user
}

export async function createPatient({ phone, fullName }) {
  const normalized = normalizePhone(phone)
  const user = await prisma.user.create({
    data: {
      phone: normalized,
      role: "Patient",
      fullName,
    },
  })
  return user
}

export async function getUserByEmail(email) {
  if (!email) return null
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })
}

export async function getPatientByPhone(phone) {
  const normalized = normalizePhone(phone)
  const user = await prisma.user.findUnique({
    where: { phone: normalized },
  })
  if (!user || user.role !== "Patient") return null
  return {
    id: user.id,
    phone: user.phone,
    fullName: user.fullName,
    role: user.role,
  }
}
