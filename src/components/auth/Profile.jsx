import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Profile = () => {
  const { currentUser, logout, getUserData, updateUserData } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (currentUser) {
          const data = await getUserData(currentUser.uid);
          setUserData(data);
        }
      } catch (error) {
        setError('Error al cargar los datos del perfil');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser, getUserData]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      setError('Error al cerrar sesión');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="loading">Cargando perfil...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>Perfil de Usuario</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        {userData && (
          <div className="profile-info">
            <div className="profile-avatar">
              {/* Aquí podrías mostrar un avatar personalizado */}
              <div className="avatar-placeholder">
                {userData.username ? userData.username.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
            
            <div className="profile-details">
              <p><strong>Nombre de usuario:</strong> {userData.username}</p>
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>Miembro desde:</strong> {new Date(userData.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div className="game-stats">
              <h3>Estadísticas de Juego</h3>
              <p><strong>Última posición:</strong> X: {userData.position?.x || 0}, Y: {userData.position?.y || 0}</p>
              <p><strong>Dirección:</strong> {userData.lastDirection || 'abajo'}</p>
              {/* Aquí puedes añadir más estadísticas del juego */}
            </div>
          </div>
        )}
        
        <div className="profile-actions">
          <button className="game-button" onClick={() => navigate('/game')}>
            Jugar
          </button>
          <button className="logout-button" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
