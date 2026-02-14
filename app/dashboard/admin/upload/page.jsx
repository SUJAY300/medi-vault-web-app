"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, FileText, X } from "lucide-react"

export default function AdminUploadPage() {
  const [files, setFiles] = useState([])
  const [patientCode, setPatientCode] = useState("")
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files)
    setFiles((prev) => [...prev, ...newFiles])
  }

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!patientCode || files.length === 0) return

    setLoading(true)
    setTimeout(() => {
      alert(`Uploaded ${files.length} files for patient ${patientCode}`)
      setFiles([])
      setPatientCode("")
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Upload Medical Files</h1>
        <p className="text-slate-600">Upload medical documents for patients in the system.</p>
      </div>

      <div className="max-w-2xl">
        <Card className="p-8">
          <form onSubmit={handleUpload} className="space-y-6">
            {/* Patient Code Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Patient Code</label>
              <Input
                type="text"
                placeholder="e.g., P-001"
                value={patientCode}
                onChange={(e) => setPatientCode(e.target.value)}
                required
              />
              <p className="text-xs text-slate-500 mt-1">Enter the patient's unique code</p>
            </div>

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="fileInput"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <label htmlFor="fileInput" className="cursor-pointer">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-500">PDF, DOC, DOCX, JPG, PNG (Max 50MB)</p>
              </label>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-900 mb-3">{files.length} file(s) selected</p>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white p-3 rounded border border-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-slate-700">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading || !patientCode || files.length === 0}
            >
              {loading ? "Uploading..." : "Upload Files"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
