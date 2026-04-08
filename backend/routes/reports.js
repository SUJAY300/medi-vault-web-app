import express from "express";
import multer from "multer";
import {
  listPatientReports,
  uploadPatientReport,
  saveReportSummary,
  getReportById,
  runReportSummarizer,
  confirmReportBlockchain,
} from "../controllers/reportController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB for dev
  },
});

// List reports for a patient (doctor-scoped)
router.get("/patients/:patientId/reports", listPatientReports);

// Upload a report PDF for a patient
router.post("/patients/:patientId/reports", upload.single("file"), uploadPatientReport);

// Save summarizer output to Mongo
router.post("/reports/:reportId/summary", saveReportSummary);

// Fetch a report (includes stored summary/json)
router.get("/reports/:reportId", getReportById);

// Run summarizer later using stored PDF (server-side)
router.post("/reports/:reportId/run-summarizer", runReportSummarizer);

// Confirm that a report was anchored on-chain (store tx + ipfsHash in Mongo)
router.post("/reports/:reportId/blockchain-confirm", confirmReportBlockchain);

export default router;

