import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import { UserProvider } from '../contexts/UserContext';

const ProtectedRoute = ({ children }) => {
  // null = verificando, true = autenticado, false = no autenticado
  const [authState, setAuthState] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        setAuthState(false);
        return;
      }

      try {
        const response = await api.get('/user');
        setUser(response.data);
        setAuthState(true);
      } catch {
        localStorage.removeItem('auth_token');
        setAuthState(false);
      }
    };

    verifyToken();
  }, []);

  // Verificando — mostrar spinner centrado
  if (authState === null) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #e17055 100%)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-white font-medium">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Sin sesión — redirigir al login
  if (!authState) {
    return <Navigate to="/login" replace />;
  }

  return <UserProvider initialUser={user}>{children}</UserProvider>;
};

export default ProtectedRoute;
