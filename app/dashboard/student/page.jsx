"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, FileText, Download } from "lucide-react"

export default function StudentDashboard() {
  const cases = [
    {
      id: 1,
      caseId: "CASE-001",
      title: "Diabetes Type 2 Management",
      specialty: "Endocrinology",
      files: 5,
      flagged: false,
    },
    { id: 2, caseId: "CASE-045", title: "Cardiac Arrhythmia", specialty: "Cardiology", files: 8, flagged: true },
    { id: 3, caseId: "CASE-089", title: "Respiratory Infection", specialty: "Pulmonology", files: 4, flagged: false },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Student Dashboard</h1>
        <p className="text-slate-600">Learn from medical cases and build your knowledge.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-2">Available Cases</p>
              <p className="text-3xl font-bold text-slate-900">48</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-2">Reviewed Cases</p>
              <p className="text-3xl font-bold text-slate-900">12</p>
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
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Cases */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Recent Cases</h3>
        <div className="space-y-3">
          {cases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-slate-900">{caseItem.title}</p>
                  {caseItem.flagged && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                      Flagged
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600">
                  {caseItem.caseId} • {caseItem.specialty} • {caseItem.files} files
                </p>
              </div>
              <Button size="sm" variant="outline" className="flex items-center gap-2 bg-transparent">
                <Download className="w-4 h-4" />
                Review
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
