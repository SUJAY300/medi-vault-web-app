const API_BASE = "/api";

export async function linkWallet({ userId, walletAddress }) {
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}/wallet`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to link wallet");
  return data;
}

