import mongoose from "mongoose"

const UserRole = {
  Admin: "Admin",
  Doctor: "Doctor",
  Nurse: "Nurse",
  Student: "Student",
  Patient: "Patient",
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },
    passwordHash: String,
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    license: String,
  },
  {
    timestamps: true,
  }
)

// unique: true on email/phone already creates indexes; no need to duplicate
const User = mongoose.models.User || mongoose.model("User", userSchema)

export default User
export { UserRole }
