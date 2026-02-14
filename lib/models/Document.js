/**
 * MongoDB model for unstructured medical documents
 * Flexible schema for various document types
 */

import mongoose from "mongoose"

const DocumentSchema = new mongoose.Schema(
  {
    // References
    patientId: { type: String, required: true, index: true },
    uploadedBy: { type: String, required: true, index: true }, // userId

    // File metadata
    fileName: { type: String, required: true },
    mimeType: { type: String, default: "application/octet-stream" },
    size: { type: Number, default: 0 },
    storagePath: { type: String }, // S3 path, local path, etc.

    // Unstructured metadata (flexible)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Examples: { type: "lab_report", date: "2024-01-15", provider: "..." }

    // Tags for search
    tags: [{ type: String }],

    // AI summary (optional)
    summary: { type: String },

    // Status
    status: { type: String, default: "active", enum: ["active", "archived", "deleted"] },
  },
  { timestamps: true }
)

// Ensure we're connected before using the model
let Document
try {
  Document = mongoose.models.Document || mongoose.model("Document", DocumentSchema)
} catch {
  Document = mongoose.model("Document", DocumentSchema)
}

export default Document
