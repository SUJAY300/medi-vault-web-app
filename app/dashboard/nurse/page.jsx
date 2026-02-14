"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileText, Heart } from "lucide-react"

export default function NurseDashboard() {
  const assignedPatients = [
    { code: "P-005", name: "Emily Brown", lastCheck: "2 hours ago", vitalStatus: "Stable" },
    { code: "P-067", name: "Michael Lee", lastCheck: "4 hours ago", vitalStatus: "Monitoring" },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Nurse Dashboard</h1>
        <p className="text-slate-600">Monitor assigned patients and medical files.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-2">Assigned Patients</p>
              <p className="text-3xl font-bold text-slate-900">8</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-2">Files Accessed</p>
              <p className="text-3xl font-bold text-slate-900">24</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-100 text-emerald-600">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-2">Flagged Items</p>
              <p className="text-3xl font-bold text-slate-900">3</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-100 text-amber-600">
              <Heart className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Assigned Patients Monitoring */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">My Assigned Patients</h3>
        <div className="space-y-3">
          {assignedPatients.map((patient) => (
            <div key={patient.code} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">{patient.name}</p>
                <p className="text-sm text-slate-600">
                  {patient.code} • Last check: {patient.lastCheck}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    patient.vitalStatus === "Stable" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {patient.vitalStatus}
                </span>
                <Button size="sm" variant="outline">
                  Monitor
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
