import bcrypt from "bcryptjs"
import { createUser, createPatient, getUserByEmail, getPatientByPhone } from "../services/authService"
import { createSignupSchema } from "../../shared/schemas/authSchemas"

export async function loginController(email, password) {
  const user = await getUserByEmail(email)
  if (!user) {
    return { success: false, error: "Invalid email or password", status: 401 }
  }

  const match = await bcrypt.compare(password, user.passwordHash)
  if (!match) {
    return { success: false, error: "Invalid email or password", status: 401 }
  }

  return {
    success: true,
    user: {
      id: user.id,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
    },
  }
}

export async function signupController(role, formData) {
  const schema = createSignupSchema(role)
  const parsed = schema.safeParse(formData)
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]
    return { success: false, error: firstError?.message ?? "Invalid input", status: 400 }
  }
  const data = parsed.data

  if (role === "Patient") {
    const existing = await getPatientByPhone(data.phone)
    if (existing) {
      return {
        success: false,
        error: "An account with this phone number already exists",
        status: 409,
      }
    }
    const patient = await createPatient({ phone: data.phone, fullName: data.fullName })
    return {
      success: true,
      user: { id: patient.id, role: patient.role, fullName: patient.fullName, phone: patient.phone },
    }
  }

  // Professional signup
  const existing = await getUserByEmail(data.email)
  if (existing) {
    return {
      success: false,
      error: "An account with this email already exists",
      status: 409,
    }
  }

  const passwordHash = await bcrypt.hash(data.password, 10)
  const user = await createUser({
    email: data.email,
    passwordHash,
    role,
    fullName: data.fullName,
    phone: data.phone,
    license: data.license,
  })

  return {
    success: true,
    user: { id: user.id, role: user.role, fullName: user.fullName, email: user.email },
  }
}
