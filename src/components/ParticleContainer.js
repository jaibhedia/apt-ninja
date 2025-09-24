import React from 'react';

const ParticleContainer = ({ particles }) => {
  return (
    <div className="particle-container">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            backgroundColor: particle.color,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.life
          }}
        />
      ))}
    </div>
  );
};

export default ParticleContainer;