import React, { useEffect, useState, forwardRef } from 'react';
import dazSprite from '../assets/sprites/daz.png'; // Sprite para movimiento hacia izquierda/arriba/abajo
import dazRightSprite from '../assets/sprites/daz-right.png'; // Sprite para girar a la derecha
import dazRunRightSprite from '../assets/sprites/daz-run-right.png'; // Sprite para correr hacia la derecha
import dazStandSprite from '../assets/sprites/daz-stand.png'; // Sprite para cuando está quieto
import dazLeftSprite from '../assets/sprites/daz-left.png'; // Sprite para girar a la izquierda
import { TILE_SIZE } from '../assets/maps/map1';

// Colores para diferenciar jugadores
const PLAYER_COLORS = [
  '#FF5733', // Naranja
  '#33FF57', // Verde
  '#3357FF', // Azul
  '#FF33F5', // Rosa
  '#33FFF5', // Cian
  '#F5FF33'  // Amarillo
];

const Character = forwardRef(({ 
  position, 
  visible = true, 
  direction = 'left', 
  isKeyPressed = false, 
  isOtherPlayer = false, 
  username = 'Jugador'
}, ref) => {
  // Estados para la posición visual del personaje (para animaciones suaves)
  const [visualPosition, setVisualPosition] = useState({ x: position.x, y: position.y });
  const [isMoving, setIsMoving] = useState(false);
  const [lastDirection, setLastDirection] = useState(direction); // Guardar la última dirección
  const [moveCount, setMoveCount] = useState(0); // Contador de movimientos en la misma dirección
  const [idleTimer, setIdleTimer] = useState(null); // Temporizador para el estado de reposo
  const [isIdle, setIsIdle] = useState(false); // Estado de reposo (cuando no se presionan teclas por un tiempo)
  
  // Efecto SOLO para manejar cuando el usuario presiona o suelta las teclas
  // Este es el único lugar donde se maneja el estado de reposo
  useEffect(() => {
    if (isKeyPressed) {
      // Si se está presionando una tecla, salir inmediatamente del estado de reposo
      if (isIdle) {
        console.log('Tecla presionada, saliendo del estado de reposo');
        setIsIdle(false);
      }
      
      // Limpiar cualquier temporizador de inactividad existente
      if (idleTimer) {
        clearTimeout(idleTimer);
        setIdleTimer(null);
      }
    } else {
      // Si no se está presionando ninguna tecla, iniciar temporizador para reposo
      // Asegurarse de que no hay temporizador activo ya
      if (!idleTimer) {
        console.log('Teclas liberadas, iniciando temporizador de reposo');
        const timer = setTimeout(() => {
          console.log('0.5 segundos sin presionar teclas, cambiando a reposo');
          // Pasar a estado de reposo pero manteniendo la orientación
          setIsIdle(true);
        }, 500); // 0.5 segundos
        setIdleTimer(timer);
      }
    }
    
    // Limpiar el temporizador cuando el componente se desmonte
    return () => {
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
    };
  }, [isKeyPressed, idleTimer]);

  // Actualizar la posición visual cuando cambia la posición real
  // Este efecto NO afecta al estado de reposo
  useEffect(() => {
    // Detectar si la posición ha cambiado realmente
    const positionChanged = visualPosition.x !== position.x || visualPosition.y !== position.y;
    
    if (positionChanged) {
      // Marcar que el personaje está en movimiento SOLO cuando cambia de cuadradito
      setIsMoving(true);
      
      // Actualizar la posición visual gradualmente
      setVisualPosition({ x: position.x, y: position.y });
      
      // Después de completar el movimiento, marcar que ya no está moviéndose
      const animationDuration = 150; // Duración de la animación en ms
      const timer = setTimeout(() => {
        setIsMoving(false);
      }, animationDuration);
      
      return () => clearTimeout(timer);
    }
  }, [position, visualPosition]);
  
  // Efecto separado para manejar cambios de dirección
  useEffect(() => {
    // Actualizar la dirección y el contador de movimientos
    if (direction !== lastDirection) {
      // Si cambió de dirección, actualizar la dirección pero mantener el estado
      console.log('Cambio de dirección a: ' + direction + ', manteniendo estado actual');
      
      // Detectar si es un cambio a dirección opuesta
      const isOppositeDirection = 
        (direction === 'right' && lastDirection === 'left') ||
        (direction === 'left' && lastDirection === 'right') ||
        (direction === 'up' && lastDirection === 'down') ||
        (direction === 'down' && lastDirection === 'up');
      
      if (isOppositeDirection) {
        console.log('Dirección opuesta detectada, mostrando sprite de reposo en nueva dirección');
        // No activar movimiento, solo cambiar dirección
        setIsMoving(false);
      }
      
      setMoveCount(1);
      setLastDirection(direction);
    } else {
      // Si sigue en la misma dirección y está moviéndose, incrementar el contador
      if (isMoving) {
        setMoveCount(prevCount => prevCount + 1);
      }
    }
  }, [direction, lastDirection, isMoving]);
  
  if (!visible) return null;
  
  // Calcular un ligero rebote para la animación de movimiento
  const bounce = isMoving ? 'translateY(-5px)' : 'translateY(0)'; 
  
  // Seleccionar el sprite adecuado según el estado (movimiento, quieto, reposo) y dirección
  let currentSprite;
  
  // Primero verificamos si está en estado de reposo (0.5 segundos sin teclas)
  if (isIdle) {
    // Estado de reposo: mostrar sprite estático según la última dirección
    console.log('ESTADO: REPOSO (0.5 segundos sin teclas) - Orientación: ' + 
               (lastDirection === 'right' ? 'DERECHA' : 
                lastDirection === 'left' ? 'IZQUIERDA' : 'ABAJO'));
                
    if (lastDirection === 'right') {
      currentSprite = dazRightSprite; // Reposo mirando a la derecha
    } else if (lastDirection === 'left') {
      currentSprite = dazLeftSprite; // Reposo mirando a la izquierda
    } else {
      currentSprite = dazStandSprite; // Reposo mirando abajo por defecto
    }
  }
  // Si no está en reposo, verificamos si está en movimiento
  else if (isMoving) {
    // Está en movimiento activo (cambiando de posición)
    console.log('ESTADO: MOVIMIENTO - Dirección: ' + direction.toUpperCase());
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
  // Si no está en reposo ni en movimiento, está quieto
  else {
    // Está quieto (no en reposo y no cambiando de posición)
    console.log('ESTADO: QUIETO - Orientación: ' + 
               (lastDirection === 'right' ? 'DERECHA' : 
                lastDirection === 'left' ? 'IZQUIERDA' : 'ABAJO'));
                
    if (lastDirection === 'right') {
      currentSprite = dazRightSprite; // Quieto mirando a la derecha
    } else if (lastDirection === 'left') {
      currentSprite = dazLeftSprite; // Quieto mirando a la izquierda
    } else {
      currentSprite = dazStandSprite; // Quieto mirando abajo por defecto
    }
  }
  
  // Constante para el tamaño del personaje (mantener el tamaño anterior aunque los tiles sean más pequeños)
  const CHARACTER_SIZE = 96; // El tamaño anterior de los tiles
  
  // Calcular el desplazamiento para centrar el personaje en el tile
  const offsetX = (TILE_SIZE - CHARACTER_SIZE) / 2;
  const offsetY = (TILE_SIZE - CHARACTER_SIZE) / 2;
  
  // Generar un color único basado en el nombre de usuario para otros jugadores
  const getPlayerColor = () => {
    if (!isOtherPlayer) return null; // Solo aplicar a otros jugadores
    
    // Generar un índice basado en el nombre de usuario
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Usar el hash para seleccionar un color del array
    const colorIndex = Math.abs(hash) % PLAYER_COLORS.length;
    return PLAYER_COLORS[colorIndex];
  };
  
  const playerColor = getPlayerColor();
  
  return (
    <div className="character-container" style={{
      position: 'absolute',
      left: `${visualPosition.x * TILE_SIZE}px`,
      top: `${visualPosition.y * TILE_SIZE}px`,
      width: `${TILE_SIZE}px`,
      display: visible ? 'flex' : 'none',
      flexDirection: 'column',
      alignItems: 'center',
      zIndex: 10
    }}>
      {/* Nombre de usuario */}
      {username && (
        <div className="character-name" style={{
          position: 'absolute',
          top: '-20px',
          width: '100px',
          textAlign: 'center',
          transform: 'translateX(-25%)',
          backgroundColor: isOtherPlayer ? playerColor : '#4CAF50',
          color: 'white',
          padding: '2px 5px',
          borderRadius: '3px',
          fontSize: '12px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
        }}>
          {username}
        </div>
      )}
      
      {/* Sprite del personaje */}
      <div
        ref={ref}
        className="character-sprite"
        style={{
          width: `${TILE_SIZE}px`,
          height: `${TILE_SIZE}px`,
          backgroundImage: `url(${currentSprite})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          transition: isMoving ? 'none' : 'left 0.2s ease-out, top 0.2s ease-out',
          filter: isOtherPlayer 
            ? `drop-shadow(0 0 5px ${playerColor}) drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.5))` 
            : 'drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.5))' // Sombra suave
        }}
      />
    </div>
  );
});

export default Character;
