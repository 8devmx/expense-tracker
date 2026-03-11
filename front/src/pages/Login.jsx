import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../services/api';
import { FcGoogle } from 'react-icons/fc';
import { FaWallet, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();

  // Si ya tiene sesión activa, redirigir al dashboard
  useEffect(() => {
    if (localStorage.getItem('auth_token')) {
      navigate('/dashboard', { replace: true });
    }
  }, []);

  // 'login' | 'register'
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const handleChange = (e) => {
    setError('');
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && form.password !== form.password_confirmation) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password, password_confirmation: form.password_confirmation };

      const response = await api.post(endpoint, payload);
      localStorage.setItem('auth_token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.errors?.email?.[0]
        || 'Ocurrió un error. Intenta de nuevo.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        const response = await api.post('/auth/google/callback', {
          google_access_token: tokenResponse.access_token,
        });
        localStorage.setItem('auth_token', response.data.token);
        navigate('/dashboard');
      } catch (err) {
        setError('Error al iniciar sesión con Google. Intenta con email y contraseña.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('El inicio de sesión con Google fue cancelado.'),
  });

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #e17055 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-black/20" />

      <div className="glass-card-dashboard p-8 w-full max-w-md relative z-10 animate-slide-up">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#e17055] to-[#f5a692] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FaWallet className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Expense Tracker
          </h2>
          <p className="text-[#6b7280] mt-2">Gestiona tus finanzas personales</p>
        </div>

        {/* Mode toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === 'login'
                ? 'bg-white shadow text-[#1f2937]'
                : 'text-[#6b7280] hover:text-[#1f2937]'
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === 'register'
                ? 'bg-white shadow text-[#1f2937]'
                : 'text-[#6b7280] hover:text-[#1f2937]'
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {mode === 'register' && (
            <div>
              <label className="form-label-custom">Nombre</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Tu nombre"
                className="form-input-custom"
                required
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label className="form-label-custom">Correo electrónico</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              className="form-input-custom"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="form-label-custom">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={mode === 'register' ? 'Mínimo 8 caracteres' : '••••••••'}
                className="form-input-custom pr-12"
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#e17055] transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="form-label-custom">Confirmar contraseña</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                className="form-input-custom"
                required
                autoComplete="new-password"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-xl font-medium transition-all duration-200 bg-[#e17055] text-white hover:bg-[#c45c44] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {mode === 'login' ? 'Ingresando...' : 'Creando cuenta...'}
              </>
            ) : (
              mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white/80 text-gray-400">o continúa con</span>
          </div>
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={() => handleGoogleLogin()}
          disabled={loading}
          className="w-full py-4 px-6 rounded-xl font-medium flex items-center justify-center gap-3 transition-all duration-200 bg-white text-gray-800 hover:bg-gray-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          <FcGoogle className="w-6 h-6" />
          Google
        </button>

        <p className="text-center text-sm text-[#6b7280] mt-8">
          Al continuar, aceptas nuestros términos y condiciones
        </p>
      </div>
    </div>
  );
};

export default Login;
