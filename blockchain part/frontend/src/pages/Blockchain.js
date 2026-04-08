// src/pages/Blockchain.js
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export default function Blockchain() {
  const { isConnected, connectWallet, isConnecting, account,
          networkId, getStatsOnChain } = useWeb3();

  const [nodeStatus, setNodeStatus] = useState(null);
  const [chainStats, setChainStats] = useState(null);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => { loadStatus(); }, [isConnected]);

  const loadStatus = async () => {
    try {
      const res = await axios.get(`${API}/blockchain/status`);
      setNodeStatus(res.data);
    } catch {
      setNodeStatus({ connected: false, error: 'Backend not reachable' });
    }
    if (isConnected) {
      try {
        const stats = await getStatsOnChain();
        setChainStats({
          totalUsers:     Number(stats[0]),
          totalDocuments: Number(stats[1]),
          owner:          stats[2]
        });
      } catch (err) {
        console.error('Stats error:', err);
      }
    }
    setLoading(false);
  };

  const contractFunctions = [
    { fn:'registerUser()',          desc:'Register wallet with role',         access:'Admin',         color:'#8b5cf6' },
    { fn:'uploadDocument()',        desc:'Store IPFS hash on blockchain',      access:'Doctor/Admin',  color:'#3b82f6' },
    { fn:'getPatientDocuments()',   desc:'Fetch all patient document hashes',  access:'Authorized',    color:'#06b6d4' },
    { fn:'grantAccess()',           desc:'Patient grants doctor access',       access:'Patient',       color:'#10b981' },
    { fn:'revokeAccess()',          desc:'Patient revokes doctor access',      access:'Patient',       color:'#ef4444' },
    { fn:'verifyDocument()',        desc:'Verify IPFS hash exists on chain',   access:'Public',        color:'#f59e0b' },
    { fn:'checkAccess()',           desc:'Check if access grant is active',    access:'Public',        color:'#06b6d4' },
    { fn:'getStats()',              desc:'Get total users and documents',       access:'Public',        color:'#8b5cf6' },
  ];

  if (loading) return <div style={s.loading}>Loading blockchain info…</div>;

  return (
    <div>
      <div style={s.header}>
        <h2 style={s.title}>Blockchain Information</h2>
        <p style={s.sub}>Network status, contract details, and connection info</p>
      </div>

      <div style={s.grid2}>
        {/* MetaMask card */}
        <div style={s.card}>
          <div style={s.cardTitle}>🦊 MetaMask Wallet</div>
          {isConnected ? (
            <>
              <div style={s.successBox}>✅ Connected to Ganache network</div>
              <div style={s.infoRow}>
                <span style={s.infoKey}>ACCOUNT</span>
                <span style={{...s.infoVal, fontFamily:'monospace', fontSize:11}}>{account}</span>
              </div>
              <div style={s.infoRow}>
                <span style={s.infoKey}>NETWORK ID</span>
                <span style={s.infoVal}>{String(networkId)}</span>
              </div>
              <div style={s.infoRow}>
                <span style={s.infoKey}>EXPECTED</span>
                <span style={{...s.infoVal, color:'#10b981'}}>1337 (Ganache Local)</span>
              </div>
              {networkId !== 1337 && (
                <div style={s.warnBox}>
                  ⚠️  Wrong network! Switch MetaMask to Ganache Local (Chain ID 1337)
                </div>
              )}
            </>
          ) : (
            <>
              <div style={s.warnBox}>MetaMask not connected</div>
              <button
                style={s.connectBtn}
                onClick={connectWallet}
                disabled={isConnecting}
              >
                {isConnecting ? '⏳  Connecting…' : '🦊  Connect MetaMask'}
              </button>
            </>
          )}
        </div>

        {/* Node status card */}
        <div style={s.card}>
          <div style={s.cardTitle}>⛓ Ganache Node Status</div>
          {nodeStatus?.connected ? (
            <>
              <div style={s.successBox}>✅ Ganache is running</div>
              {[
                ['RPC URL',       nodeStatus.network_url],
                ['Block Number',  String(nodeStatus.block_number)],
                ['Contract',      nodeStatus.contract_address?.slice(0,20) + '…'],
              ].map(([k,v]) => (
                <div key={k} style={s.infoRow}>
                  <span style={s.infoKey}>{k}</span>
                  <span style={{...s.infoVal, fontFamily:'monospace', fontSize:11}}>{v}</span>
                </div>
              ))}
            </>
          ) : (
            <div style={s.errorBox}>
              ❌ Cannot reach Ganache at {nodeStatus?.network_url || 'http://127.0.0.1:7545'}
              <div style={{marginTop:6, fontSize:11}}>
                Make sure Ganache is running on port 7545
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chain stats */}
      {chainStats && (
        <div style={{...s.card, margin:'20px 0'}}>
          <div style={s.cardTitle}>📊 Contract Statistics (Live from Blockchain)</div>
          <div style={s.statsGrid}>
            {[
              { label:'Total Users',     value: chainStats.totalUsers,     icon:'👥', color:'#8b5cf6' },
              { label:'Total Documents', value: chainStats.totalDocuments, icon:'📄', color:'#3b82f6' },
              { label:'Contract Owner',  value: chainStats.owner?.slice(0,10)+'…', icon:'🔑', color:'#06b6d4' },
              { label:'Network',         value: 'Ganache Local',           icon:'⛓', color:'#10b981' },
            ].map((stat, i) => (
              <div key={i} style={s.statCard}>
                <div style={{fontSize:24, marginBottom:8}}>{stat.icon}</div>
                <div style={{fontSize:22, fontWeight:800, color: stat.color}}>{stat.value}</div>
                <div style={{fontSize:11, color:'#6b8ab4', marginTop:4}}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contract functions */}
      <div style={s.card}>
        <div style={s.cardTitle}>📋 Smart Contract Functions</div>
        <div style={s.fnGrid}>
          {contractFunctions.map(f => (
            <div key={f.fn} style={s.fnCard}>
              <div style={{fontFamily:'monospace', fontSize:11, color:'#3b82f6', marginBottom:6}}>
                {f.fn}
              </div>
              <div style={{fontSize:11, color:'#6b8ab4', marginBottom:8, lineHeight:1.4}}>
                {f.desc}
              </div>
              <span style={{
                padding:'2px 8px', borderRadius:4, fontSize:9, fontWeight:600,
                fontFamily:'monospace', background: f.color + '18',
                color: f.color, border: `1px solid ${f.color}30`
              }}>
                {f.access}
              </span>
            </div>
          ))}
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
  grid2:      { display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 },
  card:       { background:'#0d1526', border:'1px solid rgba(48,100,200,0.18)', borderRadius:14, padding:22 },
  cardTitle:  { fontSize:14, fontWeight:700, marginBottom:16 },
  successBox: { background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)',
                color:'#6ee7b7', borderRadius:8, padding:'8px 12px', fontSize:12, marginBottom:12 },
  errorBox:   { background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)',
                color:'#fca5a5', borderRadius:8, padding:'10px 14px', fontSize:12 },
  warnBox:    { background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.25)',
                color:'#fcd34d', borderRadius:8, padding:'8px 12px', fontSize:12, marginBottom:12 },
  infoRow:    { display:'flex', justifyContent:'space-between', padding:'8px 0',
                borderBottom:'1px solid rgba(48,100,200,0.1)', fontSize:12 },
  infoKey:    { color:'#3d5478', fontFamily:'monospace', fontSize:10 },
  infoVal:    { color:'#e2eaf8' },
  connectBtn: { width:'100%', padding:11, borderRadius:8, border:'none', background:'#3b82f6',
                color:'white', fontSize:13, fontWeight:600, cursor:'pointer', marginTop:8 },
  statsGrid:  { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 },
  statCard:   { background:'#111d35', border:'1px solid rgba(48,100,200,0.18)',
                borderRadius:10, padding:16, textAlign:'center' },
  fnGrid:     { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 },
  fnCard:     { background:'#111d35', border:'1px solid rgba(48,100,200,0.18)',
                borderRadius:10, padding:14 },
};