import { useState, useCallback, useEffect } from 'react';
import { useVisibility } from './useVisibility';

const ITEM_TYPES = [
  { name: "Aptos", symbol: "APT", color: "#ffd700", isGood: true, points: 10, spawnWeight: 0.9 },
  { name: "Bomb", symbol: "💣", color: "#ff4444", isGood: false, points: 0, spawnWeight: 0.1 }
];

const MAX_ITEMS = 12; // Limit maximum items on screen

const getRandomItemType = () => {
  const random = Math.random();
  let cumulative = 0;
  
  for (let itemType of ITEM_TYPES) {
    cumulative += itemType.spawnWeight;
    if (random <= cumulative) {
      return itemType;
    }
  }
  
  return ITEM_TYPES[0];
};

export const useGameLoop = (canvasRef, gameState, onEndGame, updateParticles, onFruitMissed, difficultyLevel = 1) => {
  const [items, setItems] = useState([]);
  const [slashTrail, setSlashTrail] = useState([]);
  const [particles, setParticles] = useState([]);
  const [aptosImage, setAptosImage] = useState(null);
  const isVisible = useVisibility();

  // Load Aptos token SVG image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      console.log('Aptos token SVG loaded successfully');
      setAptosImage(img);
    };
    img.onerror = () => {
      console.error('Failed to load Aptos token SVG');
    };
    img.src = '/aptos-token.svg';
  }, []);

  // Clean up items when tab becomes visible again to prevent accumulation
  useEffect(() => {
    if (isVisible && items.length > MAX_ITEMS) {
      setItems(prev => prev.slice(-MAX_ITEMS)); // Keep only the most recent items
    }
  }, [isVisible, items.length]);

  // Clear all trails when tab is not visible to prevent memory issues
  useEffect(() => {
    if (!isVisible) {
      setItems(prev => prev.map(item => ({ ...item, trail: [] })));
    }
  }, [isVisible]);

  const spawnItem = useCallback(() => {
    if (!gameState.isGameRunning || gameState.isPaused || !canvasRef.current || !isVisible) return;
    
    // Prevent spawning if there are too many items already
    if (items.length >= MAX_ITEMS) return;
    
    const canvas = canvasRef.current;
    const itemType = getRandomItemType();
    
    // Calculate speed multiplier based on difficulty (10% faster each level)
    const speedMultiplier = 1 + (difficultyLevel - 1) * 0.1;
    
    const item = {
      id: Math.random(),
      x: Math.random() * (canvas.width - 80) + 40,
      y: -40,
      vx: (Math.random() - 0.5) * 3 * speedMultiplier,
      vy: (2 + Math.random() * 2) * speedMultiplier,
      radius: itemType.name === 'Bomb' ? 25 : 30,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.15 * speedMultiplier,
      type: itemType,
      slashed: false,
      trail: [] // Store trail points for fluid motion
    };
    
    setItems(prev => [...prev, item]);
  }, [gameState.isGameRunning, gameState.isPaused, canvasRef, isVisible, items.length, difficultyLevel]);

  const updateGame = useCallback(() => {
    if (!gameState.isGameRunning || gameState.isPaused || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const now = Date.now();
    
    setItems(prev => prev
      .map(item => {
        const newX = item.x + item.vx;
        const newY = item.y + item.vy;
        
        // Only update trails if tab is visible to prevent accumulation
        let filteredTrail = item.trail || [];
        if (isVisible) {
          // Add current position to trail
          const newTrail = [...item.trail, { 
            x: item.x, 
            y: item.y, 
            timestamp: now,
            alpha: 1.0
          }];
          
          // Remove trail points older than 1 second and update alpha
          filteredTrail = newTrail
            .map(point => ({
              ...point,
              alpha: Math.max(0, 1 - (now - point.timestamp) / 1000) // Fade over 1 second
            }))
            .filter(point => point.alpha > 0)
            .slice(-8); // Keep only last 8 points for performance
        }
        
        return {
          ...item,
          x: newX,
          y: newY,
          rotation: item.rotation + item.rotationSpeed,
          trail: filteredTrail
        };
      })
      .filter(item => {
        // Check if a good item (fruit) fell off the bottom of the screen without being slashed
        if (item.y > canvas.height + 50 && item.type.isGood && !item.slashed && onFruitMissed) {
          console.log('Fruit missed! Losing a life.');
          onFruitMissed(); // Deduct a life when a fruit is missed and show notification
        }
        
        // More aggressive cleanup - remove items that are well off screen
        return item.y <= canvas.height + 100 && 
               item.x >= -100 && 
               item.x <= canvas.width + 100;
      })
    );

    updateParticles();
  }, [gameState.isGameRunning, gameState.isPaused, updateParticles, canvasRef, isVisible]);

  const render = useCallback((ctx, itemsToRender, trail, particlesToRender) => {
    if (!ctx || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    // Clear canvas with semi-transparent background
    ctx.fillStyle = 'rgba(34, 47, 62, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw items (aptos tokens and bombs)
    itemsToRender.forEach(item => {
      if (item.slashed) return;
      
      // Draw fluid trail first (before the object)
      if (item.trail && item.trail.length > 1) {
        ctx.save();
        
        // Create gradient trail
        for (let i = 1; i < item.trail.length; i++) {
          const prev = item.trail[i - 1];
          const curr = item.trail[i];
          
          if (prev && curr) {
            ctx.strokeStyle = item.type.name === 'Bomb' 
              ? `rgba(255, 68, 68, ${curr.alpha * 0.6})` // Red trail for bombs
              : `rgba(255, 215, 0, ${curr.alpha * 0.6})`; // Yellow trail for tokens
            
            ctx.lineWidth = Math.max(1, 3 * curr.alpha); // Thin trail that fades
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(curr.x, curr.y);
            ctx.stroke();
          }
        }
        
        ctx.restore();
      }
      
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.rotation);
      
      // Draw item shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.arc(2, 2, item.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw item
      if (item.type.name === 'Bomb') {
        // Special styling for bombs
        ctx.fillStyle = '#2A2A2A';
        ctx.beginPath();
        ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add bomb border
        ctx.strokeStyle = '#FF4444';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw bomb emoji
        ctx.font = `${item.radius}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.type.symbol, 0, 0);
      } else {
        // Draw Aptos Carrom Token - Clean, Professional Design
        ctx.save();
        
        // Create premium carrom token with elegant gradient
        const tokenGradient = ctx.createRadialGradient(
          -item.radius * 0.4, -item.radius * 0.4, 0,
          0, 0, item.radius * 1.2
        );
        tokenGradient.addColorStop(0, '#ffffff');
        tokenGradient.addColorStop(0.3, '#f8f9fa');
        tokenGradient.addColorStop(0.7, '#e9ecef');
        tokenGradient.addColorStop(1, '#dee2e6');
        
        // Draw main carrom token disc
        ctx.fillStyle = tokenGradient;
        ctx.beginPath();
        ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add carrom-style shadow for depth
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        
        // Reset shadow for borders
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Outer carrom token border - dark edge
        ctx.strokeStyle = '#6c757d';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner highlight border for carrom beveled edge
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, item.radius - 4, 0, Math.PI * 2);
        ctx.stroke();
        
        // Always use Aptos SVG logo in center
        if (aptosImage) {
          // Create clean circular clipping for the Aptos logo
          ctx.save();
          const logoRadius = item.radius * 0.65; // Logo takes 65% of token
          ctx.beginPath();
          ctx.arc(0, 0, logoRadius, 0, Math.PI * 2);
          ctx.clip();
          
          // Draw the Aptos SVG logo centered
          const logoSize = logoRadius * 2;
          ctx.drawImage(
            aptosImage,
            -logoRadius,
            -logoRadius,
            logoSize,
            logoSize
          );
          
          ctx.restore();
          
          // Add Aptos brand border around the logo
          ctx.strokeStyle = '#00d4aa';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, logoRadius + 1, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          // Fallback if SVG doesn't load - keep minimal
          ctx.fillStyle = '#00d4aa';
          ctx.font = `bold ${item.radius * 0.7}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('APT', 0, 0);
        }
        
        ctx.restore();
      }
      
      ctx.restore();
    });
    
    // Draw slash trail
    if (trail.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#FF6B35';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = '#FF6B35';
      ctx.shadowBlur = 15;
      
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);
      
      for (let i = 1; i < trail.length; i++) {
        ctx.lineTo(trail[i].x, trail[i].y);
      }
      
      ctx.stroke();
      ctx.restore();
    }
    
    // Draw particles on canvas
    particlesToRender.forEach(particle => {
      ctx.save();
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }, [canvasRef, aptosImage]);

  const clearAllItems = useCallback(() => {
    setItems([]);
    setSlashTrail([]);
    setParticles([]);
  }, []);

  const cleanupExcessItems = useCallback(() => {
    setItems(prev => {
      if (prev.length > MAX_ITEMS) {
        // Remove oldest items and clear their trails
        return prev.slice(-MAX_ITEMS).map(item => ({ ...item, trail: [] }));
      }
      return prev;
    });
  }, []);

  return {
    items,
    slashTrail,
    particles,
    setItems,
    setSlashTrail,
    setParticles,
    spawnItem,
    updateGame,
    render,
    clearAllItems,
    cleanupExcessItems,
    itemCount: items.length
  };
};