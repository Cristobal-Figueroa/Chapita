import React, { useEffect, useState, forwardRef } from 'react';
import dazSprite from '../assets/sprites/daz.png'; // Sprite para movimiento hacia izquierda/arriba/abajo
import dazRightSprite from '../assets/sprites/daz-right.png'; // Sprite para girar a la derecha
import dazRunRightSprite from '../assets/sprites/daz-run-right.png'; // Sprite para correr hacia la derecha
import dazStandSprite from '../assets/sprites/daz-stand.png'; // Sprite para cuando está quieto
import dazLeftSprite from '../assets/sprites/daz-left.png'; // Sprite para girar a la izquierda
import { TILE_SIZE } from '../assets/maps/map1';

const Character = forwardRef(({ position, visible = true, direction = 'left' }, ref) => {
  // Estados para la posición visual del personaje (para animaciones suaves)
  const [visualPosition, setVisualPosition] = useState({ x: position.x, y: position.y });
  const [isMoving, setIsMoving] = useState(false);
  const [lastDirection, setLastDirection] = useState(direction); // Guardar la última dirección
  const [moveCount, setMoveCount] = useState(0); // Contador de movimientos en la misma dirección
  
  // Actualizar la posición visual cuando cambia la posición real
  useEffect(() => {
    // Marcar que el personaje está en movimiento
    setIsMoving(true);
    
    // Comprobar si sigue moviéndose en la misma dirección
    if (direction === lastDirection) {
      // Incrementar el contador de movimientos en la misma dirección
      setMoveCount(prevCount => prevCount + 1);
    } else {
      // Si cambió de dirección, reiniciar el contador
      setMoveCount(1);
      setLastDirection(direction);
    }
    
    // Actualizar la posición visual gradualmente
    // Esto creará una animación suave entre la posición anterior y la nueva
    setVisualPosition({ x: position.x, y: position.y });
    
    // Después de completar el movimiento, marcar que ya no está moviéndose
    const animationDuration = 300; // Duración de la animación en ms
    const timer = setTimeout(() => {
      setIsMoving(false);
    }, animationDuration);
    
    return () => clearTimeout(timer);
  }, [position, direction]);
  
  if (!visible) return null;
  
  // Calcular un ligero rebote para la animación de movimiento
  const bounce = isMoving ? 'translateY(-5px)' : 'translateY(0)'; 
  
  // Seleccionar el sprite adecuado según la dirección, estado de movimiento y contador de movimientos
  let currentSprite;
  
  if (!isMoving) {
    // Si está quieto, usar el sprite de reposo según la última dirección
    if (lastDirection === 'right') {
      currentSprite = dazRightSprite; // Quieto mirando a la derecha
    } else if (lastDirection === 'left') {
      currentSprite = dazLeftSprite; // Quieto mirando a la izquierda
    } else {
      currentSprite = dazStandSprite; // Quieto mirando abajo por defecto
    }
  } else {
    // Si está en movimiento
    if (direction === 'right') {
      // Para movimiento a la derecha, usar sprite según el contador de movimientos
      if (moveCount <= 1) {
        currentSprite = dazRightSprite; // Primer movimiento a la derecha (girar)
      } else {
        currentSprite = dazRunRightSprite; // Movimientos continuos a la derecha (correr)
      }
    } else if (direction === 'left') {
      // Para movimiento a la izquierda
      if (moveCount <= 1) {
        currentSprite = dazLeftSprite; // Primer movimiento a la izquierda
      } else {
        currentSprite = dazSprite; // Movimientos continuos a la izquierda
      }
    } else if (direction === 'down') {
      // Para movimiento hacia abajo usar el sprite de stand
      currentSprite = dazStandSprite;
    } else {
      // Para otras direcciones usar el sprite normal
      currentSprite = dazSprite;
    }
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
    // Transición suave para el movimiento entre casillas
    transition: 'left 0.3s ease-in-out, top 0.3s ease-in-out, transform 0.2s',
    filter: isMoving ? 'brightness(1.3) drop-shadow(0 0 5px rgba(255, 255, 255, 0.7))' : 'brightness(1.1) drop-shadow(0 0 3px rgba(255, 255, 255, 0.5))', // Efecto de brillo mejorado
    imageRendering: 'pixelated' // Mantener el aspecto pixelado al hacer zoom
  };

  return <div style={characterStyle} ref={ref} />;
});

export default Character;
