"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Lock } from "lucide-react"
import { useState } from "react"

export default function AdminPatientsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const patients = [
    {
      code: "P-001",
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+1 (555) 111-1111",
      joinDate: "2024-01-10",
      status: "Active",
    },
    {
      code: "P-045",
      name: "Jane Smith",
      email: "jane.smith@email.com",
      phone: "+1 (555) 222-2222",
      joinDate: "2024-01-15",
      status: "Active",
    },
    {
      code: "P-089",
      name: "Robert Johnson",
      email: "robert.j@email.com",
      phone: "+1 (555) 333-3333",
      joinDate: "2024-01-20",
      status: "Inactive",
    },
    {
      code: "P-105",
      name: "Maria Garcia",
      email: "maria.garcia@email.com",
      phone: "+1 (555) 444-4444",
      joinDate: "2024-02-01",
      status: "Active",
    },
    {
      code: "P-142",
      name: "David Wilson",
      email: "david.w@email.com",
      phone: "+1 (555) 555-5555",
      joinDate: "2024-02-05",
      status: "Active",
    },
  ]

  const filtered = patients.filter(
    (p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.includes(searchTerm),
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Patients Management</h1>

        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by name or patient code..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">Add Patient</Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Patient Code</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Name</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Email</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Phone</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Join Date</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((patient) => (
                <tr key={patient.code} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-900">{patient.code}</td>
                  <td className="py-3 px-4 text-slate-700">{patient.name}</td>
                  <td className="py-3 px-4 text-slate-600">{patient.email}</td>
                  <td className="py-3 px-4 text-slate-600">{patient.phone}</td>
                  <td className="py-3 px-4 text-slate-600">{patient.joinDate}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        patient.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {patient.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Lock className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
