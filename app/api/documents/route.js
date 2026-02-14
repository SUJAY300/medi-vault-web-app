import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Document from "@/lib/models/Document"

export async function GET(request) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")
    const uploadedBy = searchParams.get("uploadedBy")

    const filter = {}
    if (patientId) filter.patientId = patientId
    if (uploadedBy) filter.uploadedBy = uploadedBy
    filter.status = "active"

    const docs = await Document.find(filter).sort({ createdAt: -1 }).lean()
    return NextResponse.json(docs)
  } catch (error) {
    console.error("Documents fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()
    const body = await request.json()
    const { patientId, uploadedBy, fileName, mimeType, size, storagePath, metadata, tags, summary } =
      body

    if (!patientId || !uploadedBy || !fileName) {
      return NextResponse.json(
        { error: "patientId, uploadedBy, and fileName are required" },
        { status: 400 }
      )
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

    return NextResponse.json(doc)
  } catch (error) {
    console.error("Document create error:", error)
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 })
  }
}
