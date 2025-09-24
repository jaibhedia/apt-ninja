import React, { useState } from 'react';
import { useWallet } from './AptosWalletProvider';
import WalletSelector from './WalletSelector';
import WalletConnectionModal from './WalletConnectionModal';

const LandingPage = ({ onStartGame }) => {
  const { connected, account } = useWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);

  const handlePlayClick = () => {
    if (connected) {
      onStartGame();
    } else {
      setShowWalletModal(true);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/aptos-token.svg" alt="APT" style={{ width: '40px', height: '40px' }} />
          <h1 style={{ 
            margin: 0, 
            fontSize: '1.5rem', 
            background: 'linear-gradient(135deg, #32b8c6, #21808d)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>
            APT Ninja
          </h1>
        </div>
        <WalletSelector />
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        <img src="/aptos-token.svg" alt="Aptos" style={{ width: '80px', height: '80px', marginBottom: '2rem' }} />
        
        <h1 style={{ 
          fontSize: '3rem', 
          marginBottom: '1rem', 
          background: 'linear-gradient(135deg, #32b8c6, #21808d)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          APT Ninja
        </h1>
        
        <p style={{ 
          fontSize: '1.2rem', 
          marginBottom: '3rem', 
          opacity: 0.8, 
          maxWidth: '600px', 
          margin: '0 auto 3rem' 
        }}>
          Master the art of coin collection in this fast-paced blockchain ninja game powered by Aptos
        </p>

        {/* Action Button */}
        <div style={{ marginBottom: '4rem' }}>
          {connected ? (
            <button 
              onClick={handlePlayClick}
              style={{
                background: 'linear-gradient(135deg, #32b8c6, #21808d)',
                border: 'none',
                color: 'white',
                padding: '1rem 2rem',
                fontSize: '1.2rem',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(50, 184, 198, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              🎮 Play Now
            </button>
          ) : (
            <div>
              <p style={{ marginBottom: '1rem', opacity: 0.7 }}>
                🔒 Connect your wallet to start playing
              </p>
              <button 
                onClick={handlePlayClick}
                style={{
                  background: 'linear-gradient(135deg, #32b8c6, #21808d)',
                  border: 'none',
                  color: 'white',
                  padding: '1rem 2rem',
                  fontSize: '1.2rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(50, 184, 198, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                🔗 Connect Wallet to Play
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Video Section */}
      <section style={{ 
        padding: '4rem 2rem', 
        textAlign: 'center', 
        backgroundColor: 'rgba(0,0,0,0.3)' 
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#32b8c6' }}>
            See APT Ninja in Action
          </h2>
          <p style={{ marginBottom: '3rem', opacity: 0.7 }}>
            Watch gameplay footage and master the ninja techniques
          </p>
          
          {/* Video Placeholder */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '400px',
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: '15px',
            border: '2px solid rgba(50, 184, 198, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            overflow: 'hidden'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = 'rgba(50, 184, 198, 0.6)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(50, 184, 198, 0.2)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = 'rgba(50, 184, 198, 0.3)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            {/* Play Button */}
            <div style={{
              position: 'absolute',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'rgba(50, 184, 198, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                border: '2px solid rgba(255,255,255,0.3)'
              }}>
                <div style={{
                  width: '0',
                  height: '0',
                  borderLeft: '20px solid white',
                  borderTop: '15px solid transparent',
                  borderBottom: '15px solid transparent',
                  marginLeft: '5px'
                }}></div>
              </div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem' }}>Gameplay Trailer</h3>
              <p style={{ margin: 0, opacity: 0.7 }}>Coming Soon - 2:30 Duration</p>
            </div>
            
            {/* Background Pattern */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2332b8c6' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              zIndex: 1
            }}></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '3rem', color: '#32b8c6' }}>
            Game Features
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '2rem' 
          }}>
            <div style={{ 
              padding: '2rem', 
              backgroundColor: 'rgba(0,0,0,0.3)', 
              borderRadius: '10px',
              border: '1px solid rgba(50, 184, 198, 0.2)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
              <h3 style={{ marginBottom: '1rem', color: '#32b8c6' }}>Lightning Fast</h3>
              <p style={{ opacity: 0.7 }}>Powered by Aptos blockchain for instant transactions</p>
            </div>
            
            <div style={{ 
              padding: '2rem', 
              backgroundColor: 'rgba(0,0,0,0.3)', 
              borderRadius: '10px',
              border: '1px solid rgba(50, 184, 198, 0.2)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
              <h3 style={{ marginBottom: '1rem', color: '#32b8c6' }}>Global Leaderboard</h3>
              <p style={{ opacity: 0.7 }}>Compete with players worldwide</p>
            </div>
            
            <div style={{ 
              padding: '2rem', 
              backgroundColor: 'rgba(0,0,0,0.3)', 
              borderRadius: '10px',
              border: '1px solid rgba(50, 184, 198, 0.2)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
              <h3 style={{ marginBottom: '1rem', color: '#32b8c6' }}>Secure Wallet</h3>
              <p style={{ opacity: 0.7 }}>Your progress is securely stored on blockchain</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        borderTop: '1px solid rgba(255,255,255,0.1)',
        opacity: 0.7
      }}>
        <p>© 2025 APT Ninja. Powered by Aptos Blockchain.</p>
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
    </div>
  );
};

export default LandingPage;