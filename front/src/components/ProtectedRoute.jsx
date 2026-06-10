import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import { UserProvider } from '../contexts/UserContext';

const ProtectedRoute = ({ children }) => {
  const [state, setState] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) { setState(false); return; }
      try {
        const res = await api.get('/user');
        setUser(res.data);
        setState(true);
      } catch {
        localStorage.removeItem('auth_token');
        setState(false);
      }
    };
    verify();
  }, []);

  if (state === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200 bg-gradient">
        <div className="card bg-base-100 shadow-md p-8 text-center">
          <span className="loading loading-spinner loading-lg mb-3" />
          <p className="caption">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!state) return <Navigate to="/" replace />;

  return <UserProvider initialUser={user}>{children}</UserProvider>;
};

export default ProtectedRoute;
