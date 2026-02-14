/**
 * MongoDB connection for unstructured data (documents, files metadata)
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
      "MONGODB_URI is not set. Add it to .env for document storage. Example: mongodb://localhost:27017/medivault"
    )
  }
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI)
  }
  cached.conn = await cached.promise
  return cached.conn
}

export default connectDB
