import React from 'react';
import dazSprite from '../assets/sprites/daz.png';
import { TILE_SIZE } from '../assets/maps/map1';

const Character = ({ position, visible = true }) => {
  if (!visible) return null;
  
  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.x * TILE_SIZE}px`,
        top: `${position.y * TILE_SIZE}px`,
        width: `${TILE_SIZE}px`,
        height: `${TILE_SIZE}px`,
        backgroundImage: `url(${dazSprite})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: 10,
        transition: 'all 0.2s ease-out',
        boxShadow: '0 0 10px 2px rgba(255, 255, 0, 0.5)', // Añadir un brillo alrededor del personaje
      }}
    />
  );
};

export default Character;
