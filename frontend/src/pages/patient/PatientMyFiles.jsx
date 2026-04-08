import { useState, useEffect } from "react";
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
  btn: {
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
  error: {
    padding: "0.75rem 1rem",
    borderRadius: "var(--radius)",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "var(--color-text)",
    fontSize: "0.9rem",
  },
  small: { color: "var(--color-text-muted)", fontSize: "0.9rem" },
  empty: {
    color: "var(--color-text-muted)",
    fontSize: "0.9375rem",
    padding: "1rem 0",
  },
};

export default function PatientMyFiles() {
  const [user, setUser] = useState(null);
  const { isConnected, connectWallet, isConnecting, verifyDocumentOnChain } = useWeb3();
  const [verifying, setVerifying] = useState("");
  const [verifyResult, setVerifyResult] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("medivault_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const hashIds = user?.hashIds || [];
  const GATEWAY = import.meta.env.VITE_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs/";

  async function handleVerify(hash) {
    if (!isConnected) {
      setError("Connect MetaMask to verify on-chain.");
      return;
    }
    setError("");
    setVerifying(hash);
    try {
      const res = await verifyDocumentOnChain({ ipfsHash: hash });
      setVerifyResult((prev) => ({
        ...prev,
        [hash]: {
          ok: Boolean(res?.[0]),
          patient: res?.[1],
          uploadedBy: res?.[2],
        },
      }));
    } catch (e) {
      setError(e?.message || "Verification failed.");
    } finally {
      setVerifying("");
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Files</h1>
        <p style={styles.subtitle}>
          Your medical documents and file hashes. Files are shared with your doctor.
        </p>
      </div>

      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem", color: "var(--color-text)" }}>
            Your file hashes
          </h2>
          {!isConnected ? (
            <button style={styles.btn} onClick={connectWallet} disabled={isConnecting}>
              {isConnecting ? "Connecting..." : "Connect MetaMask"}
            </button>
          ) : (
            <div style={styles.small}>Wallet connected</div>
          )}
        </div>
        {error ? <div style={styles.error}>{error}</div> : null}
        {hashIds.length === 0 ? (
          <p style={styles.empty}>No files linked to your account yet. Your doctor can upload files for you.</p>
        ) : (
          <ul style={styles.hashList}>
            {hashIds.map((hashId, idx) => (
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
                  <a href={GATEWAY + hashId} target="_blank" rel="noreferrer" style={{ ...styles.btn, textDecoration: "none" }}>
                    Open IPFS
                  </a>
                  <button style={styles.btn} onClick={() => handleVerify(hashId)} disabled={verifying === hashId}>
                    {verifying === hashId ? "Verifying..." : "Verify"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
