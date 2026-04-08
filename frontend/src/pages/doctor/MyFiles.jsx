import { useState, useEffect } from "react";
import { getPatients } from "../../api/patients";
import { useWeb3 } from "../../blockchain/Web3Context";

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
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
  card: {
    background: "var(--color-surface)",
    borderRadius: "var(--radius)",
    padding: "2rem",
    boxShadow: "var(--shadow)",
    border: "1px solid var(--color-border)",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  patientRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem",
    borderRadius: "var(--radius)",
    background: "var(--color-bg)",
    border: "1px solid var(--color-border)",
    cursor: "pointer",
    transition: "background 0.2s, border-color 0.2s",
  },
  patientRowSelected: {
    background: "rgba(14, 165, 233, 0.15)",
    borderColor: "var(--color-primary)",
  },
  hashList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  hashItem: {
    padding: "0.75rem 1rem",
    borderRadius: "var(--radius)",
    background: "var(--color-bg)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.75rem",
  },
  hashText: { fontFamily: "monospace", fontSize: "0.875rem", wordBreak: "break-all" },
  actions: { display: "flex", gap: "0.5rem", flexWrap: "wrap" },
  btnSm: {
    padding: "0.45rem 0.7rem",
    borderRadius: "var(--radius)",
    border: "1px solid var(--color-border)",
    background: "transparent",
    color: "var(--color-text)",
    cursor: "pointer",
    fontWeight: 650,
    fontSize: "0.85rem",
  },
  badge: {
    padding: "0.15rem 0.5rem",
    borderRadius: 999,
    border: "1px solid var(--color-border)",
    fontSize: "0.75rem",
    color: "var(--color-text-muted)",
    whiteSpace: "nowrap",
  },
  smallMuted: { color: "var(--color-text-muted)", fontSize: "0.9rem" },
  placeholderDetail: {
    color: "var(--color-text-muted)",
    fontSize: "0.9375rem",
    padding: "1.5rem 0",
  },
  patientName: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "var(--color-text)",
  },
  patientId: {
    fontSize: "0.875rem",
    color: "var(--color-text-muted)",
  },
  loading: {
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
  empty: {
    color: "var(--color-text-muted)",
    fontSize: "0.9375rem",
    padding: "1rem 0",
  },
};

export default function MyFiles() {
  const [user, setUser] = useState(null);
  const { isConnected, connectWallet, isConnecting, verifyDocumentOnChain } = useWeb3();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState("");
  const [verifyResult, setVerifyResult] = useState({});

  const GATEWAY = import.meta.env.VITE_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs/";

  useEffect(() => {
    const stored = localStorage.getItem("medivault_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (!user) return;
    async function fetchPatients() {
      try {
        setLoading(true);
        setError("");
        const data = await getPatients({ doctorId: user.id });
        if (data.success) {
          setPatients(data.patients);
        } else {
          setError(data.message || "Failed to fetch patients");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch patients");
      } finally {
        setLoading(false);
      }
    }
    fetchPatients();
  }, [user]);

  async function handleVerify(hash) {
    if (!isConnected) return;
    setVerifying(hash);
    try {
      const res = await verifyDocumentOnChain({ ipfsHash: hash });
      setVerifyResult((prev) => ({
        ...prev,
        [hash]: { ok: Boolean(res?.[0]), patient: res?.[1], uploadedBy: res?.[2] },
      }));
    } catch {
      setVerifyResult((prev) => ({ ...prev, [hash]: { ok: false } }));
    } finally {
      setVerifying("");
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Files</h1>
        <p style={styles.subtitle}>
          Files and documents for your patients. Below are the patients under your care.
        </p>
      </div>

      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem", color: "var(--color-text)" }}>
            Patients under you
          </h2>
          {!isConnected ? (
            <button type="button" style={styles.btnSm} onClick={connectWallet} disabled={isConnecting}>
              {isConnecting ? "Connecting..." : "Connect MetaMask"}
            </button>
          ) : (
            <div style={styles.smallMuted}>Wallet connected</div>
          )}
        </div>
        {loading ? (
          <div style={styles.loading}>Loading patients…</div>
        ) : error ? (
          <div style={styles.error}>{error}</div>
        ) : patients.length === 0 ? (
          <div style={styles.empty}>No patients assigned to you yet.</div>
        ) : (
          <>
            <ul style={styles.list}>
              {patients.map((patient) => (
                <li
                  key={patient.id}
                  style={{
                    ...styles.patientRow,
                    ...(selectedPatient?.id === patient.id ? styles.patientRowSelected : {}),
                  }}
                  onClick={() => setSelectedPatient(patient)}
                >
                  <span style={styles.patientName}>{patient.fullName}</span>
                  <span style={styles.patientId}>{patient.patientId}</span>
                </li>
              ))}
            </ul>
            {selectedPatient && (
              <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--color-border)" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--color-text)" }}>
                  Hash IDs for {selectedPatient.fullName}
                </h3>
                {!selectedPatient.hashIds || selectedPatient.hashIds.length === 0 ? (
                  <p style={styles.placeholderDetail}>No hash IDs (PDFs) for this patient yet.</p>
                ) : (
                  <ul style={styles.hashList}>
                    {selectedPatient.hashIds.map((hashId, idx) => (
                      <li key={idx} style={styles.hashItem}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                          <div style={styles.hashText}>{hashId}</div>
                          {verifyResult[hashId] ? (
                            <div style={styles.badge}>
                              {verifyResult[hashId].ok ? "On-chain: ✅ verified" : "On-chain: ❌ not found"}
                            </div>
                          ) : null}
                        </div>
                        <div style={styles.actions}>
                          <a
                            href={GATEWAY + hashId}
                            target="_blank"
                            rel="noreferrer"
                            style={{ ...styles.btnSm, textDecoration: "none" }}
                          >
                            Open IPFS
                          </a>
                          <button
                            type="button"
                            style={styles.btnSm}
                            onClick={() => handleVerify(hashId)}
                            disabled={!isConnected || verifying === hashId}
                            title={!isConnected ? "Connect MetaMask to verify on-chain" : "Verify on blockchain"}
                          >
                            {verifying === hashId ? "Verifying..." : "Verify"}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
