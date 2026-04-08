import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import Web3 from "web3";
import MediVaultABI from "./MediVaultABI.json";

const Web3Context = createContext(null);

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";
const EXPECTED_CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID || 1337);

export function Web3Provider({ children }) {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");

  const web3 = useMemo(() => {
    if (!window.ethereum) return null;
    return new Web3(window.ethereum);
  }, []);

  const contract = useMemo(() => {
    if (!web3 || !CONTRACT_ADDRESS) return null;
    return new web3.eth.Contract(MediVaultABI, CONTRACT_ADDRESS);
  }, [web3]);

  useEffect(() => {
    if (!window.ethereum) return;

    const onAccounts = (accounts) => {
      setAccount((accounts?.[0] || "").toLowerCase());
    };
    const onChain = (hexChainId) => {
      const id = typeof hexChainId === "string" ? parseInt(hexChainId, 16) : Number(hexChainId);
      setChainId(id);
    };

    window.ethereum.request({ method: "eth_accounts" }).then(onAccounts).catch(() => {});
    window.ethereum.request({ method: "eth_chainId" }).then(onChain).catch(() => {});

    window.ethereum.on("accountsChanged", onAccounts);
    window.ethereum.on("chainChanged", onChain);
    return () => {
      window.ethereum.removeListener("accountsChanged", onAccounts);
      window.ethereum.removeListener("chainChanged", onChain);
    };
  }, []);

  async function connectWallet() {
    if (!window.ethereum) {
      setError("MetaMask not found. Please install MetaMask.");
      return;
    }
    setIsConnecting(true);
    setError("");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount((accounts?.[0] || "").toLowerCase());
      const cid = await window.ethereum.request({ method: "eth_chainId" });
      setChainId(parseInt(cid, 16));
    } catch (e) {
      setError(e?.message || "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  }

  // Contract helpers
  function assertReady() {
    if (!contract) throw new Error("Contract not ready. Set VITE_CONTRACT_ADDRESS.");
    if (!account) throw new Error("Wallet not connected.");
    if (chainId && chainId !== EXPECTED_CHAIN_ID) {
      throw new Error(`Wrong network. Expected chain id ${EXPECTED_CHAIN_ID}.`);
    }
  }

  async function uploadDocumentOnChain({ ipfsHash, fileName, documentType, patientWallet }) {
    assertReady();
    return await contract.methods
      .uploadDocument(ipfsHash, fileName, documentType, patientWallet)
      .send({ from: account, gas: 300000 });
  }

  async function grantAccessOnChain({ doctorWallet, expiresAt = 0 }) {
    assertReady();
    return await contract.methods.grantAccess(doctorWallet, expiresAt).send({ from: account, gas: 200000 });
  }

  async function revokeAccessOnChain({ doctorWallet }) {
    assertReady();
    return await contract.methods.revokeAccess(doctorWallet).send({ from: account, gas: 120000 });
  }

  async function checkAccessOnChain({ patientWallet, doctorWallet }) {
    if (!contract) throw new Error("Contract not ready. Set VITE_CONTRACT_ADDRESS.");
    return await contract.methods.checkAccess(patientWallet, doctorWallet).call();
  }

  async function verifyDocumentOnChain({ ipfsHash }) {
    if (!contract) throw new Error("Contract not ready. Set VITE_CONTRACT_ADDRESS.");
    // verifyDocument is non-view in Solidity (writes audit log), but we use eth_call for demo verification.
    return await contract.methods.verifyDocument(ipfsHash).call({ from: account || undefined });
  }

  const value = {
    web3,
    contract,
    account,
    chainId,
    expectedChainId: EXPECTED_CHAIN_ID,
    isConnected: Boolean(account),
    isConnecting,
    error,
    connectWallet,
    uploadDocumentOnChain,
    grantAccessOnChain,
    revokeAccessOnChain,
    checkAccessOnChain,
    verifyDocumentOnChain,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error("useWeb3 must be used within Web3Provider");
  return ctx;
}

