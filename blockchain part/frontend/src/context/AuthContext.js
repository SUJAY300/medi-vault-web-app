// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Map wallet address → user profile
// These match the Ganache deterministic accounts
const WALLET_TO_USER = {
  '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266': {
    id: '1',
    name: 'Dr. Admin Kumar',
    email: 'admin@medivault.com',
    role: 'admin',
    wallet_address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  },
  '0x70997970c51812dc3a010c7d01b50e0d17dc79c8': {
    id: '2',
    name: 'Dr. Sarah Johnson',
    email: 'doctor@medivault.com',
    role: 'doctor',
    wallet_address: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  },
  '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc': {
    id: '3',
    name: 'Rahul Sharma',
    email: 'patient@medivault.com',
    role: 'patient',
    wallet_address: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
  },
  '0x90f79bf6eb2c4f870365e785982e1f101e93b906': {
    id: '4',
    name: 'Priya Patel',
    email: 'student@medivault.com',
    role: 'student',
    wallet_address: '0x90f79bf6eb2c4f870365e785982e1f101e93b906',
  },
  '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65': {
    id: '5',
    name: 'Dr. Michael Chen',
    email: 'doctor2@medivault.com',
    role: 'doctor',
    wallet_address: '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65',
  },
};

// Fallback for unknown wallets — treated as patient
function buildUnknownUser(wallet) {
  return {
    id: wallet,
    name: 'Unknown User',
    email: 'unknown@medivault.com',
    role: 'patient',
    wallet_address: wallet,
  };
}

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(false);

  // When MetaMask account changes → update user automatically
  useEffect(() => {
    if (!window.ethereum) return;

    // Check if already connected
    window.ethereum
      .request({ method: 'eth_accounts' })
      .then(accounts => {
        if (accounts && accounts.length > 0) {
          applyWallet(accounts[0]);
        }
      })
      .catch(() => {});

    // Listen for account switches
    function handleAccountChange(accounts) {
      if (accounts.length === 0) {
        setUser(null);
      } else {
        applyWallet(accounts[0]);
      }
    }

    window.ethereum.on('accountsChanged', handleAccountChange);
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountChange);
    };
  }, []);

  function applyWallet(wallet) {
    const lower    = wallet.toLowerCase();
    const matched  = WALLET_TO_USER[lower] || buildUnknownUser(lower);
    setUser(matched);
  }

  // Called from Login page role card click (no MetaMask)
  function loginAsRole(role) {
    const found = Object.values(WALLET_TO_USER).find(u => u.role === role);
    if (found) setUser(found);
  }

  // Called when MetaMask connects
  function loginWithWallet(wallet) {
    applyWallet(wallet);
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      loginAsRole,
      loginWithWallet,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;