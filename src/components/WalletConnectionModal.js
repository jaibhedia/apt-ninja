import React from 'react';
import { useWallet } from './AptosWalletProvider';
import { useAptosService } from '../services/aptos_service.js';

const WalletConnectionModal = ({ onClose }) => {
  const {
    connect,
    connected,
    connecting,
    wallets,
  } = useWallet();
  
  const { handleAuthorizeSession, isSessionAuthorized } = useAptosService();

  const connectToWallet = (walletName) => {
    connect(walletName);
  };

  const getWalletStatus = (wallet) => {
    switch (wallet.readyState) {
      case 'Installed':
        return 'Ready';
      case 'NotDetected':
        return 'Install';
      default:
        return 'Loading';
    }
  };

  // Handle wallet connection and session authorization
  React.useEffect(() => {
    if (connected && !isSessionAuthorized) {
      // Automatically authorize session when wallet connects
      handleAuthorizeSession();
    }
  }, [connected, isSessionAuthorized, handleAuthorizeSession]);

  // Close modal if wallet gets connected and session is authorized
  React.useEffect(() => {
    if (connected && isSessionAuthorized) {
      onClose();
    }
  }, [connected, isSessionAuthorized, onClose]);

  return (
    <div className="wallet-connection-modal">
      <div className="wallet-modal-backdrop" onClick={onClose} />
      <div className="wallet-modal-content">
        <div className="wallet-modal-header">
          <h2>Connect Wallet to Play</h2>
          <p>You need to connect your wallet to start playing APT Ninja</p>
        </div>
        
        <div className="wallet-options">
          {wallets.map((wallet) => (
            <button
              key={wallet.name}
              className={`wallet-option ${wallet.readyState === 'Installed' ? 'available' : 'unavailable'}`}
              onClick={() => connectToWallet(wallet.name)}
              disabled={connecting}
            >
              <div className="wallet-option-info">
                <span className="wallet-option-name">{wallet.name}</span>
                <span className="wallet-option-status">
                  {getWalletStatus(wallet)}
                </span>
              </div>
              {wallet.readyState !== 'Installed' && (
                <span className="install-hint">Click to install</span>
              )}
            </button>
          ))}
        </div>
        
        <div className="wallet-modal-footer">
          <button 
            className="btn btn--secondary"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletConnectionModal;