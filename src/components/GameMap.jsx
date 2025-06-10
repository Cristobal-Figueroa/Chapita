import React from 'react';
import { map1, TILE_SIZE } from '../assets/maps/map1';
import grassTexture from '../assets/sprites/gras.jpg';
import treeTexture from '../assets/sprites/tree.png';
import flower1Texture from '../assets/sprites/flower1.png';
import flower2Texture from '../assets/sprites/flower2.png';
import flower3Texture from '../assets/sprites/flower3.png';

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
      case 9: // Flores tipo 1
        return '#4a8f29';
      case 10: // Flores tipo 2
        return '#4a8f29';
      case 11: // Flores tipo 3
        return '#4a8f29';
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
      case 0: // Hierba - ahora transparente para mostrar la textura de fondo
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          // Sin background-image para dejar ver la textura de fondo
        };
      
      case 1: // Árbol individual - ahora usando tree.png
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          backgroundImage: `url(${treeTexture})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
          // Hacer que el árbol sea mucho más alto que la celda
          height: `${TILE_SIZE * 3.5}px`,
          width: `${TILE_SIZE * 3}px`,
          // Ajustar la posición para que la base del árbol esté en la celda
          top: `${rowIndex * TILE_SIZE - (TILE_SIZE * 2.5)}px`,
          left: `${colIndex * TILE_SIZE - (TILE_SIZE * 1)}px`,
          transform: `scale(${1.5 + Math.sin(rowIndex * colIndex) * 0.3})`,
          filter: 'drop-shadow(4px 8px 10px rgba(0,0,0,0.6))',
          zIndex: 20, // Asegurar que los árboles estén por encima de otros elementos
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
      
      case 5: // Flores (genéricas)
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
        
      case 9: // Flores tipo 1
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          backgroundImage: `url(${flower1Texture})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          zIndex: 3,
        };
        
      case 10: // Flores tipo 2
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          backgroundImage: `url(${flower2Texture})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          zIndex: 3,
        };
        
      case 11: // Flores tipo 3
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          backgroundImage: `url(${flower3Texture})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          zIndex: 3,
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
      
      case 7: // Árboles densos (bosque) - ahora usando tree.png
        // Para bosques, vamos a crear un grupo de árboles en lugar de usar gradientes
        // Esta es una celda especial que se manejará de forma diferente en el renderizado
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          // No definimos backgroundImage aquí porque crearemos elementos separados para los árboles
          zIndex: 5, // Capa base del bosque
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

  // Función para crear grupos de árboles para las celdas de bosque
  const createForestTrees = () => {
    const forestTrees = [];
    
    map1.forEach((row, rowIndex) => {
      row.forEach((tile, colIndex) => {
        // Solo procesar celdas de bosque (tipo 7)
        if (tile === 7) {
          // Crear varios árboles por cada celda de bosque
          const numTrees = 4 + Math.floor(pseudoRandom(rowIndex, colIndex) * 3); // 4-6 árboles
          
          for (let i = 0; i < numTrees; i++) {
            // Posición aleatoria dentro de la celda
            const offsetX = pseudoRandom(i, rowIndex) * TILE_SIZE * 0.8;
            const offsetY = pseudoRandom(colIndex, i) * TILE_SIZE * 0.8;
            const scale = 1.2 + pseudoRandom(i + rowIndex, i + colIndex) * 0.8; // 1.2-2.0 (mucho más grande)
            const zIndexOffset = Math.floor(pseudoRandom(i, colIndex) * 5); // 0-4
            
            forestTrees.push(
              <div
                key={`forest-tree-${rowIndex}-${colIndex}-${i}`}
                style={{
                  position: 'absolute',
                  left: `${colIndex * TILE_SIZE + offsetX - (TILE_SIZE * 1)}px`,
                  top: `${rowIndex * TILE_SIZE + offsetY - (TILE_SIZE * 2)}px`,
                  width: `${TILE_SIZE * 3}px`,
                  height: `${TILE_SIZE * 3.5}px`,
                  backgroundImage: `url(${treeTexture})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center bottom',
                  backgroundRepeat: 'no-repeat',
                  transform: `scale(${scale * 1.3})`,
                  filter: 'drop-shadow(4px 8px 10px rgba(0,0,0,0.6))',
                  zIndex: 20 + zIndexOffset, // Asegurar que los árboles estén por encima de otros elementos
                }}
              />
            );
          }
        }
      });
    });
    
    return forestTrees;
  };
  
  // Función para generar valores aleatorios consistentes
  const pseudoRandom = (x, y) => {
    const seed = 42; // Usar un valor fijo para consistencia
    const val = Math.sin(seed + x * 12.9898 + y * 78.233) * 43758.5453;
    return val - Math.floor(val);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: `${map1[0].length * TILE_SIZE}px`,
        height: `${map1.length * TILE_SIZE}px`,
        overflow: 'hidden',
        backgroundImage: `url(${grassTexture})`,
        backgroundRepeat: 'repeat',
        backgroundSize: '64px 64px', // Ajusta el tamaño según necesites
        backgroundColor: '#4a8f29', // Color de hierba como respaldo
      }}
    >
      {/* Renderizar cada celda del mapa */}
      {map1.map((row, rowIndex) =>
        row.map((tile, colIndex) => {
          // No renderizar celdas de hierba (0) ya que tenemos un fondo base
          // Tampoco renderizar bosques (7) ya que los manejamos por separado
          if (tile === 0 || tile === 7) return null;
          
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              style={getTileStyle(tile, rowIndex, colIndex)}
            />
          );
        })
      )}
      
      {/* Agregar los árboles de bosque como elementos separados */}
      {createForestTrees()}
    </div>
  );
};

export default GameMap;
