"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Lock, User, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function PatientSettingsPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: "John Doe",
    email: "john.doe@email.com",
    phone: "+1 (555) 111-1111",
    dob: "1990-05-15",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("userId")
    router.push("/")
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-600">Manage your account settings and preferences.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Profile Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <Input type="text" name="fullName" value={formData.fullName} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <Input type="email" name="email" value={formData.email} onChange={handleChange} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
              <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date of Birth</label>
              <Input type="date" name="dob" value={formData.dob} onChange={handleChange} />
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 w-full">Save Changes</Button>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm text-slate-700">Email notifications for new files</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm text-slate-700">SMS alerts for urgent messages</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-sm text-slate-700">Marketing emails</span>
            </label>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Security</h2>
          </div>

          <div className="space-y-4">
            <Button variant="outline" className="w-full bg-transparent">
              Change Password
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              Enable Two-Factor Authentication
            </Button>
          </div>
        </Card>

        {/* Logout */}
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center gap-3 mb-4">
            <LogOut className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">Logout</h2>
          </div>
          <p className="text-sm text-red-700 mb-4">You will be logged out of your account.</p>
          <Button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700">
            Logout
          </Button>
        </Card>
      </div>
    </div>
  )
}
