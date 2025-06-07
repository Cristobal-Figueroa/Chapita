import React, { useState, useEffect, useRef } from 'react';
import GameMap from './GameMap';
import Character from './Character';
import { map1, TILE_SIZE } from '../assets/maps/map1';

const Game = () => {
  // Estado para controlar si el juego ha comenzado
  const [gameStarted, setGameStarted] = useState(false);
  
  // Posición inicial del personaje (coordenadas en el mapa)
  const [position, setPosition] = useState({ x: 12, y: 12 });
  
  // Estado para la dirección del personaje (izquierda o derecha)
  const [direction, setDirection] = useState('left');
  
  // Estado para almacenar la última dirección presionada
  const [lastDirection, setLastDirection] = useState(null);
  
  // Estado para controlar el cooldown entre movimientos
  const [canMove, setCanMove] = useState(true);
  
  // Estado para detectar si hay alguna tecla de movimiento presionada actualmente
  const [isKeyPressed, setIsKeyPressed] = useState(false);
  
  // Constante para la velocidad de movimiento (en ms)
  const MOVEMENT_SPEED = 150; // 150ms entre movimientos (más rápido)
  
  // Referencia para el contenedor del juego para mantener el foco
  const gameContainerRef = useRef(null);

  // Función para verificar si una posición es válida (dentro del mapa y no es un obstáculo)
  const isValidPosition = (x, y) => {
    // Verificar límites del mapa
    if (x < 0 || y < 0 || y >= map1.length || x >= map1[0].length) {
      return false;
    }
    
    // Verificar si es un obstáculo (1: árbol, 2: agua, 3: casa, 7: árboles densos)
    const tileType = map1[y][x];
    return ![1, 2, 3, 7].includes(tileType);
  };

  // Manejar cuando se presiona una tecla
  const handleKeyDown = (event) => {
    // Si el juego no ha comenzado, solo responder a Enter
    if (!gameStarted) {
      if (event.key === 'Enter') {
        setGameStarted(true);
      }
      return;
    }
    
    let newX = position.x;
    let newY = position.y;
    let newDirection = direction;
    let currentKey = null;
    
    // Determinar la nueva posición basada en la tecla presionada
    switch (event.key) {
      case 'ArrowUp':
        newY -= 1;
        newDirection = 'up';
        currentKey = 'up';
        setIsKeyPressed(true); // Marcar que una tecla de movimiento está presionada
        break;
      case 'ArrowDown':
        newY += 1;
        newDirection = 'down';
        currentKey = 'down';
        setIsKeyPressed(true);
        break;
      case 'ArrowLeft':
        newX -= 1;
        newDirection = 'left';
        currentKey = 'left';
        setIsKeyPressed(true);
        break;
      case 'ArrowRight':
        newX += 1;
        newDirection = 'right';
        currentKey = 'right';
        setIsKeyPressed(true);
        break;
      default:
        return; // Ignorar otras teclas
    }

    // Actualizar la dirección del personaje siempre
    setDirection(newDirection);

    // Incluso si el personaje está en cooldown, siempre actualizamos la dirección
    // para que gire inmediatamente al presionar una tecla
    
    // Si el personaje está en cooldown, no realizar el movimiento completo
    // pero sí permitir el cambio de dirección
    if (!canMove) {
      // Si es una nueva dirección, actualizar la última dirección
      if (currentKey !== lastDirection) {
        setLastDirection(currentKey);
      }
      return;
    }

    // Verificar si es la misma dirección que la última vez
    if (currentKey === lastDirection) {
      // Si ya estaba en esta dirección, mover al personaje
      if (isValidPosition(newX, newY)) {
        setPosition({ x: newX, y: newY });
        
        // Activar el cooldown
        setCanMove(false);
        
        // Reactivar el movimiento después del tiempo definido
        setTimeout(() => {
          setCanMove(true);
        }, MOVEMENT_SPEED);
      }
    } else {
      // Si es una nueva dirección, solo actualizar la dirección sin mover
      setLastDirection(currentKey);
      // No actualizar la posición, solo girar
      
      // Activar un cooldown más corto para el giro
      setCanMove(false);
      setTimeout(() => {
        setCanMove(true);
      }, MOVEMENT_SPEED / 2); // El giro es más rápido que el movimiento
    }
  };

  // Manejar cuando se suelta una tecla
  const handleKeyUp = (event) => {
    // Verificar si es una tecla de movimiento
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      console.log('Tecla de movimiento liberada');
      setIsKeyPressed(false);
    }
  };

  // Mantener el foco en el contenedor del juego
  useEffect(() => {
    if (gameContainerRef.current) {
      gameContainerRef.current.focus();
    }
  }, [gameStarted]);

  // Agregar event listeners para las teclas
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Limpiar los event listeners cuando el componente se desmonte
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [position, gameStarted, direction, lastDirection, canMove]); // Incluir todas las dependencias necesarias

  // Referencia para el personaje
  const characterRef = useRef(null);
  
  // Referencia para el viewport
  const viewportRef = useRef(null);
  
  // Función para centrar la cámara en el personaje con manejo de bordes
  const centerCameraOnCharacter = () => {
    if (viewportRef.current && gameStarted) {
      // Calcular la posición del personaje en píxeles
      const characterX = position.x * TILE_SIZE + TILE_SIZE / 2;
      const characterY = position.y * TILE_SIZE + TILE_SIZE / 2;
      
      // Obtener las dimensiones del viewport
      const viewportWidth = viewportRef.current.clientWidth;
      const viewportHeight = viewportRef.current.clientHeight;
      
      // Calcular las dimensiones totales del mapa
      const mapWidth = map1[0].length * TILE_SIZE;
      const mapHeight = map1.length * TILE_SIZE;
      
      // Calcular la posición de desplazamiento para centrar al personaje
      let scrollX = characterX - viewportWidth / 2;
      let scrollY = characterY - viewportHeight / 2;
      
      // Ajustar los límites para que no se muestre espacio vacío en los bordes
      scrollX = Math.max(0, Math.min(scrollX, mapWidth - viewportWidth));
      scrollY = Math.max(0, Math.min(scrollY, mapHeight - viewportHeight));
      
      // Desplazar el viewport para centrar al personaje
      viewportRef.current.scrollTo({
        left: scrollX,
        top: scrollY,
        behavior: 'smooth'
      });
    }
  };
  
  // Centrar la cámara cuando el personaje se mueve
  useEffect(() => {
    centerCameraOnCharacter();
  }, [position]);
  
  // Centrar la cámara cuando el juego comienza
  useEffect(() => {
    if (gameStarted) {
      // Centrar inmediatamente
      centerCameraOnCharacter();
      
      // Y luego volver a centrar después de un breve retraso para asegurar que todo esté renderizado
      setTimeout(centerCameraOnCharacter, 100);
      setTimeout(centerCameraOnCharacter, 300);
      setTimeout(centerCameraOnCharacter, 500);
    }
  }, [gameStarted]);
  
  // Calcular el estilo para el contenedor del mapa
  const mapContainerStyle = {
    position: 'relative',
    width: `${map1[0].length * TILE_SIZE}px`,
    height: `${map1.length * TILE_SIZE}px`,
  };

  // Estilo para el viewport que muestra una porción del mapa
  const viewportStyle = {
    position: 'relative',
    width: '100%',
    height: '70vh', // Aumentado para mostrar mejor el mapa con zoom
    overflow: 'auto',
    border: '6px solid #333',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.7)',
    scrollbarWidth: 'none', // Ocultar scrollbar en Firefox
    msOverflowStyle: 'none', // Ocultar scrollbar en IE/Edge
    backgroundColor: '#1a2f1a', // Fondo oscuro para el borde del mapa
  };

  return (
    <div className="game-container">
      <h2>Juego Pokémon PixelArt</h2>
      <div 
        className="game-board" 
        style={viewportStyle}
        ref={(el) => {
          gameContainerRef.current = el;
          viewportRef.current = el;
        }}
        tabIndex="0"
      >
        <div style={mapContainerStyle}>
          <GameMap />
          <Character 
            position={position} 
            visible={gameStarted} 
            direction={direction}
            isKeyPressed={isKeyPressed}
            ref={characterRef}
          />
        </div>
        
        {!gameStarted && (
          <div className="start-screen">
            <p>Presiona ENTER para comenzar</p>
          </div>
        )}
      </div>
      <div className="game-instructions">
        <p>
          {gameStarted 
            ? "Usa las flechas del teclado para mover al personaje" 
            : "Presiona ENTER para comenzar el juego"}
        </p>
      </div>
    </div>
  );
};

export default Game;
