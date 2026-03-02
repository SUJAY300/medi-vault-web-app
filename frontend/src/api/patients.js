const API_BASE = "/api";

export async function getPatients({ doctorId } = {}) {
  const query = doctorId ? `?doctorId=${encodeURIComponent(doctorId)}` : "";
  const res = await fetch(`${API_BASE}/patients${query}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch patients");
  return data;
}
