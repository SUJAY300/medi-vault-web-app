import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { isConnected } from "../config/db.js";

const ROLES = ["Student", "Patient", "Doctor", "Nurse", "Intern"];

export async function signup(req, res) {
  if (!isConnected()) {
    return res.status(503).json({
      success: false,
      message: "Database unavailable. Check backend terminal and MongoDB connection.",
    });
  }
  try {
    const { username, password, role, fullName, doctorId, doctor: doctorFromBody } = req.body;

    if (!username || !password || !role || !fullName) {
      return res.status(400).json({
        success: false,
        message: "Username, password, role, and full name are required.",
      });
    }

    if (!ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be one of: " + ROLES.join(", "),
      });
    }

    let doctorForPatient = null;
    if (role === "Patient") {
      const doctorRef = doctorId || doctorFromBody;
      if (!doctorRef) {
        return res.status(400).json({
          success: false,
          message: "Doctor is required when signing up as a Patient.",
        });
      }

      doctorForPatient = await User.findById(doctorRef);
      if (!doctorForPatient) {
        return res.status(400).json({
          success: false,
          message: "Selected doctor not found.",
        });
      }

      if (doctorForPatient.role !== "Doctor") {
        return res.status(400).json({
          success: false,
          message: "Selected user is not registered as a Doctor.",
        });
      }
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Username already taken.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      passwordHash,
      role,
      fullName,
      ...(role === "Patient" && doctorForPatient
        ? {
            doctor: doctorForPatient._id,
          }
        : {}),
    });

    if (role === "Patient" && doctorForPatient) {
      await User.findByIdAndUpdate(doctorForPatient._id, {
        $addToSet: { myPatients: user._id },
      });
    }

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
}

export async function login(req, res) {
  if (!isConnected()) {
    return res.status(503).json({
      success: false,
      message: "Database unavailable. Check backend terminal and MongoDB connection.",
    });
  }
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Username, password, and role are required.",
      });
    }

    if (!ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role.",
      });
    }

    const user = await User.findOne({ username }).populate("doctor", "fullName username");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    if (user.role !== role) {
      return res.status(401).json({
        success: false,
        message: "This account is not registered as " + role + ". Please select the correct role.",
      });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    const userPayload = {
      id: user._id,
      username: user.username,
      role: user.role,
      fullName: user.fullName,
    };
    if (user.role === "Patient") {
      userPayload.hashIds = user.hashIds || [];
      if (user.doctor) {
        userPayload.doctorId = user.doctor._id.toString();
        userPayload.doctorName = user.doctor.fullName;
        userPayload.doctorUsername = user.doctor.username;
      }
    }

    res.json({
      success: true,
      message: "Login successful.",
      user: userPayload,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
}
