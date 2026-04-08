// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  {
    key: 'admin',
    label: 'Admin',
    name: 'Dr. Admin Kumar',
    desc: 'Full system access — manage users, view all records',
    color: '#8b5cf6',
    icon: '🛡️'
  },
  {
    key: 'doctor',
    label: 'Doctor',
    name: 'Dr. Sarah Johnson',
    desc: 'Upload documents, view assigned patient records',
    color: '#3b82f6',
    icon: '🩺'
  },
  {
    key: 'patient',
    label: 'Patient',
    name: 'Rahul Sharma',
    desc: 'View own records, grant and revoke doctor access',
    color: '#06b6d4',
    icon: '🧑'
  },
  {
    key: 'student',
    label: 'Student',
    name: 'Priya Patel',
    desc: 'Read-only access to granted records',
    color: '#f59e0b',
    icon: '📚'
  },
];

export default function Login() {
  const { loginAsRole: login } = useAuth();
  const navigate     = useNavigate();
  const [selected, setSelected] = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleEnter() {
    if (!selected) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    login(selected);
    navigate('/dashboard');
  }

  return (
    <div style={s.page}>
      <div style={s.glow} />

      <div style={s.card}>

        {/* Logo */}
        <div style={s.logoWrap}>
          <div style={s.logoIcon}>🏥</div>
          <div style={s.logoText}>
            Medi<span style={{ color: '#06b6d4' }}>Vault</span>
          </div>
          <div style={s.logoSub}>Blockchain-Secured Medical Records</div>
        </div>

        {/* Title */}
        <div style={s.sectionLabel}>SELECT YOUR ROLE TO CONTINUE</div>

        {/* Role cards */}
        <div style={s.roleGrid}>
          {ROLES.map(role => (
            <div
              key={role.key}
              style={{
                ...s.roleCard,
                borderColor: selected === role.key
                  ? role.color
                  : 'rgba(48,100,200,0.18)',
                background: selected === role.key
                  ? role.color + '15'
                  : '#111d35',
              }}
              onClick={() => setSelected(role.key)}
            >
              <div style={s.roleTop}>
                <div style={{
                  ...s.roleIconWrap,
                  background: role.color + '22'
                }}>
                  <span style={s.roleIcon}>{role.icon}</span>
                </div>
                <div style={{
                  ...s.radioCircle,
                  borderColor: role.color,
                  background: selected === role.key ? role.color : 'transparent'
                }}>
                  {selected === role.key && (
                    <div style={s.radioDot} />
                  )}
                </div>
              </div>
              <div style={{ ...s.roleLabel, color: role.color }}>
                {role.label}
              </div>
              <div style={s.roleName}>{role.name}</div>
              <div style={s.roleDesc}>{role.desc}</div>
            </div>
          ))}
        </div>

        {/* Enter button */}
        <button
          style={{
            ...s.enterBtn,
            opacity: selected && !loading ? 1 : 0.4,
            cursor: selected && !loading ? 'pointer' : 'not-allowed'
          }}
          onClick={handleEnter}
          disabled={!selected || loading}
        >
          {loading
            ? 'Entering Dashboard...'
            : selected
            ? 'Enter as ' + ROLES.find(r => r.key === selected)?.label
            : 'Select a role above'
          }
        </button>

        {/* Info note */}
        <div style={s.note}>
          This is a demo. Select any role to explore that dashboard.
          Connect MetaMask to enable real blockchain interactions.
        </div>

      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#060b14',
    position: 'relative',
    overflow: 'hidden',
    padding: 20
  },
  glow: {
    position: 'absolute',
    width: 700,
    height: 700,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none'
  },
  card: {
    background: '#0d1526',
    border: '1px solid rgba(80,140,255,0.25)',
    borderRadius: 20,
    padding: 40,
    width: '100%',
    maxWidth: 540,
    position: 'relative',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
  },
  logoWrap: {
    textAlign: 'center',
    marginBottom: 32
  },
  logoIcon: {
    width: 64,
    height: 64,
    background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    borderRadius: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    margin: '0 auto 14px',
    boxShadow: '0 0 40px rgba(59,130,246,0.3)'
  },
  logoText: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: -1
  },
  logoSub: {
    fontSize: 12,
    color: '#6b8ab4',
    marginTop: 4
  },
  sectionLabel: {
    fontSize: 10,
    color: '#3d5478',
    fontFamily: 'monospace',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 16
  },
  roleGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginBottom: 20
  },
  roleCard: {
    border: '1px solid',
    borderRadius: 12,
    padding: 16,
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  roleTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  roleIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  roleIcon: {
    fontSize: 18
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: '50%',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease'
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'white'
  },
  roleLabel: {
    fontSize: 11,
    fontWeight: 700,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
    marginBottom: 3
  },
  roleName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e2eaf8',
    marginBottom: 4
  },
  roleDesc: {
    fontSize: 11,
    color: '#6b8ab4',
    lineHeight: 1.4
  },
  enterBtn: {
    width: '100%',
    padding: 13,
    background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    transition: 'opacity 0.15s ease',
    marginBottom: 16
  },
  note: {
    fontSize: 11,
    color: '#3d5478',
    textAlign: 'center',
    lineHeight: 1.5
  }
};