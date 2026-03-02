import { useState, useEffect } from "react";

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
};

export default function DoctorDashboardHome() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("medivault_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  return (
    <div style={styles.card}>
      <p style={styles.welcome}>
        Welcome, <strong>{user?.fullName ?? "Doctor"}</strong>.
      </p>
      <p style={styles.muted}>
        You are signed in as <strong>{user?.username}</strong>. This is your dashboard overview.
        Use the sidebar to open My Patients, Upload Files, My Files, or the Chatbot.
      </p>
    </div>
  );
}
