import React, { useState, useCallback } from 'react';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import ResultsScreen from './components/ResultsScreen';
import ParticleContainer from './components/ParticleContainer';
import WalletSelector from './components/WalletSelector';
import LandingPage from './components/LandingPage';
import WalletWidget from './components/WalletWidget';
import { useGameState } from './hooks/useGameState';
import { useTaskbarControls } from './hooks/useTaskbarControls';
import { useWallet } from './components/AptosWalletProvider';
import './App.css';

function App() {
  const {
    gameState,
    startGame,
    endGame,
    updateScore,
    loseLife,
    loseLiveFromMissedToken,
    togglePause,
    createScreenFlash
  } = useGameState();

  const { connected, account } = useWallet();
  const [particles, setParticles] = useState([]);
  const [showLanding, setShowLanding] = useState(true);

  // Add taskbar controls
  useTaskbarControls(gameState, togglePause);

  const handleCreateParticles = useCallback((x, y, color, count) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const velocity = 3 + Math.random() * 4;
      const particle = {
        id: Math.random(),
        x: x,
        y: y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        color: color,
        life: 1.0,
        decay: 0.015 + Math.random() * 0.01,
        size: 2 + Math.random() * 3
      };
      newParticles.push(particle);
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  const updateParticles = useCallback(() => {
    setParticles(prev => prev
      .map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        life: particle.life - particle.decay,
        vy: particle.vy + 0.15,
        vx: particle.vx * 0.98
      }))
      .filter(particle => particle.life > 0)
    );
  }, []);

  const renderScreen = () => {
    switch (gameState.screen) {
      case 'start':
        return (
          <StartScreen
            bestScore={gameState.bestScore}
            onStartGame={startGame}
          />
        );
      case 'game':
        return (
          <GameScreen
            gameState={gameState}
            onEndGame={endGame}
            onUpdateScore={updateScore}
            onLoseLife={loseLife}
            onLoseLiveFromMissedToken={loseLiveFromMissedToken}
            onTogglePause={togglePause}
            onCreateParticles={handleCreateParticles}
            onCreateScreenFlash={createScreenFlash}
            updateParticles={updateParticles}
          />
        );
      case 'results':
        return (
          <ResultsScreen
            gameState={gameState}
            onStartGame={startGame}
            onShowStartScreen={handleBackToLanding}
          />
        );
      default:
        return null;
    }
  };

  const handleStartFromLanding = () => {
    setShowLanding(false);
    startGame();
  };

  const handleBackToLanding = () => {
    setShowLanding(true);
  };

  if (showLanding) {
    return (
      <div className="App">
        <LandingPage onStartGame={handleStartFromLanding} />
      </div>
    );
  }

  return (
    <div className="App">
      {!connected && (
        // Show navbar only when not connected
        <div className="game-header">
          <div className="game-nav-brand">
            <img src="/aptos-token.svg" alt="APT" className="game-nav-logo" />
            <button className="back-to-landing-btn" onClick={handleBackToLanding}>
              ← Back to Home
            </button>
          </div>
          <WalletSelector />
        </div>
      )}

      {renderScreen()}
      <ParticleContainer particles={particles} />
      
      {/* Show wallet widget when connected */}
      {connected && <WalletWidget />}
    </div>
  );
}

export default App;