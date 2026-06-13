import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiSun, FiMoon, FiLogOut } from 'react-icons/fi';
import { auth } from '../services/api';

const THEME_DARK = 'expense-tracker-dark';

const Header = () => {
  const { user } = useUser();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const getTitle = (pathname) => {
    switch (pathname) {
      case '/dashboard': return 'Dashboard';
      case '/transactions': return 'Transacciones';
      case '/budgets': return 'Presupuestos';
      case '/categories': return 'Categorías';
      case '/settings': return 'Ajustes';
      default: return '';
    }
  };

  const handleLogout = async () => {
    try { await auth.signOut(); } catch {} finally {
      navigate('/', { replace: true });
    }
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 bg-base-100/70 backdrop-blur-xl border-b border-base-300/50">
      <div className="max-w-3xl lg:max-w-6xl mx-auto px-5 lg:px-10 h-14 lg:h-16 flex items-center justify-between">
        {/* Title */}
        <h1 className="text-lg lg:text-xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
          {getTitle(location.pathname)}
        </h1>
        
        {/* Actions */}
        <div className="flex gap-0.5">
          <button 
            onClick={toggleTheme} 
            className="w-10 h-10 rounded-full hover:bg-base-200 active:bg-base-300 transition-colors flex items-center justify-center text-base-content/60 hover:text-base-content"
            aria-label="Cambiar tema"
          >
            {theme === THEME_DARK ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
          <button 
            onClick={handleLogout} 
            className="w-10 h-10 rounded-full hover:bg-base-200 active:bg-base-300 transition-colors flex items-center justify-center text-base-content/60 hover:text-base-content"
            aria-label="Cerrar sesión"
          >
            {user.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <FiLogOut size={18} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
