import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import { readFileSync, existsSync } from "fs"
import { resolve } from "path"

// Load .env.local so MONGODB_URI is set when running: npm run db:seed
const envPath = resolve(process.cwd(), ".env.local")
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf8")
  content.split("\n").forEach((line) => {
    const match = line.match(/^\s*([^#=]+)=(.*)$/)
    if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "")
  })
}

import User from "../backend/models/User.js"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/medivault"

async function main() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB")

    const existing = await User.findOne({ email: "admin@medivault.com" })
    if (existing) {
      console.log("Demo admin already exists")
      await mongoose.disconnect()
      return
    }
    
    // Hash for Admin@123 (must match auth-store demo admin)
    const hash = await bcrypt.hash("Admin@123", 10)
    await User.create({
      email: "admin@medivault.com",
      passwordHash: hash,
      role: "Admin",
      fullName: "System Admin",
    })
    console.log("Demo admin created: admin@medivault.com / Admin@123")
  } catch (error) {
    console.error("Seed error:", error)
    throw error
  } finally {
    await mongoose.disconnect()
  }
}

main().catch(console.error)
