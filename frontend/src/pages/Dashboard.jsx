import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const ROLES = ["student", "patient", "doctor", "nurse", "intern"];

const styles = {
  page: {
    minHeight: "100vh",
    padding: "2rem",
    background: "linear-gradient(180deg, var(--color-bg) 0%, var(--color-surface) 100%)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 700,
  },
  roleBadge: {
    padding: "0.35rem 0.75rem",
    borderRadius: "var(--radius)",
    background: "var(--color-primary)",
    color: "white",
    fontSize: "0.875rem",
    fontWeight: 600,
    textTransform: "capitalize",
  },
  card: {
    maxWidth: "560px",
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
  button: {
    padding: "0.5rem 1rem",
    borderRadius: "var(--radius)",
    fontSize: "0.9375rem",
    fontWeight: 500,
    background: "var(--color-border)",
    color: "var(--color-text)",
    border: "none",
    cursor: "pointer",
  },
};

export default function Dashboard() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("medivault_user");
    if (!stored) {
      navigate("/login", { replace: true });
      return;
    }
    const parsed = JSON.parse(stored);
    const roleLower = (role || "").toLowerCase();
    if (!ROLES.includes(roleLower) || parsed.role.toLowerCase() !== roleLower) {
      // Redirect to their actual role dashboard
      navigate("/dashboard/" + parsed.role.toLowerCase(), { replace: true });
      return;
    }
    setUser(parsed);
  }, [role, navigate]);

  function handleLogout() {
    localStorage.removeItem("medivault_user");
    navigate("/", { replace: true });
  }

  if (!user) return null;

  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>MediVault</h1>
        <span style={styles.roleBadge}>{roleLabel} Dashboard</span>
        <button type="button" style={styles.button} onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div style={styles.card}>
        <p style={styles.welcome}>
          Welcome, <strong>{user.fullName}</strong>.
        </p>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>
          You are signed in as <strong>{user.username}</strong> ({roleLabel}). This is your
          dashboard. More features will be added here.
        </p>
      </div>
    </div>
  );
}
