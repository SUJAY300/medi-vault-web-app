import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Document from "@/lib/models/Document"

export async function GET(request, { params }) {
  try {
    await connectDB()
    const doc = await Document.findById(params.id).lean()
    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 })
    return NextResponse.json(doc)
  } catch (error) {
    console.error("Document fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    await connectDB()
    const body = await request.json()
    const allowed = ["metadata", "tags", "summary", "status"]
    const update = {}
    for (const k of allowed) {
      if (body[k] !== undefined) update[k] = body[k]
    }
    const doc = await Document.findByIdAndUpdate(params.id, { $set: update }, { new: true }).lean()
    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 })
    return NextResponse.json(doc)
  } catch (error) {
    console.error("Document update error:", error)
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB()
    const doc = await Document.findByIdAndUpdate(
      params.id,
      { $set: { status: "deleted" } },
      { new: true }
    )
    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Document delete error:", error)
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
  }
}
