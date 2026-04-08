import express from "express";
import { updateWalletAddress } from "../controllers/userController.js";

const router = express.Router();

// Link a MetaMask wallet to a user profile (dev-friendly; add auth later if needed)
router.put("/:userId/wallet", updateWalletAddress);

export default router;

