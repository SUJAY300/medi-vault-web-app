"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Bookmark, AlertCircle } from "lucide-react"
import { useState } from "react"

export default function StudentCasesPage() {
  const [savedCases, setSavedCases] = useState([1])
  const [reportCase, setReportCase] = useState(null)

  const cases = [
    {
      id: 1,
      title: "Diabetes Type 2 Management",
      specialty: "Endocrinology",
      files: 5,
      difficulty: "Intermediate",
      description: "Case study on managing diabetes in a 55-year-old patient.",
      doctor: "Dr. Smith",
    },
    {
      id: 2,
      title: "Cardiac Arrhythmia",
      specialty: "Cardiology",
      files: 8,
      difficulty: "Advanced",
      description: "Complex case involving atrial fibrillation management.",
      doctor: "Dr. Johnson",
    },
    {
      id: 3,
      title: "Respiratory Infection",
      specialty: "Pulmonology",
      files: 4,
      difficulty: "Beginner",
      description: "Acute bacterial pneumonia case with imaging.",
      doctor: "Dr. Wilson",
    },
    {
      id: 4,
      title: "Gastric Ulcer",
      specialty: "Gastroenterology",
      files: 6,
      difficulty: "Intermediate",
      description: "Case of peptic ulcer disease with endoscopy findings.",
      doctor: "Dr. Martinez",
    },
  ]

  const toggleSave = (id) => {
    setSavedCases((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  const handleReport = (caseId, caseName) => {
    // TODO: Integrate with case analysis system - should submit case for detailed review
    setReportCase(caseId)
    console.log("Reporting case:", caseName)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Medical Cases</h1>
        <p className="text-slate-600">Learn from real-world medical cases and build your clinical knowledge.</p>
      </div>

      {reportCase && (
        <Card className="mb-6 p-4 bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-blue-900">Case Report Submitted</p>
              <p className="text-sm text-blue-800">
                Your case report has been submitted for review. Your instructor will provide feedback shortly.
              </p>
            </div>
            <button
              onClick={() => setReportCase(null)}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Dismiss
            </button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cases.map((caseItem) => (
          <Card key={caseItem.id} className="p-6 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">{caseItem.title}</h3>
                <p className="text-sm text-blue-600">{caseItem.specialty}</p>
                <p className="text-xs text-slate-500 mt-1">By {caseItem.doctor}</p>
              </div>
              <button
                onClick={() => toggleSave(caseItem.id)}
                className={`p-2 rounded-lg transition ${
                  savedCases.includes(caseItem.id)
                    ? "bg-amber-100 text-amber-600"
                    : "bg-slate-100 text-slate-400 hover:text-slate-600"
                }`}
              >
                <Bookmark className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 mb-4">{caseItem.description}</p>

            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              <div className="p-2 bg-slate-50 rounded">
                <p className="text-slate-600 text-xs">Difficulty</p>
                <p className="font-semibold text-slate-900">{caseItem.difficulty}</p>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <p className="text-slate-600 text-xs">Files</p>
                <p className="font-semibold text-slate-900">{caseItem.files}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-auto">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm">Review Case</Button>
              <Button
                variant="outline"
                className="flex-1 bg-transparent text-sm flex items-center justify-center gap-1"
              >
                <Download className="w-4 h-4" />
                Files
              </Button>
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                onClick={() => handleReport(caseItem.id, caseItem.title)}
                title="Report case for review"
              >
                Report
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
