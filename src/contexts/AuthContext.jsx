import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, database } from '../firebase/config';

// Crear el contexto de autenticación
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export function useAuth() {
  return useContext(AuthContext);
}

// Proveedor del contexto
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Función para registrar un nuevo usuario
  async function signup(email, password, username) {
    try {
      setError('');
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Actualizar el perfil con el nombre de usuario
      await updateProfile(userCredential.user, {
        displayName: username
      });
      
      // Guardar datos adicionales en Realtime Database
      await set(ref(database, `users/${userCredential.user.uid}`), {
        username,
        email,
        createdAt: new Date().toISOString(),
        position: { x: 5, y: 5 }, // Posición inicial
        lastDirection: 'down',    // Dirección inicial
        // Otros datos del jugador que quieras guardar
      });
      
      return userCredential.user;
    } catch (error) {
      console.error("Error al registrar:", error);
      setError(error.message);
      throw error;
    }
  }

  // Función para iniciar sesión
  async function login(email, password) {
    try {
      setError('');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setError(error.message);
      throw error;
    }
  }

  // Función para cerrar sesión
  async function logout() {
    try {
      setError('');
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setError(error.message);
      throw error;
    }
  }

  // Función para obtener datos del usuario desde la base de datos
  async function getUserData(userId) {
    try {
      const userRef = ref(database, `users/${userId}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        console.log("No se encontraron datos para este usuario");
        return null;
      }
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
      throw error;
    }
  }

  // Función para actualizar datos del usuario en la base de datos
  async function updateUserData(userId, data) {
    try {
      const userRef = ref(database, `users/${userId}`);
      await set(userRef, data);
    } catch (error) {
      console.error("Error al actualizar datos del usuario:", error);
      throw error;
    }
  }

  // Efecto para observar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    
    // Limpiar el observador al desmontar
    return unsubscribe;
  }, []);

  // Valor del contexto
  const value = {
    currentUser,
    signup,
    login,
    logout,
    error,
    getUserData,
    updateUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
