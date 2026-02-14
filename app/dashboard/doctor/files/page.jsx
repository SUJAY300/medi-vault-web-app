"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Eye, AlertCircle } from "lucide-react"
import { useState } from "react"

export default function DoctorFilesPage() {
  const [reportFile, setReportFile] = useState(null)

  const files = [
    {
      id: 1,
      name: "Lab Report",
      patient: "P-001 (John Doe)",
      diagnosingTeam: "Dr. Smith, Nurse Davis",
      date: "2024-01-20",
      type: "PDF",
      hasSummary: true,
    },
    {
      id: 2,
      name: "X-Ray Images",
      patient: "P-045 (Jane Smith)",
      diagnosingTeam: "Dr. Johnson, Nurse Wilson",
      date: "2024-01-18",
      type: "Images",
      hasSummary: false,
    },
    {
      id: 3,
      name: "ECG Report",
      patient: "P-001 (John Doe)",
      diagnosingTeam: "Dr. Smith",
      date: "2024-01-15",
      type: "PDF",
      hasSummary: true,
    },
    {
      id: 4,
      name: "Prescription Notes",
      patient: "P-089 (Robert Johnson)",
      diagnosingTeam: "Dr. Smith, Nurse Brown",
      date: "2024-01-12",
      type: "DOC",
      hasSummary: true,
    },
  ]

  const handleReport = (fileId, fileName) => {
    // TODO: Integrate with reporting system - should send file for detailed analysis
    setReportFile(fileId)
    console.log("Reporting file:", fileName)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Files</h1>
        <p className="text-slate-600">View all your uploaded medical files and their diagnosis team.</p>
      </div>

      {reportFile && (
        <Card className="mb-6 p-4 bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-blue-900">File Report Submitted</p>
              <p className="text-sm text-blue-800">
                Your report has been queued for detailed analysis. You will receive notifications once processing is
                complete.
              </p>
            </div>
            <button
              onClick={() => setReportFile(null)}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Dismiss
            </button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-slate-700">File Name</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Patient</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Diagnosing Team</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Type</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Summary</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-slate-900">{file.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{file.patient}</td>
                  <td className="py-3 px-4 text-slate-600 text-xs">
                    <div className="flex flex-wrap gap-1">
                      {file.diagnosingTeam.split(",").map((person, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {person.trim()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{file.date}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">{file.type}</span>
                  </td>
                  <td className="py-3 px-4">
                    {file.hasSummary ? (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                        ✓ Available
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">Pending</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" title="View file">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" title="Download file">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                        onClick={() => handleReport(file.id, file.name)}
                        title="Report file for analysis"
                      >
                        Report
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
