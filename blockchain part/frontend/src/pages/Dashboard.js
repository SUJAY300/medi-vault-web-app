// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';

export default function Dashboard() {
  const { user } = useAuth();
  const { isConnected, account, getStatsOnChain } = useWeb3();
  const [stats, setStats] = useState({ users: 0, documents: 0 });

  useEffect(() => {
    if (isConnected) {
      getStatsOnChain()
        .then(s => setStats({
          users: Number(s[0]),
          documents: Number(s[1])
        }))
        .catch(() => {});
    }
  }, [isConnected]);

  const roleStats = {
    admin: [
      { label: 'Total Users',     value: stats.users || 4,     icon: '👥', color: '#8b5cf6' },
      { label: 'Total Documents', value: stats.documents || 3, icon: '📄', color: '#3b82f6' },
      { label: 'Verified Docs',   value: 2,                    icon: '✅', color: '#10b981' },
      { label: 'Pending',         value: 1,                    icon: '⏳', color: '#f59e0b' },
    ],
    doctor: [
      { label: 'My Patients',   value: 1, icon: '🧑', color: '#3b82f6' },
      { label: 'Docs Uploaded', value: 3, icon: '📤', color: '#06b6d4' },
      { label: 'Verified',      value: 2, icon: '✅', color: '#10b981' },
      { label: 'Pending',       value: 1, icon: '⏳', color: '#f59e0b' },
    ],
    patient: [
      { label: 'My Records',       value: 3, icon: '📋', color: '#3b82f6' },
      { label: 'Verified',         value: 2, icon: '✅', color: '#10b981' },
      { label: 'Doctors w/ Access',value: 1, icon: '🩺', color: '#8b5cf6' },
      { label: 'Pending',          value: 1, icon: '⏳', color: '#f59e0b' },
    ],
    student: [
      { label: 'Accessible Docs', value: 3,       icon: '📖', color: '#3b82f6' },
      { label: 'Verified',        value: 2,       icon: '✅', color: '#10b981' },
      { label: 'Doc Types',       value: 3,       icon: '🗂', color: '#06b6d4' },
      { label: 'Last Access',     value: 'Today', icon: '⏱', color: '#8b5cf6' },
    ],
  };

  const myStats = roleStats[user?.role] || roleStats.patient;

  const recentDocs = [
    { id: 1, file_name: 'blood_test_report.pdf',  document_type: 'lab_report',   is_verified: true,  uploaded_at: '2025-01-15', uploader: 'Dr. Sarah Johnson' },
    { id: 2, file_name: 'ecg_report.pdf',          document_type: 'imaging',      is_verified: true,  uploaded_at: '2025-02-20', uploader: 'Dr. Sarah Johnson' },
    { id: 3, file_name: 'prescription_jan.pdf',    document_type: 'prescription', is_verified: false, uploaded_at: '2025-03-05', uploader: 'Dr. Sarah Johnson' },
  ];

  const typeLabel = {
    lab_report: 'Lab Report', imaging: 'Imaging',
    prescription: 'Prescription', history: 'History', other: 'Other'
  };

  return (
    <div>
      {/* Welcome */}
      <div style={s.welcomeRow}>
        <div>
          <h2 style={s.welcomeTitle}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p style={s.welcomeSub}>
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long', day: 'numeric',
              month: 'long', year: 'numeric'
            })}
            {account && (
              <span style={s.walletText}>
                {' · ' + account.slice(0, 10) + '...'}
              </span>
            )}
          </p>
        </div>
        {!isConnected && (
          <div style={s.warnBox}>
            Connect MetaMask in the top bar to enable blockchain features
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={s.statsGrid}>
        {myStats.map((stat, i) => (
          <div key={i} style={s.statCard}>
            <div style={{
              ...s.statIcon,
              background: stat.color + '22'
            }}>
              {stat.icon}
            </div>
            <div style={s.statValue}>{stat.value}</div>
            <div style={s.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent docs */}
      <div style={s.card}>
        <div style={s.cardTitle}>Recent Documents</div>
        <div style={s.cardSub}>Latest medical records activity</div>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Document</th>
              <th style={s.th}>Type</th>
              <th style={s.th}>Uploaded By</th>
              <th style={s.th}>Date</th>
              <th style={s.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentDocs.map(doc => (
              <tr key={doc.id}>
                <td style={s.td}>
                  <div style={{ fontWeight: 600 }}>{doc.file_name}</div>
                </td>
                <td style={s.td}>
                  <span style={{ fontSize: 12, color: '#6b8ab4' }}>
                    {typeLabel[doc.document_type]}
                  </span>
                </td>
                <td style={{ ...s.td, fontSize: 12 }}>
                  {doc.uploader}
                </td>
                <td style={{ ...s.td, fontSize: 11, color: '#6b8ab4' }}>
                  {doc.uploaded_at}
                </td>
                <td style={s.td}>
                  {doc.is_verified
                    ? <span style={{ ...s.badge, ...s.badgeGreen }}>Verified</span>
                    : <span style={{ ...s.badge, ...s.badgeAmber }}>Pending</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const s = {
  welcomeRow:   { display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', marginBottom: 24,
                  flexWrap: 'wrap', gap: 12 },
  welcomeTitle: { fontSize: 22, fontWeight: 800, marginBottom: 4 },
  welcomeSub:   { color: '#6b8ab4', fontSize: 12 },
  walletText:   { fontFamily: 'monospace', fontSize: 11 },
  warnBox:      { background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.25)',
                  color: '#fcd34d', borderRadius: 8,
                  padding: '8px 14px', fontSize: 12 },
  statsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
                  gap: 16, marginBottom: 24 },
  statCard:     { background: '#0d1526',
                  border: '1px solid rgba(48,100,200,0.18)',
                  borderRadius: 14, padding: 20 },
  statIcon:     { width: 38, height: 38, borderRadius: 10,
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 18, marginBottom: 14 },
  statValue:    { fontSize: 28, fontWeight: 800, lineHeight: 1, marginBottom: 4 },
  statLabel:    { fontSize: 11, color: '#6b8ab4' },
  card:         { background: '#0d1526',
                  border: '1px solid rgba(48,100,200,0.18)',
                  borderRadius: 14, padding: 22 },
  cardTitle:    { fontSize: 14, fontWeight: 700, marginBottom: 4 },
  cardSub:      { fontSize: 11, color: '#6b8ab4', marginBottom: 16 },
  table:        { width: '100%', borderCollapse: 'collapse' },
  th:           { textAlign: 'left', padding: '8px 14px', fontSize: 10,
                  color: '#3d5478', fontFamily: 'monospace', letterSpacing: 1,
                  textTransform: 'uppercase',
                  borderBottom: '1px solid rgba(48,100,200,0.18)' },
  td:           { padding: '12px 14px',
                  borderBottom: '1px solid rgba(48,100,200,0.06)',
                  fontSize: 12, verticalAlign: 'middle' },
  badge:        { padding: '3px 8px', borderRadius: 5,
                  fontSize: 10, fontWeight: 600, fontFamily: 'monospace' },
  badgeGreen:   { background: 'rgba(16,185,129,0.15)', color: '#10b981',
                  border: '1px solid rgba(16,185,129,0.25)' },
  badgeAmber:   { background: 'rgba(245,158,11,0.12)', color: '#f59e0b',
                  border: '1px solid rgba(245,158,11,0.2)' },
};