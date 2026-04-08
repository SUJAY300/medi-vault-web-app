// src/components/Layout.js
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';

const roleColors = {
  admin:   '#8b5cf6',
  doctor:  '#3b82f6',
  patient: '#06b6d4',
  student: '#f59e0b',
};

const roleIcons = {
  admin: '🛡️', doctor: '🩺', patient: '🧑', student: '📚'
};

// ── NAV CONFIG — role controls what appears ───────────────
const NAV_ITEMS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: '◉',
    section: 'OVERVIEW',
    roles: ['admin', 'doctor', 'patient', 'student'],
  },
  {
    path: '/documents',
    label: 'My Documents',
    icon: '🗂',
    section: 'RECORDS',
    roles: ['patient'],
  },
  {
    path: '/documents',
    label: 'Documents',
    icon: '🗂',
    section: 'RECORDS',
    roles: ['admin', 'doctor', 'student'],
  },
  {
    path: '/upload',
    label: 'Upload Document',
    icon: '⬆',
    section: null,
    roles: ['admin', 'doctor'],
  },
  {
    path: '/verify',
    label: 'Verify Document',
    icon: '✓',
    section: null,
    roles: ['admin', 'doctor', 'patient', 'student'],
  },
  // Access Control — NOT shown for patient (patient can only view docs)
  {
    path: '/users',
    label: 'Manage Users',
    icon: '👥',
    section: 'ADMIN',
    roles: ['admin'],
  },
  {
    path: '/blockchain',
    label: 'Blockchain Info',
    icon: '⛓',
    section: 'SYSTEM',
    roles: ['admin', 'doctor', 'patient', 'student'],
  },
];

export default function Layout() {
  const { user, logout }    = useAuth();
  const { account, isConnected, connectWallet, isConnecting } = useWeb3();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const accentColor = roleColors[user?.role] || '#3b82f6';

  // Only show nav items allowed for current role
  const visibleNav = NAV_ITEMS.filter(n => n.roles.includes(user?.role));

  // Deduplicate by path+label to avoid double entries
  const seen = new Set();
  const dedupedNav = visibleNav.filter(item => {
    const key = item.path + item.label;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  let lastSection = null;
  const s = styles(collapsed, accentColor);

  return (
    <div style={s.app}>

      {/* ── SIDEBAR ───────────────────────────────────── */}
      <aside style={s.sidebar}>

        {/* Logo */}
        <div style={s.logoRow}>
          <div style={s.logoIcon}>🏥</div>
          {!collapsed && (
            <div>
              <div style={s.logoText}>
                Medi<span style={{ color: '#06b6d4' }}>Vault</span>
              </div>
              <div style={s.logoSub}>BLOCKCHAIN · IPFS</div>
            </div>
          )}
          <button
            style={s.collapseBtn}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? '▶' : '◀'}
          </button>
        </div>

        {/* Role indicator */}
        {!collapsed && user && (
          <div style={{ ...s.roleIndicator, background: accentColor + '15', borderColor: accentColor + '40' }}>
            <span style={{ marginRight: 6 }}>{roleIcons[user.role]}</span>
            <span style={{ color: accentColor, fontWeight: 700, fontSize: 11 }}>
              {user.role.toUpperCase()} DASHBOARD
            </span>
          </div>
        )}

        {/* Nav items */}
        <nav style={s.nav}>
          {dedupedNav.map(item => {
            const showSection = !collapsed && item.section && item.section !== lastSection;
            if (item.section) lastSection = item.section;
            const isActive = location.pathname === item.path;

            return (
              <React.Fragment key={item.label}>
                {showSection && (
                  <div style={s.sectionLabel}>{item.section}</div>
                )}
                <div
                  style={{
                    ...s.navItem,
                    ...(isActive ? {
                      background: accentColor + '18',
                      color: accentColor,
                      borderColor: accentColor + '40',
                    } : {})
                  }}
                  onClick={() => navigate(item.path)}
                >
                  <span style={s.navIcon}>{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </div>
              </React.Fragment>
            );
          })}
        </nav>

        {/* User card */}
        {!collapsed && user && (
          <div style={s.footer}>
            <div style={s.userCard}>
              <div style={{
                ...s.avatar,
                background: accentColor + '22',
                color: accentColor
              }}>
                {user.name?.charAt(0)}
              </div>
              <div style={s.userInfo}>
                <div style={s.userName}>{user.name}</div>
                <div style={{ ...s.userRole, color: accentColor }}>
                  {roleIcons[user.role]} {user.role?.toUpperCase()}
                </div>
              </div>
              <button
                style={s.logoutBtn}
                onClick={logout}
                title="Logout"
              >
                ⏻
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* ── MAIN ──────────────────────────────────────── */}
      <div style={s.main}>

        {/* Topbar */}
        <div style={s.topbar}>
          <div style={s.pageTitle}>
            MediVault
            <span style={s.pageSub}>
              {' / ' + (location.pathname.replace('/', '') || 'dashboard')}
            </span>
          </div>

          <div style={s.topbarRight}>

            {/* MetaMask button */}
            {isConnected ? (
              <div style={s.walletBadge}>
                <span style={s.walletDot} />
                {account?.slice(0, 6) + '...' + account?.slice(-4)}
              </div>
            ) : (
              <button
                style={s.connectBtn}
                onClick={connectWallet}
                disabled={isConnecting}
              >
                {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
              </button>
            )}

            {/* Role badge */}
            {user && (
              <div style={{
                ...s.roleBadge,
                background: accentColor + '18',
                color: accentColor,
                border: '1px solid ' + accentColor + '33',
              }}>
                {roleIcons[user.role]} {user.role?.toUpperCase()}
              </div>
            )}

          </div>
        </div>

        {/* Page content */}
        <div style={s.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function styles(collapsed, accentColor) {
  return {
    app: {
      display: 'flex', minHeight: '100vh', background: '#060b14'
    },
    sidebar: {
      width: collapsed ? 60 : 240,
      minHeight: '100vh',
      background: '#0d1526',
      borderRight: '1px solid rgba(48,100,200,0.18)',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, bottom: 0,
      zIndex: 100,
      transition: 'width 0.2s ease',
      overflow: 'hidden',
    },
    logoRow: {
      padding: collapsed ? '20px 12px' : '24px 20px',
      borderBottom: '1px solid rgba(48,100,200,0.18)',
      display: 'flex', alignItems: 'center', gap: 10,
    },
    logoIcon: {
      width: 36, height: 36,
      background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
      borderRadius: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 18, flexShrink: 0,
    },
    logoText: { fontWeight: 800, fontSize: 18, letterSpacing: -0.5 },
    logoSub:  { fontSize: 9, color: '#3d5478', letterSpacing: 1 },
    collapseBtn: {
      marginLeft: 'auto', background: 'none', border: 'none',
      color: '#3d5478', fontSize: 10, cursor: 'pointer', padding: 4,
    },
    roleIndicator: {
      margin: '10px 12px 0',
      padding: '6px 12px',
      borderRadius: 6,
      border: '1px solid',
      display: 'flex', alignItems: 'center',
      fontSize: 10, fontFamily: 'monospace', letterSpacing: 0.5,
    },
    nav: { flex: 1, padding: '12px 8px', overflowY: 'auto' },
    sectionLabel: {
      fontSize: 9, color: '#3d5478', letterSpacing: 1.5,
      textTransform: 'uppercase', padding: '8px 8px 4px', marginTop: 8,
    },
    navItem: {
      display: 'flex', alignItems: 'center',
      gap: 10,
      padding: collapsed ? '10px 0' : '9px 12px',
      justifyContent: collapsed ? 'center' : 'flex-start',
      borderRadius: 8, cursor: 'pointer',
      color: '#6b8ab4', fontSize: 13, fontWeight: 500,
      marginBottom: 2,
      border: '1px solid transparent',
      transition: 'all 0.15s ease',
    },
    navIcon: { fontSize: 16, width: 20, textAlign: 'center', flexShrink: 0 },
    footer: { padding: 16, borderTop: '1px solid rgba(48,100,200,0.18)' },
    userCard: {
      background: '#111d35',
      border: '1px solid rgba(48,100,200,0.18)',
      borderRadius: 10, padding: 12,
      display: 'flex', alignItems: 'center', gap: 10,
    },
    avatar: {
      width: 34, height: 34, borderRadius: 8,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: 14, flexShrink: 0,
    },
    userInfo: { flex: 1, minWidth: 0 },
    userName: {
      fontSize: 12, fontWeight: 600,
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    },
    userRole: { fontSize: 9, letterSpacing: 0.5 },
    logoutBtn: {
      background: 'none', border: 'none',
      color: '#3d5478', fontSize: 16, cursor: 'pointer',
    },
    main: {
      flex: 1,
      marginLeft: collapsed ? 60 : 240,
      display: 'flex', flexDirection: 'column', minHeight: '100vh',
      transition: 'margin-left 0.2s ease',
    },
    topbar: {
      height: 60, background: '#0d1526',
      borderBottom: '1px solid rgba(48,100,200,0.18)',
      display: 'flex', alignItems: 'center',
      padding: '0 28px', gap: 16,
      position: 'sticky', top: 0, zIndex: 50,
    },
    pageTitle: { fontWeight: 700, fontSize: 16 },
    pageSub:   { color: '#6b8ab4', fontWeight: 400, fontSize: 13 },
    topbarRight: {
      marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12,
    },
    walletBadge: {
      display: 'flex', alignItems: 'center', gap: 6,
      background: '#111d35',
      border: '1px solid rgba(48,100,200,0.18)',
      borderRadius: 6, padding: '5px 10px',
      fontSize: 11, color: '#6b8ab4', fontFamily: 'monospace',
    },
    walletDot: {
      width: 6, height: 6, borderRadius: '50%',
      background: '#10b981', boxShadow: '0 0 6px #10b981',
    },
    connectBtn: {
      background: '#3b82f6', color: 'white', border: 'none',
      borderRadius: 6, padding: '6px 12px',
      fontSize: 11, fontWeight: 600, cursor: 'pointer',
    },
    roleBadge: {
      padding: '3px 10px', borderRadius: 5,
      fontSize: 10, fontWeight: 600,
      fontFamily: 'monospace', letterSpacing: 0.3,
    },
    content: { flex: 1, padding: 28, overflowY: 'auto' },
  };
}