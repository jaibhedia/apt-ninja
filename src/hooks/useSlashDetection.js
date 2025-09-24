import { useState, useCallback, useRef } from 'react';

export const useSlashDetection = (
  canvasRef, 
  items, 
  gameState, 
  onUpdateScore, 
  onLoseLife, 
  onCreateParticles, 
  onCreateScreenFlash,
  addTrailPoint,  // Add blade trail function
  isSlashing     // Get slashing state from blade trail
) => {
  const [slashPath, setSlashPath] = useState([]);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const slashVelocity = useRef({ vx: 0, vy: 0 });
  const slashedItems = useRef(new Set()); // Track already slashed items

  const getMousePos = useCallback((e) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, [canvasRef]);

  const getDistanceToLine = useCallback((lineStart, lineEnd, point) => {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) {
      const dx2 = point.x - lineStart.x;
      const dy2 = point.y - lineStart.y;
      return Math.sqrt(dx2 * dx2 + dy2 * dy2);
    }
    
    const t = Math.max(0, Math.min(1, ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (length * length)));
    const projectionX = lineStart.x + t * dx;
    const projectionY = lineStart.y + t * dy;
    
    const distanceX = point.x - projectionX;
    const distanceY = point.y - projectionY;
    
    return Math.sqrt(distanceX * distanceX + distanceY * distanceY);
  }, []);

  const checkSlashCollisions = useCallback((currentPos, velocity) => {
    if (!isSlashing || velocity.speed < 3) return; // Require minimum speed for cutting
    
    items.forEach((item) => {
      if (item.slashed || slashedItems.current.has(item.id)) return;
      
      // Check if blade passes through the item
      const dx = currentPos.x - item.x;
      const dy = currentPos.y - item.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // More generous collision detection for better UX
      if (distance < item.radius + 15) {
        item.slashed = true;
        slashedItems.current.add(item.id);
        
        if (item.type.isGood) {
          // Aptos token - award points
          onUpdateScore(item.type.points);
          onCreateParticles(item.x, item.y, '#00ff88', 15);
          
          // Create slice effect with cutting angle
          const angle = Math.atan2(velocity.vy, velocity.vx);
          createSliceEffect(item, angle);
        } else {
          // Bomb - lose life
          onLoseLife();
          onCreateParticles(item.x, item.y, '#ff4444', 25);
          onCreateScreenFlash();
          
          // Create explosion effect
          createExplosionEffect(item);
        }
      }
    });
  }, [items, isSlashing, onUpdateScore, onLoseLife, onCreateParticles, onCreateScreenFlash]);

  const createSliceEffect = useCallback((item, angle) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    
    // Create two halves of the sliced item
    for (let i = 0; i < 2; i++) {
      const half = document.createElement('div');
      half.className = 'slice-half';
      half.style.position = 'fixed';
      half.style.left = (rect.left + item.x - 20) + 'px';
      half.style.top = (rect.top + item.y - 20) + 'px';
      half.style.width = '40px';
      half.style.height = '40px';
      half.style.background = item.type.color;
      half.style.borderRadius = '50%';
      half.style.pointerEvents = 'none';
      half.style.zIndex = '999';
      half.style.fontSize = '24px';
      half.style.display = 'flex';
      half.style.alignItems = 'center';
      half.style.justifyContent = 'center';
      half.textContent = item.type.symbol;
      
      // Add physics-based movement
      const direction = i === 0 ? 1 : -1;
      const perpAngle = angle + Math.PI / 2;
      const vx = Math.cos(perpAngle) * direction * 100;
      const vy = Math.sin(perpAngle) * direction * 100 - 50; // Add upward motion
      
      half.style.transform = `rotate(${angle}rad)`;
      half.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.8s ease-out';
      
      document.body.appendChild(half);
      
      // Animate the half
      requestAnimationFrame(() => {
        half.style.transform = `translate(${vx}px, ${vy}px) rotate(${angle + direction * Math.PI}rad) scale(0.3)`;
        half.style.opacity = '0';
      });
      
      setTimeout(() => {
        if (document.body.contains(half)) {
          document.body.removeChild(half);
        }
      }, 800);
    }
  }, [canvasRef]);

  const createExplosionEffect = useCallback((item) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const explosion = document.createElement('div');
    explosion.className = 'bomb-explosion';
    explosion.style.position = 'fixed';
    explosion.style.left = (rect.left + item.x - 50) + 'px';
    explosion.style.top = (rect.top + item.y - 50) + 'px';
    explosion.style.width = '100px';
    explosion.style.height = '100px';
    explosion.style.background = 'radial-gradient(circle, #ff4444, #ff8888, transparent)';
    explosion.style.borderRadius = '50%';
    explosion.style.pointerEvents = 'none';
    explosion.style.zIndex = '999';
    explosion.style.animation = 'explode 0.6s ease-out forwards';
    
    document.body.appendChild(explosion);
    
    setTimeout(() => {
      if (document.body.contains(explosion)) {
        document.body.removeChild(explosion);
      }
    }, 600);
  }, [canvasRef]);

  const startSlash = useCallback((e) => {
    if (gameState.screen !== 'game' || !gameState.isGameRunning || gameState.isPaused) return;
    
    const pos = getMousePos(e);
    lastMousePos.current = pos;
    slashVelocity.current = { vx: 0, vy: 0, speed: 0 };
    slashedItems.current.clear(); // Clear slashed items for new gesture
    
    // Add initial trail point
    addTrailPoint(pos.x, pos.y);
    setSlashPath([pos]);
  }, [gameState.screen, gameState.isGameRunning, gameState.isPaused, getMousePos, addTrailPoint]);

  const updateSlash = useCallback((e) => {
    if (!isSlashing || gameState.screen !== 'game' || !gameState.isGameRunning || gameState.isPaused) return;
    
    const currentPos = getMousePos(e);
    const lastPos = lastMousePos.current;
    
    // Calculate velocity
    const vx = currentPos.x - lastPos.x;
    const vy = currentPos.y - lastPos.y;
    const speed = Math.sqrt(vx * vx + vy * vy);
    
    slashVelocity.current = { vx, vy, speed };
    
    // Add trail point
    addTrailPoint(currentPos.x, currentPos.y);
    setSlashPath(prev => [...prev, currentPos]);
    
    // Check collisions with current velocity
    checkSlashCollisions(currentPos, slashVelocity.current);
    lastMousePos.current = currentPos;
  }, [isSlashing, gameState.screen, gameState.isGameRunning, gameState.isPaused, getMousePos, addTrailPoint, checkSlashCollisions]);

  const endSlash = useCallback(() => {
    if (!isSlashing) return;
    
    // Trail will fade naturally, don't clear immediately
    setTimeout(() => {
      setSlashPath([]);
      slashedItems.current.clear();
    }, 100);
  }, [isSlashing]);

  return {
    startSlash,
    updateSlash,
    endSlash,
    slashPath
  };
};