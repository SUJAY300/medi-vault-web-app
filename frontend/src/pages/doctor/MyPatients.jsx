import { useState, useEffect } from "react";
import { getPatients } from "../../api/patients";

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    height: "100%",
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
  container: {
    display: "flex",
    gap: "1.5rem",
    flex: 1,
    minHeight: 0,
  },
  leftPanel: {
    width: "33%",
    minWidth: "300px",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  searchBar: {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "var(--radius)",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text)",
    fontSize: "0.9375rem",
    fontFamily: "inherit",
  },
  searchBarPlaceholder: {
    color: "var(--color-text-muted)",
  },
  patientList: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    overflowY: "auto",
    paddingRight: "0.5rem",
  },
  patientCard: {
    padding: "1rem",
    borderRadius: "var(--radius)",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    cursor: "pointer",
    transition: "background 0.2s, border-color 0.2s",
  },
  patientCardSelected: {
    background: "rgba(14, 165, 233, 0.15)",
    borderColor: "var(--color-primary)",
  },
  patientName: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "var(--color-text)",
    marginBottom: "0.25rem",
  },
  patientId: {
    fontSize: "0.875rem",
    color: "var(--color-text-muted)",
  },
  rightPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    borderRadius: "var(--radius)",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    padding: "2rem",
    minHeight: 0,
  },
  placeholder: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    color: "var(--color-text-muted)",
    fontSize: "0.9375rem",
  },
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
};

export default function MyPatients() {
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("medivault_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
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
          setFilteredPatients(data.patients);
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

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPatients(patients);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = patients.filter(
      (patient) =>
        patient.fullName.toLowerCase().includes(query) ||
        patient.patientId.toLowerCase().includes(query) ||
        patient.username.toLowerCase().includes(query)
    );
    setFilteredPatients(filtered);
  }, [searchQuery, patients]);

  function handlePatientClick(patient) {
    setSelectedPatient(patient);
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Patients</h1>
        <p style={styles.subtitle}>View and manage all your assigned patients.</p>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading patients...</div>
      ) : error ? (
        <div style={styles.error}>{error}</div>
      ) : (
        <div style={styles.container}>
          <div style={styles.leftPanel}>
            <input
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchBar}
            />
            <div style={styles.patientList}>
              {filteredPatients.length === 0 ? (
                <div style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>
                  No patients found
                </div>
              ) : (
                filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => handlePatientClick(patient)}
                    style={{
                      ...styles.patientCard,
                      ...(selectedPatient?.id === patient.id ? styles.patientCardSelected : {}),
                    }}
                  >
                    <div style={styles.patientName}>{patient.fullName}</div>
                    <div style={styles.patientId}>{patient.patientId}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={styles.rightPanel}>
            {selectedPatient ? (
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem", color: "var(--color-text)" }}>
                  {selectedPatient.fullName}
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Patient ID: </span>
                    <span style={{ color: "var(--color-text)", fontSize: "0.875rem" }}>{selectedPatient.patientId}</span>
                  </div>
                  <div>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Username: </span>
                    <span style={{ color: "var(--color-text)", fontSize: "0.875rem" }}>{selectedPatient.username}</span>
                  </div>
                  <div>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Role: </span>
                    <span style={{ color: "var(--color-text)", fontSize: "0.875rem" }}>{selectedPatient.role}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.placeholder}>Select a patient to view details</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
