import { NextResponse } from "next/server"
import {
  getDocumentByIdController,
  updateDocumentController,
  deleteDocumentController,
} from "../../../../../backend/controllers/documentController"

export async function GET(request, { params }) {
  try {
    const result = await getDocumentByIdController(params.id)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status || 500 })
    }
    return NextResponse.json(result.document)
  } catch (error) {
    console.error("Document fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const body = await request.json()

    const result = await updateDocumentController(params.id, body)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status || 500 })
    }
    return NextResponse.json(result.document)
  } catch (error) {
    console.error("Document update error:", error)
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const result = await deleteDocumentController(params.id)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status || 500 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Document delete error:", error)
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
  }
}
