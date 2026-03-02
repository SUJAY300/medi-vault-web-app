const API_BASE = "/api";

export async function getDoctors() {
  const res = await fetch(`${API_BASE}/doctors`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch doctors");
  return data;
}

