import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, FileText, Lock, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">MediVault</h1>
          </div>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-blue-600 hover:bg-blue-700">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold text-slate-900 mb-6">Secure Medical Document Management</h2>
        <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
          MediVault provides a comprehensive, role-based system for managing medical documents with AI-powered insights
          and secure access controls.
        </p>
        <Link href="/auth/login">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Access Dashboard
          </Button>
        </Link>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg border border-slate-200">
            <Lock className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Secure Access</h3>
            <p className="text-slate-600">Role-based access control with OTP verification for patients.</p>
          </div>
          <div className="p-6 bg-white rounded-lg border border-slate-200">
            <FileText className="w-8 h-8 text-emerald-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Smart Management</h3>
            <p className="text-slate-600">Upload, organize, and manage medical documents with patient codes.</p>
          </div>
          <div className="p-6 bg-white rounded-lg border border-slate-200">
            <Zap className="w-8 h-8 text-amber-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">AI-Powered</h3>
            <p className="text-slate-600">Automatic summaries and intelligent chatbot assistance.</p>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-slate-900 mb-12 text-center">Role-Based Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { role: "Admin", desc: "Full control & user management" },
            { role: "Doctor", desc: "Patient management & files" },
            { role: "Nurse", desc: "Patient monitoring & files" },
            { role: "Student", desc: "View & learn from cases" },
            { role: "Patient", desc: "View own medical files" },
          ].map((item) => (
            <div key={item.role} className="p-4 bg-white rounded-lg border border-slate-200 text-center">
              <h4 className="font-semibold text-slate-900 mb-2">{item.role}</h4>
              <p className="text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-slate-600">
          <p>MediVault - Secure Medical Document Management System</p>
        </div>
      </footer>
    </div>
  )
}
