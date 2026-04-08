// src/pages/Access.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';

export default function Access() {
  const { user } = useAuth();
  const { isConnected, grantAccessOnChain, revokeAccessOnChain, checkAccessOnChain } = useWeb3();

  const [doctorWallet, setDoctorWallet] = useState('');
  const [expiryDate,   setExpiryDate]   = useState('');
  const [grants,       setGrants]       = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [success,      setSuccess]      = useState('');
  const [error,        setError]        = useState('');

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleGrant = async () => {
    if (!doctorWallet) { setError('Enter doctor wallet address'); return; }
    if (!isConnected)  { setError('Connect MetaMask first');      return; }

    setLoading(true);
    setError('');
    try {
      // Convert expiry date to unix timestamp (0 = no expiry)
      const expiresAt = expiryDate
        ? Math.floor(new Date(expiryDate).getTime() / 1000)
        : 0;

      await grantAccessOnChain(doctorWallet, expiresAt);

      setGrants(prev => [...prev, {
        wallet:    doctorWallet,
        grantedAt: new Date().toISOString(),
        expiresAt: expiryDate || 'Never',
        status:    'active'
      }]);

      setDoctorWallet('');
      setExpiryDate('');
      showSuccess('✅ Access granted! Transaction confirmed on blockchain.');
    } catch (err) {
      setError(err.message || 'Grant failed. Check console.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (wallet, index) => {
    if (!isConnected) { setError('Connect MetaMask first'); return; }
    setError('');
    try {
      await revokeAccessOnChain(wallet);
      setGrants(prev => prev.map((g, i) =>
        i === index ? { ...g, status: 'revoked' } : g
      ));
      showSuccess('🔒 Access revoked successfully.');
    } catch (err) {
      setError(err.message || 'Revoke failed.');
      console.error(err);
    }
  };

  return (
    <div>
      <div style={s.header}>
        <h2 style={s.title}>Access Control</h2>
        <p style={s.sub}>
          Control who can view your medical records.
          All grants are recorded on the blockchain.
        </p>
      </div>

      {success && <div style={s.successBox}>{success}</div>}
      {error   && <div style={s.errorBox}>{error}</div>}

      {!isConnected && (
        <div style={s.warnBox}>
          ⚠️  Connect MetaMask to grant or revoke access
        </div>
      )}

      <div style={s.grid2}>
        {/* Grant form */}
        <div style={s.card}>
          <div style={s.cardTitle}>Grant Doctor Access</div>
          <div style={s.group}>
            <label style={s.label}>DOCTOR WALLET ADDRESS</label>
            <input
              style={s.input}
              value={doctorWallet}
              onChange={e => setDoctorWallet(e.target.value)}
              placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
            />
          </div>
          <div style={s.group}>
            <label style={s.label}>ACCESS EXPIRY (LEAVE EMPTY FOR NO EXPIRY)</label>
            <input
              style={s.input}
              type="date"
              value={expiryDate}
              onChange={e => setExpiryDate(e.target.value)}
            />
          </div>
          <div style={s.infoBox}>
            ⚠️  This calls grantAccess() on the smart contract.
            The doctor will be able to view ALL your records.
          </div>
          <button
            style={{...s.btn, ...s.btnGreen, opacity: loading ? 0.6 : 1}}
            onClick={handleGrant}
            disabled={loading || !doctorWallet}
          >
            {loading ? '⏳  Processing…' : '🔓  Grant Access'}
          </button>
        </div>

        {/* Active grants */}
        <div style={s.card}>
          <div style={s.cardTitle}>
            Active Grants
            <span style={s.countBadge}>
              {grants.filter(g => g.status === 'active').length}
            </span>
          </div>

          {grants.length === 0 ? (
            <div style={s.empty}>
              <div style={{fontSize:32, opacity:0.3, marginBottom:8}}>🔒</div>
              <div style={{fontWeight:600, marginBottom:4}}>No access granted</div>
              <div style={{fontSize:12, color:'#6b8ab4'}}>Your records are private</div>
            </div>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              {grants.map((g, i) => (
                <div key={i} style={s.grantItem}>
                  <div style={s.grantIcon}>🩺</div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:11, fontFamily:'monospace', color:'#06b6d4',
                                 overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                      {g.wallet}
                    </div>
                    <div style={{fontSize:10, color:'#6b8ab4', marginTop:2}}>
                      Granted {new Date(g.grantedAt).toLocaleDateString()} ·
                      Expires: {g.expiresAt}
                    </div>
                  </div>
                  <div style={{display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end'}}>
                    <span style={{
                      ...s.badge,
                      ...(g.status === 'active' ? s.badgeGreen : s.badgeRed)
                    }}>
                      {g.status === 'active' ? '● Active' : '✕ Revoked'}
                    </span>
                    {g.status === 'active' && (
                      <button
                        style={s.revokeBtn}
                        onClick={() => handleRevoke(g.wallet, i)}
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* How it works */}
      <div style={{...s.card, marginTop:20}}>
        <div style={s.cardTitle}>How Access Control Works</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginTop:12}}>
          {[
            { icon:'🔐', title:'Patient Controls', desc:'Only you can grant or revoke access to your records. No one else can override this.' },
            { icon:'⛓', title:'On-Chain Record', desc:'Every grant and revoke is permanently logged as a blockchain transaction.' },
            { icon:'⏰', title:'Time Limited', desc:'Optionally set an expiry date. Access automatically becomes invalid after that date.' },
          ].map(item => (
            <div key={item.title} style={s.howItem}>
              <div style={{fontSize:24, marginBottom:8}}>{item.icon}</div>
              <div style={{fontWeight:600, fontSize:13, marginBottom:4}}>{item.title}</div>
              <div style={{fontSize:11, color:'#6b8ab4', lineHeight:1.5}}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  header:     { marginBottom:24 },
  title:      { fontSize:20, fontWeight:800, marginBottom:4 },
  sub:        { color:'#6b8ab4', fontSize:12 },
  successBox: { background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)',
                color:'#6ee7b7', borderRadius:8, padding:'10px 14px', fontSize:12, marginBottom:16 },
  errorBox:   { background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)',
                color:'#fca5a5', borderRadius:8, padding:'10px 14px', fontSize:12, marginBottom:16 },
  warnBox:    { background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.25)',
                color:'#fcd34d', borderRadius:8, padding:'10px 14px', fontSize:12, marginBottom:16 },
  grid2:      { display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 },
  card:       { background:'#0d1526', border:'1px solid rgba(48,100,200,0.18)', borderRadius:14, padding:22 },
  cardTitle:  { fontSize:14, fontWeight:700, marginBottom:16,
                display:'flex', alignItems:'center', gap:8 },
  countBadge: { background:'#3b82f6', color:'white', fontSize:10, padding:'1px 7px',
                borderRadius:10, fontFamily:'monospace' },
  group:      { marginBottom:16 },
  label:      { display:'block', fontSize:10, color:'#6b8ab4', marginBottom:6,
                letterSpacing:0.5, fontFamily:'monospace' },
  input:      { width:'100%', background:'#111d35', border:'1px solid rgba(48,100,200,0.18)',
                color:'#e2eaf8', padding:'10px 14px', borderRadius:8, fontSize:12,
                outline:'none', boxSizing:'border-box' },
  infoBox:    { background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)',
                color:'#fcd34d', borderRadius:8, padding:'10px 14px', fontSize:11, marginBottom:16 },
  btn:        { width:'100%', padding:11, borderRadius:8, border:'none',
                fontSize:13, fontWeight:600, cursor:'pointer' },
  btnGreen:   { background:'rgba(16,185,129,0.15)', color:'#10b981',
                border:'1px solid rgba(16,185,129,0.3)' },
  empty:      { textAlign:'center', padding:'30px 20px', color:'#6b8ab4' },
  grantItem:  { background:'#111d35', border:'1px solid rgba(48,100,200,0.18)',
                borderRadius:10, padding:14, display:'flex', alignItems:'center', gap:12 },
  grantIcon:  { width:36, height:36, borderRadius:8, background:'rgba(59,130,246,0.15)',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 },
  badge:      { padding:'3px 8px', borderRadius:5, fontSize:10, fontWeight:600, fontFamily:'monospace' },
  badgeGreen: { background:'rgba(16,185,129,0.15)', color:'#10b981', border:'1px solid rgba(16,185,129,0.25)' },
  badgeRed:   { background:'rgba(239,68,68,0.12)', color:'#ef4444', border:'1px solid rgba(239,68,68,0.2)' },
  revokeBtn:  { background:'rgba(239,68,68,0.1)', color:'#ef4444', border:'1px solid rgba(239,68,68,0.25)',
                padding:'4px 10px', borderRadius:5, fontSize:11, fontWeight:600, cursor:'pointer' },
  howItem:    { background:'#111d35', border:'1px solid rgba(48,100,200,0.18)',
                borderRadius:10, padding:16 },
};