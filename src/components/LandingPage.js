import React, { useState, useEffect } from 'react';
import './LandingPage.css';

const LandingPage = ({ onStartGame }) => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [showWalletOptions, setShowWalletOptions] = useState(false);

  // Check if wallet is already connected
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectMetaMask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletConnected(true);
        setWalletAddress(accounts[0]);
        setShowWalletOptions(false);
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      window.open('https://metamask.io/', '_blank');
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
  };

  const handlePlayClick = (e) => {
    e.preventDefault();
    if (walletConnected) {
      onStartGame();
    } else {
      setShowWalletOptions(true);
    }
  };

  const formatAddress = (address) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  };

  return (
    <div className="landing-page">
      {/* Professional Gaming Navbar */}
      <nav className="game-navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <img 
              src="/citrea-logo.svg" 
              alt="Citrea Logo" 
              className="navbar-logo"
            />
            <div className="brand-text">
              <span className="brand-name">Citrea Ninja</span>
            </div>
          </div>
          
          <div className="navbar-menu">
            <button onClick={handlePlayClick} className="nav-link play-btn">Play</button>
            <a href="#how-to-play" className="nav-link">How to Play</a>
            <a href="#leaderboard" className="nav-link">Leaderboard</a>
            <div className="navbar-wallet">
              {walletConnected ? (
                <div className="wallet-connected">
                  <div className="wallet-info">
                    <span className="wallet-status">Connected</span>
                    <span className="wallet-address">{formatAddress(walletAddress)}</span>
                  </div>
                  <button onClick={disconnectWallet} className="disconnect-btn">Disconnect</button>
                </div>
              ) : (
                <button onClick={() => setShowWalletOptions(true)} className="connect-wallet-btn">
                  <span className="wallet-icon">👛</span>
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Background Video - Full Screen */}
      <video 
        className="hero-bg-video"
        autoPlay 
        muted 
        loop 
        playsInline
        preload="auto"
        disablePictureInPicture
      >
        <source src="/background-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Video Overlay */}
      <div className="hero-video-overlay"></div>
      
      {/* Main Content Area */}
      <main className="main-content">
        <video 
          className="hero-bg-video"
          autoPlay 
          muted 
          loop 
          playsInline
          preload="auto"
          disablePictureInPicture
        >
          <source src="/background-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Video Overlay */}
        <div className="hero-video-overlay"></div>
      
      </main>



      {/* Professional Footer */}
      <footer className="gaming-footer">
        <div className="footer-content">
          <div className="footer-main">
            <div className="footer-section">
              <h3>Citrea Ninja</h3>
              <p>The ultimate token slashing experience on Bitcoin L2</p>
              <div className="footer-brand">
                <img src="/citrea-logo.svg" alt="Citrea" className="footer-logo" />
              </div>
            </div>
            <div className="footer-section">
              <h3>Game</h3>
              <ul className="footer-links">
                <li><a href="#play">Play Now</a></li>
                <li><a href="#how-to-play">How to Play</a></li>
                <li><a href="#leaderboard">Leaderboard</a></li>
                <li><a href="#stats">Statistics</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Citrea Network</h3>
              <ul className="footer-links">
                <li><a href="https://citrea.xyz" target="_blank" rel="noopener noreferrer">Official Site</a></li>
                <li><a href="https://docs.citrea.xyz" target="_blank" rel="noopener noreferrer">Documentation</a></li>
                <li><a href="https://docs.citrea.xyz/user-guide/install-a-wallet" target="_blank" rel="noopener noreferrer">Install Wallet</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Community</h3>
              <ul className="footer-links">
                <li><a href="#discord" target="_blank" rel="noopener noreferrer">Discord</a></li>
                <li><a href="#twitter" target="_blank" rel="noopener noreferrer">Twitter</a></li>
                <li><a href="#github" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                <li><a href="#telegram" target="_blank" rel="noopener noreferrer">Telegram</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <p>&copy; 2025 Citrea Ninja. Built on Citrea Network.</p>
              <div className="footer-tech">
                <span>Powered by EVM • Bitcoin L2 • Zero-Knowledge Proofs</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Wallet Connection Modal */}
      {showWalletOptions && (
        <div className="wallet-modal-overlay" onClick={() => setShowWalletOptions(false)}>
          <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wallet-modal-header">
              <h3>Connect EVM Wallet</h3>
              <button onClick={() => setShowWalletOptions(false)} className="modal-close">✕</button>
            </div>
            <div className="wallet-modal-content">
              <p>Connect an EVM-compatible wallet to play Citrea Ninja</p>
              <div className="wallet-options">
                <button onClick={connectMetaMask} className="wallet-option">
                  <span>🦊</span>
                  <div>
                    <strong>MetaMask</strong>
                    <small>Connect using MetaMask wallet</small>
                  </div>
                </button>
              </div>
              <div className="wallet-info">
                <p><small>Don't have a wallet? <a href="https://docs.citrea.xyz/user-guide/install-a-wallet" target="_blank" rel="noopener noreferrer">Learn how to install one</a></small></p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LandingPage;