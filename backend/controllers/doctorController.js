import User from "../models/User.js";
import { isConnected } from "../config/db.js";

export async function getDoctors(req, res) {
  if (!isConnected()) {
    return res.status(503).json({
      success: false,
      message: "Database unavailable. Check backend terminal and MongoDB connection.",
    });
  }

  try {
    const doctors = await User.find({ role: "Doctor" })
      .select("_id username fullName role")
      .sort({ fullName: 1 });

    res.json({
      success: true,
      doctors,
    });
  } catch (err) {
    console.error("Get doctors error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
}

