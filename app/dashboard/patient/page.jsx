"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download } from "lucide-react"

export default function PatientDashboard() {
  const myFiles = [
    { id: 1, name: "Lab Report", date: "2024-01-15", size: "2.3 MB", type: "PDF" },
    { id: 2, name: "X-Ray Images", date: "2024-01-10", size: "45.8 MB", type: "Images" },
    { id: 3, name: "Medical History", date: "2024-01-05", size: "1.2 MB", type: "PDF" },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Medical Files</h1>
        <p className="text-slate-600">View and download your medical documents.</p>
      </div>

      {/* Info Card */}
      <Card className="p-6 mb-8 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-slate-900 mb-2">Patient Information</h3>
        <p className="text-sm text-slate-600">
          You can only view and download your own medical files. For questions about your records, please contact your
          healthcare provider.
        </p>
      </Card>

      {/* Files List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">My Files</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-slate-700">File Name</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Type</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Size</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {myFiles.map((file) => (
                <tr key={file.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-slate-900">{file.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{file.date}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">{file.type}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{file.size}</td>
                  <td className="py-3 px-4">
                    <Button size="sm" variant="outline" className="flex items-center gap-2 bg-transparent">
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
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
