import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, ".env");

if (!fs.existsSync(envPath)) {
  console.error("[Config] .env NOT FOUND at:", envPath);
  console.error("[Config] Data will go to local MongoDB, not Atlas.");
} else {
  dotenv.config({ path: envPath });
  console.log("[Config] .env loaded from", envPath);
}
if (!process.env.MONGODB_URI) {
  console.warn("[Config] MONGODB_URI is not set in .env — using local MongoDB.");
}

import express from "express";
import cors from "cors";
import { connectDB, isConnected, getDatabaseTarget, getActualConnection } from "./config/db.js";
import authRoutes from "./routes/auth.js";

const app = express();
const PORT = process.env.PORT || 5000;

await connectDB();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "MediVault API",
    database: isConnected() ? "connected" : "disconnected",
    databaseTarget: getDatabaseTarget(),
    actualConnection: getActualConnection(),
  });
});

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`MediVault API running at http://localhost:${PORT}`);
});
