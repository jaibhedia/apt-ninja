import React, { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import WalletConnectionModal from './WalletConnectionModal';
import { useAptosService } from '../services/aptos_service';

const StartScreen = ({ bestScore, onStartGame }) => {
  const { connected } = useWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const { handleAuthorizeSession, isSessionAuthorized } = useAptosService();

  const handlePlayClick = async () => {
    if (connected) {
        await handleAuthorizeSession();
    } else {
        setShowWalletModal(true);
    }
};

useEffect(() => {
    if (isSessionAuthorized) {
        onStartGame();
    }
}, [isSessionAuthorized, onStartGame]);
  
  return (
    <div className="screen start-screen">
      <div className="start-container">
        <div className="game-title">
          <h1>APT Ninja</h1>
          <div className="subtitle">Slice & Dice Adventure</div>
        </div>
        
                <div className="logo">
          <div className="aptos-token-logo">A</div>
        </div>
        
        <div className="instructions">
          <p>Slash <span className="highlight">Aptos tokens</span> to earn points!</p>
          <p>Avoid bombs or lose a life!</p>
        </div>
        
        <div className="best-score">
          <span>Best Score: <span>{bestScore}</span> points</span>
        </div>
        
        <button 
          className="btn btn--primary btn--lg play-btn" 
          type="button"
          onClick={handlePlayClick}
        >
          <span>{connected ? 'PLAY' : 'CONNECT WALLET TO PLAY'}</span>
        </button>
        
        {!connected && (
          <div className="wallet-required-notice">
            <p>🔒 Wallet connection required to play</p>
          </div>
        )}
      </div>
      
      {showWalletModal && (
        <WalletConnectionModal onClose={() => setShowWalletModal(false)} />
      )}
    </div>
  );
};

export default StartScreen;