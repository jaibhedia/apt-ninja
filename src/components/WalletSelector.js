import React, { useState } from 'react';
import { useWallet } from './AptosWalletProvider';

const WalletSelector = () => {
  const {
    connect,
    disconnect,
    account,
    connected,
    connecting,
    wallet,
    wallets,
  } = useWallet();
  
  const [showWalletList, setShowWalletList] = useState(false);

  const onWalletButtonClick = () => {
    if (connected) {
      disconnect();
    } else {
      const availableWallets = wallets.filter(w => w.readyState === 'Installed');
      if (availableWallets.length === 1) {
        // Connect directly if only one wallet is available
        connect(availableWallets[0].name);
      } else if (availableWallets.length > 1) {
        // Show wallet selection if multiple wallets available
        setShowWalletList(true);
      } else {
        // Try to connect to any wallet (will prompt user to install)
        if (wallets.length > 0) {
          connect(wallets[0].name);
        }
      }
    }
  };

  const connectToWallet = (walletName) => {
    connect(walletName);
    setShowWalletList(false);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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

  return (
    <div className="wallet-selector">
      {connected && account ? (
        <div className="wallet-info">
          <div className="wallet-details">
            <span className="wallet-name">{wallet?.name || 'Connected'}</span>
            <span className="wallet-address">
              {formatAddress(account.address)}
            </span>
          </div>
          <button 
            className="btn btn--secondary btn--sm disconnect-btn"
            onClick={onWalletButtonClick}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <>
          <button 
            className="btn btn--primary btn--sm connect-btn"
            onClick={onWalletButtonClick}
            disabled={connecting}
          >
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
          
          {showWalletList && (
            <div className="wallet-list-modal">
              <div className="wallet-list-backdrop" onClick={() => setShowWalletList(false)} />
              <div className="wallet-list">
                <h3>Select Wallet</h3>
                <div className="wallet-options">
                  {wallets.map((w) => (
                    <button
                      key={w.name}
                      className={`wallet-option ${w.readyState === 'Installed' ? 'available' : 'unavailable'}`}
                      onClick={() => connectToWallet(w.name)}
                      disabled={connecting}
                    >
                      <div className="wallet-option-info">
                        <span className="wallet-option-name">{w.name}</span>
                        <span className="wallet-option-status">
                          {getWalletStatus(w)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                <button 
                  className="btn btn--secondary btn--sm close-wallet-list"
                  onClick={() => setShowWalletList(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WalletSelector;