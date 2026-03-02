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
  doctorName: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "var(--color-text)",
    marginBottom: "0.5rem",
  },
  doctorUsername: {
    fontSize: "0.9375rem",
    color: "var(--color-text-muted)",
  },
  empty: {
    color: "var(--color-text-muted)",
    fontSize: "0.9375rem",
    padding: "1rem 0",
  },
};

export default function PatientDoctor() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("medivault_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const hasDoctor = user?.doctorName || user?.doctorId;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Doctor</h1>
        <p style={styles.subtitle}>
          Your assigned doctor. They can view and upload files to your record.
        </p>
      </div>

      <div style={styles.card}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem", color: "var(--color-text)" }}>
          Your doctor
        </h2>
        {!hasDoctor ? (
          <p style={styles.empty}>No doctor assigned to your account. Contact support to get linked to a doctor.</p>
        ) : (
          <div>
            <p style={styles.doctorName}>{user.doctorName}</p>
            {user.doctorUsername && (
              <p style={styles.doctorUsername}>@{user.doctorUsername}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
