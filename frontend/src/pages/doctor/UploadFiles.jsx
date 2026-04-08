import { useEffect, useMemo, useState } from "react";
import { getPatients } from "../../api/patients";
import { confirmReportBlockchain, getReport, listPatientReports, runReportSummarizer, saveReportSummary, uploadPatientReport, uploadToIpfs } from "../../api/reports";
import { useWeb3 } from "../../blockchain/Web3Context";

const FASTAPI_BASE = "http://127.0.0.1:8000";

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    height: "100%",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "var(--color-text)",
    margin: 0,
  },
  subtitle: {
    fontSize: "0.9375rem",
    color: "var(--color-text-muted)",
    margin: 0,
  },
  container: {
    display: "flex",
    gap: "1.5rem",
    flex: 1,
    minHeight: 0,
  },
  leftPanel: {
    width: "33%",
    minWidth: "300px",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  searchBar: {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "var(--radius)",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text)",
    fontSize: "0.9375rem",
    fontFamily: "inherit",
  },
  patientList: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    overflowY: "auto",
    paddingRight: "0.5rem",
  },
  patientCard: {
    padding: "1rem",
    borderRadius: "var(--radius)",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    cursor: "pointer",
    transition: "background 0.2s, border-color 0.2s",
  },
  patientCardSelected: {
    background: "rgba(14, 165, 233, 0.15)",
    borderColor: "var(--color-primary)",
  },
  patientName: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "var(--color-text)",
    marginBottom: "0.25rem",
  },
  patientId: {
    fontSize: "0.875rem",
    color: "var(--color-text-muted)",
  },
  rightPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    borderRadius: "var(--radius)",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    padding: "1.5rem",
    minHeight: 0,
    gap: "1rem",
  },
  placeholder: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    color: "var(--color-text-muted)",
    fontSize: "0.9375rem",
  },
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    color: "var(--color-text-muted)",
    fontSize: "0.9375rem",
  },
  error: {
    padding: "1rem",
    borderRadius: "var(--radius)",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "var(--color-text)",
    fontSize: "0.9375rem",
  },
  sectionTitle: {
    fontSize: "1.05rem",
    fontWeight: 650,
    color: "var(--color-text)",
    margin: 0,
  },
  row: { display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" },
  btn: {
    padding: "0.6rem 0.9rem",
    borderRadius: "var(--radius)",
    border: "1px solid var(--color-border)",
    background: "var(--color-surface)",
    color: "var(--color-text)",
    cursor: "pointer",
    fontWeight: 600,
  },
  btnPrimary: {
    background: "var(--color-primary)",
    borderColor: "var(--color-primary)",
    color: "#fff",
  },
  smallMuted: { color: "var(--color-text-muted)", fontSize: "0.875rem" },
  reportsList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    overflowY: "auto",
    paddingRight: "0.25rem",
    maxHeight: "220px",
  },
  reportItem: {
    padding: "0.75rem 0.9rem",
    borderRadius: "var(--radius)",
    border: "1px solid var(--color-border)",
    background: "rgba(255,255,255,0.02)",
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
  },
  summaryBox: {
    whiteSpace: "pre-wrap",
    background: "rgba(0,0,0,0.15)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius)",
    padding: "0.9rem",
    fontSize: "0.95rem",
    color: "var(--color-text)",
    maxHeight: "260px",
    overflowY: "auto",
  },
  jsonBox: {
    background: "rgba(0,0,0,0.15)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius)",
    padding: "0.9rem",
    fontSize: "0.85rem",
    color: "var(--color-text)",
    maxHeight: "260px",
    overflowY: "auto",
  },
};

export default function UploadFiles() {
  const [user, setUser] = useState(null);
  const { isConnected, isConnecting, connectWallet, account, uploadDocumentOnChain } = useWeb3();
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [loadingPatients, setLoadingPatients] = useState(true);
  const [patientError, setPatientError] = useState("");

  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportsError, setReportsError] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [latestReport, setLatestReport] = useState(null);
  const [anchoring, setAnchoring] = useState(false);
  const [anchorInfo, setAnchorInfo] = useState(null);

  const [summarizing, setSummarizing] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [structuredData, setStructuredData] = useState(null);
  const [summarizeError, setSummarizeError] = useState("");

  const [activeReportId, setActiveReportId] = useState(null);
  const [activeReportMeta, setActiveReportMeta] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("medivault_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (!user) return;
    async function fetchPatients() {
      try {
        setLoadingPatients(true);
        setPatientError("");
        const data = await getPatients({ doctorId: user.id });
        if (data.success) setPatients(data.patients);
        else setPatientError(data.message || "Failed to fetch patients");
      } catch (e) {
        setPatientError(e.message || "Failed to fetch patients");
      } finally {
        setLoadingPatients(false);
      }
    }
    fetchPatients();
  }, [user]);

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const q = searchQuery.toLowerCase();
    return patients.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.patientId.toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q)
    );
  }, [patients, searchQuery]);

  async function refreshReports(patient) {
    if (!user || !patient) return;
    try {
      setLoadingReports(true);
      setReportsError("");
      const data = await listPatientReports({ patientId: patient.id, doctorId: user.id });
      setReports(data.reports || []);
    } catch (e) {
      setReportsError(e.message || "Failed to fetch reports");
    } finally {
      setLoadingReports(false);
    }
  }

  function handlePatientClick(patient) {
    setSelectedPatient(patient);
    setSelectedFile(null);
    setUploadError("");
    setSummarizeError("");
    setSummaryText("");
    setStructuredData(null);
    setLatestReport(null);
    setAnchorInfo(null);
    setActiveReportId(null);
    setActiveReportMeta(null);
    refreshReports(patient);
  }

  async function handleUpload() {
    if (!user || !selectedPatient || !selectedFile) return;
    try {
      setUploading(true);
      setUploadError("");
      setAnchorInfo(null);
      setSummarizeError("");
      setSummaryText("");
      setStructuredData(null);

      const data = await uploadPatientReport({
        patientId: selectedPatient.id,
        doctorId: user.id,
        file: selectedFile,
      });
      setLatestReport(data.report);
      setActiveReportId(data.report?._id || null);
      setActiveReportMeta(data.report || null);

      // ── Optional blockchain anchoring (safe: does not block existing features) ──
      // Requires: patient wallet address + MetaMask connected + contract configured.
      const patientWallet = selectedPatient.walletAddress;
      if (patientWallet && isConnected) {
        try {
          setAnchoring(true);
          const ipfs = await uploadToIpfs({ file: selectedFile });
          const ipfsHash = ipfs.ipfsHash;
          const ipfsUrl = ipfs.ipfsUrl;

          const tx = await uploadDocumentOnChain({
            ipfsHash,
            fileName: selectedFile.name,
            documentType: "lab_report",
            patientWallet,
          });

          const txHash = tx?.transactionHash || tx?.transactionHash?.toString?.() || "";
          await confirmReportBlockchain({
            reportId: data.report?._id,
            doctorId: user.id,
            ipfsHash,
            ipfsUrl,
            txHash: txHash || "0x",
            status: "confirmed",
          });

          setAnchorInfo({ ipfsHash, ipfsUrl, txHash });
        } catch (e) {
          setAnchorInfo({ error: e.message || "Blockchain anchoring failed (upload still succeeded)." });
          try {
            // best-effort mark failed if we already have report id
            if (data?.report?._id) {
              await confirmReportBlockchain({
                reportId: data.report._id,
                doctorId: user.id,
                ipfsHash: "",
                ipfsUrl: "",
                txHash: "0x",
                status: "failed",
              });
            }
          } catch {
            // ignore
          }
        } finally {
          setAnchoring(false);
        }
      } else if (!patientWallet) {
        setAnchorInfo({ warning: "Patient walletAddress not set. Skipping blockchain anchoring." });
      } else if (!isConnected) {
        setAnchorInfo({ warning: "MetaMask not connected. Upload succeeded; connect wallet to anchor on-chain." });
      }

      await refreshReports(selectedPatient);
    } catch (e) {
      setUploadError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSelectReport(reportId) {
    if (!user || !reportId) return;
    try {
      setSummarizeError("");
      setSummaryText("");
      setStructuredData(null);
      setActiveReportId(reportId);

      const data = await getReport({ reportId, doctorId: user.id });
      const report = data.report;
      setActiveReportMeta(report);

      if (report?.summaryText) {
        setSummaryText(report.summaryText);
        setStructuredData(report.structuredData ?? null);
      }
    } catch (e) {
      setSummarizeError(e.message || "Failed to load report");
    }
  }

  async function handleSummarize() {
    if (!user) return;

    // If we still have a File object from the current session + latest upload, use direct FastAPI (fastest for dev)
    if (selectedFile && latestReport && activeReportId === latestReport._id) {
      try {
        setSummarizing(true);
        setSummarizeError("");
        setSummaryText("");
        setStructuredData(null);

        const form = new FormData();
        form.append("file", selectedFile);

        const res = await fetch(`${FASTAPI_BASE}/medical/summarize`, {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Summarizer failed");

        setSummaryText(data.summary || "");
        setStructuredData(data.structured_data || null);

        await saveReportSummary({
          reportId: latestReport._id,
          doctorId: user.id,
          summaryText: data.summary || "",
          structuredData: data.structured_data || null,
          status: "summarized",
        });
        await refreshReports(selectedPatient);
        setActiveReportId(latestReport._id);
        setActiveReportMeta((prev) => (prev?._id === latestReport._id ? { ...prev, status: "summarized" } : prev));
      } catch (e) {
        setSummarizeError(e.message || "Summarizer failed");
        try {
          await saveReportSummary({
            reportId: latestReport._id,
            doctorId: user.id,
            summaryText: "Summarization failed.",
            structuredData: null,
            status: "failed",
          });
        } catch {
          // ignore secondary failure in dev
        }
      } finally {
        setSummarizing(false);
      }
      return;
    }

    // Otherwise run on the server using the stored PDF path (no re-upload needed)
    if (!activeReportId) return;
    try {
      setSummarizing(true);
      setSummarizeError("");
      setSummaryText("");
      setStructuredData(null);

      const data = await runReportSummarizer({ reportId: activeReportId, doctorId: user.id });
      const report = data.report;
      setActiveReportMeta(report);
      setSummaryText(report.summaryText || "");
      setStructuredData(report.structuredData ?? null);
      await refreshReports(selectedPatient);
    } catch (e) {
      setSummarizeError(e.message || "Summarizer failed");
    } finally {
      setSummarizing(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Upload Reports</h1>
        <p style={styles.subtitle}>Select a patient, upload a PDF, run the summarizer, and save output.</p>
      </div>

      {loadingPatients ? (
        <div style={styles.loading}>Loading patients...</div>
      ) : patientError ? (
        <div style={styles.error}>{patientError}</div>
      ) : (
        <div style={styles.container}>
          <div style={styles.leftPanel}>
            <input
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchBar}
            />
            <div style={styles.patientList}>
              {filteredPatients.length === 0 ? (
                <div style={styles.smallMuted}>No patients found</div>
              ) : (
                filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => handlePatientClick(patient)}
                    style={{
                      ...styles.patientCard,
                      ...(selectedPatient?.id === patient.id ? styles.patientCardSelected : {}),
                    }}
                  >
                    <div style={styles.patientName}>{patient.fullName}</div>
                    <div style={styles.patientId}>{patient.patientId}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={styles.rightPanel}>
            {!selectedPatient ? (
              <div style={styles.placeholder}>Select a patient to upload a report</div>
            ) : (
              <>
                <div>
                  <h2 style={styles.sectionTitle}>{selectedPatient.fullName}</h2>
                  <div style={styles.smallMuted}>
                    {selectedPatient.patientId} · {selectedPatient.username}
                  </div>
                </div>

                <div>
                  <h3 style={styles.sectionTitle}>Upload PDF report</h3>
                  <div style={{ ...styles.row, justifyContent: "space-between" }}>
                    <div style={styles.smallMuted}>
                      Blockchain wallet:{" "}
                      {isConnected ? (
                        <b><code>{account?.slice(0, 6)}...{account?.slice(-4)}</code></b>
                      ) : (
                        <b>Not connected</b>
                      )}
                    </div>
                    {!isConnected ? (
                      <button
                        style={{ ...styles.btn }}
                        onClick={connectWallet}
                        disabled={isConnecting || uploading || summarizing}
                      >
                        {isConnecting ? "Connecting..." : "Connect MetaMask"}
                      </button>
                    ) : null}
                  </div>
                  <div style={styles.row}>
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      disabled={uploading || summarizing}
                    />
                    <button
                      style={{ ...styles.btn, ...styles.btnPrimary, opacity: uploading || !selectedFile ? 0.7 : 1 }}
                      onClick={handleUpload}
                      disabled={uploading || !selectedFile}
                    >
                      {uploading ? "Uploading..." : "Upload"}
                    </button>
                  </div>
                  {uploadError ? <div style={styles.error}>{uploadError}</div> : null}
                  {anchoring ? (
                    <div style={styles.smallMuted}>Anchoring on blockchain… (upload already succeeded)</div>
                  ) : null}
                  {anchorInfo?.warning ? (
                    <div style={styles.smallMuted}>{anchorInfo.warning}</div>
                  ) : null}
                  {anchorInfo?.error ? (
                    <div style={styles.error}>{anchorInfo.error}</div>
                  ) : null}
                  {anchorInfo?.ipfsUrl ? (
                    <div style={styles.smallMuted}>
                      IPFS:{" "}
                      <a href={anchorInfo.ipfsUrl} target="_blank" rel="noreferrer">
                        {anchorInfo.ipfsHash}
                      </a>
                      {anchorInfo.txHash ? (
                        <>
                          {" "}· TX: <code>{anchorInfo.txHash.slice(0, 10)}...</code>
                        </>
                      ) : null}
                    </div>
                  ) : null}
                  {latestReport ? (
                    <div style={styles.smallMuted}>
                      Uploaded: <b>{latestReport.originalFileName}</b>
                    </div>
                  ) : null}
                </div>

                <div>
                  <h3 style={styles.sectionTitle}>Run summarizer</h3>
                  <div style={styles.row}>
                    <button
                      style={{
                        ...styles.btn,
                        ...styles.btnPrimary,
                        opacity: (!activeReportId || summarizing) ? 0.7 : 1,
                      }}
                      onClick={handleSummarize}
                      disabled={!activeReportId || summarizing}
                    >
                      {summarizing ? "Summarizing..." : "Run summarizer"}
                    </button>
                    <div style={styles.smallMuted}>
                      FastAPI: <code>{FASTAPI_BASE}</code>
                    </div>
                  </div>
                  {summarizeError ? <div style={styles.error}>{summarizeError}</div> : null}
                </div>

                <div>
                  <h3 style={styles.sectionTitle}>Output</h3>
                  {activeReportMeta ? (
                    <div style={styles.smallMuted}>
                      Showing: <b>{activeReportMeta.originalFileName}</b> · <b>{activeReportMeta.status}</b>
                    </div>
                  ) : null}
                  {summaryText ? <div style={styles.summaryBox}>{summaryText}</div> : <div style={styles.smallMuted}>No output yet.</div>}
                  {structuredData ? (
                    <details style={{ marginTop: "0.75rem" }}>
                      <summary style={{ cursor: "pointer", color: "var(--color-text)" }}>Structured JSON</summary>
                      <pre style={styles.jsonBox}>{JSON.stringify(structuredData, null, 2)}</pre>
                    </details>
                  ) : null}
                </div>

                <div>
                  <h3 style={styles.sectionTitle}>Previous uploads</h3>
                  {loadingReports ? (
                    <div style={styles.smallMuted}>Loading reports...</div>
                  ) : reportsError ? (
                    <div style={styles.error}>{reportsError}</div>
                  ) : reports.length === 0 ? (
                    <div style={styles.smallMuted}>No reports uploaded yet.</div>
                  ) : (
                    <div style={styles.reportsList}>
                      {reports.map((r) => (
                        <div
                          key={r._id}
                          style={{
                            ...styles.reportItem,
                            cursor: "pointer",
                            borderColor: activeReportId === r._id ? "var(--color-primary)" : "var(--color-border)",
                          }}
                          onClick={() => handleSelectReport(r._id)}
                        >
                          <div>
                            <div style={{ fontWeight: 650, color: "var(--color-text)" }}>{r.originalFileName}</div>
                            <div style={styles.smallMuted}>
                              {new Date(r.createdAt).toLocaleString()} · <b>{r.status}</b>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

