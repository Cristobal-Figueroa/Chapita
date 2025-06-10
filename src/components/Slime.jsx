import React, { useState, useEffect, useRef } from 'react';
import slimeSprite from '../assets/sprites/slime.png';
import slimeJumpSprite from '../assets/sprites/slime-jump.png';
import slimeHitSprite from '../assets/sprites/slime-hit.png';
import { TILE_SIZE } from '../assets/maps/map1';

// Factor de escala para el tamaño del sprite del slime
const SPRITE_SCALE = 1.0;

const Slime = ({ initialPosition, movementArea = 3 }) => {
  // Estado para la posición del slime
  const [position, setPosition] = useState(initialPosition);
  // Estado para la dirección del slime
  const [direction, setDirection] = useState('left');
  // Estado para la animación del slime
  const [animationState, setAnimationState] = useState('idle'); // idle, jump, hit
  // Estado para el frame actual de la animación
  const [currentFrame, setCurrentFrame] = useState(0);
  
  // Referencia para los temporizadores
  const movementTimerRef = useRef(null);
  const animationTimerRef = useRef(null);
  const stateTimerRef = useRef(null);
  
  // Constantes para la animación
  const FRAMES_COUNT = 1; // Asumimos que solo hay un frame por ahora
  const FRAME_WIDTH = 16; // Ancho de cada frame en el sprite
  const FRAME_HEIGHT = 16; // Alto de cada frame en el sprite
  const ANIMATION_SPEED = 200; // ms entre frames
  const MOVEMENT_SPEED = 2000; // ms entre movimientos
  const STATE_CHANGE_SPEED = 5000; // ms entre cambios de estado
  
  // Función para obtener un sprite basado en el estado de animación
  const getSprite = () => {
    switch(animationState) {
      case 'jump':
        return slimeJumpSprite;
      case 'idle':
      default:
        return slimeSprite;
    }
  };
  
  // Función para mover el slime aleatoriamente dentro de su área
  const moveRandomly = () => {
    const directions = ['up', 'down', 'left', 'right'];
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    
    setDirection(randomDirection);
    
    // Calcular la nueva posición basada en la dirección
    let newX = position.x;
    let newY = position.y;
    
    switch(randomDirection) {
      case 'up':
        newY = Math.max(initialPosition.y - movementArea, position.y - 1);
        break;
      case 'down':
        newY = Math.min(initialPosition.y + movementArea, position.y + 1);
        break;
      case 'left':
        newX = Math.max(initialPosition.x - movementArea, position.x - 1);
        break;
      case 'right':
        newX = Math.min(initialPosition.x + movementArea, position.x + 1);
        break;
      default:
        break;
    }
    
    // Actualizar la posición
    setPosition({ x: newX, y: newY });
    
    // Cambiar temporalmente al estado de salto cuando se mueve
    setAnimationState('jump');
    
    // Volver al estado idle después de un tiempo
    setTimeout(() => {
      setAnimationState('idle');
    }, 500);
  };
  
  // Función para cambiar aleatoriamente el estado de animación
  const changeAnimationState = () => {
    const states = ['idle', 'jump'];
    const randomState = states[Math.floor(Math.random() * states.length)];
    
    setAnimationState(randomState);
    
    // Si el estado es jump, volver a idle después de un tiempo
    if (randomState !== 'idle') {
      setTimeout(() => {
        setAnimationState('idle');
      }, 1000);
    }
  };
  
  // Efecto para manejar la animación del sprite
  useEffect(() => {
    // Función para avanzar al siguiente frame
    const advanceFrame = () => {
      setCurrentFrame(prevFrame => (prevFrame + 1) % FRAMES_COUNT);
    };
    
    // Iniciar el temporizador de animación
    animationTimerRef.current = setInterval(advanceFrame, ANIMATION_SPEED);
    
    // Limpiar el temporizador cuando el componente se desmonte
    return () => {
      clearInterval(animationTimerRef.current);
    };
  }, []);
  
  // Efecto para manejar el movimiento aleatorio
  useEffect(() => {
    // Iniciar el temporizador de movimiento
    movementTimerRef.current = setInterval(moveRandomly, MOVEMENT_SPEED);
    
    // Limpiar el temporizador cuando el componente se desmonte
    return () => {
      clearInterval(movementTimerRef.current);
    };
  }, [position]);
  
  // Efecto para cambiar aleatoriamente el estado de animación
  useEffect(() => {
    // Iniciar el temporizador de cambio de estado
    stateTimerRef.current = setInterval(changeAnimationState, STATE_CHANGE_SPEED);
    
    // Limpiar el temporizador cuando el componente se desmonte
    return () => {
      clearInterval(stateTimerRef.current);
    };
  }, []);
  
  // Estilo para el sprite del slime
  const spriteStyle = {
    position: 'absolute',
    left: `${position.x * TILE_SIZE - (TILE_SIZE/4)}px`,
    top: `${position.y * TILE_SIZE - (TILE_SIZE/4)}px`,
    width: `${TILE_SIZE * 2}px`,
    height: `${TILE_SIZE * 2}px`,
    backgroundColor: 'transparent',
    zIndex: position.y,
    transition: 'top 0.3s ease, left 0.3s ease',
    imageRendering: 'pixelated',
    WebkitFontSmoothing: 'none',
  };
  
  // Estilo para la imagen del slime
  const slimeImageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    imageRendering: 'pixelated',
    WebkitImageRendering: 'pixelated',
    MozImageRendering: 'crisp-edges',
    msInterpolationMode: 'nearest-neighbor',
    transform: direction === 'right' ? 'scaleX(-1)' : 'scaleX(1)',
  };
  
  return (
    <div className="slime" style={spriteStyle}>
      <img src={getSprite()} style={slimeImageStyle} />
      <div 
        style={{
          position: 'absolute',
          top: '-7px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.34)',
          color: '#ffffffe6',
          padding: '1px 5px',
          paddingTop: '2px',
          borderRadius: '3px',
          fontSize: '6px',
          whiteSpace: 'nowrap',
          textAlign: 'center',
          zIndex: 100
        }}
      >
        Slime
      </div>
    </div>
  );
};

export default Slime;
