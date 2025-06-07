import React, { useEffect, useState } from 'react';
import dazSprite from '../assets/sprites/daz.png';
import { TILE_SIZE } from '../assets/maps/map1';

const Character = ({ position, visible = true, direction = 'left' }) => {
  // Estados para la posición visual del personaje (para animaciones suaves)
  const [visualPosition, setVisualPosition] = useState({ x: position.x, y: position.y });
  const [isMoving, setIsMoving] = useState(false);
  
  // Actualizar la posición visual cuando cambia la posición real
  useEffect(() => {
    // Marcar que el personaje está en movimiento
    setIsMoving(true);
    
    // Actualizar la posición visual con una pequeña demora para la animación
    const timer = setTimeout(() => {
      setVisualPosition({ x: position.x, y: position.y });
      
      // Después de completar el movimiento, marcar que ya no está moviéndose
      setTimeout(() => setIsMoving(false), 200);
    }, 10);
    
    return () => clearTimeout(timer);
  }, [position]);
  
  if (!visible) return null;
  
  // Calcular un ligero rebote para la animación de movimiento
  const bounce = isMoving ? 'translateY(-5px)' : 'translateY(0)'; 
  
  return (
    <div
      style={{
        position: 'absolute',
        left: `${visualPosition.x * TILE_SIZE}px`,
        top: `${visualPosition.y * TILE_SIZE}px`,
        width: `${TILE_SIZE}px`,
        height: `${TILE_SIZE}px`,
        backgroundImage: `url(${dazSprite})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transform: `${direction === 'right' ? 'scaleX(-1)' : 'scaleX(1)'} ${bounce}`,
        zIndex: 10,
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Transición más suave con efecto de rebote
        filter: isMoving ? 'brightness(1.2)' : 'brightness(1)' // Efecto de brillo al moverse
      }}
    />
  );
};

export default Character;
