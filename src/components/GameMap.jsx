import React from 'react';
import { map1, TILE_SIZE } from '../assets/maps/map1';

const GameMap = () => {
  // Función para determinar el color de cada tipo de celda
  const getTileColor = (tileType) => {
    switch (tileType) {
      case 0: // Hierba
        return '#7CFC00';
      case 1: // Árbol/Obstáculo
        return '#228B22';
      case 2: // Agua
        return '#1E90FF';
      case 3: // Casa
        return '#8B4513';
      case 4: // Camino
        return '#D2B48C';
      default:
        return '#000000';
    }
  };
  
  // Función para determinar si una celda debe tener un ligero degradado para dar profundidad
  const getTileStyle = (tileType, rowIndex, colIndex) => {
    const baseColor = getTileColor(tileType);
    
    // Crear un efecto de variación sutil para que no todas las celdas se vean idénticas
    const variation = ((rowIndex + colIndex) % 3 === 0) ? '05' : 
                      ((rowIndex + colIndex) % 3 === 1) ? '10' : '00';
    
    return {
      position: 'absolute',
      left: `${colIndex * TILE_SIZE}px`,
      top: `${rowIndex * TILE_SIZE}px`,
      width: `${TILE_SIZE}px`,
      height: `${TILE_SIZE}px`,
      backgroundColor: baseColor,
      boxShadow: tileType === 1 ? '0 5px 15px rgba(0, 0, 0, 0.3) inset' : 'none', // Sombra para árboles
      boxSizing: 'border-box',
      // Aplicar un degradado sutil para dar profundidad
      background: `linear-gradient(${45 + (rowIndex * colIndex) % 90}deg, ${baseColor}, ${baseColor}${variation})`,
    };
  };

  return (
    <div
      style={{
        position: 'relative',
        width: `${map1[0].length * TILE_SIZE}px`,
        height: `${map1.length * TILE_SIZE}px`,
        overflow: 'hidden',
      }}
    >
      {/* Capa base para todo el mapa (hierba) */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#7CFC00',
          backgroundImage: 'radial-gradient(#8FFF00 10%, transparent 10%)',
          backgroundSize: '10px 10px',
        }}
      />
      
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
