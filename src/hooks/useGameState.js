import { useState, useCallback } from 'react';

export const useGameState = () => {
  const [gameState, setGameState] = useState({
    screen: 'start',
    score: 0,
    lives: 3,
    bestScore: parseInt(localStorage.getItem('fruitNinjaBestScore')) || 0,
    isGameRunning: false,
    isPaused: false,
    totalSlashes: 0,
    aptosSlashed: 0,
    bombsHit: 0
  });

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      screen: 'game',
      score: 0,
      lives: 3,
      isGameRunning: true,
      isPaused: false,
      totalSlashes: 0,
      aptosSlashed: 0,
      bombsHit: 0
    }));
  }, []);

  const endGame = useCallback(() => {
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

  const updateScore = useCallback((points) => {
    setGameState(prev => ({
      ...prev,
      score: prev.score + points,
      aptosSlashed: prev.aptosSlashed + 1,
      totalSlashes: prev.totalSlashes + 1
    }));
  }, []);

  const loseLife = useCallback(() => {
    setGameState(prev => {
      const newLives = prev.lives - 1;
      const newState = {
        ...prev,
        lives: newLives,
        bombsHit: prev.bombsHit + 1,
        totalSlashes: prev.totalSlashes + 1
      };
      
      // End game when all lives are lost
      if (newLives <= 0) {
        setTimeout(() => {
          setGameState(current => {
            const finalBestScore = current.score > current.bestScore ? current.score : current.bestScore;
            if (finalBestScore > current.bestScore) {
              localStorage.setItem('fruitNinjaBestScore', finalBestScore.toString());
            }
            
            return {
              ...current,
              screen: 'results',
              isGameRunning: false,
              isPaused: false,
              bestScore: finalBestScore
            };
          });
        }, 1000);
      }
      
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
    togglePause,
    createParticles,
    createScreenFlash
  };
};