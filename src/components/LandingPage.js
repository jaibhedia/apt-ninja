import React, { useState } from 'react';
import { useWallet } from './AptosWalletProvider';
import WalletSelector from './WalletSelector';
import WalletConnectionModal from './WalletConnectionModal';
import WalletNotification from './WalletNotification';
import './LandingPage.css';

const LandingPage = ({ onStartGame }) => {
  const { connected, account } = useWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const handlePlayClick = () => {
    if (connected) {
      onStartGame();
    } else {
      setNotificationMessage('Please connect your wallet to play!');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      setShowWalletModal(true);
    }
  };

  return (
    <div className="landing-page">
      {/* Gaming Navbar */}
      <nav className="gaming-navbar">
        <div className="navbar-content">
          <div className="navbar-brand">
            <img 
              src="/logo.png" 
              alt="APT Ninja Logo" 
              className="navbar-logo"
            />
            <h1 className="navbar-title">APT Ninja</h1>
          </div>
          <div className="navbar-nav">
            <WalletSelector />
          </div>
        </div>
      </nav>

      {/* Gaming Hero Section */}
      <section className="gaming-hero">
        {/* Background Video */}
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
        
        <div className="hero-badge">
          🎮 Blockchain Gaming Experience
        </div>

        <h1 className="hero-title">APT Ninja</h1>
        <p className="hero-subtitle">Master the art of blockchain slicing</p>
        <p className="hero-description">
          Master the art of coin collection in this fast-paced blockchain ninja game powered by Aptos. 
          Connect your wallet and test your reflexes in an immersive gaming experience 
          that combines skill with blockchain technology.
        </p>

        {/* Gaming Stats */}
        <div className="gaming-stats">
          <div className="gaming-stat">
            <span className="stat-number">10+</span>
            <span className="stat-label">Players</span>
          </div>
          <div className="gaming-stat">
            <span className="stat-number">500+</span>
            <span className="stat-label">Slices</span>
          </div>
          <div className="gaming-stat">
            <span className="stat-number">99.9%</span>
            <span className="stat-label">Uptime</span>
          </div>
        </div>

        <div className="gaming-cta">
          <button
            onClick={handlePlayClick}
            className="gaming-play-btn"
          >
            {connected ? '🎮 Play Now' : '🔗 Connect & Play'}
          </button>
        </div>
      </section>

      {/* Video Section */}
      <section className="gaming-video-section" id="gameplay">
        <div className="video-content">
          <h2 className="section-title">Epic Ninja Gameplay</h2>
          <p style={{ marginBottom: '3rem', opacity: 0.7, fontSize: '1.1rem' }}>
            Watch epic ninja action and master the slicing techniques
          </p>
          <div className="video-placeholder">
            <div className="video-play-content">
              <div className="video-play-btn">
                <div className="play-triangle"></div>
              </div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', color: 'white' }}>
                Gameplay Trailer
              </h3>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)' }}>
                Coming Soon - Epic Ninja Action
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '5rem 2rem', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 className="section-title" style={{ marginBottom: '3rem' }}>
            Ultimate Gaming Features
          </h2>
          <div className="gaming-stats" style={{ justifyContent: 'center', maxWidth: '100%' }}>
            <div className="gaming-stat">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
              <h3 style={{ marginBottom: '1rem', color: '#32b8c6', fontFamily: 'Orbitron, monospace' }}>Lightning Fast</h3>
              <p style={{ opacity: 0.7 }}>Powered by Aptos blockchain for instant transactions</p>
            </div>
            
            <div className="gaming-stat">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
              <h3 style={{ marginBottom: '1rem', color: '#32b8c6', fontFamily: 'Orbitron, monospace' }}>Global Arena</h3>
              <p style={{ opacity: 0.7 }}>Compete with elite ninja warriors worldwide</p>
            </div>
            
            <div className="gaming-stat">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
              <h3 style={{ marginBottom: '1rem', color: '#32b8c6', fontFamily: 'Orbitron, monospace' }}>Secure Vault</h3>
              <p style={{ opacity: 0.7 }}>Your achievements safely stored on blockchain</p>
            </div>

            <div className="gaming-stat">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>�</div>
              <h3 style={{ marginBottom: '1rem', color: '#32b8c6', fontFamily: 'Orbitron, monospace' }}>Precision Mode</h3>
              <p style={{ opacity: 0.7 }}>Master the blade with perfect slicing mechanics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gaming Footer */}
      <footer className="gaming-footer">
        <div className="footer-content">
          <div className="footer-main">
            <div className="footer-section">
              <h3>Game</h3>
              <ul className="footer-links">
                <li><a href="#play">Play Now</a></li>
                <li><a href="#leaderboard">Leaderboard</a></li>
                <li><a href="#achievements">Achievements</a></li>
                <li><a href="#tournaments">Tournaments</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Blockchain</h3>
              <ul className="footer-links">
                <li><a href="#wallet">Wallet Guide</a></li>
                <li><a href="#aptos">Aptos Network</a></li>
                <li><a href="#security">Security</a></li>
                <li><a href="#nfts">Game NFTs</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Community</h3>
              <ul className="footer-links">
                <li><a href="#discord">Discord</a></li>
                <li><a href="#twitter">Twitter</a></li>
                <li><a href="#reddit">Reddit</a></li>
                <li><a href="#blog">Dev Blog</a></li>
              </ul>
              <div className="social-links">
                <a href="#" className="social-link">💬</a>
                <a href="#" className="social-link">🐦</a>
                <a href="#" className="social-link">📺</a>
                <a href="#" className="social-link">📱</a>
              </div>
            </div>
            <div className="footer-section">
              <h3>Support</h3>
              <ul className="footer-links">
                <li><a href="#help">Help Center</a></li>
                <li><a href="#contact">Contact Team</a></li>
                <li><a href="#bugs">Report Bugs</a></li>
                <li><a href="#feedback">Feedback</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 APT Ninja. Elite blockchain gaming experience. Built on Aptos Network.</p>
          </div>
        </div>
      </footer>

      {/* Wallet Connection Modal */}
      {showWalletModal && (
        <WalletConnectionModal 
          onClose={() => setShowWalletModal(false)}
          onConnect={() => {
            setShowWalletModal(false);
            // Connection will be handled by WalletSelector
          }}
        />
      )}

      <WalletNotification 
        show={showNotification}
        message={notificationMessage}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
};

export default LandingPage;