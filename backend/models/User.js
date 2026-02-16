import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, unique: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["Student", "Patient", "Doctor", "Nurse", "Intern"],
    },
    fullName: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
