import { useState, useEffect } from "react";
import { useWeb3 } from "../../blockchain/Web3Context";
import { linkWallet } from "../../api/users";

const styles = {
  card: {
    maxWidth: 560,
    background: "var(--color-surface)",
    borderRadius: "var(--radius)",
    padding: "2rem",
    boxShadow: "var(--shadow)",
    border: "1px solid var(--color-border)",
  },
  welcome: {
    fontSize: "1.125rem",
    color: "var(--color-text-muted)",
    marginBottom: "1rem",
  },
  muted: {
    color: "var(--color-text-muted)",
    fontSize: "0.9375rem",
  },
  row: { display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap", marginTop: "1rem" },
  btn: {
    padding: "0.6rem 0.9rem",
    borderRadius: "var(--radius)",
    border: "1px solid var(--color-border)",
    background: "var(--color-bg)",
    color: "var(--color-text)",
    cursor: "pointer",
    fontWeight: 650,
  },
  btnPrimary: { background: "var(--color-primary)", borderColor: "var(--color-primary)", color: "#fff" },
  code: { fontFamily: "monospace" },
  error: {
    marginTop: "0.75rem",
    padding: "0.75rem 1rem",
    borderRadius: "var(--radius)",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "var(--color-text)",
    fontSize: "0.9rem",
  },
  success: {
    marginTop: "0.75rem",
    padding: "0.75rem 1rem",
    borderRadius: "var(--radius)",
    background: "rgba(16, 185, 129, 0.12)",
    border: "1px solid rgba(16, 185, 129, 0.35)",
    color: "var(--color-text)",
    fontSize: "0.9rem",
  },
};

export default function PatientDashboardHome() {
  const [user, setUser] = useState(null);
  const { isConnected, connectWallet, isConnecting, account } = useWeb3();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    const stored = localStorage.getItem("medivault_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  async function handleSaveWallet() {
    if (!user?.id) return;
    if (!isConnected || !account) {
      setMsg({ type: "error", text: "Connect MetaMask first." });
      return;
    }
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      const data = await linkWallet({ userId: user.id, walletAddress: account });
      localStorage.setItem("medivault_user", JSON.stringify(data.user));
      setUser(data.user);
      setMsg({ type: "success", text: "Wallet linked to your profile." });
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Failed to link wallet." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.card}>
      <p style={styles.welcome}>
        Welcome, <strong>{user?.fullName ?? "Patient"}</strong>.
      </p>
      <p style={styles.muted}>
        You are signed in as <strong>{user?.username}</strong>. This is your dashboard overview.
        Use the sidebar to open My Files, view your Doctor, or manage your health records.
      </p>

      <div style={styles.row}>
        <div style={styles.muted}>
          Connected wallet:{" "}
          {isConnected ? <span style={styles.code}>{account}</span> : <strong>Not connected</strong>}
        </div>
        {!isConnected ? (
          <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={connectWallet} disabled={isConnecting}>
            {isConnecting ? "Connecting..." : "Connect MetaMask"}
          </button>
        ) : (
          <button style={{ ...styles.btn, ...styles.btnPrimary, opacity: saving ? 0.7 : 1 }} onClick={handleSaveWallet} disabled={saving}>
            {saving ? "Saving..." : "Save wallet to profile"}
          </button>
        )}
      </div>

      <div style={{ marginTop: "0.5rem" }}>
        <div style={styles.muted}>
          Saved in profile:{" "}
          {user?.walletAddress ? <span style={styles.code}>{user.walletAddress}</span> : <strong>Not set</strong>}
        </div>
      </div>

      {msg.text ? <div style={msg.type === "error" ? styles.error : styles.success}>{msg.text}</div> : null}
    </div>
  );
}
