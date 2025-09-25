import React from 'react';

const ResultsScreen = ({ gameState, onStartGame, onShowStartScreen }) => {
  const isNewBest = gameState.score > gameState.bestScore;

  return (
    <div className="screen results-screen">
      <div className="results-container">
        <div className="game-over-title">
          <h2>Game Over!</h2>
        </div>
        
        <div className="final-stats">
          <div className="final-score">
            <div className="stat-label">Final Score</div>
            <div className="stat-value">{gameState.score}</div>
            <div className="stat-unit">points</div>
          </div>
          
          {isNewBest && (
            <div className="new-best">
              🎉 New Best Score! 🎉
            </div>
          )}
          
          <div className="game-stats">
            <div className="stat-item">
              <span className="stat-label">Aptos Tokens Slashed:</span>
              <span className="stat-value">{gameState.aptosSlashed}</span>
            </div>
          </div>
        </div>
        
        <div className="results-buttons">
          <button 
            className="btn btn--primary btn--lg" 
            type="button"
            onClick={onStartGame}
          >
            <span>Play Again</span>
          </button>
          <button 
            className="btn btn--secondary btn--lg" 
            type="button"
            onClick={onShowStartScreen}
          >
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;