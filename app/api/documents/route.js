import { NextResponse } from "next/server"
import {
  getDocumentsController,
  createDocumentController,
} from "../../../../backend/controllers/documentController"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")
    const uploadedBy = searchParams.get("uploadedBy")

    const result = await getDocumentsController(patientId, uploadedBy)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status || 500 })
    }

    return NextResponse.json(result.documents)
  } catch (error) {
    console.error("Documents fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()

    const result = await createDocumentController(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status || 500 })
    }

    return NextResponse.json(result.document)
  } catch (error) {
    console.error("Document create error:", error)
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 })
  }
}
