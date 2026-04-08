const API_BASE = "/api";

export async function listPatientReports({ patientId, doctorId }) {
  const res = await fetch(
    `${API_BASE}/patients/${encodeURIComponent(patientId)}/reports?doctorId=${encodeURIComponent(doctorId)}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch reports");
  return data;
}

export async function uploadPatientReport({ patientId, doctorId, file }) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(
    `${API_BASE}/patients/${encodeURIComponent(patientId)}/reports?doctorId=${encodeURIComponent(doctorId)}`,
    {
      method: "POST",
      body: form,
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to upload report");
  return data;
}

export async function uploadToIpfs({ file }) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE}/ipfs/upload`, {
    method: "POST",
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to upload to IPFS");
  return data;
}

export async function confirmReportBlockchain({ reportId, doctorId, ipfsHash, ipfsUrl, txHash, status }) {
  const res = await fetch(
    `${API_BASE}/reports/${encodeURIComponent(reportId)}/blockchain-confirm?doctorId=${encodeURIComponent(doctorId)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ipfsHash, ipfsUrl, txHash, status }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to confirm blockchain anchor");
  return data;
}

export async function saveReportSummary({ reportId, doctorId, summaryText, structuredData, status }) {
  const res = await fetch(
    `${API_BASE}/reports/${encodeURIComponent(reportId)}/summary?doctorId=${encodeURIComponent(doctorId)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summaryText, structuredData, status }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to save summary");
  return data;
}

export async function getReport({ reportId, doctorId }) {
  const res = await fetch(
    `${API_BASE}/reports/${encodeURIComponent(reportId)}?doctorId=${encodeURIComponent(doctorId)}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch report");
  return data;
}

export async function runReportSummarizer({ reportId, doctorId }) {
  const res = await fetch(
    `${API_BASE}/reports/${encodeURIComponent(reportId)}/run-summarizer?doctorId=${encodeURIComponent(doctorId)}`,
    { method: "POST" }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to run summarizer");
  return data;
}

