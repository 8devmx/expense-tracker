// src/components/ProtectedRoute.jsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import { UserProvider } from '../contexts/UserContext';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);
  const authToken = localStorage.getItem('auth_token');

  useEffect(() => {
    const verifyToken = async () => {
      if (!authToken) {
        setIsAuthenticated(false);
        return;
      }

      try {
        // Petición al endpoint de usuario para verificar el token
        const response = await api.get('/user');
        setUser(response.data); // <-- Guarda los datos del usuario
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Error de autenticación:', err);
        localStorage.removeItem('auth_token');
        setIsAuthenticated(false);
      }
    };
    verifyToken();
  }, [authToken]);

  if (isAuthenticated === null || user === null) {
    return (
      <div className="container">
        <div className="card">
          <div className="skeleton skeleton-title"></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!authToken) {
    return <Navigate to="/login" replace />;
  }

  return <UserProvider initialUser={user}>{children}</UserProvider>;
};

export default ProtectedRoute;
