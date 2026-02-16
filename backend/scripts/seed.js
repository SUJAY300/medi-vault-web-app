import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/medivault";

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const demoUser = {
      username: "demo",
      passwordHash: await bcrypt.hash("demo123", 10),
      role: "Patient",
      fullName: "Demo User",
    };

    const existing = await User.findOne({ username: demoUser.username });
    if (existing) {
      console.log("Demo user already exists:", existing.username);
      console.log("Id:", existing._id.toString());
      await mongoose.disconnect();
      return;
    }

    const user = await User.create(demoUser);
    console.log("Demo user created successfully:");
    console.log("  Id:", user._id.toString());
    console.log("  Username:", user.username);
    console.log("  Role:", user.role);
    console.log("  Full name:", user.fullName);
    console.log("\nYou can verify this in Atlas under your database -> users collection.");
    console.log("Login with username: demo, password: demo123, role: Patient");
  } catch (err) {
    console.error("Seed error:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seed();
