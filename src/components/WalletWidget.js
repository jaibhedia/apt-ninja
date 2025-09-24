import React from 'react';
import { useWallet } from './AptosWalletProvider';

const WalletWidget = () => {
  const { account, disconnect } = useWallet();

  if (!account) return null;

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="wallet-widget">
      <div className="wallet-widget-content">
        <div className="wallet-status">
          <span className="wallet-connected-dot"></span>
          <span className="wallet-address">{formatAddress(account.address)}</span>
        </div>
        <button 
          className="wallet-disconnect-btn"
          onClick={disconnect}
          title="Disconnect Wallet"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default WalletWidget;