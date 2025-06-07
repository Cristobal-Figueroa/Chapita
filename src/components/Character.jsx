import React, { useEffect, useState, forwardRef } from 'react';
import dazSprite from '../assets/sprites/daz.png'; // Sprite para movimiento hacia izquierda/arriba/abajo
import dazRightSprite from '../assets/sprites/daz-right.png'; // Sprite para girar a la derecha
import dazRunRightSprite from '../assets/sprites/daz-run-right.png'; // Sprite para correr hacia la derecha
import dazStandSprite from '../assets/sprites/daz-stand.png'; // Sprite para cuando está quieto
import dazLeftSprite from '../assets/sprites/daz-left.png'; // Sprite para girar a la izquierda
import { TILE_SIZE } from '../assets/maps/map1';

const Character = forwardRef(({ position, visible = true, direction = 'left', isKeyPressed = false }, ref) => {
  // Estados para la posición visual del personaje (para animaciones suaves)
  const [visualPosition, setVisualPosition] = useState({ x: position.x, y: position.y });
  const [isMoving, setIsMoving] = useState(false);
  const [lastDirection, setLastDirection] = useState(direction); // Guardar la última dirección
  const [moveCount, setMoveCount] = useState(0); // Contador de movimientos en la misma dirección
  const [idleTimer, setIdleTimer] = useState(null); // Temporizador para el estado de reposo
  const [isIdle, setIsIdle] = useState(false); // Estado de reposo (cuando no se presionan teclas por un tiempo)
  
  // Efecto para manejar cuando el usuario presiona o suelta las teclas
  useEffect(() => {
    // Función para limpiar el temporizador
    const clearIdleTimerFn = () => {
      if (idleTimer) {
        clearTimeout(idleTimer);
        setIdleTimer(null);
      }
    };
    
    if (isKeyPressed) {
      // Si se está presionando una tecla, no está en reposo
      if (isIdle) {
        setIsIdle(false);
      }
      
      // Limpiar cualquier temporizador de inactividad existente
      clearIdleTimerFn();
    } else {
      // Si no se está presionando ninguna tecla, iniciar temporizador para reposo
      if (!idleTimer && !isIdle) {
        console.log('Teclas liberadas, iniciando temporizador de reposo');
        const timer = setTimeout(() => {
          console.log('1.6 segundos sin presionar teclas, cambiando a reposo');
          setIsIdle(true);
        }, 1600); // 1.6 segundos
        setIdleTimer(timer);
      }
    }
    
    // Limpiar el temporizador cuando el componente se desmonte
    return clearIdleTimerFn;
  }, [isKeyPressed, idleTimer, isIdle]);

  // Actualizar la posición visual cuando cambia la posición real
  useEffect(() => {
    // Detectar si la posición ha cambiado realmente
    const positionChanged = visualPosition.x !== position.x || visualPosition.y !== position.y;
    
    if (positionChanged) {
      // Marcar que el personaje está en movimiento
      setIsMoving(true);
      
      // Si se está moviendo, no está en reposo
      if (isIdle) {
        setIsIdle(false);
      }
      
      // Limpiar cualquier temporizador de inactividad existente
      if (idleTimer) {
        clearTimeout(idleTimer);
        setIdleTimer(null);
      }
      
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
      setVisualPosition({ x: position.x, y: position.y });
      
      // Después de completar el movimiento, marcar que ya no está moviéndose
      const animationDuration = 150; // Duración de la animación en ms
      const timer = setTimeout(() => {
        setIsMoving(false);
      }, animationDuration);
      
      return () => clearTimeout(timer);
    }
  }, [position, direction, visualPosition, lastDirection, idleTimer, isIdle]);
  
  // Limpiar temporizadores cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
    };
  }, []);
  
  if (!visible) return null;
  
  // Calcular un ligero rebote para la animación de movimiento
  const bounce = isMoving ? 'translateY(-5px)' : 'translateY(0)'; 
  
  // Seleccionar el sprite adecuado según la dirección, estado de movimiento, contador de movimientos y estado de inactividad
  let currentSprite;
  
  if (isIdle) {
    // Si está en estado de inactividad (1.6 segundos sin presionar teclas)
    console.log('Mostrando sprite de reposo por inactividad');
    // El sprite de reposo debe ser el que mira hacia la última dirección
    if (lastDirection === 'right') {
      currentSprite = dazRightSprite; // Reposo mirando a la derecha
    } else if (lastDirection === 'left') {
      currentSprite = dazLeftSprite; // Reposo mirando a la izquierda
    } else {
      currentSprite = dazStandSprite; // Reposo mirando abajo por defecto
    }
  } else if (!isMoving) {
    // Si está quieto pero no inactivo, usar el sprite estático según la última dirección
    console.log('Mostrando sprite estático según dirección: ' + lastDirection);
    if (lastDirection === 'right') {
      currentSprite = dazRightSprite; // Quieto mirando a la derecha
    } else if (lastDirection === 'left') {
      currentSprite = dazLeftSprite; // Quieto mirando a la izquierda
    } else {
      currentSprite = dazStandSprite; // Quieto mirando abajo por defecto
    }
  } else {
    // Si está en movimiento
    console.log('Mostrando sprite de movimiento');
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
  
  // Constante para el tamaño del personaje (mantener el tamaño anterior aunque los tiles sean más pequeños)
  const CHARACTER_SIZE = 96; // El tamaño anterior de los tiles
  
  // Calcular el desplazamiento para centrar el personaje en el tile
  const offsetX = (TILE_SIZE - CHARACTER_SIZE) / 2;
  const offsetY = (TILE_SIZE - CHARACTER_SIZE) / 2;
  
  // Estilo para el personaje
  const characterStyle = {
    position: 'absolute',
    left: `${visualPosition.x * TILE_SIZE + offsetX}px`,
    top: `${visualPosition.y * TILE_SIZE + offsetY}px`,
    width: `${CHARACTER_SIZE}px`,
    height: `${CHARACTER_SIZE}px`,
    backgroundImage: `url(${currentSprite})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    transform: `${bounce}`,
    zIndex: 10,
    // Transición suave para el movimiento entre casillas (ajustada a la nueva velocidad)
    transition: 'left 0.15s ease-in-out, top 0.15s ease-in-out, transform 0.15s',
    filter: isMoving ? 'brightness(1.3) drop-shadow(0 0 5px rgba(255, 255, 255, 0.7))' : 'brightness(1.1) drop-shadow(0 0 3px rgba(255, 255, 255, 0.5))', // Efecto de brillo mejorado
    imageRendering: 'pixelated' // Mantener el aspecto pixelado al hacer zoom
  };

  return <div style={characterStyle} ref={ref} />;
});

export default Character;
