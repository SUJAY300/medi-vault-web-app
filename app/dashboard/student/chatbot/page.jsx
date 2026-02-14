"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Paperclip } from "lucide-react"
import { useState } from "react"

export default function StudentChatbotPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "bot",
      text: "Welcome! I'm your medical learning assistant. Ask me anything about medical concepts, diseases, or treatments.",
    },
    { id: 2, role: "user", text: "What is diabetes mellitus?" },
    {
      id: 3,
      role: "bot",
      text: "Diabetes mellitus is a metabolic disorder characterized by elevated blood glucose levels. There are two main types: Type 1 (autoimmune) and Type 2 (insulin resistance).",
    },
  ])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim()) return

    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, role: "user", text: input },
      { id: prev.length + 2, role: "bot", text: "Processing your medical question..." },
    ])
    setInput("")
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Medical Learning Assistant</h1>
        <p className="text-slate-600">Learn medical concepts and discuss case studies with AI.</p>
      </div>

      <Card className="h-[600px] flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs px-4 py-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-slate-100 text-slate-900 rounded-bl-none"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 p-4">
          <div className="flex gap-2">
            <Button size="icon" variant="outline" className="bg-transparent">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Input
              type="text"
              placeholder="Ask a medical question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <Button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
