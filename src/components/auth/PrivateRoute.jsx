import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Componente para proteger rutas que requieren autenticación
const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  // Si no hay usuario autenticado, redirigir al login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // Si hay usuario autenticado, mostrar el contenido protegido
  return children;
};

export default PrivateRoute;
