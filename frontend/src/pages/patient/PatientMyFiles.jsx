import { useState, useEffect } from "react";

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
    fontFamily: "monospace",
    fontSize: "0.875rem",
    color: "var(--color-text)",
    wordBreak: "break-all",
  },
  empty: {
    color: "var(--color-text-muted)",
    fontSize: "0.9375rem",
    padding: "1rem 0",
  },
};

export default function PatientMyFiles() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("medivault_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const hashIds = user?.hashIds || [];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Files</h1>
        <p style={styles.subtitle}>
          Your medical documents and file hashes. Files are shared with your doctor.
        </p>
      </div>

      <div style={styles.card}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem", color: "var(--color-text)" }}>
          Your file hashes
        </h2>
        {hashIds.length === 0 ? (
          <p style={styles.empty}>No files linked to your account yet. Your doctor can upload files for you.</p>
        ) : (
          <ul style={styles.hashList}>
            {hashIds.map((hashId, idx) => (
              <li key={idx} style={styles.hashItem}>
                {hashId}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
