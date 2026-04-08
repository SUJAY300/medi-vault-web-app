// src/pages/Users.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const roleColors = { admin:'#8b5cf6', doctor:'#3b82f6', patient:'#06b6d4', student:'#f59e0b' };
const roleIcons  = { admin:'🛡️', doctor:'🩺', patient:'🧑', student:'📚' };

export default function Users() {
  const { user }  = useAuth();
  const { isConnected, registerUserOnChain } = useWeb3();

  const [users,   setUsers]   = useState([]);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  // Register form
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'doctor', wallet_address: ''
  });
  const [registering, setRegistering] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const res = await axios.get(`${API}/users/all`);
      setUsers(res.data.users || []);
    } catch (err) {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password || !form.wallet_address) {
      setError('All fields are required'); return;
    }
    if (!isConnected) { setError('Connect MetaMask first'); return; }

    setRegistering(true);
    setError('');
    try {
      // 1. Register in backend DB
      await axios.post(`${API}/auth/register`, null, { params: form });

      // 2. Register on blockchain
      await registerUserOnChain(
        form.wallet_address,
        form.name,
        form.email,
        form.role
      );

      setSuccess('✅ User registered in database and on blockchain!');
      setTimeout(() => setSuccess(''), 4000);
      setForm({ name:'', email:'', password:'', role:'doctor', wallet_address:'' });
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Registration failed.');
      console.error(err);
    } finally {
      setRegistering(false);
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={s.loading}>Loading users…</div>;

  return (
    <div>
      <div style={s.header}>
        <h2 style={s.title}>User Management</h2>
        <p style={s.sub}>Register users on blockchain and manage system access</p>
      </div>

      {success && <div style={s.successBox}>{success}</div>}
      {error   && <div style={s.errorBox}>{error}</div>}

      <div style={s.grid2}>
        {/* Register form */}
        <div style={s.card}>
          <div style={s.cardTitle}>Register New User</div>
          <div style={s.group}>
            <label style={s.label}>FULL NAME</label>
            <input style={s.input} value={form.name}
              onChange={update('name')} placeholder="Dr. Jane Smith"/>
          </div>
          <div style={s.group}>
            <label style={s.label}>EMAIL</label>
            <input style={s.input} type="email" value={form.email}
              onChange={update('email')} placeholder="jane@hospital.com"/>
          </div>
          <div style={s.group}>
            <label style={s.label}>PASSWORD</label>
            <input style={s.input} type="password" value={form.password}
              onChange={update('password')} placeholder="••••••••"/>
          </div>
          <div style={s.group}>
            <label style={s.label}>ROLE</label>
            <select style={s.input} value={form.role} onChange={update('role')}>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
              <option value="student">Medical Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div style={s.group}>
            <label style={s.label}>WALLET ADDRESS</label>
            <input style={s.input} value={form.wallet_address}
              onChange={update('wallet_address')} placeholder="0x..."/>
          </div>
          <div style={s.infoBox}>
            ℹ️  This registers the user in MongoDB AND calls registerUser() on the smart contract.
          </div>
          <button
            style={{...s.btn, ...s.btnPrimary, opacity: registering ? 0.6 : 1}}
            onClick={handleRegister}
            disabled={registering}
          >
            {registering ? '⏳  Registering…' : '⛓  Register on Blockchain'}
          </button>
        </div>

        {/* Users list */}
        <div style={s.card}>
          <div style={s.cardTitle}>
            Registered Users
            <span style={s.countBadge}>{users.length}</span>
          </div>
          <input
            style={{...s.input, marginBottom:16}}
            placeholder="🔍  Search users…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div style={{display:'flex', flexDirection:'column', gap:8, maxHeight:400, overflowY:'auto'}}>
            {filtered.map(u => (
              <div key={u.id} style={s.userItem}>
                <div style={{
                  ...s.userAvatar,
                  background: (roleColors[u.role] || '#3b82f6') + '22',
                  color: roleColors[u.role] || '#3b82f6'
                }}>
                  {u.name?.charAt(0)}
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13, fontWeight:600}}>{u.name}</div>
                  <div style={{fontSize:11, color:'#6b8ab4'}}>{u.email}</div>
                  <div style={{fontSize:10, fontFamily:'monospace', color:'#3d5478', marginTop:2}}>
                    {u.wallet_address?.slice(0,20)}…
                  </div>
                </div>
                <span style={{
                  ...s.roleBadge,
                  background: (roleColors[u.role] || '#3b82f6') + '18',
                  color: roleColors[u.role] || '#3b82f6',
                  border: `1px solid ${(roleColors[u.role] || '#3b82f6')}33`
                }}>
                  {roleIcons[u.role]} {u.role?.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  loading:    { color:'#6b8ab4', padding:40, textAlign:'center' },
  header:     { marginBottom:24 },
  title:      { fontSize:20, fontWeight:800, marginBottom:4 },
  sub:        { color:'#6b8ab4', fontSize:12 },
  successBox: { background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)',
                color:'#6ee7b7', borderRadius:8, padding:'10px 14px', fontSize:12, marginBottom:16 },
  errorBox:   { background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)',
                color:'#fca5a5', borderRadius:8, padding:'10px 14px', fontSize:12, marginBottom:16 },
  grid2:      { display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 },
  card:       { background:'#0d1526', border:'1px solid rgba(48,100,200,0.18)', borderRadius:14, padding:22 },
  cardTitle:  { fontSize:14, fontWeight:700, marginBottom:16, display:'flex', alignItems:'center', gap:8 },
  countBadge: { background:'#3b82f6', color:'white', fontSize:10,
                padding:'1px 7px', borderRadius:10, fontFamily:'monospace' },
  group:      { marginBottom:14 },
  label:      { display:'block', fontSize:10, color:'#6b8ab4', marginBottom:6,
                letterSpacing:0.5, fontFamily:'monospace' },
  input:      { width:'100%', background:'#111d35', border:'1px solid rgba(48,100,200,0.18)',
                color:'#e2eaf8', padding:'10px 14px', borderRadius:8, fontSize:12,
                outline:'none', boxSizing:'border-box' },
  infoBox:    { background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)',
                color:'#93c5fd', borderRadius:8, padding:'10px 14px', fontSize:11, marginBottom:14 },
  btn:        { width:'100%', padding:11, borderRadius:8, border:'none',
                fontSize:13, fontWeight:600, cursor:'pointer' },
  btnPrimary: { background:'#3b82f6', color:'white' },
  userItem:   { background:'#111d35', border:'1px solid rgba(48,100,200,0.18)',
                borderRadius:10, padding:12, display:'flex', alignItems:'center', gap:10 },
  userAvatar: { width:36, height:36, borderRadius:8, display:'flex', alignItems:'center',
                justifyContent:'center', fontWeight:700, fontSize:14, flexShrink:0 },
  roleBadge:  { padding:'3px 8px', borderRadius:5, fontSize:9,
                fontWeight:600, fontFamily:'monospace', flexShrink:0 },
};