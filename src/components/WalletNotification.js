import React, { useState, useEffect } from 'react';

const WalletNotification = ({ connected, account, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (connected && account) {
      setShouldShow(true);
      setIsVisible(true);
      
      // Auto-dismiss after 2 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          setShouldShow(false);
          if (onDismiss) onDismiss();
        }, 300); // Wait for fade out animation
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setTimeout(() => setShouldShow(false), 300);
    }
  }, [connected, account, onDismiss]);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShouldShow(false);
      if (onDismiss) onDismiss();
    }, 300);
  };

  if (!shouldShow) return null;

  return (
    <div className={`wallet-notification ${isVisible ? 'visible' : ''}`}>
      <div className="wallet-notification-content">
        <div className="wallet-notification-icon">
          ✅
        </div>
        <div className="wallet-notification-text">
          <div className="wallet-notification-title">
            Wallet Connected
          </div>
          <div className="wallet-notification-address">
            {formatAddress(account?.address)}
          </div>
        </div>
        <button 
          className="wallet-notification-close" 
          onClick={handleDismiss}
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default WalletNotification;