"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const userRole = localStorage.getItem("userRole")
    if (!userRole) {
      router.push("/auth/login")
      return
    }
    setRole(userRole)
    setMounted(true)
  }, [router])

  if (!mounted || !role) {
    return null
  }

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar role={role} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
