import React, { useState } from 'react';
import { useWallet } from './AptosWalletProvider';
import { useAptosService } from '../services/aptos_service.js';
import WalletConnectionModal from './WalletConnectionModal';

const StartScreen = ({ bestScore, onStartGame }) => {
  const { connected } = useWallet();
  const { isSessionAuthorized } = useAptosService();
  const [showWalletModal, setShowWalletModal] = useState(false);

  const handlePlayClick = () => {
    console.log(isSessionAuthorized)
    if (connected && isSessionAuthorized) {
      onStartGame();
    } else {
      setShowWalletModal(true);
    }
  };
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
          <span>
            {connected && isSessionAuthorized ? 'PLAY' : 
             connected ? 'AUTHORIZING SESSION...' : 
             'CONNECT WALLET TO PLAY'}
          </span>
        </button>
        
        {(!connected || !isSessionAuthorized) && (
          <div className="wallet-required-notice">
            <p>🔒 {!connected ? 'Wallet connection required to play' : 'Authorizing blockchain session...'}</p>
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