import React, { useState, useEffect } from 'react';
import { useAptosTransactions } from '../hooks/useAptosTransactions';

const WalletDemo = () => {
  const {
    account,
    getAccountBalance,
    getAccountInfo,
    submitHighScore,
    isLoading,
    error
  } = useAptosTransactions();
  
  const [balance, setBalance] = useState(null);
  const [accountInfo, setAccountInfo] = useState(null);
  const [demoScore] = useState(Math.floor(Math.random() * 10000));

  useEffect(() => {
    if (account?.address) {
      // Fetch account balance when wallet connects
      getAccountBalance().then(setBalance);
      getAccountInfo().then(setAccountInfo);
    }
  }, [account, getAccountBalance, getAccountInfo]);

  const handleSubmitScore = async () => {
    try {
      const result = await submitHighScore(demoScore);
      console.log('Score submitted:', result);
      alert(`Score ${demoScore} submitted successfully!`);
    } catch (err) {
      console.error('Failed to submit score:', err);
      alert('Failed to submit score. Check console for details.');
    }
  };

  if (!account) {
    return null; // Don't show demo if wallet not connected
  }

  return (
    <div className="wallet-demo">
      <div className="wallet-demo-content">
        <h3>Wallet Connected!</h3>
        
        <div className="account-info">
          <div className="info-item">
            <span className="info-label">Address:</span>
            <span className="info-value">{account.address}</span>
          </div>
          
          {balance !== null && (
            <div className="info-item">
              <span className="info-label">Balance:</span>
              <span className="info-value">{balance.toFixed(4)} APT</span>
            </div>
          )}
          
          {accountInfo && (
            <div className="info-item">
              <span className="info-label">Sequence:</span>
              <span className="info-value">{accountInfo.sequence_number}</span>
            </div>
          )}
        </div>

        <div className="demo-actions">
          <button
            className="btn btn--primary btn--sm"
            onClick={handleSubmitScore}
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : `Submit Demo Score: ${demoScore}`}
          </button>
        </div>

        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletDemo;