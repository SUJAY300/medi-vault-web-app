"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Phone, Mail } from "lucide-react"

export default function AdminNursesPage() {
  const nurses = [
    {
      id: 1,
      name: "Sarah Davis",
      nurseLicense: "RN-2024-001",
      department: "ICU",
      phone: "+1 (555) 001-1111",
      email: "sarah.davis@medivault.com",
      patients: 8,
      status: "Active",
    },
    {
      id: 2,
      name: "Michael Johnson",
      nurseLicense: "RN-2024-002",
      department: "Emergency",
      phone: "+1 (555) 001-2222",
      email: "michael.johnson@medivault.com",
      patients: 12,
      status: "Active",
    },
    {
      id: 3,
      name: "Emma Wilson",
      nurseLicense: "RN-2024-003",
      department: "Pediatrics",
      phone: "+1 (555) 001-3333",
      email: "emma.wilson@medivault.com",
      patients: 6,
      status: "Active",
    },
    {
      id: 4,
      name: "James Brown",
      nurseLicense: "RN-2024-004",
      department: "Cardiology",
      phone: "+1 (555) 001-4444",
      email: "james.brown@medivault.com",
      patients: 9,
      status: "On Leave",
    },
    {
      id: 5,
      name: "Lisa Chen",
      nurseLicense: "RN-2024-005",
      department: "Surgery",
      phone: "+1 (555) 001-5555",
      email: "lisa.chen@medivault.com",
      patients: 7,
      status: "Active",
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Nurses Management</h1>
        <p className="text-slate-600">Manage all nurses in the system.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {nurses.map((nurse) => (
          <Card key={nurse.id} className="p-6">
            <div className="mb-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-slate-900">{nurse.name}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    nurse.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {nurse.status}
                </span>
              </div>
              <p className="text-sm text-blue-600">{nurse.nurseLicense}</p>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users className="w-4 h-4 text-slate-400" />
                <span>{nurse.department} Department</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{nurse.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{nurse.email}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg mb-4">
              <p className="text-xs text-slate-600">Assigned Patients</p>
              <p className="text-2xl font-bold text-slate-900">{nurse.patients}</p>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm">View Profile</Button>
              <Button variant="outline" className="flex-1 bg-transparent text-sm">
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
