"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, TrendingUp } from "lucide-react"

export default function NursePatientsPage() {
  const patients = [
    {
      id: 1,
      code: "P-005",
      name: "Emily Brown",
      condition: "Stable",
      heartRate: 72,
      bloodPressure: "120/80",
      lastCheck: "2024-01-20 14:30",
    },
    {
      id: 2,
      code: "P-067",
      name: "Michael Lee",
      condition: "Monitoring",
      heartRate: 88,
      bloodPressure: "135/85",
      lastCheck: "2024-01-20 13:45",
    },
    {
      id: 3,
      code: "P-091",
      name: "Lisa Anderson",
      condition: "Alert",
      heartRate: 95,
      bloodPressure: "145/90",
      lastCheck: "2024-01-20 13:00",
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Patient Monitoring</h1>
        <p className="text-slate-600">Monitor vital signs and patient status.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {patients.map((patient) => (
          <Card key={patient.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{patient.name}</h3>
                <p className="text-sm text-slate-600">{patient.code}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  patient.condition === "Stable"
                    ? "bg-emerald-100 text-emerald-700"
                    : patient.condition === "Monitoring"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {patient.condition}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  <p className="text-xs text-slate-600">Heart Rate</p>
                </div>
                <p className="text-lg font-bold text-slate-900">{patient.heartRate} bpm</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <p className="text-xs text-slate-600">Blood Pressure</p>
                </div>
                <p className="text-lg font-bold text-slate-900">{patient.bloodPressure}</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-4">Last checked: {patient.lastCheck}</p>

            <div className="flex gap-2">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm">Update Vitals</Button>
              <Button variant="outline" className="flex-1 bg-transparent text-sm">
                View History
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
