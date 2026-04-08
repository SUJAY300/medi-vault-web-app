import { useEffect, useMemo, useState } from "react";
import { useWeb3 } from "../../blockchain/Web3Context";
import { linkWallet } from "../../api/users";
import WalletMismatchBanner from "../../components/WalletMismatchBanner";

const styles = {
  page: { display: "flex", flexDirection: "column", gap: "1.5rem" },
  header: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  title: { fontSize: "1.75rem", fontWeight: 700, color: "var(--color-text)", margin: 0 },
  subtitle: { fontSize: "0.9375rem", color: "var(--color-text-muted)", margin: 0 },
  card: {
    background: "var(--color-surface)",
    borderRadius: "var(--radius)",
    padding: "1.5rem",
    boxShadow: "var(--shadow)",
    border: "1px solid var(--color-border)",
  },
  row: { display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" },
  label: { fontSize: "0.875rem", color: "var(--color-text-muted)" },
  input: {
    padding: "0.7rem 0.9rem",
    borderRadius: "var(--radius)",
    background: "var(--color-bg)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text)",
    minWidth: 320,
  },
  btn: {
    padding: "0.65rem 0.95rem",
    borderRadius: "var(--radius)",
    border: "1px solid var(--color-border)",
    background: "var(--color-bg)",
    color: "var(--color-text)",
    cursor: "pointer",
    fontWeight: 650,
  },
  btnPrimary: { background: "var(--color-primary)", borderColor: "var(--color-primary)", color: "#fff" },
  error: {
    padding: "0.9rem",
    borderRadius: "var(--radius)",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "var(--color-text)",
  },
  success: {
    padding: "0.9rem",
    borderRadius: "var(--radius)",
    background: "rgba(16, 185, 129, 0.12)",
    border: "1px solid rgba(16, 185, 129, 0.35)",
    color: "var(--color-text)",
  },
  small: { fontSize: "0.875rem", color: "var(--color-text-muted)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", fontSize: "0.8rem", color: "var(--color-text-muted)", padding: "0.5rem 0" },
  td: { padding: "0.6rem 0", borderTop: "1px solid var(--color-border)", fontFamily: "monospace", fontSize: "0.875rem" },
};

export default function PatientAccess() {
  const { isConnected, connectWallet, isConnecting, account, grantAccessOnChain, revokeAccessOnChain, checkAccessOnChain, getGrantedDoctorsOnChain } =
    useWeb3();

  const [doctorWallet, setDoctorWallet] = useState("");
  const [expiry, setExpiry] = useState(""); // datetime-local value
  const [grants, setGrants] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [savingWallet, setSavingWallet] = useState(false);
  const [user, setUser] = useState(null);

  const patientWallet = useMemo(() => (account || "").toLowerCase(), [account]);

  useEffect(() => {
    setError("");
    setSuccess("");
  }, [account]);

  useEffect(() => {
    const stored = localStorage.getItem("medivault_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // Load persisted grants from chain when connected (patient must be the signer).
  useEffect(() => {
    if (!isConnected || !account) return;
    let cancelled = false;

    async function load() {
      try {
        const doctors = await getGrantedDoctorsOnChain({ patientWallet });
        const rows = await Promise.all(
          (doctors || []).map(async (d) => {
            const res = await checkAccessOnChain({ patientWallet, doctorWallet: d });
            const hasAccess = Boolean(res?.[0]);
            const expiresAt = Number(res?.[1] || 0);
            return {
              doctorWallet: String(d).toLowerCase(),
              expiresAt,
              status: hasAccess ? "active" : "revoked",
              txHash: "",
            };
          })
        );
        if (!cancelled) setGrants(rows.filter((r) => r.doctorWallet));
      } catch {
        // ignore — still usable via manual grant inputs
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isConnected, account]);

  async function handleSaveWallet() {
    if (!user?.id) return;
    if (!isConnected || !account) {
      setError("Connect MetaMask first.");
      return;
    }
    setSavingWallet(true);
    setError("");
    setSuccess("");
    try {
      const data = await linkWallet({ userId: user.id, walletAddress: account });
      localStorage.setItem("medivault_user", JSON.stringify(data.user));
      setUser(data.user);
      setSuccess("Wallet linked to your profile.");
    } catch (e) {
      setError(e.message || "Failed to link wallet.");
    } finally {
      setSavingWallet(false);
    }
  }

  async function handleGrant() {
    if (!doctorWallet) return setError("Enter doctor wallet address.");
    if (!isConnected) return setError("Connect MetaMask first.");
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const expiresAt = expiry ? Math.floor(new Date(expiry).getTime() / 1000) : 0;
      const tx = await grantAccessOnChain({ doctorWallet, expiresAt });
      setSuccess("Access granted on-chain.");
      setGrants((prev) => [
        { doctorWallet: doctorWallet.toLowerCase(), expiresAt, txHash: tx?.transactionHash || "", status: "active" },
        ...prev,
      ]);
      setDoctorWallet("");
      setExpiry("");
    } catch (e) {
      setError(e?.message || "Grant failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRevoke(addr) {
    if (!isConnected) return setError("Connect MetaMask first.");
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const tx = await revokeAccessOnChain({ doctorWallet: addr });
      setSuccess("Access revoked on-chain.");
      setGrants((prev) => prev.map((g) => (g.doctorWallet === addr.toLowerCase() ? { ...g, status: "revoked", txHash: tx?.transactionHash || g.txHash } : g)));
    } catch (e) {
      setError(e?.message || "Revoke failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCheck(addr) {
    setError("");
    setSuccess("");
    try {
      const res = await checkAccessOnChain({ patientWallet, doctorWallet: addr });
      const hasAccess = Boolean(res?.[0]);
      const expiresAt = Number(res?.[1] || 0);
      setSuccess(hasAccess ? `Access active. Expires: ${expiresAt ? new Date(expiresAt * 1000).toLocaleString() : "Never"}` : "No active access.");
    } catch (e) {
      setError(e?.message || "Check failed.");
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Access Control</h1>
        <p style={styles.subtitle}>Grant or revoke doctor access to your records on the blockchain.</p>
      </div>

      <div style={styles.card}>
        {user ? <WalletMismatchBanner user={user} style={{ marginBottom: 12 }} /> : null}
        <div style={{ ...styles.row, justifyContent: "space-between" }}>
          <div style={styles.small}>
            Wallet: {isConnected ? <b><code>{patientWallet}</code></b> : <b>Not connected</b>}
          </div>
          {!isConnected ? (
            <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={connectWallet} disabled={isConnecting}>
              {isConnecting ? "Connecting..." : "Connect MetaMask"}
            </button>
          ) : (
            <button
              style={{ ...styles.btn, ...styles.btnPrimary, opacity: savingWallet ? 0.7 : 1 }}
              onClick={handleSaveWallet}
              disabled={savingWallet}
              title="Save this wallet address into your MediVault profile"
            >
              {savingWallet ? "Saving..." : "Save wallet"}
            </button>
          )}
        </div>

        <div style={{ height: 12 }} />

        <div style={styles.row}>
          <div>
            <div style={styles.label}>Doctor Wallet Address</div>
            <input
              style={styles.input}
              value={doctorWallet}
              onChange={(e) => setDoctorWallet(e.target.value)}
              placeholder="0x..."
              disabled={busy}
            />
          </div>
          <div>
            <div style={styles.label}>Expiry (optional)</div>
            <input style={styles.input} type="datetime-local" value={expiry} onChange={(e) => setExpiry(e.target.value)} disabled={busy} />
          </div>
        </div>

        <div style={{ height: 12 }} />

        <div style={styles.row}>
          <button style={{ ...styles.btn, ...styles.btnPrimary, opacity: busy ? 0.7 : 1 }} onClick={handleGrant} disabled={busy}>
            Grant Access
          </button>
          <div style={styles.small}>Tip: use MetaMask Account 3 for patient.</div>
        </div>

        {error ? <div style={{ ...styles.error, marginTop: 12 }}>{error}</div> : null}
        {success ? <div style={{ ...styles.success, marginTop: 12 }}>{success}</div> : null}
      </div>

      <div style={styles.card}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 650, margin: 0, color: "var(--color-text)" }}>Recent grants (this session)</h2>
        <p style={{ ...styles.small, marginTop: 8 }}>
          For a full list, we can add an on-chain fetch later. This list is local and resets on refresh.
        </p>

        {grants.length === 0 ? (
          <div style={styles.small}>No grants yet.</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Doctor</th>
                <th style={styles.th}>Expiry</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {grants.map((g) => (
                <tr key={g.doctorWallet + g.txHash}>
                  <td style={styles.td}>{g.doctorWallet}</td>
                  <td style={styles.td}>
                    {g.expiresAt ? new Date(g.expiresAt * 1000).toLocaleString() : "Never"}
                  </td>
                  <td style={styles.td}>{g.status}</td>
                  <td style={{ ...styles.td, fontFamily: "inherit" }}>
                    <div style={styles.row}>
                      <button style={styles.btn} onClick={() => handleCheck(g.doctorWallet)} disabled={busy}>
                        Check
                      </button>
                      {g.status === "active" ? (
                        <button style={styles.btn} onClick={() => handleRevoke(g.doctorWallet)} disabled={busy}>
                          Revoke
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

