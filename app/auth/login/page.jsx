"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useToast } from "@/hooks/use-toast"
import { Shield } from "lucide-react"
import { patientOtpSendSchema, otpSchema, professionalLoginSchema } from "../../../shared/schemas/authSchemas"

const ROLES = ["Admin", "Doctor", "Nurse", "Student", "Patient"]
const DASHBOARD_ROUTES = {
  Admin: "/dashboard/admin",
  Doctor: "/dashboard/doctor",
  Nurse: "/dashboard/nurse",
  Student: "/dashboard/student",
  Patient: "/dashboard/patient",
}

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [role, setRole] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otpPhone, setOtpPhone] = useState("")
  const [otpCooldown, setOtpCooldown] = useState(0)
  const [devOtp, setDevOtp] = useState("")

  const professionalForm = useForm({
    resolver: zodResolver(professionalLoginSchema),
    defaultValues: { email: "", password: "" },
  })

  const patientPhoneForm = useForm({
    resolver: zodResolver(patientOtpSendSchema),
    defaultValues: { phone: "" },
  })

  const patientOtpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  })

  const handleProfessionalLogin = async (values) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const data = await res.json()

      if (!res.ok) {
        toast({ variant: "destructive", title: "Login failed", description: data.error })
        return
      }

      localStorage.setItem("userRole", data.user.role)
      localStorage.setItem("userId", data.user.id)
      localStorage.setItem("userName", data.user.fullName || "")
      toast({ title: "Welcome back!", description: `Logged in as ${data.user.fullName}` })
      router.push(DASHBOARD_ROUTES[data.user.role] || "/dashboard")
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Something went wrong" })
    }
  }

  const handleSendOTP = async (values) => {
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const data = await res.json()

      if (!res.ok) {
        toast({ variant: "destructive", title: "Could not send OTP", description: data.error })
        return
      }

      setOtpSent(true)
      setOtpPhone(values.phone)
      setDevOtp(data.devOtp || "")
      setOtpCooldown(60)
      const interval = setInterval(() => {
        setOtpCooldown((c) => {
          if (c <= 1) clearInterval(interval)
          return c - 1
        })
      }, 1000)
      toast({ title: "OTP sent", description: "Check your phone for the verification code" })
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to send OTP" })
    }
  }

  const handleVerifyOTP = async (values) => {
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: otpPhone, otp: values.otp }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast({ variant: "destructive", title: "Verification failed", description: data.error })
        return
      }

      localStorage.setItem("userRole", data.user.role)
      localStorage.setItem("userId", data.user.id)
      localStorage.setItem("userName", data.user.fullName || "")
      toast({ title: "Welcome!", description: `Logged in as ${data.user.fullName}` })
      router.push(DASHBOARD_ROUTES[data.user.role] || "/dashboard")
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Verification failed" })
    }
  }

  const resetOtpFlow = () => {
    setOtpSent(false)
    setDevOtp("")
    patientPhoneForm.reset()
    patientOtpForm.reset()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-slate-900 mb-8">MediVault Login</h1>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">Select Your Role</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r)
                    resetOtpFlow()
                  }}
                  className={`p-3 rounded-lg border-2 font-medium transition ${
                    role === r
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {role && (
            <>
              {role === "Patient" ? (
                !otpSent ? (
                  <Form {...patientPhoneForm}>
                    <form onSubmit={patientPhoneForm.handleSubmit(handleSendOTP)} className="space-y-4">
                      <FormField
                        control={patientPhoneForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                        Send OTP
                      </Button>
                    </form>
                  </Form>
                ) : (
                  <Form {...patientOtpForm}>
                    <form onSubmit={patientOtpForm.handleSubmit(handleVerifyOTP)} className="space-y-4">
                      <FormField
                        control={patientOtpForm.control}
                        name="otp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Enter 6-digit OTP</FormLabel>
                            <FormControl>
                              <InputOTP
                                maxLength={6}
                                {...field}
                                onChange={(val) => field.onChange(val)}
                              >
                                <InputOTPGroup className="justify-center">
                                  {[0, 1, 2, 3, 4, 5].map((i) => (
                                    <InputOTPSlot key={i} index={i} />
                                  ))}
                                </InputOTPGroup>
                              </InputOTP>
                            </FormControl>
                            <FormMessage />
                            {devOtp && (
                              <p className="text-xs text-amber-600 mt-1">
                                Dev mode: OTP is {devOtp} (check server console)
                              </p>
                            )}
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                        Verify OTP
                      </Button>
                      <div className="flex gap-2">
                        {otpCooldown > 0 ? (
                          <Button type="button" variant="outline" className="flex-1" disabled>
                            Resend in {otpCooldown}s
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleSendOTP({ phone: otpPhone })}
                          >
                            Resend OTP
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={resetOtpFlow}
                        >
                          Change Phone
                        </Button>
                      </div>
                    </form>
                  </Form>
                )
              ) : (
                <Form {...professionalForm}>
                  <form onSubmit={professionalForm.handleSubmit(handleProfessionalLogin)} className="space-y-4">
                    <FormField
                      control={professionalForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="name@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={professionalForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                      Login
                    </Button>
                  </form>
                </Form>
              )}
            </>
          )}

          <p className="text-center text-sm text-slate-600 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-blue-600 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
