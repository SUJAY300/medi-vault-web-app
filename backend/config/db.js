import mongoose from "mongoose";

/** Returns a safe description of the connection (no credentials) for logging/health */
function getConnectionTarget(uri) {
  try {
    const url = new URL(uri.replace("mongodb+srv://", "https://").replace("mongodb://", "http://"));
    const host = url.hostname || "unknown";
    return uri.includes("mongodb+srv") ? `Atlas (${host})` : `local (${host}${url.port ? ":" + url.port : ""})`;
  } catch {
    return "unknown";
  }
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/medivault";
  const isFallback = !process.env.MONGODB_URI;

  if (isFallback) {
    console.warn(
      "[DB] MONGODB_URI is not set. Using local MongoDB. Data will NOT appear in Atlas.\n" +
      "     Set MONGODB_URI in backend/.env to your Atlas connection string."
    );
  }

  const target = getConnectionTarget(uri);
  console.log("[DB] Connecting to MongoDB:", target);

  try {
    await mongoose.connect(uri);
    const conn = mongoose.connection;
    console.log("[DB] MongoDB connected successfully");
    console.log("[DB] Actual connection — host:", conn.host, "| db:", conn.name);
    return true;
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    console.error("Server will start but auth will return errors until MongoDB is available.");
    return false;
  }
}

export function isConnected() {
  return mongoose.connection.readyState === 1;
}

/** For health API: which database we're connected to (no credentials) */
export function getDatabaseTarget() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/medivault";
  return getConnectionTarget(uri);
}

/** Actual connected host and db (from mongoose) for debugging */
export function getActualConnection() {
  if (mongoose.connection.readyState !== 1) return null;
  return {
    host: mongoose.connection.host,
    name: mongoose.connection.name,
  };
}
