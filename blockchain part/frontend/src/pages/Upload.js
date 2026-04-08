// src/pages/Upload.js
import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export default function Upload() {
  const { user }    = useAuth();
  const { account, isConnected, uploadDocumentOnChain } = useWeb3();

  const [file,          setFile]          = useState(null);
  const [docType,       setDocType]       = useState('lab_report');
  const [patientWallet, setPatientWallet] = useState('');
  const [description,   setDescription]  = useState('');
  const [dragOver,      setDragOver]      = useState(false);
  const [step,          setStep]          = useState(0);
  // step: 0=form, 1=uploading to IPFS, 2=storing on blockchain, 3=done

  const [ipfsHash,  setIpfsHash]  = useState('');
  const [txHash,    setTxHash]    = useState('');
  const [ipfsUrl,   setIpfsUrl]   = useState('');
  const [error,     setError]     = useState('');

  const fileRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleUpload = async () => {
    if (!file)          { setError('Please select a file');          return; }
    if (!patientWallet) { setError('Please enter patient wallet address'); return; }
    if (!isConnected)   { setError('Please connect MetaMask first'); return; }

    setError('');
    setStep(1);

    try {
      // ── STEP 1: Upload to IPFS via backend ──────────────
      const formData = new FormData();
      formData.append('file',           file);
      formData.append('patient_wallet', patientWallet);
      formData.append('document_type',  docType);
      formData.append('description',    description);

      const uploadRes = await axios.post(`${API}/documents/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { ipfs_hash, ipfs_url } = uploadRes.data;
      setIpfsHash(ipfs_hash);
      setIpfsUrl(ipfs_url);

      // ── STEP 2: Store hash on blockchain ────────────────
      setStep(2);
      const tx = await uploadDocumentOnChain(
        ipfs_hash,
        file.name,
        docType,
        patientWallet
      );

      setTxHash(tx.transactionHash);

      // ── STEP 3: Confirm in backend DB ───────────────────
      await axios.post(`${API}/documents/confirm-blockchain`, null, {
        params: {
          ipfs_hash:      ipfs_hash,
          tx_hash:        tx.transactionHash,
          patient_wallet: patientWallet
        }
      });

      setStep(3);

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Upload failed. Check console for details.'
      );
      setStep(0);
      console.error('Upload error:', err);
    }
  };

  const reset = () => {
    setFile(null); setDocType('lab_report'); setPatientWallet('');
    setDescription(''); setStep(0); setIpfsHash(''); setTxHash('');
    setIpfsUrl(''); setError('');
  };

  // ── SUCCESS SCREEN ───────────────────────────────────
  if (step === 3) return (
    <div style={{maxWidth:600, margin:'0 auto'}}>
      <div style={s.successBox}>
        <div style={{fontSize:48, marginBottom:12}}>🎉</div>
        <div style={s.successTitle}>Document Secured!</div>
        <div style={s.successSub}>
          Uploaded to IPFS and stored on the blockchain successfully.
        </div>
        <div style={s.resultBlock}>
          <div style={s.resultRow}>
            <span style={s.resultKey}>IPFS HASH</span>
            <span style={s.resultVal}>{ipfsHash}</span>
          </div>
          <div style={s.resultRow}>
            <span style={s.resultKey}>TX HASH</span>
            <span style={s.resultVal}>{txHash}</span>
          </div>
          <div style={s.resultRow}>
            <span style={s.resultKey}>IPFS URL</span>
            <a href={ipfsUrl} target="_blank" rel="noreferrer" style={{color:'#06b6d4', fontSize:11, wordBreak:'break-all'}}>
              {ipfsUrl}
            </a>
          </div>
        </div>
        <button style={{...s.btn, ...s.btnPrimary, marginTop:20}} onClick={reset}>
          ↩  Upload Another Document
        </button>
      </div>
    </div>
  );

  return (
    <div style={{maxWidth:680, margin:'0 auto'}}>
      <div style={s.header}>
        <h2 style={s.title}>Upload Medical Document</h2>
        <p style={s.sub}>
          Files are stored on IPFS. The hash is permanently recorded on the blockchain.
        </p>
      </div>

      {/* Progress steps */}
      {step > 0 && (
        <div style={s.progressCard}>
          {[
            { label:'Uploading to IPFS (Pinata)…',    done: step > 1, active: step === 1 },
            { label:'Storing hash on blockchain…',     done: step > 2, active: step === 2 },
            { label:'Confirming transaction…',         done: step > 2, active: step === 2 },
          ].map((p, i) => (
            <div key={i} style={s.progressRow}>
              {p.done
                ? <span style={{color:'#10b981', fontSize:16}}>✓</span>
                : p.active
                ? <span style={s.spinner} />
                : <span style={{color:'#3d5478'}}>○</span>}
              <span style={{fontSize:13, color: p.done ? '#10b981' : p.active ? '#e2eaf8' : '#6b8ab4'}}>
                {p.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {error && <div style={s.errorBox}>{error}</div>}

      {!isConnected && (
        <div style={s.warnBox}>
          ⚠️  Connect MetaMask first using the button in the top bar
        </div>
      )}

      <div style={s.card}>
        {/* Drop zone */}
        <div
          style={{...s.dropZone, ...(dragOver ? s.dropZoneActive : {})}}
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileRef} type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            style={{display:'none'}}
            onChange={e => setFile(e.target.files[0])}
          />
          {file ? (
            <>
              <div style={{fontSize:36, marginBottom:8}}>📄</div>
              <div style={{fontWeight:600, color:'#3b82f6', marginBottom:4}}>{file.name}</div>
              <div style={{fontSize:11, color:'#6b8ab4'}}>
                {(file.size / 1024).toFixed(1)} KB · Click to change
              </div>
            </>
          ) : (
            <>
              <div style={{fontSize:36, marginBottom:8, opacity:0.5}}>☁️</div>
              <div style={{fontWeight:600, marginBottom:4}}>Drop file here or click to browse</div>
              <div style={{fontSize:11, color:'#6b8ab4'}}>PDF, JPEG, PNG · Max 50MB</div>
            </>
          )}
        </div>

        {/* Form fields */}
        <div style={s.grid2}>
          <div style={s.group}>
            <label style={s.label}>DOCUMENT TYPE</label>
            <select style={s.input} value={docType} onChange={e => setDocType(e.target.value)}>
              <option value="lab_report">🧪  Lab Report</option>
              <option value="prescription">💊  Prescription</option>
              <option value="imaging">🔬  Imaging (X-Ray / MRI)</option>
              <option value="history">📋  Medical History</option>
              <option value="other">📄  Other</option>
            </select>
          </div>
          <div style={s.group}>
            <label style={s.label}>PATIENT WALLET ADDRESS</label>
            <input
              style={s.input}
              value={patientWallet}
              onChange={e => setPatientWallet(e.target.value)}
              placeholder="0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
            />
          </div>
        </div>

        <div style={s.group}>
          <label style={s.label}>DESCRIPTION (OPTIONAL)</label>
          <input
            style={s.input}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Brief description of this document…"
          />
        </div>

        <div style={s.infoBox}>
          ℹ️  This file will be uploaded to IPFS via Pinata, then the hash will be stored
          on Ganache via the MediVaultAccess smart contract.
        </div>

        <button
          style={{
            ...s.btn,
            ...s.btnPrimary,
            opacity: (!file || step > 0 || !isConnected) ? 0.5 : 1
          }}
          onClick={handleUpload}
          disabled={!file || step > 0 || !isConnected}
        >
          {step > 0 ? '⏳  Processing…' : '⬆  Upload & Secure on Blockchain'}
        </button>
      </div>
    </div>
  );
}

const s = {
  header:       { marginBottom:24 },
  title:        { fontSize:20, fontWeight:800, marginBottom:4 },
  sub:          { color:'#6b8ab4', fontSize:12 },
  progressCard: { background:'#0d1526', border:'1px solid rgba(48,100,200,0.18)',
                  borderRadius:12, padding:20, marginBottom:20,
                  display:'flex', flexDirection:'column', gap:12 },
  progressRow:  { display:'flex', alignItems:'center', gap:10 },
  spinner:      { width:14, height:14, border:'2px solid rgba(255,255,255,0.2)',
                  borderTopColor:'#3b82f6', borderRadius:'50%',
                  animation:'spin 0.7s linear infinite', display:'inline-block' },
  errorBox:     { background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)',
                  color:'#fca5a5', borderRadius:8, padding:'10px 14px', fontSize:12, marginBottom:16 },
  warnBox:      { background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.25)',
                  color:'#fcd34d', borderRadius:8, padding:'10px 14px', fontSize:12, marginBottom:16 },
  card:         { background:'#0d1526', border:'1px solid rgba(48,100,200,0.18)', borderRadius:14, padding:24 },
  dropZone:     { border:'2px dashed rgba(80,140,255,0.35)', borderRadius:12, padding:40,
                  textAlign:'center', cursor:'pointer', marginBottom:20,
                  background:'rgba(59,130,246,0.03)', transition:'all 0.2s ease' },
  dropZoneActive:{ borderColor:'#3b82f6', background:'rgba(59,130,246,0.07)' },
  grid2:        { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 },
  group:        { marginBottom:16 },
  label:        { display:'block', fontSize:10, color:'#6b8ab4', marginBottom:6,
                  letterSpacing:0.5, fontFamily:'monospace' },
  input:        { width:'100%', background:'#111d35', border:'1px solid rgba(48,100,200,0.18)',
                  color:'#e2eaf8', padding:'10px 14px', borderRadius:8, fontSize:13,
                  outline:'none', boxSizing:'border-box' },
  infoBox:      { background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)',
                  color:'#93c5fd', borderRadius:8, padding:'10px 14px', fontSize:12, marginBottom:16 },
  btn:          { width:'100%', padding:12, borderRadius:8, border:'none',
                  fontSize:13, fontWeight:600, cursor:'pointer' },
  btnPrimary:   { background:'#3b82f6', color:'white' },
  successBox:   { background:'#0d1526', border:'2px solid #10b981', borderRadius:14,
                  padding:32, textAlign:'center' },
  successTitle: { fontSize:22, fontWeight:800, color:'#10b981', marginBottom:8 },
  successSub:   { color:'#6b8ab4', fontSize:13, marginBottom:20 },
  resultBlock:  { background:'#111d35', borderRadius:10, padding:16, textAlign:'left' },
  resultRow:    { display:'flex', flexDirection:'column', marginBottom:14 },
  resultKey:    { fontSize:9, color:'#3d5478', fontFamily:'monospace',
                  letterSpacing:1, marginBottom:4 },
  resultVal:    { fontSize:11, color:'#06b6d4', fontFamily:'monospace', wordBreak:'break-all' },
};