import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200 bg-gradient">
        <div className="card bg-base-100 shadow-md p-8 text-center">
          <span className="loading loading-spinner loading-lg mb-3" />
          <p className="caption">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
