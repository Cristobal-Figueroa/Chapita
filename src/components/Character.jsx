import React, { useEffect, useState, forwardRef } from 'react';
import dazSprite from '../assets/sprites/daz.png'; // Sprite para movimiento hacia izquierda/arriba/abajo
import dazRunRightSprite from '../assets/sprites/daz-run-right.png'; // Sprite para movimiento hacia la derecha
import dazStandSprite from '../assets/sprites/daz-stand.png'; // Sprite para cuando está quieto
import { TILE_SIZE } from '../assets/maps/map1';

const Character = forwardRef(({ position, visible = true, direction = 'left' }, ref) => {
  // Estados para la posición visual del personaje (para animaciones suaves)
  const [visualPosition, setVisualPosition] = useState({ x: position.x, y: position.y });
  const [isMoving, setIsMoving] = useState(false);
  
  // Actualizar la posición visual cuando cambia la posición real
  useEffect(() => {
    // Marcar que el personaje está en movimiento
    setIsMoving(true);
    
    // Actualizar la posición visual con una demora mayor para la animación
    const timer = setTimeout(() => {
      setVisualPosition({ x: position.x, y: position.y });
      
      // Después de completar el movimiento, marcar que ya no está moviéndose
      // Aumentamos el tiempo que el personaje se muestra en estado de movimiento
      setTimeout(() => setIsMoving(false), 400);
    }, 50); // Mayor demora antes de iniciar el movimiento
    
    return () => clearTimeout(timer);
  }, [position]);
  
  if (!visible) return null;
  
  // Calcular un ligero rebote para la animación de movimiento
  const bounce = isMoving ? 'translateY(-5px)' : 'translateY(0)'; 
  
  // Seleccionar el sprite adecuado según si está en movimiento o quieto y la dirección
  let currentSprite;
  if (!isMoving) {
    // Si está quieto, usar el sprite de reposo
    currentSprite = dazStandSprite;
  } else {
    // Si está en movimiento, usar el sprite según la dirección
    currentSprite = direction === 'right' ? dazRunRightSprite : dazSprite;
  }
  
  // Estilo para el personaje
  const characterStyle = {
    position: 'absolute',
    left: `${visualPosition.x * TILE_SIZE}px`,
    top: `${visualPosition.y * TILE_SIZE}px`,
    width: `${TILE_SIZE}px`,
    height: `${TILE_SIZE}px`,
    backgroundImage: `url(${currentSprite})`,
    backgroundSize: 'contain', // Mantener el tamaño original del PNG
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    transform: `${bounce}`,
    zIndex: 10,
    // Transición más lenta para el movimiento, pero sin afectar al cambio de sprite
    transition: 'left 0.5s ease-in-out, top 0.5s ease-in-out, transform 0.5s',
    filter: isMoving ? 'brightness(1.3) drop-shadow(0 0 5px rgba(255, 255, 255, 0.7))' : 'brightness(1.1) drop-shadow(0 0 3px rgba(255, 255, 255, 0.5))', // Efecto de brillo mejorado
    imageRendering: 'pixelated' // Mantener el aspecto pixelado al hacer zoom
  };

  return <div style={characterStyle} ref={ref} />;
});

export default Character;
