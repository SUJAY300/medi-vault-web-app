// src/pages/Documents.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const GATEWAY = process.env.REACT_APP_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

const TYPE_LABEL = {
  lab_report: 'Lab Report',
  imaging: 'Imaging',
  prescription: 'Prescription',
  history: 'Medical History',
  other: 'Other'
};

const TYPE_ICON = {
  lab_report: '[LAB]',
  imaging: '[IMG]',
  prescription: '[RX]',
  history: '[HX]',
  other: '[DOC]'
};

function DocRow({ doc }) {
  const url = GATEWAY + doc.ipfs_hash;

  function openDoc() {
    window.open(url, '_blank');
  }

  const shortHash = doc.ipfs_hash
    ? doc.ipfs_hash.slice(0, 16) + '...'
    : 'N/A';

  const dateStr = doc.uploaded_at
    ? new Date(doc.uploaded_at).toLocaleDateString()
    : 'N/A';

  return (
    <tr>
      <td style={s.td}>
        <div style={{ fontWeight: 600 }}>{doc.file_name}</div>
      </td>
      <td style={s.td}>
        <span style={s.typeBadge}>
          {TYPE_ICON[doc.document_type]} {TYPE_LABEL[doc.document_type]}
        </span>
      </td>
      <td style={s.td}>
        <span style={s.hashChip}>{shortHash}</span>
      </td>
      <td style={{ ...s.td, fontSize: 12 }}>
        {doc.uploader_name || 'Unknown'}
      </td>
      <td style={{ ...s.td, fontSize: 11, color: '#6b8ab4' }}>
        {dateStr}
      </td>
      <td style={s.td}>
        {doc.is_verified
          ? <span style={{ ...s.badge, ...s.badgeGreen }}>Verified</span>
          : <span style={{ ...s.badge, ...s.badgeAmber }}>Pending</span>
        }
      </td>
      <td style={s.td}>
        <button style={s.viewBtn} onClick={openDoc}>
          View
        </button>
      </td>
    </tr>
  );
}

export default function Documents() {
  const { user }    = useAuth();
  const [docs,      setDocs]    = useState([]);
  const [search,    setSearch]  = useState('');
  const [filter,    setFilter]  = useState('all');
  const [loading,   setLoading] = useState(true);
  const [error,     setError]   = useState('');

  useEffect(() => {
    loadDocuments();
  }, [user]);

  async function loadDocuments() {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(
        API + '/documents/patient/' + user.wallet_address
      );
      setDocs(res.data.documents || []);
    } catch (err) {
      setError('Failed to load documents. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  const filtered = docs.filter(function(d) {
    const matchSearch = d.file_name
      ? d.file_name.toLowerCase().includes(search.toLowerCase())
      : false;
    const matchFilter = filter === 'all' || d.document_type === filter;
    return matchSearch && matchFilter;
  });

  const verifiedCount = docs.filter(function(d) {
    return d.is_verified;
  }).length;

  if (loading) {
    return <div style={s.loading}>Loading documents...</div>;
  }

  return (
    <div>

      <div style={s.header}>
        <h2 style={s.title}>Medical Documents</h2>
        <p style={s.sub}>
          All documents stored on IPFS with blockchain verification
        </p>
      </div>

      {error && (
        <div style={s.errorBox}>{error}</div>
      )}

      <div style={s.filterRow}>
        <input
          style={{ ...s.input, flex: 1, minWidth: 200 }}
          placeholder="Search documents..."
          value={search}
          onChange={function(e) { setSearch(e.target.value); }}
        />
        <select
          style={{ ...s.input, width: 160 }}
          value={filter}
          onChange={function(e) { setFilter(e.target.value); }}
        >
          <option value="all">All Types</option>
          <option value="lab_report">Lab Reports</option>
          <option value="imaging">Imaging</option>
          <option value="prescription">Prescriptions</option>
          <option value="history">Medical History</option>
          <option value="other">Other</option>
        </select>
        <button style={s.refreshBtn} onClick={loadDocuments}>
          Refresh
        </button>
      </div>

      <div style={s.card}>
        {filtered.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 40, marginBottom: 10, opacity: 0.3 }}>
              [empty]
            </div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              No documents found
            </div>
            <div style={{ fontSize: 12, color: '#6b8ab4' }}>
              {docs.length === 0
                ? 'No documents uploaded yet'
                : 'Try adjusting your search or filter'
              }
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Document</th>
                  <th style={s.th}>Type</th>
                  <th style={s.th}>IPFS Hash</th>
                  <th style={s.th}>Uploaded By</th>
                  <th style={s.th}>Date</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(function(doc) {
                  return <DocRow key={doc.id} doc={doc} />;
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {docs.length > 0 && (
        <div style={s.summary}>
          {'Showing ' + filtered.length + ' of ' + docs.length + ' documents'}
          {'   |   ' + verifiedCount + ' verified on blockchain'}
        </div>
      )}

    </div>
  );
}

const s = {
  loading: {
    color: '#6b8ab4', padding: 40, textAlign: 'center'
  },
  header: {
    marginBottom: 24
  },
  title: {
    fontSize: 20, fontWeight: 800, marginBottom: 4
  },
  sub: {
    color: '#6b8ab4', fontSize: 12
  },
  errorBox: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.25)',
    color: '#fca5a5',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 12,
    marginBottom: 16
  },
  filterRow: {
    display: 'flex', gap: 12, alignItems: 'center',
    marginBottom: 16, flexWrap: 'wrap'
  },
  input: {
    background: '#0d1526',
    border: '1px solid rgba(48,100,200,0.18)',
    color: '#e2eaf8',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 13,
    outline: 'none'
  },
  refreshBtn: {
    background: '#111d35',
    border: '1px solid rgba(48,100,200,0.18)',
    color: '#6b8ab4',
    padding: '10px 16px',
    borderRadius: 8,
    fontSize: 12,
    cursor: 'pointer'
  },
  card: {
    background: '#0d1526',
    border: '1px solid rgba(48,100,200,0.18)',
    borderRadius: 14,
    padding: 22
  },
  empty: {
    textAlign: 'center', padding: '50px 20px', color: '#6b8ab4'
  },
  table: {
    width: '100%', borderCollapse: 'collapse'
  },
  th: {
    textAlign: 'left',
    padding: '8px 14px',
    fontSize: 10,
    color: '#3d5478',
    fontFamily: 'monospace',
    letterSpacing: 1,
    textTransform: 'uppercase',
    borderBottom: '1px solid rgba(48,100,200,0.18)'
  },
  td: {
    padding: '12px 14px',
    borderBottom: '1px solid rgba(48,100,200,0.06)',
    fontSize: 12,
    verticalAlign: 'middle'
  },
  typeBadge: {
    fontSize: 11, color: '#6b8ab4'
  },
  hashChip: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#06b6d4',
    background: '#111d35',
    padding: '3px 7px',
    borderRadius: 4
  },
  badge: {
    padding: '3px 8px',
    borderRadius: 5,
    fontSize: 10,
    fontWeight: 600,
    fontFamily: 'monospace'
  },
  badgeGreen: {
    background: 'rgba(16,185,129,0.15)',
    color: '#10b981',
    border: '1px solid rgba(16,185,129,0.25)'
  },
  badgeAmber: {
    background: 'rgba(245,158,11,0.12)',
    color: '#f59e0b',
    border: '1px solid rgba(245,158,11,0.2)'
  },
  viewBtn: {
    background: '#111d35',
    border: '1px solid rgba(48,100,200,0.18)',
    color: '#e2eaf8',
    padding: '5px 11px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer'
  },
  summary: {
    marginTop: 12,
    fontSize: 11,
    color: '#3d5478',
    textAlign: 'right',
    fontFamily: 'monospace'
  }
};