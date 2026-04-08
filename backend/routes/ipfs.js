import express from "express";
import multer from "multer";
import { uploadToIpfs } from "../controllers/ipfsController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Upload a file to IPFS (Pinata) and return ipfsHash/ipfsUrl
router.post("/upload", upload.single("file"), uploadToIpfs);

export default router;

