"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Paperclip } from "lucide-react"
import { useState } from "react"

export default function NurseChatbotPage() {
  const [messages, setMessages] = useState([
    { id: 1, role: "bot", text: "Hello Nurse! I can help you with patient monitoring and documentation." },
    { id: 2, role: "user", text: "What's the normal range for blood pressure?" },
    {
      id: 3,
      role: "bot",
      text: "Normal blood pressure is typically less than 120/80 mmHg. Values between 120-139/80-89 are considered elevated.",
    },
  ])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim()) return

    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, role: "user", text: input },
      { id: prev.length + 2, role: "bot", text: "I'm processing your request..." },
    ])
    setInput("")
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Nursing Assistant</h1>
        <p className="text-slate-600">Chat with AI for nursing guidance and patient care information.</p>
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
              placeholder="Ask a question..."
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
