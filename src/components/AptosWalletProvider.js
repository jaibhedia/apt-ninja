import React, { createContext, useContext, useState, useCallback } from 'react';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

// Initialize Aptos client
const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within AptosWalletProvider');
  }
  return context;
};

const AptosWalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [wallet, setWallet] = useState(null);

  const connect = useCallback(async (walletName) => {
    setConnecting(true);
    try {
      // Check if Petra wallet is available
      if (window.aptos) {
        const response = await window.aptos.connect();
        setAccount({ address: response.address });
        setConnected(true);
        setWallet({ name: 'Petra' });
        console.log('Connected to Petra wallet:', response.address);
      } else {
        // Fallback - open Petra website
        window.open('https://petra.app/', '_blank');
        throw new Error('Petra wallet not found. Please install Petra wallet extension.');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please make sure Petra wallet is installed and try again.');
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      if (window.aptos && window.aptos.disconnect) {
        await window.aptos.disconnect();
      }
      setAccount(null);
      setConnected(false);
      setWallet(null);
      console.log('Wallet disconnected');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  }, []);

  const signAndSubmitTransaction = useCallback(async (transactionInput) => {
    if (!connected || !window.aptos) {
      throw new Error('Wallet not connected');
    }

    try {
      // Handle both old format (direct payload) and new format ({ payload })
      const transactionPayload = transactionInput.payload || transactionInput;
      const response = await window.aptos.signAndSubmitTransaction(transactionPayload);
      return response;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }, [connected]);

  // Mock wallets list for compatibility
  const wallets = [
    {
      name: 'Petra',
      readyState: window.aptos ? 'Installed' : 'NotDetected',
      url: 'https://petra.app/',
    }
  ];

  const value = {
    account,
    connected,
    connecting,
    wallet,
    wallets,
    connect,
    disconnect,
    signAndSubmitTransaction,
    aptos, // Expose aptos client
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export default AptosWalletProvider;