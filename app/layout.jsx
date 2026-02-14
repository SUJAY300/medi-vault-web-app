import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

export const metadata = {
  title: "MediVault - Medical Document Management",
  description: "Secure role-based medical document management system",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
