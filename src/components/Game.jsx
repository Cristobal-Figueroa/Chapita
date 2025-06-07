import React, { useState, useEffect, useRef } from 'react';
import GameMap from './GameMap';
import Character from './Character';
import { map1 } from '../assets/maps/map1';

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
    
    // Verificar si es un obstáculo (1: árbol, 2: agua, 3: casa)
    const tileType = map1[y][x];
    return ![1, 2, 3].includes(tileType);
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

  return (
    <div className="game-container">
      <h2>Juego Pokémon PixelArt</h2>
      <div 
        className="game-board" 
        ref={gameContainerRef}
        tabIndex="0" // Permite que el div reciba el foco
      >
        <GameMap />
        <Character 
          position={position} 
          visible={gameStarted} 
          direction={direction} // Pasar la dirección al componente Character
        />
        
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
