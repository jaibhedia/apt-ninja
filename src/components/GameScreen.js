import React, { useRef, useEffect, useCallback } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { useSlashDetection } from '../hooks/useSlashDetection';
import { useBladeTrail } from '../hooks/useBladeTrail';
import { useVisibility } from '../hooks/useVisibility';
import { usePointPopups } from '../hooks/usePointPopups';
import { useMissedTokenNotifications } from '../hooks/useMissedTokenNotifications';
import PointPopup from './PointPopup';
import MissedTokenNotification from './MissedTokenNotification';

const GameScreen = ({ 
  gameState, 
  onEndGame, 
  onUpdateScore, 
  onLoseLife, 
  onLoseLiveFromMissedToken,
  onTogglePause,
  onCreateParticles,
  onCreateScreenFlash,
  updateParticles
}) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isVisible = useVisibility();
  const wasVisibleRef = useRef(isVisible);
  
  const { popups, addPopup, removePopup, clearAllPopups } = usePointPopups();
  const { 
    notifications: missedNotifications, 
    addMissedNotification, 
    removeMissedNotification, 
    clearAllMissedNotifications 
  } = useMissedTokenNotifications();

  // Handle missed fruit without notification
  const handleMissedFruit = useCallback(() => {
    onLoseLiveFromMissedToken();
    // Removed addMissedNotification() to disable popup
  }, [onLoseLiveFromMissedToken]);

  const { 
    items, 
    slashTrail, 
    particles,
    spawnItem,
    updateGame,
    render,
    clearAllItems,
    cleanupExcessItems,
    itemCount
  } = useGameLoop(canvasRef, gameState, onEndGame, updateParticles, handleMissedFruit);

  const {
    bladeTrail,
    isSlashing,
    addTrailPoint,
    updateTrail,
    startSlashing,
    stopSlashing,
    renderBladeTrail
  } = useBladeTrail();

  const {
    startSlash,
    updateSlash,
    endSlash
  } = useSlashDetection(
    canvasRef,
    items,
    gameState,
    onUpdateScore,
    onLoseLife,
    onCreateParticles,
    onCreateScreenFlash,
    addTrailPoint,
    isSlashing,
    addPopup
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctxRef.current = ctx;

    // Resize canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    // Only run game loops when tab is visible and game is running
    if (!gameState.isGameRunning || gameState.isPaused || !isVisible) return;

    const gameLoop = setInterval(() => {
      updateGame();
      updateTrail(); // Update blade trail
    }, 16);
    const itemSpawner = setInterval(spawnItem, 1200);

    return () => {
      clearInterval(gameLoop);
      clearInterval(itemSpawner);
    };
  }, [gameState.isGameRunning, gameState.isPaused, updateGame, spawnItem, updateTrail, isVisible]);

  // Auto-pause when tab becomes invisible, resume when visible again
  useEffect(() => {
    if (wasVisibleRef.current !== isVisible && gameState.isGameRunning) {
      if (!isVisible && !gameState.isPaused) {
        // Tab became invisible and game was running - auto pause
        onTogglePause();
      }
    }
    wasVisibleRef.current = isVisible;
  }, [isVisible, gameState.isGameRunning, gameState.isPaused, onTogglePause]);

  // Clean up excess items periodically
  useEffect(() => {
    if (itemCount > 15) { // If items exceed safe threshold
      cleanupExcessItems();
    }
  }, [itemCount, cleanupExcessItems]);

  // Clear popups and notifications when game ends
  useEffect(() => {
    if (!gameState.isGameRunning) {
      clearAllPopups();
      clearAllMissedNotifications();
    }
  }, [gameState.isGameRunning, clearAllPopups, clearAllMissedNotifications]);

  useEffect(() => {
    const ctx = ctxRef.current;
    if (ctx) {
      render(ctx, items, slashTrail, particles);
      // Render blade trail on top
      renderBladeTrail(ctx);
    }
  }, [items, slashTrail, particles, render, renderBladeTrail]);

  const handleMouseDown = useCallback((e) => {
    startSlashing();
    startSlash(e);
  }, [startSlashing, startSlash]);

  const handleMouseMove = useCallback((e) => {
    updateSlash(e);
  }, [updateSlash]);

  const handleMouseUp = useCallback(() => {
    stopSlashing();
    endSlash();
  }, [stopSlashing, endSlash]);

  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    startSlashing();
    startSlash(e.touches[0]);
  }, [startSlashing, startSlash]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    updateSlash(e.touches[0]);
  }, [updateSlash]);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    stopSlashing();
    endSlash();
  }, [endSlash]);

  return (
    <div className="screen game-screen fullscreen">
      {/* Floating UI Elements */}
      <div className="game-ui-overlay">
        <div className="game-header-overlay">
          <div className="highest-score-container">
            <div className="highest-score-label">Best</div>
            <div className="highest-score-value">{gameState.bestScore}</div>
          </div>
          
          <div className="score-container">
            <div className="score-label">Score</div>
            <div className="score-value">{gameState.score}</div>
          </div>
        </div>
        
        {/* Lives container positioned below wallet widget */}
        <div className="lives-container-overlay">
          <div className="lives-label">Lives</div>
          <div className="hearts">
            {[1, 2, 3].map(i => {
              const heartIndex = i - 1;
              const heartHealth = gameState.heartHealth ? gameState.heartHealth[heartIndex] : 100;
              const isActiveHeart = heartHealth > 0;
              
              return (
                <div key={i} className="heart-container">
                  <span 
                    className={`heart ${!isActiveHeart ? 'lost' : ''}`}
                  >
                    ♥
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {itemCount > 10 && (
          <div className="performance-warning">
            <div style={{ 
              color: '#ff6b35', 
              fontSize: '12px', 
              fontWeight: 'bold',
              textShadow: '0 0 10px rgba(255, 107, 53, 0.8)'
            }}>
              Items: {itemCount}
            </div>
          </div>
        )}
        
        <button 
          className="btn btn--outline pause-btn-overlay" 
          type="button"
          onClick={onTogglePause}
        >
          <span>{gameState.isPaused ? '▶️' : '⏸️'}</span>
        </button>
        
        {/* Keyboard Shortcuts Hint - Only show when game is running */}
        {gameState.isGameRunning && (
          <div className="keyboard-shortcuts-hint">
            <div className="shortcut-hint">
              <span className="key-indicator">Space</span> or <span className="key-indicator">P</span> to pause
            </div>
          </div>
        )}
      </div>
      
      {/* Full Screen Canvas */}
      <canvas 
        ref={canvasRef}
        className="game-canvas fullscreen-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      
      {/* Point Popups */}
      <PointPopup popups={popups} onRemovePopup={removePopup} />
      
      {/* Missed Token Notifications - Disabled */}
      {/* <MissedTokenNotification 
        notifications={missedNotifications} 
        onRemoveNotification={removeMissedNotification} 
      /> */}
    </div>
  );
};

export default GameScreen;