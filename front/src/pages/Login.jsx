import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../services/api';
import { FcGoogle } from 'react-icons/fc';
import { FaWallet } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await api.post('/auth/google/callback', {
          google_access_token: tokenResponse.access_token,
        });

        const { token } = response.data;
        localStorage.setItem('auth_token', token);
        navigate('/dashboard');
      } catch (error) {
        console.error('Error al iniciar sesión con el backend:', error);
        alert('Hubo un error al iniciar sesión. Intenta de nuevo.');
      }
    },
    onError: () => {
      console.log('Fallo en el inicio de sesión de Google');
    },
  });

  const handleTestLogin = async () => {
    try {
      const response = await api.post('/auth/test-login', {
        email: 'test@example.com'
      });

      const { token } = response.data;
      localStorage.setItem('auth_token', token);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error en login de prueba:', error);
      alert('Hubo un error en el login de prueba.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #e17055 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="glass-card-dashboard p-8 w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#e17055] to-[#f5a692] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FaWallet className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Expense Tracker
          </h2>
          <p className="text-[#6b7280] mt-2">Gestiona tus finanzas personales</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin} 
            className="w-full py-4 px-6 rounded-xl font-medium flex items-center justify-center gap-3 transition-all duration-200 bg-white text-gray-800 hover:bg-gray-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <FcGoogle className="w-6 h-6" />
            Iniciar sesión con Google
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/80 text-gray-500">o</span>
            </div>
          </div>

          <button 
            onClick={handleTestLogin} 
            className="w-full py-4 px-6 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200 bg-[#e17055] text-white hover:bg-[#c45c44] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            🔐 Login de Prueba
          </button>
        </div>

        <p className="text-center text-sm text-white/70 mt-8">
          Al iniciar sesión, aceptas nuestros términos y condiciones
        </p>
      </div>
    </div>
  );
};

export default Login;
