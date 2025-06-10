import React, { useEffect, useState, forwardRef } from 'react';
import dazSprite from '../assets/sprites/daz.png'; // Sprite para movimiento hacia izquierda/arriba/abajo
import dazRightSprite from '../assets/sprites/daz-right.png'; // Sprite para girar a la derecha
import dazRunRightSprite from '../assets/sprites/daz-run-right.png'; // Sprite para correr hacia la derecha
import dazStandSprite from '../assets/sprites/daz-stand.png'; // Sprite para cuando está quieto
import dazLeftSprite from '../assets/sprites/daz-left.png'; // Sprite para girar a la izquierda
import dazFightSprite from '../assets/sprites/daz-fight.png'; // Sprite para la animación de ataque
import { TILE_SIZE } from '../assets/maps/map1';
import '../styles/chatBubble.css'; // Importamos los estilos para el globo de chat

// Factor de escala para el tamaño del sprite del personaje
const SPRITE_SCALE = 2.5; // Aumentado para compensar el TILE_SIZE más pequeño (15px)

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
  username = 'Jugador',
  isMoving = false,
  chatMessage = null, // Mensaje de chat actual
  isChatting = false, // Indica si el personaje está chateando
  isAttacking = false // Nuevo prop para indicar si el personaje está atacando
}, ref) => {
  // Estados para la posición visual del personaje (para animaciones suaves)
  const [visualPosition, setVisualPosition] = useState({ x: position.x, y: position.y });
  const [isMovingState, setIsMovingState] = useState(false);
  const [lastDirection, setLastDirection] = useState(direction); // Guardar la última dirección
  const [wasVisible, setWasVisible] = useState(false); // Para controlar la animación de aparición
  const [moveCount, setMoveCount] = useState(0); // Contador de movimientos en la misma dirección
  const [idleTimer, setIdleTimer] = useState(null); // Temporizador para el estado de reposo
  const [isIdle, setIsIdle] = useState(false); // Estado de reposo (cuando no se presionan teclas por un tiempo)
  const [movementTimer, setMovementTimer] = useState(null); // Temporizador para la animación de movimiento
  const [attackTimer, setAttackTimer] = useState(null); // Temporizador para la animación de ataque
  const [isAttackingState, setIsAttackingState] = useState(false); // Estado local de ataque
  
  // Efecto para manejar el estado de ataque
  useEffect(() => {
    // Si se activa el ataque desde props, actualizar el estado local
    if (isAttacking && !isAttackingState) {
      setIsAttackingState(true);
      
      // Limpiar cualquier temporizador anterior
      if (attackTimer) clearTimeout(attackTimer);
      
      // Configurar un temporizador para finalizar la animación de ataque después de 500ms
      const timer = setTimeout(() => {
        setIsAttackingState(false);
      }, 500); // La animación de ataque dura 500ms
      
      setAttackTimer(timer);
    }
  }, [isAttacking]);

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
          console.log('0.2 segundos sin presionar teclas, cambiando a reposo');
          // Pasar a estado de reposo pero manteniendo la orientación
          setIsIdle(true);
        }, 200); // 0.5 segundos
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

  // Efecto para marcar el personaje como visible después de la primera renderización
  useEffect(() => {
    if (visible && !wasVisible) {
      // Usar un pequeño retraso para asegurar que la clase CSS se aplique después del primer render
      const timer = setTimeout(() => {
        setWasVisible(true);
      }, 500); // Tiempo suficiente para que se complete la animación de aparición
      
      return () => clearTimeout(timer);
    }
  }, [visible, wasVisible]);
  
  // Efecto para actualizar la posición visual cuando cambia la posición real
  // Este efecto NO afecta al estado de reposo
  useEffect(() => {
    // Detectar si la posición ha cambiado realmente
    const positionChanged = position.x !== visualPosition.x || position.y !== visualPosition.y;
    
    if (positionChanged) {
      // Marcar que el personaje está en movimiento SOLO cuando cambia de cuadradito
      setIsMovingState(true);
      
      // Actualizar la posición visual con transición CSS suave
      setVisualPosition({ x: position.x, y: position.y });
      
      // Cancelar cualquier temporizador anterior
      if (movementTimer) {
        clearTimeout(movementTimer);
      }
      
      // Crear un nuevo temporizador para desactivar el estado de movimiento
      // después de que se complete la transición CSS
      const timer = setTimeout(() => {
        // Solo desactivar el estado de movimiento si no hay tecla presionada
        if (!isKeyPressed && !isOtherPlayer) {
          setIsMovingState(false);
        }
      }, 200); // 200ms para que coincida con la duración de la transición CSS
      
      setMovementTimer(timer);
      
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [position, visualPosition, isKeyPressed, isOtherPlayer, movementTimer]);
  
  // Para jugadores locales, usar el estado de movimiento interno
  // Para otros jugadores, detectar cambios de posición para mostrar sprite de movimiento
  const [lastPosition, setLastPosition] = useState(null);
  const [otherPlayerMoving, setOtherPlayerMoving] = useState(false);
  
  // Inicializar lastPosition al montar el componente
  useEffect(() => {
    if (position) {
      setLastPosition({ x: position.x, y: position.y });
    }
  }, []); // Solo se ejecuta al montar
  
  // Detectar cambios de posición para otros jugadores
  useEffect(() => {
    if (!isOtherPlayer || !lastPosition) return;
    
    // Si la posición cambió, activar el sprite de movimiento
    if (lastPosition.x !== position.x || lastPosition.y !== position.y) {
      console.log('Otro jugador se movió de', lastPosition, 'a', position);
      
      // Determinar la dirección del movimiento
      let moveDirection = lastDirection;
      if (position.x > lastPosition.x) moveDirection = 'right';
      else if (position.x < lastPosition.x) moveDirection = 'left';
      else if (position.y > lastPosition.y) moveDirection = 'down';
      else if (position.y < lastPosition.y) moveDirection = 'up';
      
      // Forzar el sprite de movimiento
      setOtherPlayerMoving(true);
      
      // Guardar la nueva posición
      setLastPosition({ x: position.x, y: position.y });
      
      // Desactivar el sprite de movimiento después de un tiempo
      const timer = setTimeout(() => {
        setOtherPlayerMoving(false);
      }, 800); // Mostrar sprite de movimiento por 800ms
      
      return () => clearTimeout(timer);
    }
  }, [isOtherPlayer, position, lastPosition, lastDirection]);
  
  const effectiveIsMoving = isOtherPlayer ? otherPlayerMoving : isMovingState;
  
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
        setIsMovingState(false);
      }
      
      setMoveCount(1);
      setLastDirection(direction);
    } else {
      // Si sigue en la misma dirección y está moviéndose, incrementar el contador
      if (effectiveIsMoving) {
        setMoveCount(prevCount => prevCount + 1);
      }
    }
  }, [direction, lastDirection, effectiveIsMoving, isMovingState, isMoving]);
  
  if (!visible) return null;
  
  // Ya no necesitamos calcular el rebote manualmente, lo hacemos con CSS
  
  // Seleccionar el sprite adecuado según el estado (movimiento, quieto, reposo, ataque) y dirección
  // Establecer un sprite por defecto para evitar que sea undefined
  let currentSprite = dazStandSprite;
  
  // Primero verificamos si está atacando
  if (isAttacking || isAttackingState) {
    // Usar el sprite de ataque
    console.log('ESTADO: ATACANDO');
    currentSprite = dazFightSprite;
  }
  // Luego verificamos si está en estado de reposo (0.2 segundos sin teclas)
  else if (isIdle) {
    // Estado de reposo: mostrar sprite estático según la última dirección
    console.log('ESTADO: REPOSO (0.2 segundos sin teclas) - Orientación: ' + 
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
  else if (effectiveIsMoving) {
    // Está en movimiento activo (cambiando de posición)
    const actualDirection = isOtherPlayer ? lastDirection : direction;
    console.log('ESTADO: MOVIMIENTO - Dirección: ' + actualDirection.toUpperCase() + (isOtherPlayer ? ' (otro jugador)' : ''));
    
    // FORZAR SPRITE DE MOVIMIENTO PARA OTROS JUGADORES
    if (isOtherPlayer) {
      // Seleccionar sprite según dirección para otros jugadores
      if (actualDirection === 'right') {
        currentSprite = dazRunRightSprite; // Correr a la derecha
        console.log('FORZANDO sprite de correr a la derecha para otro jugador');
      } else if (actualDirection === 'left') {
        currentSprite = dazSprite; // Correr a la izquierda
        console.log('FORZANDO sprite de correr a la izquierda para otro jugador');
      } else if (actualDirection === 'down') {
        currentSprite = dazStandSprite; // Movimiento hacia abajo
        console.log('FORZANDO sprite hacia abajo para otro jugador');
      } else {
        currentSprite = dazSprite; // Movimiento hacia arriba u otra dirección
        console.log('FORZANDO sprite hacia arriba para otro jugador');
      }
    }
    // Lógica normal para el jugador local
    else {
      if (actualDirection === 'right') {
        // Para movimiento a la derecha, usar sprite según el contador de movimientos
        if (moveCount > 1) {
          currentSprite = dazRunRightSprite; // Movimientos continuos a la derecha (correr)
        } else {
          currentSprite = dazRightSprite; // Primer movimiento a la derecha (girar)
        }
      } else if (actualDirection === 'left') {
        // Para movimiento a la izquierda
        if (moveCount > 1) {
          currentSprite = dazSprite; // Movimientos continuos a la izquierda
        } else {
          currentSprite = dazLeftSprite; // Primer movimiento a la izquierda
        }
      } else if (actualDirection === 'down') {
        // Para movimiento hacia abajo usar el sprite de stand
        currentSprite = dazStandSprite;
      } else {
        // Para otras direcciones usar el sprite normal
        currentSprite = dazSprite;
      }
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
  
  // La variable effectiveIsMoving ya está definida arriba
  
  return (
    <div 
      className={`character ${isOtherPlayer ? 'other-player' : ''} ${effectiveIsMoving ? 'is-moving' : ''} ${wasVisible ? 'was-visible' : ''} ${(isAttacking || isAttackingState) ? 'is-attacking' : ''}`}
      style={{
        position: 'absolute',
        left: `${visualPosition.x * TILE_SIZE}px`,
        top: `${visualPosition.y * TILE_SIZE}px`,
        width: `${TILE_SIZE}px`,
        display: visible ? 'flex' : 'none',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 10,
        opacity: 1 // Asegurar que el personaje sea visible
      }}>
      {/* Globo de chat */}
      {chatMessage && (
        <div className="chat-bubble" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)', // Blanco semi-transparente para todos los jugadores
          color: '#333', // Color de texto oscuro para todos
          borderColor: 'rgba(0, 0, 0, 0.2)', // Borde sutil para todos
          top: `-${25 + (SPRITE_SCALE - 1) * 3}px` // Posicionarlo justo encima del nombre de usuario
        }}>
          <div className="chat-message">{chatMessage}</div>
          <div className="chat-tail"></div>
        </div>
      )}
      
      {/* Nombre de usuario */}
      {username && (
        <div className="character-name" style={{
          borderRadius: '5px',
          position: 'absolute',
          top: `-${20 + (SPRITE_SCALE - 1) * 8}px`, // Posición más arriba del sprite
          left: '0', // Más a la izquierda
          width: '50px', // Aún más pequeño
          textAlign: 'center',
          transform: 'translateX(-50%)', // Mantener centrado relativo a su posición
          color: isOtherPlayer ? playerColor : '#4CAF50', // Color según el jugador
          fontSize: '8px', // Fuente aún más pequeña
          fontWeight: 'bold',
          letterSpacing: '0.2px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textShadow: '0px 1px 1px rgba(0, 0, 0, 0.7)',
          zIndex: 20,
          backdropFilter: 'blur(0.5px)',
          transition: 'all 0.3s ease'
        }}>
          {username}
        </div>
      )}
      
      {/* Sprite del personaje */}
      <div
        ref={ref}
        className={`character-sprite ${effectiveIsMoving ? 'is-moving' : ''}`}
        style={{
          width: `${TILE_SIZE * SPRITE_SCALE}px`,
          height: `${TILE_SIZE * SPRITE_SCALE}px`,
          transform: `translate(${-TILE_SIZE * (SPRITE_SCALE - 1) / 2}px, ${-TILE_SIZE * (SPRITE_SCALE - 1) / 2}px)`,
          filter: isOtherPlayer 
            ? `drop-shadow(0 0 5px ${playerColor}) drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.5))` 
            : 'drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.5))', // Sombra suave
          backfaceVisibility: 'hidden', // Reducir parpadeos
          willChange: 'transform', // Optimizar rendimiento
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end'
        }}
      >
        <img 
          src={currentSprite} 
          alt="Character" 
          style={{
            width: 'auto',
            height: '2.5rem',
            imageRendering: 'pixelated',
            display: 'block'
          }}
        />
      </div>
    </div>
  );
});

export default Character;
