import React, { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

const OnlinePlayers = () => {
  const [onlinePlayers, setOnlinePlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    // Referencia a la lista de usuarios online
    const onlinePlayersRef = ref(database, 'online_players');
    
    // Escuchar cambios en tiempo real
    onValue(onlinePlayersRef, (snapshot) => {
      const players = [];
      snapshot.forEach((childSnapshot) => {
        const playerData = childSnapshot.val();
        // No incluir al usuario actual en la lista
        if (childSnapshot.key !== currentUser?.uid) {
          players.push({
            id: childSnapshot.key,
            ...playerData
          });
        }
      });
      
      setOnlinePlayers(players);
      setLoading(false);
    });
    
    // Limpiar el listener cuando el componente se desmonte
    return () => {
      off(onlinePlayersRef);
    };
  }, [currentUser]);

  if (loading) {
    return <div className="loading">Cargando jugadores online...</div>;
  }

  return (
    <div className="online-players-container">
      <h3>Jugadores Online ({onlinePlayers.length})</h3>
      
      {onlinePlayers.length === 0 ? (
        <p className="no-players">No hay otros jugadores online</p>
      ) : (
        <ul className="players-list">
          {onlinePlayers.map((player) => (
            <li key={player.id} className="player-item">
              <div className="player-avatar">
                {player.username ? player.username.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="player-info">
                <span className="player-name">{player.username}</span>
                <span className="player-position">
                  Posición: X:{player.position?.x || 0}, Y:{player.position?.y || 0}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OnlinePlayers;
