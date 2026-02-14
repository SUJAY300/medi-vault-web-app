import { z } from "zod"

// Phone validation - E.164 format or common formats
const phoneSchema = z
  .string()
  .min(10, "Phone number must be at least 10 digits")
  .max(15, "Phone number must be at most 15 digits")
  .regex(/^[\d\s\-+()]+$/, "Invalid phone number format")

// Password validation
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")

// OTP validation
export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
})

// Patient OTP send
export const patientOtpSendSchema = z.object({
  phone: phoneSchema,
})

// Patient OTP verify (phone + otp)
export const patientOtpVerifySchema = patientOtpSendSchema.merge(otpSchema)

// Professional login
export const professionalLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

// Signup schemas
export const patientSignupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: phoneSchema,
})

// Refined version - license required only for Doctor/Nurse
export const createSignupSchema = (role) => {
  if (!role) return z.object({})
  const base = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email").optional(),
    phone: z.string().optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    license: z.string().optional(),
  })

  if (role === "Patient") {
    return z.object({
      fullName: z.string().min(2, "Name must be at least 2 characters"),
      phone: phoneSchema,
    })
  }

  if (["Doctor", "Nurse"].includes(role)) {
    return z
      .object({
        fullName: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Please enter a valid email address"),
        phone: z.string().optional(),
        password: passwordSchema,
        confirmPassword: z.string(),
        license: z.string().min(1, "License number is required"),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      })
  }

  // Admin, Student
  return z
    .object({
      fullName: z.string().min(2, "Name must be at least 2 characters"),
      email: z.string().email("Please enter a valid email address"),
      phone: z.string().optional(),
      password: passwordSchema,
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    })
}
