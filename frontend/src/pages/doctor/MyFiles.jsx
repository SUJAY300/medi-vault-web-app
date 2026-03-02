import { useState, useEffect } from "react";
import { getPatients } from "../../api/patients";

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
    fontFamily: "monospace",
    fontSize: "0.875rem",
    color: "var(--color-text)",
    wordBreak: "break-all",
  },
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
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Files</h1>
        <p style={styles.subtitle}>
          Files and documents for your patients. Below are the patients under your care.
        </p>
      </div>

      <div style={styles.card}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem", color: "var(--color-text)" }}>
          Patients under you
        </h2>
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
                        {hashId}
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
