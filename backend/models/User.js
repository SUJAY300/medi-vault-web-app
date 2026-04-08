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
    // Optional: wallet used for blockchain features (MetaMask)
    walletAddress: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    // For patients: reference to their primary doctor
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // For patients: IPFS/content hash IDs of their PDFs (actual files stored on IPFS/blockchain)
    hashIds: [
      {
        type: String,
        trim: true,
      },
    ],
    // For doctors only: list of patients assigned to them (not used for patients)
    myPatients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Ensure myPatients exists only on doctor documents; never persist it for patients
userSchema.pre("save", function (next) {
  if (this.role !== "Doctor") {
    // In document middleware, unset by setting the path to undefined.
    this.myPatients = undefined;
  }
  next();
});

export default mongoose.model("User", userSchema);
