// src/pages/Verify.js
import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export default function Verify() {
  const { isConnected, verifyDocumentOnChain } = useWeb3();
  const [hash,    setHash]    = useState('');
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleVerify = async () => {
    if (!hash.trim()) { setError('Please enter an IPFS hash'); return; }
    if (!isConnected) { setError('Please connect MetaMask first'); return; }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Check on blockchain
      const chainResult = await verifyDocumentOnChain(hash.trim());

      // Also check backend DB for extra metadata
      let dbData = null;
      try {
        const dbRes = await axios.get(`${API}/documents/verify/${hash.trim()}`);
        dbData = dbRes.data;
      } catch {
        // DB check is optional
      }

      setResult({
        isVerified:     chainResult[0],
        patientAddress: chainResult[1],
        uploadedBy:     chainResult[2],
        uploadedAt:     chainResult[3],
        fileName:       dbData?.file_name,
        documentType:   dbData?.document_type,
        txHash:         dbData?.blockchain_tx,
        ipfsUrl:        dbData?.ipfs_url,
      });

    } catch (err) {
      setError(err.message || 'Verification failed. Check console for details.');
      console.error('Verify error:', err);
    } finally {
      setLoading(false);
    }
  };

  const docTypeLabel = {
    lab_report:'Lab Report', imaging:'Imaging',
    prescription:'Prescription', history:'Medical History', other:'Other'
  };

  return (
    <div style={{maxWidth:620, margin:'0 auto'}}>
      <div style={s.header}>
        <h2 style={s.title}>Verify Document</h2>
        <p style={s.sub}>
          Enter an IPFS hash to verify its authenticity on the blockchain.
        </p>
      </div>

      {/* Input card */}
      <div style={s.card}>
        <div style={s.group}>
          <label style={s.label}>IPFS HASH (CID)</label>
          <input
            style={s.input}
            value={hash}
            onChange={e => { setHash(e.target.value); setResult(null); setError(''); }}
            placeholder="QmX9K3mVZf8SRtqAhEkLpBWd7nJ4c2Ys6uTvRgN8oD1mQ"
            onKeyDown={e => e.key === 'Enter' && handleVerify()}
          />
        </div>

        {error && <div style={s.errorBox}>{error}</div>}

        {!isConnected && (
          <div style={s.warnBox}>
            ⚠️  Connect MetaMask in the top bar to verify on blockchain
          </div>
        )}

        <div style={s.btnRow}>
          <button
            style={{...s.btn, ...s.btnPrimary, flex:1,
              opacity:(!hash.trim() || loading) ? 0.5 : 1}}
            onClick={handleVerify}
            disabled={!hash.trim() || loading}
          >
            {loading ? '⏳  Querying Blockchain…' : '⛓  Verify on Blockchain'}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div style={{
          ...s.resultBox,
          borderColor: result.isVerified ? '#10b981' : '#ef4444',
          background:  result.isVerified
            ? 'rgba(16,185,129,0.05)'
            : 'rgba(239,68,68,0.05)',
        }}>
          <div style={{fontSize:48, marginBottom:12}}>
            {result.isVerified ? '✅' : '❌'}
          </div>
          <div style={{
            ...s.resultTitle,
            color: result.isVerified ? '#10b981' : '#ef4444'
          }}>
            {result.isVerified ? 'Document Verified' : 'Document Not Found'}
          </div>
          <div style={s.resultSub}>
            {result.isVerified
              ? 'This document exists on the blockchain and has not been tampered with.'
              : 'No document with this hash exists on the blockchain.'}
          </div>

          {result.isVerified && (
            <div style={s.detailsBlock}>
              {[
                ['File Name',      result.fileName       || '—'],
                ['Document Type',  docTypeLabel[result.documentType] || '—'],
                ['Patient Address',result.patientAddress || '—'],
                ['Uploaded By',    result.uploadedBy     || '—'],
                ['Upload Time',    result.uploadedAt > 0
                  ? new Date(Number(result.uploadedAt) * 1000).toLocaleString()
                  : '—'],
                ['TX Hash',        result.txHash || '—'],
              ].map(([k, v]) => (
                <div key={k} style={s.detailRow}>
                  <span style={s.detailKey}>{k}</span>
                  <span style={{
                    ...s.detailVal,
                    fontFamily: ['Patient Address','Uploaded By','TX Hash'].includes(k)
                      ? 'monospace' : 'inherit',
                    fontSize:   ['Patient Address','Uploaded By','TX Hash'].includes(k)
                      ? 11 : 12,
                  }}>
                    {v}
                  </span>
                </div>
              ))}
              {result.ipfsUrl && (
                <div style={s.detailRow}>
                  <span style={s.detailKey}>IPFS URL</span>
                  <a href={result.ipfsUrl} target="_blank" rel="noreferrer"
                    style={{color:'#06b6d4', fontSize:11, wordBreak:'break-all'}}>
                    {result.ipfsUrl}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const s = {
  header:      { marginBottom:24 },
  title:       { fontSize:20, fontWeight:800, marginBottom:4 },
  sub:         { color:'#6b8ab4', fontSize:12 },
  card:        { background:'#0d1526', border:'1px solid rgba(48,100,200,0.18)',
                 borderRadius:14, padding:24, marginBottom:20 },
  group:       { marginBottom:16 },
  label:       { display:'block', fontSize:10, color:'#6b8ab4', marginBottom:6,
                 letterSpacing:0.5, fontFamily:'monospace' },
  input:       { width:'100%', background:'#111d35', border:'1px solid rgba(48,100,200,0.18)',
                 color:'#e2eaf8', padding:'10px 14px', borderRadius:8, fontSize:12,
                 outline:'none', fontFamily:'monospace', boxSizing:'border-box' },
  errorBox:    { background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)',
                 color:'#fca5a5', borderRadius:8, padding:'10px 14px', fontSize:12, marginBottom:12 },
  warnBox:     { background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.25)',
                 color:'#fcd34d', borderRadius:8, padding:'10px 14px', fontSize:12, marginBottom:12 },
  btnRow:      { display:'flex', gap:8 },
  btn:         { padding:'11px 16px', borderRadius:8, border:'none',
                 fontSize:13, fontWeight:600, cursor:'pointer' },
  btnPrimary:  { background:'#3b82f6', color:'white' },
  resultBox:   { border:'2px solid', borderRadius:14, padding:28, textAlign:'center' },
  resultTitle: { fontSize:22, fontWeight:800, marginBottom:8 },
  resultSub:   { color:'#6b8ab4', fontSize:13, marginBottom:20 },
  detailsBlock:{ background:'#0d1526', borderRadius:10, padding:16, textAlign:'left' },
  detailRow:   { display:'flex', gap:12, marginBottom:12, fontSize:12,
                 borderBottom:'1px solid rgba(48,100,200,0.08)', paddingBottom:12 },
  detailKey:   { color:'#3d5478', width:130, flexShrink:0, fontFamily:'monospace',
                 fontSize:10, paddingTop:1 },
  detailVal:   { color:'#e2eaf8', flex:1, wordBreak:'break-all' },
};