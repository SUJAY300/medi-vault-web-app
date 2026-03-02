import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";

const SIDEBAR_WIDTH_EXPANDED = 240;
const SIDEBAR_WIDTH_COLLAPSED = 72;

const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    background: "linear-gradient(180deg, var(--color-bg) 0%, var(--color-surface) 100%)",
  },
  sidebar: (collapsed) => ({
    width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
    minWidth: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
    background: "var(--color-surface)",
    borderRight: "1px solid var(--color-border)",
    display: "flex",
    flexDirection: "column",
    transition: "width 0.25s ease",
    boxShadow: "var(--shadow)",
  }),
  sidebarHeader: {
    padding: "1rem",
    borderBottom: "1px solid var(--color-border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 56,
  },
  logo: (collapsed) => ({
    fontSize: "1.125rem",
    fontWeight: 700,
    color: "var(--color-text)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    opacity: collapsed ? 0 : 1,
    transition: "opacity 0.2s",
  }),
  toggleBtn: {
    padding: "0.5rem",
    borderRadius: "var(--radius)",
    background: "transparent",
    color: "var(--color-text-muted)",
    border: "none",
    cursor: "pointer",
    fontSize: "1.25rem",
    flexShrink: 0,
  },
  nav: {
    flex: 1,
    padding: "1rem 0.75rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem 1rem",
    borderRadius: "var(--radius)",
    color: "var(--color-text-muted)",
    textDecoration: "none",
    fontSize: "0.9375rem",
    fontWeight: 500,
    transition: "background 0.2s, color 0.2s",
    border: "none",
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  navItemIcon: {
    fontSize: "1.25rem",
    flexShrink: 0,
    width: 24,
    textAlign: "center",
  },
  navItemLabel: (collapsed) => ({
    whiteSpace: "nowrap",
    overflow: "hidden",
    opacity: collapsed ? 0 : 1,
    transition: "opacity 0.2s",
  }),
  logoutWrap: {
    padding: "0.75rem",
    borderTop: "1px solid var(--color-border)",
  },
  main: {
    flex: 1,
    overflow: "auto",
    padding: "2rem",
  },
};

const NAV_ITEMS = [
  { to: "/dashboard/patient", end: true, label: "Dashboard", icon: "📊" },
  { to: "/dashboard/patient/files", end: false, label: "My Files", icon: "📁" },
  { to: "/dashboard/patient/doctor", end: false, label: "Doctor", icon: "👨‍⚕️" },
];

export default function PatientLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("medivault_user");
    if (!stored) {
      navigate("/login", { replace: true });
      return;
    }
    const parsed = JSON.parse(stored);
    if (parsed.role.toLowerCase() !== "patient") {
      navigate("/dashboard/" + parsed.role.toLowerCase(), { replace: true });
      return;
    }
    setUser(parsed);
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("medivault_user");
    navigate("/", { replace: true });
  }

  if (!user) return null;

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar(collapsed)}>
        <div style={styles.sidebarHeader}>
          <span style={styles.logo(collapsed)}>MediVault</span>
          <button
            type="button"
            style={styles.toggleBtn}
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>
        <nav style={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                ...styles.navItem,
                background: isActive ? "rgba(14, 165, 233, 0.15)" : undefined,
                color: isActive ? "var(--color-primary)" : "var(--color-text-muted)",
              })}
            >
              <span style={styles.navItemIcon}>{item.icon}</span>
              <span style={styles.navItemLabel(collapsed)}>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div style={styles.logoutWrap}>
          <button
            type="button"
            style={{
              ...styles.navItem,
              color: "var(--color-text-muted)",
            }}
            onClick={handleLogout}
          >
            <span style={styles.navItemIcon}>🚪</span>
            <span style={styles.navItemLabel(collapsed)}>Logout</span>
          </button>
        </div>
      </aside>
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
