import React from 'react';
import { map1, TILE_SIZE } from '../assets/maps/map1';

const GameMap = () => {
  // Función para determinar el color base de cada tipo de celda
  const getTileColor = (tileType) => {
    switch (tileType) {
      case 0: // Hierba
        return '#4a8f29';
      case 1: // Árbol individual
        return '#1e5631';
      case 2: // Agua
        return '#4287f5';
      case 3: // Casa/Cabaña
        return '#8B4513';
      case 4: // Camino
        return '#c2b280';
      case 5: // Flores
        return '#4a8f29'; // Color base igual a la hierba
      case 6: // Rocas
        return '#808080';
      case 7: // Árboles densos (bosque)
        return '#0b3b0b';
      case 8: // Arbustos
        return '#3a7a3a';
      default:
        return '#4a8f29';
    }
  };
  
  // Función para obtener el estilo completo de cada celda
  const getTileStyle = (tileType, rowIndex, colIndex) => {
    const baseColor = getTileColor(tileType);
    const isEvenCell = (rowIndex + colIndex) % 2 === 0;
    
    // Estilos base comunes para todas las celdas
    const baseStyle = {
      position: 'absolute',
      left: `${colIndex * TILE_SIZE}px`,
      top: `${rowIndex * TILE_SIZE}px`,
      width: `${TILE_SIZE}px`,
      height: `${TILE_SIZE}px`,
      boxSizing: 'border-box',
      zIndex: tileType === 7 ? 5 : tileType === 1 ? 4 : tileType === 3 ? 6 : 2,
    };
    
    // Estilos específicos según el tipo de celda
    switch (tileType) {
      case 0: // Hierba
        return {
          ...baseStyle,
          backgroundColor: baseColor,
          backgroundImage: isEvenCell ? 
            'radial-gradient(circle at 30% 30%, #5ca336 5%, transparent 5%)' : 
            'radial-gradient(circle at 70% 70%, #5ca336 5%, transparent 5%)',
        };
      
      case 1: // Árbol individual
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          backgroundImage: 'radial-gradient(ellipse at 50% 30%, #2d7a4d 50%, #1e5631 80%)',
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.4)',
          borderRadius: '50% 50% 10% 10% / 60% 60% 40% 40%',
          transform: `scale(${0.9 + Math.sin(rowIndex * colIndex) * 0.1}) rotate(${(rowIndex * colIndex) % 5}deg)`,
          filter: 'drop-shadow(0 5px 3px rgba(0,0,0,0.3))',
        };
      
      case 2: // Agua
        return {
          ...baseStyle,
          backgroundColor: baseColor,
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0) 80%)',
          animation: 'waterRipple 3s infinite linear',
          opacity: 0.8,
        };
      
      case 3: // Casa/Cabaña
        return {
          ...baseStyle,
          backgroundColor: '#8B4513',
          backgroundImage: 'linear-gradient(to bottom, #a05a2c 0%, #8B4513 60%)',
          border: '2px solid #5d2906',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
          borderRadius: '10% 10% 0 0',
        };
      
      case 4: // Camino
        return {
          ...baseStyle,
          backgroundColor: baseColor,
          backgroundImage: `
            radial-gradient(circle at ${isEvenCell ? '25%' : '75%'} ${isEvenCell ? '25%' : '75%'}, 
            #d2c097 10%, transparent 10%),
            radial-gradient(circle at ${isEvenCell ? '75%' : '25%'} ${isEvenCell ? '75%' : '25%'}, 
            #a89878 8%, transparent 8%)
          `,
          backgroundSize: '8px 8px',
          boxShadow: 'inset 0 0 5px rgba(0,0,0,0.2)',
        };
      
      case 5: // Flores
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          backgroundImage: `
            radial-gradient(circle at 30% 30%, #ff9999 5%, transparent 5%),
            radial-gradient(circle at 70% 30%, #ffff99 5%, transparent 5%),
            radial-gradient(circle at 30% 70%, #99ff99 5%, transparent 5%),
            radial-gradient(circle at 70% 70%, #9999ff 5%, transparent 5%),
            radial-gradient(circle at 50% 50%, #ffffff 3%, transparent 3%)
          `,
          backgroundSize: '20px 20px',
        };
      
      case 6: // Rocas
        return {
          ...baseStyle,
          backgroundColor: baseColor,
          backgroundImage: 'radial-gradient(ellipse at 50% 50%, #a0a0a0 30%, #808080 70%)',
          borderRadius: '30% 40% 25% 35% / 40% 35% 30% 45%',
          boxShadow: '3px 3px 5px rgba(0,0,0,0.3)',
          transform: `rotate(${(rowIndex * colIndex) % 360}deg)`,
        };
      
      case 7: // Árboles densos (bosque)
        return {
          ...baseStyle,
          backgroundColor: baseColor,
          backgroundImage: `
            radial-gradient(circle at ${20 + (rowIndex * colIndex) % 60}% ${30 + (rowIndex * colIndex) % 40}%, 
            #2d7a4d 20%, transparent 30%),
            radial-gradient(circle at ${50 + (colIndex * rowIndex) % 30}% ${60 + (colIndex * rowIndex) % 30}%, 
            #2d7a4d 25%, transparent 35%)
          `,
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)',
        };
      
      case 8: // Arbustos
        return {
          ...baseStyle,
          backgroundColor: baseColor,
          backgroundImage: 'radial-gradient(circle at 50% 50%, #4a8f29 50%, #3a7a3a 80%)',
          borderRadius: '40% 40% 40% 40% / 40% 40% 40% 40%',
          boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
        };
      
      default:
        return baseStyle;
    }
  };

  // Crear un estilo CSS para las animaciones
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes waterRipple {
      0% { background-position: 0 0; }
      100% { background-position: 100px 0; }
    }
  `;
  document.head.appendChild(styleSheet);

  return (
    <div
      style={{
        position: 'relative',
        width: `${map1[0].length * TILE_SIZE}px`,
        height: `${map1.length * TILE_SIZE}px`,
        overflow: 'hidden',
        backgroundColor: '#4a8f29', // Color base del bosque
        backgroundImage: 'radial-gradient(#5ca336 15%, transparent 15%)',
        backgroundSize: '12px 12px',
      }}
    >
      {/* Renderizar cada celda del mapa */}
      {map1.map((row, rowIndex) =>
        row.map((tile, colIndex) => {
          // No renderizar celdas de hierba (0) ya que tenemos un fondo base
          if (tile === 0) return null;
          
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              style={getTileStyle(tile, rowIndex, colIndex)}
            />
          );
        })
      )}
    </div>
  );
};

export default GameMap;
