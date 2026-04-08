import User from "../models/User.js";
import { isConnected } from "../config/db.js";

function normalizeWalletAddress(value) {
  const v = String(value || "").trim().toLowerCase();
  if (!v) return "";
  if (!/^0x[a-f0-9]{40}$/.test(v)) return null;
  return v;
}

export async function updateWalletAddress(req, res) {
  if (!isConnected()) {
    return res.status(503).json({ success: false, message: "Database unavailable." });
  }
  try {
    const { userId } = req.params;
    const { walletAddress } = req.body || {};

    const normalized = normalizeWalletAddress(walletAddress);
    if (normalized === null) {
      return res.status(400).json({ success: false, message: "Invalid walletAddress. Expected 0x + 40 hex chars." });
    }
    if (!normalized) {
      return res.status(400).json({ success: false, message: "walletAddress is required." });
    }

    const user = await User.findById(userId).select("_id username role fullName walletAddress doctor hashIds");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const existing = await User.findOne({ walletAddress: normalized }).select("_id");
    if (existing && String(existing._id) !== String(user._id)) {
      return res.status(409).json({ success: false, message: "This wallet is already linked to another user." });
    }

    user.walletAddress = normalized;
    await user.save();

    return res.json({
      success: true,
      message: "Wallet linked successfully.",
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        walletAddress: user.walletAddress,
        hashIds: user.hashIds || [],
        doctorId: user.doctor ? String(user.doctor) : undefined,
      },
    });
  } catch (err) {
    console.error("Update wallet error:", err);
    // Handle unique constraint race
    if (err?.code === 11000) {
      return res.status(409).json({ success: false, message: "This wallet is already linked to another user." });
    }
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
}

