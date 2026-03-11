import React from 'react';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSun, FaMoon, FaSignOutAlt, FaUser } from 'react-icons/fa';
import api from '../services/api';

const Header = () => {
  const { user } = useUser();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const getTitle = (pathname) => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/transactions':
        return 'Transacciones';
      case '/categories':
        return 'Categorías';
      default:
        return 'Mi Aplicación';
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Si falla el logout en el server igual limpiamos localmente
    } finally {
      localStorage.removeItem('auth_token');
      navigate('/', { replace: true });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <header className="header-glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e17055] to-[#f5a692] flex items-center justify-center">
              <span className="text-white font-bold text-lg">$</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {getTitle(location.pathname)}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="icon-btn"
              aria-label="Cambiar tema"
            >
              {theme === 'dark' ? (
                <FaSun className="w-5 h-5" />
              ) : (
                <FaMoon className="w-5 h-5" />
              )}
            </button>
            
            <div className="dropdown dropdown-end">
              <div 
                tabIndex={0} 
                role="button" 
                className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#e17055] to-[#c45c44] flex items-center justify-center overflow-hidden">
                  {user.profile_picture_url ? (
                    <img
                      src={user.profile_picture_url}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <span
                    className="w-full h-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ display: user.profile_picture_url ? 'none' : 'flex' }}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-3 shadow-xl rounded-2xl w-56 mt-3 glass-card-dashboard">
                <li className="menu-title px-2 py-1">
                  <span className="text-sm font-medium">{user.name}</span>
                </li>
                <div className="divider my-2"></div>
                <li>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-[#e17055] hover:bg-[#fde8e4] dark:hover:bg-[#e17055]/20 rounded-lg"
                  >
                    <FaSignOutAlt className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
