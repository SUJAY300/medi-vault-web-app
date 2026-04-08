import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Report from "../models/Report.js";
import User from "../models/User.js";
import { isConnected } from "../config/db.js";
import { Agent } from "undici";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const PDF_STORE_DIR = path.join(REPO_ROOT, "ChatBot_Summarizer_part", "data", "pdf_samples");
const PDF_STORE_REL = path.relative(REPO_ROOT, PDF_STORE_DIR).replaceAll("\\", "/");
const FASTAPI_BASE = process.env.FASTAPI_BASE || "http://127.0.0.1:8000";
const FASTAPI_TIMEOUT_MS = Number(process.env.FASTAPI_TIMEOUT_MS || 20 * 60 * 1000); // 20 minutes

const fastapiAgent = new Agent({
  headersTimeout: FASTAPI_TIMEOUT_MS,
  bodyTimeout: FASTAPI_TIMEOUT_MS,
});

function ensurePdfStoreDir() {
  if (!fs.existsSync(PDF_STORE_DIR)) {
    fs.mkdirSync(PDF_STORE_DIR, { recursive: true });
  }
}

function safePdfName(name) {
  return String(name || "report.pdf")
    .replaceAll(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
    .replaceAll(/\s+/g, "_")
    .slice(0, 180);
}

async function assertDoctorPatientRelation({ doctorId, patientId }) {
  const patient = await User.findById(patientId).select("_id role doctor");
  if (!patient || patient.role !== "Patient") return { ok: false, message: "Patient not found." };
  if (String(patient.doctor) !== String(doctorId)) {
    return { ok: false, message: "You are not assigned to this patient." };
  }
  return { ok: true };
}

export async function listPatientReports(req, res) {
  if (!isConnected()) {
    return res.status(503).json({ success: false, message: "Database unavailable." });
  }
  try {
    const { patientId } = req.params;
    const { doctorId } = req.query;
    if (!doctorId) return res.status(400).json({ success: false, message: "doctorId is required." });

    const rel = await assertDoctorPatientRelation({ doctorId, patientId });
    if (!rel.ok) return res.status(403).json({ success: false, message: rel.message });

    const reports = await Report.find({ patient: patientId, doctor: doctorId })
      .sort({ createdAt: -1 })
      .select(
        "_id originalFileName storedFileName fileRelativePath status createdAt summarizedAt " +
          "ipfsHash ipfsUrl blockchainTxHash chainStatus anchoredAt"
      );

    return res.json({ success: true, reports });
  } catch (err) {
    console.error("List reports error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
}

export async function uploadPatientReport(req, res) {
  if (!isConnected()) {
    return res.status(503).json({ success: false, message: "Database unavailable." });
  }
  try {
    const { patientId } = req.params;
    const { doctorId } = req.query;
    if (!doctorId) return res.status(400).json({ success: false, message: "doctorId is required." });

    const rel = await assertDoctorPatientRelation({ doctorId, patientId });
    if (!rel.ok) return res.status(403).json({ success: false, message: rel.message });

    if (!req.file) {
      return res.status(400).json({ success: false, message: "PDF file is required (field: file)." });
    }

    ensurePdfStoreDir();

    const originalName = req.file.originalname || "report.pdf";
    const extOk = originalName.toLowerCase().endsWith(".pdf");
    if (!extOk) {
      return res.status(400).json({ success: false, message: "Only PDF files are supported." });
    }

    const safeOriginal = safePdfName(originalName);
    const storedFileName = `${patientId}_${Date.now()}_${safeOriginal}`;
    const storedAbsPath = path.join(PDF_STORE_DIR, storedFileName);

    fs.writeFileSync(storedAbsPath, req.file.buffer);

    const report = await Report.create({
      patient: patientId,
      doctor: doctorId,
      originalFileName: originalName,
      storedFileName,
      fileRelativePath: `${PDF_STORE_REL}/${storedFileName}`,
      mimeType: req.file.mimetype || "application/pdf",
      sizeBytes: req.file.size || req.file.buffer?.length || 0,
      status: "uploaded",
    });

    return res.status(201).json({ success: true, report });
  } catch (err) {
    console.error("Upload report error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
}

export async function saveReportSummary(req, res) {
  if (!isConnected()) {
    return res.status(503).json({ success: false, message: "Database unavailable." });
  }
  try {
    const { reportId } = req.params;
    const { doctorId } = req.query;
    const { summaryText, structuredData, status } = req.body || {};

    if (!doctorId) return res.status(400).json({ success: false, message: "doctorId is required." });
    if (!summaryText || typeof summaryText !== "string") {
      return res.status(400).json({ success: false, message: "summaryText (string) is required." });
    }

    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ success: false, message: "Report not found." });
    if (String(report.doctor) !== String(doctorId)) {
      return res.status(403).json({ success: false, message: "Not allowed for this report." });
    }

    report.summaryText = summaryText;
    report.structuredData = structuredData ?? null;
    report.status = status === "failed" ? "failed" : "summarized";
    report.summarizedAt = new Date();
    await report.save();

    return res.json({ success: true, report });
  } catch (err) {
    console.error("Save summary error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
}

export async function getReportById(req, res) {
  if (!isConnected()) {
    return res.status(503).json({ success: false, message: "Database unavailable." });
  }
  try {
    const { reportId } = req.params;
    const { doctorId } = req.query;
    if (!doctorId) return res.status(400).json({ success: false, message: "doctorId is required." });

    const report = await Report.findById(reportId).select(
      "_id patient doctor originalFileName storedFileName fileRelativePath mimeType sizeBytes status createdAt summarizedAt summaryText structuredData " +
        "ipfsHash ipfsUrl blockchainTxHash chainStatus anchoredAt"
    );
    if (!report) return res.status(404).json({ success: false, message: "Report not found." });
    if (String(report.doctor) !== String(doctorId)) {
      return res.status(403).json({ success: false, message: "Not allowed for this report." });
    }

    return res.json({ success: true, report });
  } catch (err) {
    console.error("Get report error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
}

export async function runReportSummarizer(req, res) {
  if (!isConnected()) {
    return res.status(503).json({ success: false, message: "Database unavailable." });
  }
  try {
    const { reportId } = req.params;
    const { doctorId } = req.query;
    if (!doctorId) return res.status(400).json({ success: false, message: "doctorId is required." });

    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ success: false, message: "Report not found." });
    if (String(report.doctor) !== String(doctorId)) {
      return res.status(403).json({ success: false, message: "Not allowed for this report." });
    }

    const absPath = path.join(REPO_ROOT, report.fileRelativePath.replaceAll("/", path.sep));
    if (!fs.existsSync(absPath)) {
      report.status = "failed";
      report.summaryText = "Summarization failed: PDF file missing on server.";
      report.structuredData = null;
      report.summarizedAt = new Date();
      await report.save();
      return res.status(404).json({ success: false, message: "PDF file not found on disk." });
    }

    report.status = "running";
    await report.save();

    const pdfBytes = fs.readFileSync(absPath);
    const form = new FormData();
    form.append(
      "file",
      new Blob([pdfBytes], { type: "application/pdf" }),
      report.originalFileName || "report.pdf"
    );

    let fastapiRes;
    try {
      // FastAPI can take minutes (OCR + LLM). Node's default headers timeout can be too low.
      // Bump it for this request.
      fastapiRes = await fetch(`${FASTAPI_BASE}/medical/summarize`, {
        method: "POST",
        body: form,
        dispatcher: fastapiAgent,
      });
    } catch (e) {
      const msg =
        e?.cause?.code === "UND_ERR_HEADERS_TIMEOUT"
          ? "Summarizer timed out waiting for FastAPI response. Try again or use a smaller PDF."
          : e?.message || "Failed to call FastAPI summarizer.";
      report.status = "failed";
      report.summaryText = `Summarization failed: ${msg}`;
      report.structuredData = null;
      report.summarizedAt = new Date();
      await report.save();
      return res.status(504).json({ success: false, message: msg });
    }

    const payload = await fastapiRes.json().catch(() => null);
    if (!fastapiRes.ok) {
      const msg = payload?.detail || payload?.message || `FastAPI error (${fastapiRes.status})`;
      report.status = "failed";
      report.summaryText = `Summarization failed: ${msg}`;
      report.structuredData = null;
      report.summarizedAt = new Date();
      await report.save();
      return res.status(502).json({ success: false, message: msg });
    }

    report.summaryText = payload?.summary || "";
    report.structuredData = payload?.structured_data ?? null;
    report.status = "summarized";
    report.summarizedAt = new Date();
    await report.save();

    return res.json({ success: true, report });
  } catch (err) {
    console.error("Run summarizer error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
}

export async function confirmReportBlockchain(req, res) {
  if (!isConnected()) {
    return res.status(503).json({ success: false, message: "Database unavailable." });
  }
  try {
    const { reportId } = req.params;
    const { doctorId } = req.query;
    const { ipfsHash, ipfsUrl, txHash, status } = req.body || {};

    if (!doctorId) return res.status(400).json({ success: false, message: "doctorId is required." });
    const normalizedStatus = status === "failed" ? "failed" : "confirmed";

    // For confirmed anchors we require ipfsHash + txHash.
    // For failed anchors we allow partial/empty values so the UI can still record the failure.
    if (normalizedStatus !== "failed") {
      if (!ipfsHash || typeof ipfsHash !== "string") {
        return res.status(400).json({ success: false, message: "ipfsHash (string) is required." });
      }
      if (!txHash || typeof txHash !== "string") {
        return res.status(400).json({ success: false, message: "txHash (string) is required." });
      }
    }

    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ success: false, message: "Report not found." });
    if (String(report.doctor) !== String(doctorId)) {
      return res.status(403).json({ success: false, message: "Not allowed for this report." });
    }

    if (typeof ipfsHash === "string" && ipfsHash) report.ipfsHash = ipfsHash;
    if (typeof ipfsUrl === "string" && ipfsUrl) report.ipfsUrl = ipfsUrl;
    if (typeof txHash === "string" && txHash) report.blockchainTxHash = txHash;
    report.chainStatus = normalizedStatus;
    report.anchoredAt = new Date();
    await report.save();

    // Also keep backwards-compatible patient.hashIds updated (used by Patient list)
    if (typeof ipfsHash === "string" && ipfsHash) {
      await User.findByIdAndUpdate(report.patient, { $addToSet: { hashIds: ipfsHash } }).catch(() => {});
    }

    return res.json({ success: true, report });
  } catch (err) {
    console.error("Confirm blockchain error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
}

