"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin, Edit2, Trash2 } from "lucide-react"

export default function AdminDoctorsPage() {
  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Smith",
      email: "sarah.smith@hospital.com",
      phone: "+1 (555) 123-4567",
      specialty: "Cardiology",
      patients: 24,
      location: "New York, NY",
    },
    {
      id: 2,
      name: "Dr. James Johnson",
      email: "james.johnson@hospital.com",
      phone: "+1 (555) 234-5678",
      specialty: "Neurology",
      patients: 18,
      location: "Boston, MA",
    },
    {
      id: 3,
      name: "Dr. Emily Davis",
      email: "emily.davis@hospital.com",
      phone: "+1 (555) 345-6789",
      specialty: "Orthopedics",
      patients: 32,
      location: "Los Angeles, CA",
    },
    {
      id: 4,
      name: "Dr. Michael Brown",
      email: "michael.brown@hospital.com",
      phone: "+1 (555) 456-7890",
      specialty: "Pediatrics",
      patients: 28,
      location: "Chicago, IL",
    },
  ]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Doctors Management</h1>
          <p className="text-slate-600">Manage all registered doctors in the system.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">Add New Doctor</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {doctors.map((doctor) => (
          <Card key={doctor.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{doctor.name}</h3>
                <p className="text-sm text-blue-600 font-medium">{doctor.specialty}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {doctor.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {doctor.phone}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {doctor.location}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-sm">
                <span className="font-medium text-slate-900">{doctor.patients}</span>
                <span className="text-slate-600 ml-1">patients assigned</span>
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
