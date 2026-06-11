import { useState, useEffect } from 'react';
import { settingsApi, auth } from '../services/api';
import { FiSun, FiMoon, FiLogOut, FiChevronRight } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const THEME_DARK = 'expense-tracker-dark';

const Section = ({ title, children }) => (
  <div className="mb-5">
    <p className="section-label ml-3.5 mb-1.5">{title}</p>
    <div className="card bg-base-100 shadow-sm">{children}</div>
  </div>
);

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({ transaction_month_start_day: 1 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    settingsApi.get().then(({ data }) => {
      if (data) setSettings({ transaction_month_start_day: data.transaction_month_start_day || 1 });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async (day) => {
    try {
      await settingsApi.update({ transaction_month_start_day: day });
      setSettings(p => ({ ...p, transaction_month_start_day: day }));
      setMessage({ type: 'success', text: 'Guardado' });
      setTimeout(() => setMessage(null), 2000);
    } catch { setMessage({ type: 'error', text: 'Error' }); }
  };

  const handleLogout = async () => {
    try { await auth.signOut(); } catch {} finally {
      navigate('/');
    }
  };

  if (loading) return <div className="flex justify-center pt-20">
    <div className="card bg-base-100 shadow-md p-5">
      <span className="loading loading-spinner loading-md mx-auto block" />
    </div>
  </div>;

  return (
    <div>
      <Section title="Apariencia">
        <label className="flex items-center gap-3 w-full px-4 py-3.5 text-left text-sm cursor-pointer">
          <span className="text-lg w-6 text-center flex-shrink-0 text-base-content/60">
            {theme === THEME_DARK ? <FiMoon /> : <FiSun />}
          </span>
          <span className="flex-1">Modo oscuro</span>
          <input type="checkbox" checked={theme === THEME_DARK} onChange={toggleTheme} className="toggle toggle-sm" />
        </label>
      </Section>

      <Section title="Preferencias">
        <div className="px-4 py-3.5">
          <label className="form-control w-full">
            <span className="label-text text-xs text-base-content/60 mb-1.5">Día de inicio del mes</span>
            <select value={settings.transaction_month_start_day} onChange={(e) => handleSave(parseInt(e.target.value))} className="select select-bordered w-full">
              {[...Array(28)].map((_, i) => <option key={i + 1} value={i + 1}>Día {i + 1}</option>)}
            </select>
          </label>
          <p className="caption mt-2 leading-relaxed">
            Al navegar a Marzo 2026, se mostrarán transacciones del día {settings.transaction_month_start_day} de Febrero al día {settings.transaction_month_start_day - 1} de Marzo.
          </p>
          {message && (
            <div className={`alert mt-2 text-xs py-1.5 ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              {message.text}
            </div>
          )}
        </div>
      </Section>

      <Section title="Cuenta">
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3.5 text-left text-sm text-error">
          <span className="text-lg w-6 text-center flex-shrink-0"><FiLogOut /></span>
          <span className="flex-1">Cerrar sesión</span>
          <FiChevronRight size={16} />
        </button>
      </Section>
    </div>
  );
};

export default Settings;
