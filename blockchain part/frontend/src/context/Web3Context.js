// src/context/Web3Context.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';
import MediVaultABI from '../utils/MediVaultABI.json';
import { useAuth } from './AuthContext';

const Web3Context = createContext(null);
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '';

export const Web3Provider = ({ children }) => {
  const { loginWithWallet } = useAuth();

  const [web3,         setWeb3]         = useState(null);
  const [account,      setAccount]      = useState(null);
  const [contract,     setContract]     = useState(null);
  const [networkId,    setNetworkId]    = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error,        setError]        = useState(null);

  // Auto-detect if MetaMask already connected on page load
  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum
      .request({ method: 'eth_accounts' })
      .then(accounts => {
        if (accounts && accounts.length > 0) {
          initFromAccount(accounts[0]);
        }
      })
      .catch(() => {});

    // Account switched in MetaMask
    function handleAccountChange(accounts) {
      if (accounts.length === 0) {
        setAccount(null);
        setWeb3(null);
        setContract(null);
      } else {
        initFromAccount(accounts[0]);
      }
    }

    // Network changed — reload
    function handleChainChange() {
      window.location.reload();
    }

    window.ethereum.on('accountsChanged', handleAccountChange);
    window.ethereum.on('chainChanged',    handleChainChange);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountChange);
      window.ethereum.removeListener('chainChanged',    handleChainChange);
    };
  }, []);

  async function initFromAccount(walletAddress) {
    try {
      const web3Instance = new Web3(window.ethereum);
      const network      = await web3Instance.eth.net.getId();

      let contractInstance = null;
      if (CONTRACT_ADDRESS && CONTRACT_ADDRESS !== '0xPasteYourContractAddressHere') {
        contractInstance = new web3Instance.eth.Contract(
          MediVaultABI,
          CONTRACT_ADDRESS
        );
      }

      setWeb3(web3Instance);
      setAccount(walletAddress);
      setNetworkId(Number(network));
      setContract(contractInstance);

      // ── KEY: update Auth user based on wallet ──────────
      loginWithWallet(walletAddress);

    } catch (err) {
      console.error('Web3 init error:', err);
    }
  }

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask not found. Please install MetaMask.');
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      await initFromAccount(accounts[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // ── Contract functions ─────────────────────────────────

  async function registerUserOnChain(userAddress, name, email, role) {
    if (!contract || !account) throw new Error('Wallet not connected');
    const roleMap = { admin: 1, doctor: 2, patient: 3, student: 4 };
    return await contract.methods
      .registerUser(userAddress, name, email, roleMap[role])
      .send({ from: account, gas: 300000 });
  }

  async function uploadDocumentOnChain(ipfsHash, fileName, documentType, patientAddress) {
    if (!contract || !account) throw new Error('Wallet not connected');
    return await contract.methods
      .uploadDocument(ipfsHash, fileName, documentType, patientAddress)
      .send({ from: account, gas: 300000 });
  }

  async function getPatientDocumentsOnChain(patientAddress) {
    if (!contract || !account) throw new Error('Wallet not connected');
    return await contract.methods
      .getPatientDocuments(patientAddress)
      .call({ from: account });
  }

  async function grantAccessOnChain(doctorAddress, expiresAt = 0) {
    if (!contract || !account) throw new Error('Wallet not connected');
    return await contract.methods
      .grantAccess(doctorAddress, expiresAt)
      .send({ from: account, gas: 200000 });
  }

  async function revokeAccessOnChain(doctorAddress) {
    if (!contract || !account) throw new Error('Wallet not connected');
    return await contract.methods
      .revokeAccess(doctorAddress)
      .send({ from: account, gas: 100000 });
  }

  async function verifyDocumentOnChain(ipfsHash) {
    if (!contract || !account) throw new Error('Wallet not connected');
    return await contract.methods
      .verifyDocument(ipfsHash)
      .call({ from: account });
  }

  async function checkAccessOnChain(patientAddress, doctorAddress) {
    if (!contract) throw new Error('Wallet not connected');
    return await contract.methods
      .checkAccess(patientAddress, doctorAddress)
      .call();
  }

  async function getStatsOnChain() {
    if (!contract) throw new Error('Wallet not connected');
    return await contract.methods.getStats().call();
  }

  return (
    <Web3Context.Provider value={{
      web3,
      account,
      contract,
      networkId,
      isConnecting,
      error,
      isConnected: !!account,
      connectWallet,
      registerUserOnChain,
      uploadDocumentOnChain,
      getPatientDocumentsOnChain,
      grantAccessOnChain,
      revokeAccessOnChain,
      verifyDocumentOnChain,
      checkAccessOnChain,
      getStatsOnChain,
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error('useWeb3 must be used inside Web3Provider');
  return ctx;
};

export default Web3Context;