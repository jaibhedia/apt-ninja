import { useState, useCallback } from 'react';

export const usePointPopups = () => {
  const [popups, setPopups] = useState([]);

  const addPopup = useCallback((x, y, points, type = 'token') => {
    const newPopup = {
      id: Date.now() + Math.random(),
      x: x,
      y: y,
      points: points,
      type: type, // 'token' or 'bomb'
      timestamp: Date.now()
    };

    setPopups(prev => [...prev, newPopup]);
  }, []);

  const removePopup = useCallback((id) => {
    setPopups(prev => prev.filter(popup => popup.id !== id));
  }, []);

  const clearAllPopups = useCallback(() => {
    setPopups([]);
  }, []);

  return {
    popups,
    addPopup,
    removePopup,
    clearAllPopups
  };
};