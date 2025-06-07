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

  return (
    <div
      style={{
        position: 'relative',
        width: `${map1[0].length * TILE_SIZE}px`,
        height: `${map1.length * TILE_SIZE}px`,
      }}
    >
      {map1.map((row, rowIndex) =>
        row.map((tile, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            style={{
              position: 'absolute',
              left: `${colIndex * TILE_SIZE}px`,
              top: `${rowIndex * TILE_SIZE}px`,
              width: `${TILE_SIZE}px`,
              height: `${TILE_SIZE}px`,
              backgroundColor: getTileColor(tile),
              border: '1px solid rgba(0, 0, 0, 0.1)',
              boxSizing: 'border-box',
            }}
          />
        ))
      )}
    </div>
  );
};

export default GameMap;
