"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { LogOut, Home, FileText, Users, MessageSquare, Settings } from "lucide-react"
import { useEffect, useState } from "react"

export function Sidebar({ role }) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const menuItems = {
    Admin: [
      { label: "Dashboard", href: "/dashboard/admin", icon: Home },
      { label: "Upload Files", href: "/dashboard/admin/upload", icon: FileText },
      { label: "Doctors List", href: "/dashboard/admin/doctors", icon: Users },
      { label: "Nurses List", href: "/dashboard/admin/nurses", icon: Users },
      { label: "Patients List", href: "/dashboard/admin/patients", icon: Users },
      { label: "Chatbot", href: "/dashboard/admin/chatbot", icon: MessageSquare },
    ],
    Doctor: [
      { label: "Dashboard", href: "/dashboard/doctor", icon: Home },
      { label: "My Patients", href: "/dashboard/doctor/patients", icon: Users },
      { label: "Upload Files", href: "/dashboard/doctor/upload", icon: FileText },
      { label: "My Files", href: "/dashboard/doctor/files", icon: FileText },
      { label: "Chatbot", href: "/dashboard/doctor/chatbot", icon: MessageSquare },
    ],
    Nurse: [
      { label: "Dashboard", href: "/dashboard/nurse", icon: Home },
      { label: "Assigned Patients", href: "/dashboard/nurse/patients", icon: Users },
      { label: "Files", href: "/dashboard/nurse/files", icon: FileText },
      { label: "Chatbot", href: "/dashboard/nurse/chatbot", icon: MessageSquare },
    ],
    Student: [
      { label: "Dashboard", href: "/dashboard/student", icon: Home },
      { label: "Cases", href: "/dashboard/student/cases", icon: FileText },
      { label: "Chatbot", href: "/dashboard/student/chatbot", icon: MessageSquare },
    ],
    Patient: [
      { label: "My Files", href: "/dashboard/patient", icon: FileText },
      { label: "Settings", href: "/dashboard/patient/settings", icon: Settings },
    ],
  }

  const items = menuItems[role] || []

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("userId")
    window.location.href = "/"
  }

  if (!mounted) return null

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-emerald-400 rounded-lg"></div>
          <h2 className="font-bold text-lg">MediVault</h2>
        </div>
        <p className="text-sm text-slate-400">{role}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg transition"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}
