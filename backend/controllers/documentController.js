import connectDB from "../config/mongodb.js"
import Document from "../models/document.js"

export async function getDocumentsController(patientId, uploadedBy) {
  try {
    await connectDB()
    const filter = {}
    if (patientId) filter.patientId = patientId
    if (uploadedBy) filter.uploadedBy = uploadedBy
    filter.status = "active"

    const docs = await Document.find(filter).sort({ createdAt: -1 }).lean()
    return { success: true, documents: docs }
  } catch (error) {
    console.error("Documents fetch error:", error)
    return { success: false, error: "Failed to fetch documents", status: 500 }
  }
}

export async function createDocumentController(documentData) {
  try {
    await connectDB()
    const { patientId, uploadedBy, fileName, mimeType, size, storagePath, metadata, tags, summary } =
      documentData

    if (!patientId || !uploadedBy || !fileName) {
      return {
        success: false,
        error: "patientId, uploadedBy, and fileName are required",
        status: 400,
      }
    }

    const doc = await Document.create({
      patientId,
      uploadedBy,
      fileName,
      mimeType: mimeType || "application/octet-stream",
      size: size || 0,
      storagePath: storagePath || null,
      metadata: metadata || {},
      tags: tags || [],
      summary: summary || null,
    })

    return { success: true, document: doc }
  } catch (error) {
    console.error("Document create error:", error)
    return { success: false, error: "Failed to create document", status: 500 }
  }
}

export async function getDocumentByIdController(id) {
  try {
    await connectDB()
    const doc = await Document.findById(id).lean()
    if (!doc) return { success: false, error: "Document not found", status: 404 }
    return { success: true, document: doc }
  } catch (error) {
    console.error("Document fetch error:", error)
    return { success: false, error: "Failed to fetch document", status: 500 }
  }
}

export async function updateDocumentController(id, updateData) {
  try {
    await connectDB()
    const allowed = ["metadata", "tags", "summary", "status"]
    const update = {}
    for (const k of allowed) {
      if (updateData[k] !== undefined) update[k] = updateData[k]
    }
    const doc = await Document.findByIdAndUpdate(id, { $set: update }, { new: true }).lean()
    if (!doc) return { success: false, error: "Document not found", status: 404 }
    return { success: true, document: doc }
  } catch (error) {
    console.error("Document update error:", error)
    return { success: false, error: "Failed to update document", status: 500 }
  }
}

export async function deleteDocumentController(id) {
  try {
    await connectDB()
    const doc = await Document.findByIdAndUpdate(id, { $set: { status: "deleted" } }, { new: true })
    if (!doc) return { success: false, error: "Document not found", status: 404 }
    return { success: true }
  } catch (error) {
    console.error("Document delete error:", error)
    return { success: false, error: "Failed to delete document", status: 500 }
  }
}
