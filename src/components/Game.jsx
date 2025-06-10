import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, off, set, update, serverTimestamp } from 'firebase/database';
import { database } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import GameMap from './GameMap';
import Character from './Character';
import OnlinePlayers from './OnlinePlayers';
import '../styles/game.css';
import { map1, TILE_SIZE } from '../assets/maps/map1';

const Game = () => {
  // Obtener el usuario actual y funciones de autenticación
  const { currentUser, logout, getUserData, updateUserData } = useAuth();
  const navigate = useNavigate();
  
  // Estado para controlar si el juego ha comenzado (ahora inicia automáticamente)
  const [gameStarted, setGameStarted] = useState(true);
  
  // Estado para los jugadores online
  const [onlinePlayers, setOnlinePlayers] = useState({});
  
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
  
  // Estado para la posición de la cámara
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0 });
  
  // Estados para el chat
  const [isChatting, setIsChatting] = useState(false); // Si está en modo chat
  const [chatMessage, setChatMessage] = useState(''); // Mensaje actual
  const [chatInputValue, setChatInputValue] = useState(''); // Valor del input de chat
  const [chatMessages, setChatMessages] = useState({}); // Mensajes de todos los jugadores
  
  // Factor de zoom para acercar la cámara
  const ZOOM_FACTOR = 3.0; // Aumentado para compensar el TILE_SIZE más pequeño (15px)
  
  // Constante para la velocidad de movimiento (en ms)
  const MOVEMENT_SPEED = 150; // 150ms entre movimientos (más rápido)
  
  // Referencia a los temporizadores de movimiento y chat para limpiarlos
  const movementTimers = {};
  const chatTimers = {};
  
  // Referencia para el contenedor del juego para mantener el foco
  const gameContainerRef = useRef(null);
  
  // Cargar datos del usuario al iniciar
  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser) {
        try {
          const userData = await getUserData(currentUser.uid);
          if (userData) {
            // Establecer posición y dirección guardadas
            if (userData.position) {
              setPosition(userData.position);
            }
            if (userData.lastDirection) {
              setDirection(userData.lastDirection);
              setLastDirection(userData.lastDirection);
            }
          }
        } catch (error) {
          console.error('Error al cargar datos del usuario:', error);
        }
      } else {
        // Si no hay usuario autenticado, redirigir al login
        navigate('/login');
      }
    };
    
    loadUserData();
  }, [currentUser, getUserData, navigate]);
  
  // Actualizar estado online del jugador y escuchar a otros jugadores
  useEffect(() => {
    if (!currentUser) return;
    
    // Referencia al jugador actual
    const currentPlayerRef = ref(database, `online_players/${currentUser.uid}`);
    
    // Referencia a todos los jugadores online
    const onlinePlayersRef = ref(database, 'online_players');
    
    // Marcar al jugador como online y guardar sus datos iniciales
    const setPlayerOnline = async () => {
      try {
        const userData = await getUserData(currentUser.uid);
        await set(currentPlayerRef, {
          username: currentUser.displayName || 'Jugador',
          position,
          lastDirection,
          lastUpdated: serverTimestamp(), // Usar timestamp del servidor para mayor precisión
          isMoving: false,
          ...userData
        });
      } catch (error) {
        console.error('Error al marcar jugador como online:', error);
      }
    };
    
    setPlayerOnline();
    
    // Escuchar cambios en los jugadores online con alta prioridad
    const unsubscribe = onValue(onlinePlayersRef, (snapshot) => {
      const players = {};
      snapshot.forEach((childSnapshot) => {
        // No incluir al jugador actual
        if (childSnapshot.key !== currentUser.uid) {
          const playerData = childSnapshot.val();
          
          // Asegurarse de que los datos sean válidos
          if (playerData && playerData.position) {
            // Calcular tiempo desde la última actualización para detectar jugadores inactivos
            const lastUpdated = playerData.lastUpdated || 0;
            const now = Date.now();
            const timeSinceUpdate = typeof lastUpdated === 'number' ? now - lastUpdated : 60000; // Default a 1 minuto si no hay timestamp
            
            // Verificar si el jugador ha estado inactivo por más de 10 segundos
            const isInactive = timeSinceUpdate > 10000;
            
            players[childSnapshot.key] = {
              ...playerData,
              // Asegurar que la posición siempre tenga valores numéricos válidos
              position: {
                x: Number(playerData.position.x) || 0,
                y: Number(playerData.position.y) || 0
              },
              // Añadir propiedad para detectar inactividad
              isInactive
            };
          }
        }
      });
      
      // Actualizar el estado con los nuevos datos de jugadores
      setOnlinePlayers(prevPlayers => {
        const updatedPlayers = {};
        
        // Procesar cada jugador del nuevo snapshot
        Object.keys(players).forEach(playerId => {
          const newPlayerData = players[playerId];
          const prevPlayerData = prevPlayers[playerId];
          
          // Si el jugador ya existía, preservar algunos datos para transiciones suaves
          if (prevPlayerData) {
            // Detectar si la posición ha cambiado
            const positionChanged = 
              prevPlayerData.position.x !== newPlayerData.position.x || 
              prevPlayerData.position.y !== newPlayerData.position.y;
            
            // Si la posición cambió, marcar como en movimiento por un tiempo
            let isMovingNow = newPlayerData.isMoving;
            
            if (positionChanged) {
              isMovingNow = true;
              
              // Si el jugador acaba de moverse, guardar su última dirección de movimiento
              let detectedDirection = prevPlayerData.lastDirection || 'down';
              
              if (newPlayerData.position.x > prevPlayerData.position.x) {
                detectedDirection = 'right';
              } else if (newPlayerData.position.x < prevPlayerData.position.x) {
                detectedDirection = 'left';
              } else if (newPlayerData.position.y > prevPlayerData.position.y) {
                detectedDirection = 'down';
              } else if (newPlayerData.position.y < prevPlayerData.position.y) {
                detectedDirection = 'up';
              }
              
              // Mantener el estado de movimiento activo por un tiempo
              // para permitir que la animación se complete
              if (isMovingNow) {
                // Cancelar cualquier temporizador anterior
                if (prevPlayerData.moveTimer) {
                  clearTimeout(prevPlayerData.moveTimer);
                }
                
                // Crear un nuevo temporizador para desactivar el movimiento
                const moveTimer = setTimeout(() => {
                  setOnlinePlayers(current => {
                    if (!current[playerId]) return current;
                    return {
                      ...current,
                      [playerId]: {
                        ...current[playerId],
                        isMoving: false
                      }
                    };
                  });
                }, 500); // Mantener el estado de movimiento por 500ms
                
                updatedPlayers[playerId] = {
                  ...newPlayerData,
                  isMoving: true, // Forzar a true para asegurar la animación
                  lastDirection: detectedDirection,
                  moveTimer // Guardar referencia al temporizador
                };
              } else {
                updatedPlayers[playerId] = {
                  ...newPlayerData,
                  isMoving: isMovingNow,
                  lastDirection: detectedDirection
                };
              }
            } else {
              // Si no ha cambiado la posición, mantener los datos actuales
              updatedPlayers[playerId] = {
                ...newPlayerData,
                isMoving: isMovingNow,
                lastDirection: newPlayerData.lastDirection || prevPlayerData.lastDirection
              };
            }
          } else {
            // Nuevo jugador, usar datos tal cual
            updatedPlayers[playerId] = newPlayerData;
          }
        });
        
        return updatedPlayers;
      });
    }, { onlyOnce: false }); // Asegurarse de recibir todas las actualizaciones
    
    // Limpiar al desmontar
    return () => {
      // Marcar al jugador como offline
      set(currentPlayerRef, null);
      // Dejar de escuchar cambios
      off(onlinePlayersRef);
    };
  }, [currentUser]); // Solo depende del usuario, no de la posición
  
  // Función para actualizar la posición del jugador en la base de datos
  const updatePlayerPosition = () => {
    if (!currentUser) return;
    
    const playerRef = ref(database, `online_players/${currentUser.uid}`);
    
    // Crear un objeto con las actualizaciones
    const updates = {
      position,
      lastDirection,
      isMoving: isKeyPressed, // Indicar si el jugador está en movimiento
      lastUpdated: serverTimestamp() // Usar timestamp del servidor para sincronización precisa
    };
    
    // Actualizar en tiempo real con alta prioridad
    update(playerRef, updates).catch(error => {
      console.error('Error al actualizar posición:', error);
      // Intentar reconectar si hay un error de conexión
      setTimeout(() => updatePlayerPosition(), 1000);
    });
    
    // Actualizar en el perfil del usuario solo cuando el jugador se detiene
    // para reducir escrituras innecesarias
    if (!isKeyPressed) {
      updateUserData(currentUser.uid, { position, lastDirection });
    }
  };
  
  // Actualizar la posición en la base de datos cuando cambia
  useEffect(() => {
    if (gameStarted && currentUser) {
      // Usar un pequeño debounce para evitar demasiadas actualizaciones
      const updateTimer = setTimeout(() => {
        updatePlayerPosition();
      }, 50); // 50ms de debounce
      
      return () => clearTimeout(updateTimer);
    }
  }, [position, lastDirection, gameStarted, isKeyPressed]);
  
  // Efecto para actualizar periódicamente el estado online del jugador
  // incluso cuando no se está moviendo, para mantener la conexión activa
  useEffect(() => {
    if (gameStarted && currentUser) {
      const keepAliveInterval = setInterval(() => {
        const playerRef = ref(database, `online_players/${currentUser.uid}`);
        update(playerRef, {
          lastUpdated: serverTimestamp()
        });
      }, 5000); // Actualizar cada 5 segundos
      
      return () => clearInterval(keepAliveInterval);
    }
  }, [gameStarted, currentUser]);
  
  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Función para verificar si una posición es válida (dentro del mapa y no es un obstáculo)
  const isValidPosition = (x, y) => {
    // Verificar límites del mapa
    if (x < 0 || y < 0 || y >= map1.length || x >= map1[0].length) {
      return false;
    }
    
    // Verificar si la celda actual es un obstáculo
    const tileType = map1[y][x];
    if ([2, 3].includes(tileType)) { // Agua y casas son obstáculos completos
      return false;
    }
    
    // Para árboles (tipo 1) y bosques (tipo 7), verificar también celdas adyacentes
    // debido a que visualmente son más grandes que una celda
    if (tileType === 1 || tileType === 7) {
      // La celda actual es un árbol, no es válida
      return false;
    }
    
    // Verificar árboles cercanos que podrían estar superpuestos visualmente
    // Comprobar celdas adyacentes para árboles grandes
    const adjacentCells = [
      { dx: -1, dy: -1 }, // Diagonal superior izquierda
      { dx: 0, dy: -1 },  // Arriba
      { dx: 1, dy: -1 },  // Diagonal superior derecha
      { dx: -1, dy: 0 },  // Izquierda
      { dx: 1, dy: 0 },   // Derecha
    ];
    
    for (const cell of adjacentCells) {
      const adjX = x + cell.dx;
      const adjY = y + cell.dy;
      
      // Verificar que la celda adyacente esté dentro del mapa
      if (adjX >= 0 && adjY >= 0 && adjY < map1.length && adjX < map1[0].length) {
        const adjTileType = map1[adjY][adjX];
        
        // Si hay un árbol en la celda superior, no permitir el movimiento
        // porque visualmente el árbol ocupa más espacio hacia abajo
        if (adjTileType === 1 && cell.dy === -1) {
          return false;
        }
        
        // Si hay un bosque denso cerca, también considerar colisión
        if (adjTileType === 7) {
          return false;
        }
      }
    }
    
    return true;
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
    
    // Manejar la tecla Enter para activar/desactivar el chat
    if (event.key === 'Enter') {
      if (isChatting) {
        // Si ya estaba chateando, enviar el mensaje y salir del modo chat
        if (chatInputValue.trim()) {
          sendChatMessage(chatInputValue.trim());
        }
        setIsChatting(false);
        setChatInputValue('');
      } else {
        // Activar el modo chat
        setIsChatting(true);
      }
      event.preventDefault();
      return;
    }
    
    // Si está en modo chat, no procesar teclas de movimiento
    if (isChatting) {
      return;
    }
    
    let newX = position.x;
    let newY = position.y;
    let newDirection = direction;
    let currentKey = null;
    
    // Determinar la nueva posición basada en la tecla presionada
    switch (event.key.toLowerCase()) {
      case 'w':
      case 'arrowup': // Mantener compatibilidad con flechas
        newY -= 1;
        newDirection = 'up';
        currentKey = 'up';
        setIsKeyPressed(true); // Marcar que una tecla de movimiento está presionada
        break;
      case 's':
      case 'arrowdown': // Mantener compatibilidad con flechas
        newY += 1;
        newDirection = 'down';
        currentKey = 'down';
        setIsKeyPressed(true);
        break;
      case 'a':
      case 'arrowleft': // Mantener compatibilidad con flechas
        newX -= 1;
        newDirection = 'left';
        currentKey = 'left';
        setIsKeyPressed(true);
        break;
      case 'd':
      case 'arrowright': // Mantener compatibilidad con flechas
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
      // Si es una nueva dirección, verificamos si es opuesta a la actual
      const isOppositeDirection = 
        (currentKey === 'right' && lastDirection === 'left') ||
        (currentKey === 'left' && lastDirection === 'right') ||
        (currentKey === 'up' && lastDirection === 'down') ||
        (currentKey === 'down' && lastDirection === 'up');
      
      // Si es dirección opuesta, solo girar sin mover en la primera pulsación
      if (isOppositeDirection) {
        console.log('Dirección opuesta detectada, solo girando');
        setLastDirection(currentKey);
        // No actualizar la posición, solo girar
        
        // Activar un cooldown más corto para el giro
        setCanMove(false);
        setTimeout(() => {
          setCanMove(true);
        }, MOVEMENT_SPEED / 2); // El giro es más rápido que el movimiento
      } else {
        // Si no es dirección opuesta, actualizar dirección y mover
        setLastDirection(currentKey);
        
        // Mover al personaje si la posición es válida
        if (isValidPosition(newX, newY)) {
          setPosition({ x: newX, y: newY });
          
          // Activar el cooldown
          setCanMove(false);
          
          // Reactivar el movimiento después del tiempo definido
          setTimeout(() => {
            setCanMove(true);
          }, MOVEMENT_SPEED);
        }
      }
    }
  };

  // Manejar cuando se suelta una tecla
  const handleKeyUp = (event) => {
    // Verificar si es una tecla de movimiento (WASD o flechas)
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(event.key)) {
      console.log('Tecla de movimiento liberada');
      setIsKeyPressed(false);
    }
  };

  // Manejar cambios en el input de chat
  const handleChatInputChange = (e) => {
    setChatInputValue(e.target.value);
  };

  // Manejar envío de mensaje de chat
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (chatInputValue.trim()) {
      sendChatMessage(chatInputValue.trim());
      setIsChatting(false);
      setChatInputValue('');
    }
  };

  // Función para enviar mensaje de chat a Firebase
  const sendChatMessage = (message) => {
    if (!currentUser) return;
    
    const playerRef = ref(database, `online_players/${currentUser.uid}`);
    
    // Actualizar el mensaje de chat en Firebase
    update(playerRef, {
      chatMessage: message,
      chatTimestamp: serverTimestamp()
    }).catch(error => {
      console.error('Error al enviar mensaje de chat:', error);
    });
    
    // Establecer un temporizador para borrar el mensaje después de un tiempo
    setTimeout(() => {
      if (currentUser) {
        update(playerRef, { chatMessage: null });
        setChatMessage(null);
      }
    }, 5000); // El mensaje desaparece después de 5 segundos
    
    // Actualizar el estado local
    setChatMessage(message);
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
  }, [
    position, 
    gameStarted, 
    direction, 
    lastDirection, 
    canMove, 
    isChatting, 
    chatInputValue, 
    chatMessage
  ]); // Incluir todas las dependencias necesarias

  // Referencia para el personaje
  const characterRef = useRef(null);
  
  // Referencia para el viewport
  const viewportRef = useRef(null);
  
  // Función para centrar la cámara en el personaje
  const centerCameraOnCharacter = () => {
    if (characterRef.current && viewportRef.current) {
      // Posición del personaje en el mundo
      const characterX = position.x * TILE_SIZE;
      const characterY = position.y * TILE_SIZE;
      
      // Actualizar la posición de la cámara para mantener al personaje centrado
      setCameraPosition({
        x: characterX - (window.innerWidth / ZOOM_FACTOR / 2) + (TILE_SIZE / 2),
        y: characterY - (window.innerHeight / ZOOM_FACTOR / 2) + (TILE_SIZE / 2)
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
  

  // Efecto para manejar el redimensionamiento de la ventana
  useEffect(() => {
    const handleResize = () => {
      // Actualizar la cámara cuando cambia el tamaño de la ventana
      centerCameraOnCharacter();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Efecto para prevenir el comportamiento de scroll y zoom del navegador
  useEffect(() => {
    const preventDefaultBehavior = (e) => {
      if (e.target === gameContainerRef.current || gameContainerRef.current.contains(e.target)) {
        e.preventDefault();
      }
    };

    document.addEventListener('wheel', preventDefaultBehavior, { passive: false });
    document.addEventListener('touchmove', preventDefaultBehavior, { passive: false });

    return () => {
      document.removeEventListener('wheel', preventDefaultBehavior);
      document.removeEventListener('touchmove', preventDefaultBehavior);
    };
  }, []);

  return (
    <div
      className="game-container"
      ref={gameContainerRef}
      tabIndex="0"
    >
      {!gameStarted ? (
        <div
          className="start-screen"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            zIndex: 10
          }}
        >
          <h1>Chapita</h1>
          <p>Bienvenido, {currentUser?.displayName || 'Jugador'}</p>
          <p>Presiona ENTER para comenzar</p>
        </div>
      ) : null}

      {/* Panel de información y controles */}
      <div
        className="game-ui"
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          padding: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          borderRadius: '5px',
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        <div className="user-info">
          <p>Jugador: {currentUser?.displayName || 'Anónimo'}</p>
          <p>Posición: X:{position.x}, Y:{position.y}</p>
        </div>

        <button
          onClick={() => navigate('/profile')}
          style={{
            padding: '5px 10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Perfil
        </button>

        <button
          onClick={handleLogout}
          style={{
            padding: '5px 10px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Panel de jugadores online */}
      <div
        className="online-players-panel"
        style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          width: '200px',
          maxHeight: '300px',
          overflowY: 'auto',
          padding: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          borderRadius: '5px',
          zIndex: 5
        }}
      >
        <h3>Jugadores Online ({Object.keys(onlinePlayers).length})</h3>
        {Object.keys(onlinePlayers).length === 0 ? (
          <p>No hay otros jugadores online</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {Object.entries(onlinePlayers).map(([id, player]) => (
              <li
                key={id}
                style={{
                  marginBottom: '5px',
                  padding: '5px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '3px'
                }}
              >
                <div style={{ fontWeight: 'bold' }}>
                  {player.username || 'Jugador'}
                </div>
                <div>X:{player.position?.x || 0}, Y:{player.position?.y || 0}</div>
                {player.chatMessage && (
                  <div style={{ color: 'yellow' }}>
                    {player.username || 'Jugador'}: {player.chatMessage}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        className="viewport"
        ref={viewportRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden'
        }}
      >
        <div
          className="game-world"
          style={{
            position: 'absolute',
            width: `${map1[0].length * TILE_SIZE}px`,
            height: `${map1.length * TILE_SIZE}px`,
            transform: `translate3d(${-cameraPosition.x}px, ${-cameraPosition.y}px, 0) scale(${ZOOM_FACTOR})`,
            transformOrigin: '0 0',
            willChange: 'transform'
          }}
        >
          <GameMap map={map1} />

          {/* Renderizar otros jugadores */}
          {Object.entries(onlinePlayers).map(([playerId, playerData]) => (
            <Character
              key={playerId}
              position={playerData.position}
              direction={playerData.lastDirection || 'down'}
              isOtherPlayer={true}
              username={playerData.username || 'Jugador'}
              isMoving={playerData.isMoving}
              visible={!playerData.isInactive} // Ocultar jugadores inactivos
              chatMessage={playerData.chatMessage}
            />
          ))}

          {/* Personaje del jugador actual */}
          <Character
            position={position}
            direction={direction}
            isKeyPressed={isKeyPressed}
            ref={characterRef}
            username={currentUser?.displayName || currentUser?.email || 'Jugador'}
            chatMessage={chatMessage}
            isChatting={isChatting}
          />
        </div>
        <p>
          Usa las teclas WASD para mover al personaje
        </p>
      </div>
      
      {/* Interfaz de chat */}
      {gameStarted && isChatting && (
        <div className="chat-interface">
          <form onSubmit={handleChatSubmit}>
            <input 
              type="text" 
              value={chatInputValue}
              onChange={handleChatInputChange}
              placeholder="Escribe un mensaje..."
              autoFocus
              maxLength="100"
            />
            <button type="submit">Enviar</button>
            <div className="chat-help">Presiona Enter para cancelar</div>
          </form>
        </div>
      )}
      
      {/* Instrucciones de chat */}
      {gameStarted && !isChatting && (
        <div className="chat-instructions" style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '5px',
          fontSize: '12px'
        }}>
          Presiona Enter para chatear
        </div>
      )}
    </div>
  );
};

export default Game;
