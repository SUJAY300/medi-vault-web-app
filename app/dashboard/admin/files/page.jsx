"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Eye } from "lucide-react"
import { useState } from "react"

export default function AdminFilesPage() {
  const [filterType, setFilterType] = useState("All")

  const files = [
    {
      id: 1,
      name: "Lab Report",
      patient: "P-001 (John Doe)",
      uploadedBy: "Dr. Smith",
      diagnosingBy: "Dr. Smith, Nurse Davis",
      date: "2024-01-20",
      type: "PDF",
      status: "Processed",
    },
    {
      id: 2,
      name: "X-Ray Images",
      patient: "P-045 (Jane Smith)",
      uploadedBy: "Dr. Johnson",
      diagnosingBy: "Dr. Johnson, Nurse Wilson",
      date: "2024-01-18",
      type: "Images",
      status: "Processed",
    },
    {
      id: 3,
      name: "ECG Report",
      patient: "P-001 (John Doe)",
      uploadedBy: "Nurse Davis",
      diagnosingBy: "Dr. Smith",
      date: "2024-01-15",
      type: "PDF",
      status: "Processed",
    },
    {
      id: 4,
      name: "CT Scan",
      patient: "P-089 (Robert Johnson)",
      uploadedBy: "Dr. Wilson",
      diagnosingBy: "Dr. Wilson, Nurse Brown, Nurse Chen",
      date: "2024-01-12",
      type: "Medical Images",
      status: "Under Review",
    },
    {
      id: 5,
      name: "Blood Test Results",
      patient: "P-123 (Patricia Lee)",
      uploadedBy: "Dr. Martinez",
      diagnosingBy: "Dr. Martinez",
      date: "2024-01-10",
      type: "PDF",
      status: "Processed",
    },
    {
      id: 6,
      name: "Ultrasound Report",
      patient: "P-156 (Thomas Anderson)",
      uploadedBy: "Nurse Garcia",
      diagnosingBy: "Dr. Taylor, Nurse Garcia",
      date: "2024-01-08",
      type: "Medical Images",
      status: "Processed",
    },
  ]

  const fileTypes = ["All", "PDF", "Images", "Medical Images", "DOC"]
  const filteredFiles = filterType === "All" ? files : files.filter((f) => f.type === filterType)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">All Files</h1>
        <p className="text-slate-600">View and manage all medical files in the system.</p>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {fileTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition whitespace-nowrap ${
              filterType === type ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-slate-700">File Name</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Patient</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Uploaded By</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Diagnosing By</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr key={file.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-slate-900">{file.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{file.patient}</td>
                  <td className="py-3 px-4 text-slate-600">{file.uploadedBy}</td>
                  <td className="py-3 px-4 text-slate-600 text-xs">
                    <div className="flex flex-wrap gap-1">
                      {file.diagnosingBy.split(",").map((person, idx) => (
                        <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          {person.trim()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{file.date}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        file.status === "Processed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {file.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
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
