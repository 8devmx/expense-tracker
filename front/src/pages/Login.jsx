import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../services/api';
import { FcGoogle } from 'react-icons/fc';
import { FiEye, FiEyeOff, FiDollarSign } from 'react-icons/fi';
import { Button, Input } from '../components/ui';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('auth_token')) navigate('/dashboard', { replace: true });
  }, []);

  const [mode, setMode] = useState('login');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });

  const change = (e) => { setError(''); setForm(p => ({ ...p, [e.target.name]: e.target.value })); };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'register' && form.password !== form.password_confirmation) {
      setError('Las contraseñas no coinciden.'); return;
    }
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password, password_confirmation: form.password_confirmation };
      const res = await api.post(endpoint, payload);
      localStorage.setItem('auth_token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Ocurrió un error.');
    } finally { setLoading(false); }
  };

  const google = useGoogleLogin({
    onSuccess: async (tr) => {
      setLoading(true); setError('');
      try {
        const res = await api.post('/auth/google/callback', { google_access_token: tr.access_token });
        localStorage.setItem('auth_token', res.data.token);
        navigate('/dashboard');
      } catch { setError('Error al iniciar sesión con Google.'); } finally { setLoading(false); }
    },
    onError: () => setError('Inicio de sesión cancelado.'),
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-base-200 bg-gradient">
      <div className="w-full max-w-sm animate-slideUp">
        <div className="text-center mb-7">
          <div className="w-15 h-15 rounded-2xl bg-gradient-to-br from-primary to-[#B71C1C] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <FiDollarSign size={30} color="white" />
          </div>
          <h1 className="page-title">Expense Tracker</h1>
          <p className="caption mt-1.5 text-base">
            Gestiona tus finanzas personales
          </p>
        </div>

        <div className="card bg-base-100 shadow-xl p-6 lg:p-7">
          <div role="tablist" className="tabs tabs-bordered mb-4">
            <button
              role="tab"
              className={`tab flex-1 ${mode === 'login' ? 'tab-active' : ''}`}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Iniciar sesión
            </button>
            <button
              role="tab"
              className={`tab flex-1 ${mode === 'register' ? 'tab-active' : ''}`}
              onClick={() => { setMode('register'); setError(''); }}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-3.5">
            {mode === 'register' && (
              <Input type="text" name="name" value={form.name} onChange={change} label="Nombre" placeholder="Tu nombre" required autoComplete="name" />
            )}
            <Input type="email" name="email" value={form.email} onChange={change} label="Correo electrónico" placeholder="correo@ejemplo.com" required autoComplete="email" />
            <Input
              type={showPw ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={change}
              label="Contraseña"
              placeholder={mode === 'register' ? 'Mínimo 8 caracteres' : '••••••••'}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              rightSlot={
                <Button variant="ghost" size="xs" className="btn-circle text-base-content/40 hover:text-base-content/60" onClick={() => setShowPw(p => !p)}>
                  {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </Button>
              }
            />
            {mode === 'register' && (
              <Input type={showPw ? 'text' : 'password'} name="password_confirmation" value={form.password_confirmation} onChange={change}
                label="Confirmar contraseña" placeholder="Repite tu contraseña" required autoComplete="new-password" />
            )}

            {error && (
              <div className="alert alert-error text-sm py-2.5">
                {error}
              </div>
            )}

            <Button variant="primary" className="w-full" type="submit" disabled={loading}>
              {loading ? <span className="loading loading-spinner" /> : (mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta')}
            </Button>
          </form>

          <div className="divider text-xs text-base-content/40 my-4">o</div>

          <Button variant="ghost" className="w-full gap-2" type="button" onClick={() => google()} disabled={loading}>
            <FcGoogle size={20} />
            Continuar con Google
          </Button>
        </div>

        <p className="text-center text-xs text-base-content/40 mt-5 leading-relaxed">
          Al continuar, aceptas nuestros términos y condiciones
        </p>
      </div>
    </div>
  );
};

export default Login;
