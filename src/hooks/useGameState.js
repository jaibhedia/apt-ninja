import { useState, useCallback } from 'react';
import { useAptosService } from '../services/aptos_service.js';

export const useGameState = () => {
  const { handleStartGame, handleSlashFruit, handleEndGame, handleAuthorizeSession, isSessionAuthorized } = useAptosService();
  const [gameState, setGameState] = useState({
    screen: 'start',
    score: 0,
    lives: 3,
    heartHealth: [100, 100, 100], // Health for each heart [heart1, heart2, heart3]
    maxHealth: 100,
    bestScore: parseInt(localStorage.getItem('fruitNinjaBestScore')) || 0,
    isGameRunning: false,
    isPaused: false,
    totalSlashes: 0,
    aptosSlashed: 0,
    bombsHit: 0
  });

  const startGame = useCallback(async () => {
    setGameState(prev => ({
      ...prev,
      screen: 'game',
      score: 0,
      lives: 3,
      heartHealth: [100, 100, 100], // Reset all hearts to full health
      isGameRunning: true,
      isPaused: false,
      totalSlashes: 0,
      aptosSlashed: 0,
      bombsHit: 0
    }));
    
    // Check if session is authorized first
    if (!isSessionAuthorized) {
      console.log('Session not authorized, authorizing session first...');
      try {
        await handleAuthorizeSession();
      } catch (error) {
        console.error('Failed to authorize session:', error);
        return; // Don't start the game if session authorization fails
      }
    }
    
    // Call Aptos service to start game on blockchain
    try {
      await handleStartGame();
    } catch (error) {
      console.error('Failed to start game on blockchain:', error);
    }
  }, [handleStartGame, handleAuthorizeSession, isSessionAuthorized]);

  const endGame = useCallback(async () => {
    setGameState(prev => {
      const newBestScore = prev.score > prev.bestScore ? prev.score : prev.bestScore;
      if (newBestScore > prev.bestScore) {
        localStorage.setItem('fruitNinjaBestScore', newBestScore.toString());
      }
      
      return {
        ...prev,
        screen: 'results',
        isGameRunning: false,
        isPaused: false,
        bestScore: newBestScore
      };
    });
    
    // Call Aptos service to end game on blockchain
    try {
      await handleEndGame();
    } catch (error) {
      console.error('Failed to end game on blockchain:', error);
    }
  }, [handleEndGame]);

  const showStartScreen = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      screen: 'start'
    }));
  }, []);

  const updateScore = useCallback(async (points) => {
    setGameState(prev => ({
      ...prev,
      score: prev.score + points,
      aptosSlashed: prev.aptosSlashed + 1,
      totalSlashes: prev.totalSlashes + 1
    }));
    
    // Record the slash on blockchain
    try {
      await handleSlashFruit(points);
    } catch (error) {
      console.error('Failed to record slash on blockchain:', error);
    }
  }, [handleSlashFruit]);

  const loseLife = useCallback(async () => {
    setGameState(prev => {
      // Only remove one heart if we have any hearts left
      if (prev.lives <= 0) return prev;
      
      const newLives = prev.lives - 1;
      const newHeartHealth = [...prev.heartHealth];
      
      // Remove one heart - find the last active heart and set it to 0
      for (let i = newHeartHealth.length - 1; i >= 0; i--) {
        if (newHeartHealth[i] > 0) {
          newHeartHealth[i] = 0;
          break;
        }
      }
      
      const newState = {
        ...prev,
        lives: newLives,
        heartHealth: newHeartHealth,
        bombsHit: prev.bombsHit + 1,
        totalSlashes: prev.totalSlashes + 1
      };
      
      return newState;
    });
    
    // Record bomb hit on blockchain (negative score change)
    try {
      await handleSlashFruit(-10); // Deduct points for bomb hit
    } catch (error) {
      console.error('Failed to record bomb hit on blockchain:', error);
    }
    
    // Check if game should end after state update
    setGameState(prev => {
      if (prev.lives <= 0) {
        setTimeout(async () => {
          await endGame();
        }, 1000);
      }
      return prev;
    });
  }, [handleSlashFruit, endGame]);
      


  const loseLiveFromMissedToken = useCallback(() => {
    setGameState(prev => {
      // Only remove one heart if we have any hearts left
      if (prev.lives <= 0) return prev;
      
      const newLives = prev.lives - 1;
      const newHeartHealth = [...prev.heartHealth];
      
      // Remove one heart - find the last active heart and set it to 0
      for (let i = newHeartHealth.length - 1; i >= 0; i--) {
        if (newHeartHealth[i] > 0) {
          newHeartHealth[i] = 0;
          break;
        }
      }
      
      const newState = {
        ...prev,
        lives: newLives,
        heartHealth: newHeartHealth,
        screen: newLives <= 0 ? 'results' : prev.screen
      };
      
      return newState;
    });
  }, []);

  const togglePause = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  }, []);

  const createParticles = useCallback((x, y, color, count) => {
    // This will be handled by the App component
    console.log('Creating particles:', { x, y, color, count });
  }, []);

  const createScreenFlash = useCallback(() => {
    const flash = document.createElement('div');
    flash.className = 'screen-flash';
    document.body.appendChild(flash);
    
    setTimeout(() => {
      if (document.body.contains(flash)) {
        document.body.removeChild(flash);
      }
    }, 300);
  }, []);

  return {
    gameState,
    startGame,
    endGame,
    showStartScreen,
    updateScore,
    loseLife,
    loseLiveFromMissedToken,
    togglePause,
    createParticles,
    createScreenFlash
  };
};