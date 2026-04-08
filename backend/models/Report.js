import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    originalFileName: { type: String, required: true, trim: true },
    storedFileName: { type: String, required: true, trim: true },
    fileRelativePath: { type: String, required: true, trim: true }, // relative to repo root
    mimeType: { type: String, required: true, trim: true },
    sizeBytes: { type: Number, required: true },

    status: {
      type: String,
      enum: ["uploaded", "running", "summarized", "failed"],
      default: "uploaded",
      index: true,
    },

    summaryText: { type: String, default: "" },
    structuredData: { type: mongoose.Schema.Types.Mixed, default: null },
    summarizedAt: { type: Date, default: null },

    // Blockchain / IPFS (optional, additive)
    ipfsHash: { type: String, trim: true, default: "" },
    ipfsUrl: { type: String, trim: true, default: "" },
    blockchainTxHash: { type: String, trim: true, default: "" },
    chainStatus: {
      type: String,
      enum: ["", "pending", "confirmed", "failed"],
      default: "",
      index: true,
    },
    anchoredAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);

