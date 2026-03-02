const styles = {
  card: {
    background: "var(--color-surface)",
    borderRadius: "var(--radius)",
    padding: "2rem",
    boxShadow: "var(--shadow)",
    border: "1px solid var(--color-border)",
  },
  title: { fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" },
  muted: { color: "var(--color-text-muted)", fontSize: "0.9375rem" },
};

export default function UploadFiles() {
  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Upload Files</h2>
      <p style={styles.muted}>File upload interface will appear here.</p>
    </div>
  );
}
