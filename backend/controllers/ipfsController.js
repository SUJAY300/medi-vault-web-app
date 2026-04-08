import crypto from "crypto";

const PINATA_BASE_URL = "https://api.pinata.cloud";

function mockIpfsHash(bytes) {
  // Deterministic-ish for dev if Pinata keys absent
  const hex = crypto.createHash("sha256").update(bytes).digest("hex");
  return "Qm" + hex.slice(0, 44);
}

export async function uploadToIpfs(req, res) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: "File is required (field: file)." });
    }

    const pinataKey = process.env.PINATA_API_KEY || "";
    const pinataSecret = process.env.PINATA_SECRET_KEY || "";
    const gateway = process.env.IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs/";

    // If Pinata is not configured, fall back to mock hash (so project still runs end-to-end in dev)
    if (!pinataKey || !pinataSecret) {
      const ipfsHash = mockIpfsHash(file.buffer);
      return res.json({
        success: true,
        ipfsHash,
        ipfsUrl: gateway + ipfsHash,
        mocked: true,
      });
    }

    const url = `${PINATA_BASE_URL}/pinning/pinFileToIPFS`;
    const form = new FormData();
    form.append("file", new Blob([file.buffer], { type: file.mimetype || "application/octet-stream" }), file.originalname);

    // Optional metadata
    const metadata = {
      name: file.originalname,
      keyvalues: {
        uploadedAt: new Date().toISOString(),
      },
    };
    form.append("pinataMetadata", JSON.stringify(metadata));

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        pinata_api_key: pinataKey,
        pinata_secret_api_key: pinataSecret,
      },
      body: form,
    });

    const payload = await resp.json().catch(() => null);
    if (!resp.ok) {
      const msg = payload?.error || payload?.message || `Pinata upload failed (${resp.status})`;
      return res.status(502).json({ success: false, message: msg, details: payload });
    }

    const ipfsHash = payload?.IpfsHash;
    if (!ipfsHash) {
      return res.status(502).json({ success: false, message: "Pinata response missing IpfsHash.", details: payload });
    }

    return res.json({
      success: true,
      ipfsHash,
      ipfsUrl: gateway + ipfsHash,
      mocked: false,
    });
  } catch (err) {
    console.error("IPFS upload error:", err);
    return res.status(500).json({ success: false, message: "Failed to upload to IPFS. Please try again." });
  }
}

