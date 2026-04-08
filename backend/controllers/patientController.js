import User from "../models/User.js";
import { isConnected } from "../config/db.js";

export async function getPatients(req, res) {
  if (!isConnected()) {
    return res.status(503).json({
      success: false,
      message: "Database unavailable. Check backend terminal and MongoDB connection.",
    });
  }
  try {
    const { doctorId } = req.query;

    const filter = { role: "Patient" };
    if (doctorId) {
      filter.doctor = doctorId;
    }

    const patients = await User.find(filter)
      .select("_id username fullName role createdAt hashIds walletAddress")
      .sort({ createdAt: -1 });

    // Format patients with patient ID (P-XXX format)
    const formattedPatients = patients.map((patient, index) => ({
      id: patient._id,
      patientId: `P-${String(index + 1).padStart(3, "0")}`,
      username: patient.username,
      fullName: patient.fullName,
      role: patient.role,
      createdAt: patient.createdAt,
      hashIds: patient.hashIds || [],
      walletAddress: patient.walletAddress || "",
    }));

    res.json({
      success: true,
      patients: formattedPatients,
    });
  } catch (err) {
    console.error("Get patients error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
}
