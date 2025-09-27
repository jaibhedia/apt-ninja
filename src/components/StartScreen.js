import React from 'react';

const StartScreen = ({ bestScore, onStartGame }) => {
  const handlePlayClick = () => {
    onStartGame();
  };
  return (
    <div className="screen start-screen">
      <div className="start-container">
        <div className="game-title">
          <h1>Citrea Ninja</h1>
          <div className="subtitle">Slice & Dice Adventure</div>
        </div>
        
                <div className="logo">
          <div className="token-logo">⬡</div>
        </div>
        
        <div className="instructions">
          <p>Slash <span className="highlight">Citrea tokens</span> to earn points!</p>
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
          <span>PLAY</span>
        </button>
      </div>
    </div>
  );
};

export default StartScreen;