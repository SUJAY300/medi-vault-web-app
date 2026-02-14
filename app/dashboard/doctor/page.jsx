"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileText, Clock } from "lucide-react"
import Link from "next/link"

export default function DoctorDashboard() {
  const assignedPatients = [
    { code: "P-001", name: "John Doe", lastVisit: "2 days ago", status: "Active" },
    { code: "P-045", name: "Jane Smith", lastVisit: "1 week ago", status: "Active" },
    { code: "P-089", name: "Robert Johnson", lastVisit: "3 days ago", status: "Monitoring" },
  ]

  const myFiles = [
    { id: 1, patientCode: "P-001", fileName: "Lab Report", date: "2 hours ago", hasSummary: true },
    { id: 2, patientCode: "P-045", fileName: "Medical History", date: "1 day ago", hasSummary: true },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Doctor Dashboard</h1>
        <p className="text-slate-600">Manage your patients and medical files.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-2">Assigned Patients</p>
              <p className="text-3xl font-bold text-slate-900">12</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-2">Medical Files</p>
              <p className="text-3xl font-bold text-slate-900">34</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-100 text-emerald-600">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-2">Pending Reviews</p>
              <p className="text-3xl font-bold text-slate-900">5</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-100 text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Assigned Patients */}
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">My Assigned Patients</h3>
          <Link href="/dashboard/doctor/patients">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
        <div className="space-y-3">
          {assignedPatients.map((patient) => (
            <div key={patient.code} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">{patient.name}</p>
                <p className="text-sm text-slate-600">{patient.code}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-slate-600">{patient.lastVisit}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      patient.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {patient.status}
                  </span>
                </div>
                <Button size="sm" variant="outline">
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Files */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Recent Files</h3>
          <Link href="/dashboard/doctor/upload">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Upload File
            </Button>
          </Link>
        </div>
        <div className="space-y-3">
          {myFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300"
            >
              <div>
                <p className="font-medium text-slate-900">{file.fileName}</p>
                <p className="text-sm text-slate-600">
                  {file.patientCode} • {file.date}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {file.hasSummary && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                    Summary ✓
                  </span>
                )}
                <Button size="sm" variant="outline">
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
