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

  // Manejar el movimiento del personaje con las teclas de flecha
  const handleKeyDown = (event) => {
    // Si el juego no ha comenzado, verificar si se presionó Enter
    if (!gameStarted) {
      if (event.key === 'Enter') {
        setGameStarted(true);
      }
      return;
    }
    
    let newX = position.x;
    let newY = position.y;
    let newDirection = direction;

    switch (event.key) {
      case 'ArrowUp':
        newY -= 1;
        break;
      case 'ArrowDown':
        newY += 1;
        break;
      case 'ArrowLeft':
        newX -= 1;
        newDirection = 'left'; // Actualizar dirección a izquierda
        break;
      case 'ArrowRight':
        newX += 1;
        newDirection = 'right'; // Actualizar dirección a derecha
        break;
      default:
        return; // Ignorar otras teclas
    }

    // Actualizar la dirección del personaje
    setDirection(newDirection);

    // Actualizar la posición solo si es válida
    if (isValidPosition(newX, newY)) {
      setPosition({ x: newX, y: newY });
    }
  };

  // Mantener el foco en el contenedor del juego
  useEffect(() => {
    if (gameContainerRef.current) {
      gameContainerRef.current.focus();
    }
  }, [gameStarted]);

  // Agregar event listener para las teclas
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    
    // Limpiar el event listener cuando el componente se desmonte
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [position, gameStarted, direction]); // Dependencias: position, gameStarted y direction

  // Referencia para el personaje
  const characterRef = useRef(null);
  
  // Referencia para el viewport
  const viewportRef = useRef(null);
  
  // Efecto para centrar la vista en el personaje cuando se mueve
  useEffect(() => {
    if (characterRef.current && viewportRef.current && gameStarted) {
      // Calcular la posición del personaje en píxeles
      const characterX = position.x * TILE_SIZE + TILE_SIZE / 2;
      const characterY = position.y * TILE_SIZE + TILE_SIZE / 2;
      
      // Obtener las dimensiones del viewport
      const viewportWidth = viewportRef.current.clientWidth;
      const viewportHeight = viewportRef.current.clientHeight;
      
      // Calcular la posición de desplazamiento para centrar al personaje
      const scrollX = characterX - viewportWidth / 2;
      const scrollY = characterY - viewportHeight / 2;
      
      // Desplazar el viewport para centrar al personaje
      viewportRef.current.scrollTo({
        left: scrollX,
        top: scrollY,
        behavior: 'smooth'
      });
    }
  }, [position, gameStarted]);
  
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
    height: '65vh',
    overflow: 'auto',
    border: '6px solid #333',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.7)',
    scrollbarWidth: 'none', // Ocultar scrollbar en Firefox
    msOverflowStyle: 'none', // Ocultar scrollbar en IE/Edge
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
