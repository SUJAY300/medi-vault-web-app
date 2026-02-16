import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const ROLES = [
  { name: "Admin", desc: "System administration, manage staff, uploads & files.", icon: "⚙️" },
  { name: "Doctor", desc: "View & query reports, AI chatbot, upload documents.", icon: "🩺" },
  { name: "Nurse", desc: "Assigned patient care, files & chatbot access.", icon: "💉" },
  { name: "Patient", desc: "Own records, view documents, settings.", icon: "👤" },
  { name: "Student", desc: "Cases & chatbot for learning; scoped access.", icon: "🎓" },
];

const FEATURES = [
  {
    title: "Blockchain-backed storage",
    desc: "Medical documents stored securely with hashes; metadata in MongoDB for fast listing and retrieval.",
    icon: "🔗",
  },
  {
    title: "AI summarizer & chatbot",
    desc: "Gemini-powered summarizer and chatbot so doctors can query patient reports in natural language.",
    icon: "🤖",
  },
  {
    title: "Role-based dashboards",
    desc: "Tailored experiences for Admin, Doctor, Nurse, Patient, and Student with clear access control.",
    icon: "🛡️",
  },
];

function useVisible(ref, { threshold = 0.1, rootMargin = "0px 0px -40px 0px" } = {}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      { threshold, rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold, rootMargin]);
  return visible;
}

export default function Landing() {
  const heroRef = useRef(null);
  const problemRef = useRef(null);
  const featuresRef = useRef(null);
  const rolesRef = useRef(null);
  const ctaRef = useRef(null);

  const heroVisible = useVisible(heroRef);
  const problemVisible = useVisible(problemRef);
  const featuresVisible = useVisible(featuresRef);
  const rolesVisible = useVisible(rolesRef);
  const ctaVisible = useVisible(ctaRef);

  return (
    <div className="landing-page" style={styles.page}>
      {/* Animated background */}
      <div style={styles.bgGradient} aria-hidden />
      <div style={styles.bgGlow} aria-hidden />
      <div style={styles.bgGrid} aria-hidden />

      {/* Nav */}
      <nav style={styles.nav}>
        <span style={styles.logoText}>MediVault</span>
        <div style={styles.navLinks}>
          <Link to="/login" style={styles.navLink}>Login</Link>
          <Link to="/signup" style={styles.navBtn}>Sign up</Link>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 className="landing-visible landing-stagger-1" style={styles.heroTitle}>
            Secure hospital management,{" "}
            <span style={styles.heroHighlight}>reimagined</span>
          </h1>
          <p className="landing-visible landing-stagger-2" style={styles.heroSub}>
            Role-based dashboards, blockchain-backed document storage, and a
            Gemini-powered AI assistant for doctors, nurses, patients, and
            students—all in one MERN stack.
          </p>
          <div className="landing-visible landing-stagger-3" style={styles.heroButtons}>
            <Link to="/signup" className="landing-btn-primary" style={{ ...styles.btn, ...styles.btnPrimary }}>
              Get started
            </Link>
            <Link to="/login" className="landing-btn-secondary" style={{ ...styles.btn, ...styles.btnSecondary }}>
              Login
            </Link>
          </div>
        </div>
        <div style={styles.heroVisual} aria-hidden>
          <div style={styles.floatingCard}>📋 Documents → Hash → MongoDB</div>
          <div style={{ ...styles.floatingCard, animationDelay: "0.5s" }}>
            🤖 Chat & summarize
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section ref={problemRef} style={styles.section}>
        <div
          style={{
            ...styles.sectionInner,
            opacity: problemVisible ? 1 : 0,
            transform: problemVisible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <h2 style={styles.sectionTitle}>The problem we solve</h2>
          <p style={styles.problemText}>
            Healthcare data is often <strong>fragmented</strong> across systems,{" "}
            <strong>hard to query</strong>, and lacks <strong>tamper-evident
            storage</strong>. MediVault unifies secure document storage with
            blockchain-backed hashes, fast metadata in MongoDB, and an AI
            chatbot so clinicians can find and summarize patient information
            without leaving one place.
          </p>
        </div>
      </section>

      {/* Features */}
      <section ref={featuresRef} style={styles.section}>
        <h2
          style={{
            ...styles.sectionTitle,
            opacity: featuresVisible ? 1 : 0,
            transform: featuresVisible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s",
          }}
        >
          Built for modern healthcare
        </h2>
        <div style={styles.featureGrid}>
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="landing-feature-card"
              style={{
                ...styles.featureCard,
                opacity: featuresVisible ? 1 : 0,
                transform: featuresVisible ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.5s ease ${0.15 + i * 0.1}s, transform 0.5s ease ${0.15 + i * 0.1}s, box-shadow 0.25s ease`,
              }}
            >
              <span style={styles.featureIcon}>{f.icon}</span>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section ref={rolesRef} style={styles.section}>
        <h2
          style={{
            ...styles.sectionTitle,
            opacity: rolesVisible ? 1 : 0,
            transform: rolesVisible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s",
          }}
        >
          One platform, every role
        </h2>
        <div style={styles.rolesGrid}>
          {ROLES.map((r, i) => (
            <div
              key={r.name}
              className="landing-role-card"
              style={{
                ...styles.roleCard,
                opacity: rolesVisible ? 1 : 0,
                transform: rolesVisible ? "translateY(0)" : "translateY(16px)",
                transition: `opacity 0.4s ease ${0.1 + i * 0.06}s, transform 0.4s ease ${0.1 + i * 0.06}s`,
              }}
            >
              <span style={styles.roleIcon}>{r.icon}</span>
              <h4 style={styles.roleName}>{r.name}</h4>
              <p style={styles.roleDesc}>{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech */}
      <section style={styles.techSection}>
        <div
          style={{
            ...styles.techBadge,
            opacity: featuresVisible ? 1 : 0,
            transition: "opacity 0.5s ease 0.3s",
          }}
        >
          <span style={styles.techLabel}>Stack</span>
          <span style={styles.techValue}>React · Node · Express · MongoDB</span>
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaRef} style={styles.ctaSection}>
        <div
          style={{
            ...styles.ctaBox,
            opacity: ctaVisible ? 1 : 0,
            transform: ctaVisible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <h2 style={styles.ctaTitle}>Ready to get started?</h2>
          <p style={styles.ctaSub}>
            Join MediVault for secure, role-based hospital management and AI-powered insights.
          </p>
          <div style={styles.ctaButtons}>
            <Link to="/signup" style={{ ...styles.btn, ...styles.btnPrimary }}>
              Sign up
            </Link>
            <Link to="/login" style={{ ...styles.btn, ...styles.btnSecondary }}>
              Login
            </Link>
          </div>
        </div>
      </section>

      <footer style={styles.footer}>
        <span style={styles.footerLogo}>MediVault</span>
        <span style={styles.footerCopy}>
          Hospital management with blockchain storage & AI. MERN stack.
        </span>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    position: "relative",
    background: "var(--color-bg)",
  },
  bgGradient: {
    position: "fixed",
    inset: 0,
    background: `
      radial-gradient(ellipse 80% 50% at 50% -20%, rgba(14, 165, 233, 0.15), transparent),
      radial-gradient(ellipse 60% 40% at 100% 50%, rgba(34, 211, 238, 0.08), transparent),
      radial-gradient(ellipse 50% 30% at 0% 80%, rgba(14, 165, 233, 0.06), transparent)
    `,
    pointerEvents: "none",
    zIndex: 0,
  },
  bgGlow: {
    position: "fixed",
    width: "600px",
    height: "600px",
    top: "-200px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
    animation: "landing-glow-pulse 8s ease-in-out infinite",
  },
  bgGrid: {
    position: "fixed",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(51, 65, 85, 0.15) 1px, transparent 1px),
      linear-gradient(90deg, rgba(51, 65, 85, 0.15) 1px, transparent 1px)
    `,
    backgroundSize: "64px 64px",
    pointerEvents: "none",
    zIndex: 0,
  },
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 2rem",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  logoText: {
    fontSize: "1.35rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  navLinks: { display: "flex", alignItems: "center", gap: "1rem" },
  navLink: {
    color: "var(--color-text-muted)",
    fontWeight: 500,
    padding: "0.5rem 0.75rem",
    borderRadius: "var(--radius)",
    transition: "color 0.2s, background 0.2s",
  },
  navBtn: {
    color: "var(--color-text)",
    fontWeight: 600,
    padding: "0.5rem 1rem",
    borderRadius: "var(--radius)",
    border: "2px solid var(--color-border)",
    background: "var(--color-surface)",
    transition: "color 0.2s, border-color 0.2s, background 0.2s",
  },
  hero: {
    position: "relative",
    zIndex: 1,
    padding: "4rem 2rem 6rem",
    maxWidth: "1100px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "3rem",
    alignItems: "center",
  },
  heroContent: { textAlign: "center" },
  heroTitle: {
    fontSize: "clamp(2rem, 5vw, 3.25rem)",
    fontWeight: 700,
    letterSpacing: "-0.03em",
    lineHeight: 1.2,
    marginBottom: "1.25rem",
    color: "var(--color-text)",
  },
  heroHighlight: {
    background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroSub: {
    fontSize: "1.125rem",
    color: "var(--color-text-muted)",
    maxWidth: "560px",
    margin: "0 auto 2rem",
    lineHeight: 1.65,
  },
  heroButtons: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  btn: {
    display: "inline-block",
    padding: "0.875rem 1.75rem",
    borderRadius: "var(--radius)",
    fontSize: "1rem",
    fontWeight: 600,
    transition: "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s, border-color 0.2s",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, var(--color-primary), #0284c7)",
    color: "white",
    boxShadow: "0 4px 14px rgba(14, 165, 233, 0.4)",
  },
  btnSecondary: {
    background: "var(--color-surface)",
    color: "var(--color-text)",
    border: "2px solid var(--color-border)",
  },
  heroVisual: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
  },
  floatingCard: {
    padding: "1rem 1.5rem",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius)",
    fontSize: "0.9rem",
    color: "var(--color-text-muted)",
    animation: "landing-float 4s ease-in-out infinite",
  },
  section: {
    position: "relative",
    zIndex: 1,
    padding: "4rem 2rem",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  sectionInner: { maxWidth: "640px", margin: "0 auto", textAlign: "center" },
  sectionTitle: {
    fontSize: "clamp(1.5rem, 3vw, 2rem)",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    marginBottom: "1.5rem",
    color: "var(--color-text)",
    textAlign: "center",
  },
  problemText: {
    fontSize: "1.05rem",
    color: "var(--color-text-muted)",
    lineHeight: 1.7,
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "1.5rem",
    marginTop: "1rem",
  },
  featureCard: {
    padding: "1.75rem",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius)",
  },
  featureIcon: { fontSize: "2rem", display: "block", marginBottom: "0.75rem" },
  featureTitle: {
    fontSize: "1.1rem",
    fontWeight: 600,
    marginBottom: "0.5rem",
    color: "var(--color-text)",
  },
  featureDesc: {
    fontSize: "0.95rem",
    color: "var(--color-text-muted)",
    lineHeight: 1.55,
  },
  rolesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "1.25rem",
    marginTop: "1rem",
  },
  roleCard: {
    padding: "1.25rem",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius)",
    textAlign: "center",
  },
  roleIcon: { fontSize: "1.75rem", display: "block", marginBottom: "0.5rem" },
  roleName: {
    fontSize: "1rem",
    fontWeight: 600,
    marginBottom: "0.35rem",
    color: "var(--color-text)",
  },
  roleDesc: {
    fontSize: "0.8rem",
    color: "var(--color-text-muted)",
    lineHeight: 1.4,
  },
  techSection: {
    position: "relative",
    zIndex: 1,
    padding: "2rem",
    display: "flex",
    justifyContent: "center",
  },
  techBadge: {
    padding: "0.75rem 1.5rem",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "999px",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  techLabel: {
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "var(--color-text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  techValue: { fontSize: "0.95rem", color: "var(--color-text)" },
  ctaSection: {
    position: "relative",
    zIndex: 1,
    padding: "4rem 2rem",
  },
  ctaBox: {
    maxWidth: "560px",
    margin: "0 auto",
    padding: "2.5rem",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius)",
    textAlign: "center",
  },
  ctaTitle: {
    fontSize: "1.5rem",
    fontWeight: 700,
    marginBottom: "0.5rem",
    color: "var(--color-text)",
  },
  ctaSub: {
    color: "var(--color-text-muted)",
    marginBottom: "1.5rem",
    fontSize: "1rem",
  },
  ctaButtons: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  footer: {
    position: "relative",
    zIndex: 1,
    padding: "2rem",
    textAlign: "center",
    borderTop: "1px solid var(--color-border)",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  footerLogo: {
    fontSize: "1rem",
    fontWeight: 700,
    background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  footerCopy: { fontSize: "0.85rem", color: "var(--color-text-muted)" },
};
