/**
 * Auth database service - MongoDB for structured user data
 */

import connectDB from "../config/mongodb"
import User from "../models/User"
import OtpSession from "../models/OtpSession"

const OTP_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes
const OTP_COOLDOWN_MS = 60 * 1000 // 60 seconds before resend

function normalizePhone(phone) {
  return phone.replace(/\D/g, "").slice(-10)
}

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function storeOTP(phone, otp) {
  await connectDB()
  const normalized = normalizePhone(phone)
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS)
  await OtpSession.create({
    phone: normalized,
    otp,
    expiresAt,
  })
  return normalized
}

export async function verifyOTP(phone, otp) {
  await connectDB()
  const normalized = normalizePhone(phone)
  const session = await OtpSession.findOne({ phone: normalized })
    .sort({ createdAt: -1 })
    .lean()
  
  if (!session) return { valid: false, error: "OTP not found or expired" }
  if (new Date() > session.expiresAt) {
    await OtpSession.deleteMany({ phone: normalized })
    return { valid: false, error: "OTP has expired" }
  }
  if (session.otp !== otp) return { valid: false, error: "Invalid OTP" }
  await OtpSession.deleteMany({ phone: normalized })
  return { valid: true }
}

export async function canResendOTP(phone) {
  await connectDB()
  const normalized = normalizePhone(phone)
  const session = await OtpSession.findOne({ phone: normalized })
    .sort({ createdAt: -1 })
    .lean()
  
  if (!session) return true
  return Date.now() - new Date(session.createdAt).getTime() > OTP_COOLDOWN_MS
}

export async function createUser({ email, passwordHash, role, fullName, phone, license }) {
  await connectDB()
  const user = await User.create({
    email: email?.toLowerCase(),
    phone: phone ? normalizePhone(phone) : null,
    passwordHash,
    role,
    fullName,
    license,
  })
  // Convert MongoDB _id to id for consistency
  return {
    ...user.toObject(),
    id: user._id.toString(),
  }
}

export async function createPatient({ phone, fullName }) {
  await connectDB()
  const normalized = normalizePhone(phone)
  const user = await User.create({
    phone: normalized,
    role: "Patient",
    fullName,
  })
  // Convert MongoDB _id to id for consistency
  return {
    ...user.toObject(),
    id: user._id.toString(),
  }
}

export async function getUserByEmail(email) {
  if (!email) return null
  await connectDB()
  const user = await User.findOne({ email: email.toLowerCase() }).lean()
  if (!user) return null
  // Convert MongoDB _id to id for consistency
  return {
    ...user,
    id: user._id.toString(),
  }
}

export async function getPatientByPhone(phone) {
  await connectDB()
  const normalized = normalizePhone(phone)
  const user = await User.findOne({ phone: normalized }).lean()
  if (!user || user.role !== "Patient") return null
  return {
    id: user._id.toString(),
    phone: user.phone,
    fullName: user.fullName,
    role: user.role,
  }
}
