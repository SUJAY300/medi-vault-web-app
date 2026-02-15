/**
 * MongoDB connection (local or Atlas).
 * Used by all models: User, OtpSession, Document, etc.
 */

import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

export function isMongoConfigured() {
  return !!MONGODB_URI
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Add it to .env or .env.local. " +
        "Local: mongodb://localhost:27017/medivault | " +
        "Atlas: mongodb+srv://<user>:<password>@<cluster>.mongodb.net/medivault?retryWrites=true&w=majority"
    )
  }
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      // Works for both local MongoDB and MongoDB Atlas
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
    })
  }
  cached.conn = await cached.promise
  return cached.conn
}

export default connectDB
