import { useState, useCallback } from 'react';

export const useGameState = () => {
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
    limesSlashed: 0,
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
      citreaSlashed: 0,
      bombsHit: 0
    }));
    
  }, []);

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
    
  }, []);

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
      citreaSlashed: prev.citreaSlashed + 1,
      totalSlashes: prev.totalSlashes + 1
    }));
    
  }, []);

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
    
    // Bomb hit recorded locally
    
    // Check if game should end after state update
    setGameState(prev => {
      if (prev.lives <= 0) {
        setTimeout(async () => {
          await endGame();
        }, 1000);
      }
      return prev;
    });
  }, [endGame]);
      


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