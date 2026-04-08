import { useMemo } from "react";
import { useWeb3 } from "../blockchain/Web3Context";

const styles = {
  box: {
    padding: "0.75rem 1rem",
    borderRadius: "var(--radius)",
    background: "rgba(245, 158, 11, 0.12)",
    border: "1px solid rgba(245, 158, 11, 0.35)",
    color: "var(--color-text)",
    fontSize: "0.9rem",
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  code: { fontFamily: "monospace" },
  btn: {
    padding: "0.5rem 0.75rem",
    borderRadius: "var(--radius)",
    border: "1px solid var(--color-border)",
    background: "transparent",
    color: "var(--color-text)",
    cursor: "pointer",
    fontWeight: 650,
  },
};

export default function WalletMismatchBanner({ user, style }) {
  const { isConnected, account, connectWallet, isConnecting } = useWeb3();

  const saved = (user?.walletAddress || "").toLowerCase();
  const connected = (account || "").toLowerCase();

  const mismatch = useMemo(() => {
    if (!saved) return false;
    if (!isConnected) return true;
    return connected !== saved;
  }, [saved, isConnected, connected]);

  if (!mismatch) return null;

  return (
    <div style={{ ...styles.box, ...style }}>
      <div>
        <div>
          ⚠️ Wallet mismatch for <b>{user?.role}</b>
        </div>
        <div style={{ marginTop: 4 }}>
          Saved: <span style={styles.code}>{saved || "not set"}</span>{" "}
          · Connected: <span style={styles.code}>{isConnected ? connected : "not connected"}</span>
        </div>
      </div>

      {!isConnected ? (
        <button style={styles.btn} onClick={connectWallet} disabled={isConnecting}>
          {isConnecting ? "Connecting..." : "Connect MetaMask"}
        </button>
      ) : (
        <div style={{ opacity: 0.9 }}>Switch MetaMask to the saved wallet.</div>
      )}
    </div>
  );
}

