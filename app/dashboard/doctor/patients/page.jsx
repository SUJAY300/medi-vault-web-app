"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, MessageSquare } from "lucide-react"
import { useState } from "react"

export default function DoctorPatientsPage() {
  const [selectedPatient, setSelectedPatient] = useState(null)

  const patients = [
    {
      id: 1,
      code: "P-001",
      name: "John Doe",
      condition: "Hypertension",
      lastVisit: "2024-01-20",
      nextAppointment: "2024-02-10",
    },
    {
      id: 2,
      code: "P-045",
      name: "Jane Smith",
      condition: "Diabetes Type 2",
      lastVisit: "2024-01-18",
      nextAppointment: "2024-02-08",
    },
    {
      id: 3,
      code: "P-089",
      name: "Robert Johnson",
      condition: "Asthma",
      lastVisit: "2024-01-15",
      nextAppointment: "2024-02-05",
    },
    {
      id: 4,
      code: "P-102",
      name: "Sarah Wilson",
      condition: "GERD",
      lastVisit: "2024-01-12",
      nextAppointment: "2024-02-02",
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Patients</h1>
        <p className="text-slate-600">View and manage all your assigned patients.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patients List */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <input
              type="text"
              placeholder="Search patients..."
              className="w-full px-3 py-2 border border-slate-200 rounded mb-4 text-sm"
            />
            <div className="space-y-2">
              {patients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    selectedPatient?.id === patient.id
                      ? "bg-blue-100 border border-blue-300"
                      : "bg-slate-50 border border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <p className="font-medium text-slate-900">{patient.name}</p>
                  <p className="text-xs text-slate-600">{patient.code}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Patient Details */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedPatient.name}</h2>
                <p className="text-slate-600">{selectedPatient.code}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Current Condition</p>
                  <p className="font-semibold text-slate-900">{selectedPatient.condition}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Last Visit</p>
                  <p className="font-semibold text-slate-900">{selectedPatient.lastVisit}</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                <p className="text-sm text-slate-600 mb-1">Next Appointment</p>
                <p className="text-lg font-semibold text-blue-900">{selectedPatient.nextAppointment}</p>
              </div>

              <div className="space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  View Medical Files
                </Button>
                <Button variant="outline" className="w-full flex items-center justify-center gap-2 bg-transparent">
                  <Calendar className="w-4 h-4" />
                  Schedule Appointment
                </Button>
                <Button variant="outline" className="w-full flex items-center justify-center gap-2 bg-transparent">
                  <MessageSquare className="w-4 h-4" />
                  Send Message
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-8 flex items-center justify-center h-96">
              <p className="text-slate-500">Select a patient to view details</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
