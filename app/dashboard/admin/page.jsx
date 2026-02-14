"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileText, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const stats = [
    { label: "Total Patients", value: 248, icon: Users, color: "bg-blue-100 text-blue-600" },
    { label: "Total Files", value: 1204, icon: FileText, color: "bg-emerald-100 text-emerald-600" },
    { label: "Doctors", value: 12, icon: Users, color: "bg-purple-100 text-purple-600" },
    { label: "Pending Reports", value: 8, icon: AlertCircle, color: "bg-amber-100 text-amber-600" },
  ]

  const recentUploads = [
    { id: 1, patientCode: "P-001", fileName: "Lab Report", type: "PDF", uploadedBy: "Dr. Smith", date: "2 hours ago" },
    {
      id: 2,
      patientCode: "P-045",
      fileName: "X-Ray Images",
      type: "Images",
      uploadedBy: "Dr. Johnson",
      date: "4 hours ago",
    },
    {
      id: 3,
      patientCode: "P-089",
      fileName: "Medical History",
      type: "PDF",
      uploadedBy: "Nurse Davis",
      date: "1 day ago",
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
        <p className="text-slate-600">Welcome back! Here's your system overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link href="/dashboard/admin/upload">
              <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
                Upload New File
              </Button>
            </Link>
            <Link href="/dashboard/admin/patients">
              <Button variant="outline" className="w-full bg-transparent" size="sm">
                Manage Patients
              </Button>
            </Link>
            <Link href="/dashboard/admin/doctors">
              <Button variant="outline" className="w-full bg-transparent" size="sm">
                View Doctors
              </Button>
            </Link>
            <Link href="/dashboard/admin/nurses">
              <Button variant="outline" className="w-full bg-transparent" size="sm">
                View Nurses
              </Button>
            </Link>
            <Link href="/dashboard/admin/files">
              <Button variant="outline" className="w-full bg-transparent" size="sm">
                View All Files
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Server Status</span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Database</span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">API Gateway</span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                Healthy
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Uploads Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Uploads</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Patient Code</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">File Name</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Type</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Uploaded By</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentUploads.map((upload) => (
                <tr key={upload.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-900">{upload.patientCode}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{upload.fileName}</td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {upload.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{upload.uploadedBy}</td>
                  <td className="py-3 px-4 text-slate-600">{upload.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
