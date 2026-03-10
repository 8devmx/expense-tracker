import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaCalendarAlt, FaSave, FaCog } from 'react-icons/fa';

const Settings = () => {
  const [settings, setSettings] = useState({
    transaction_month_start_day: 1,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      const data = response.data;
      
      setSettings({
        transaction_month_start_day: data.transaction_month_start_day || 1,
      });
      setLoading(false);
    } catch (err) {
      console.error('Error al obtener configuración:', err);
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        transaction_month_start_day: parseInt(settings.transaction_month_start_day),
      };

      await api.put('/settings', payload);
      setMessage({ type: 'success', text: 'Configuración guardada correctamente' });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error al guardar:', err);
      setMessage({ type: 'error', text: 'Error al guardar la configuración' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-[#e17055] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-[#e17055] font-medium">Cargando configuración...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#a78bfa] flex items-center justify-center">
            <FaCog className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Configuración
            </h2>
            <p className="text-[#6b7280] mt-1">Personaliza tu experiencia</p>
          </div>
        </div>

        <div className="glass-card-dashboard p-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e17055] to-[#f5a692] flex items-center justify-center">
              <FaCalendarAlt className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Día de Inicio del Mes
            </h3>
          </div>

          <p className="text-[#6b7280] mb-6">
            Selecciona el día de inicio del mes para mostrar tus transacciones. 
            Cada mes mostrará transacciones desde este día hasta el día anterior del siguiente mes.
          </p>

          <form onSubmit={handleSave}>
            <div className="mb-6">
              <label className="form-label-custom">Día de inicio del mes</label>
              <select
                value={settings.transaction_month_start_day}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  transaction_month_start_day: parseInt(e.target.value) 
                }))}
                className="form-input-custom"
              >
                {[...Array(28)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Día {i + 1}
                  </option>
                ))}
              </select>
              <p className="text-sm text-[#6b7280] mt-2">
                Ejemplo: Si seleccionas el <strong>día 25</strong>, al navegar a 
                <strong> Marzo 2026</strong>, se mostrarán transacciones del 
                <strong> 25 Febrero al 24 Marzo</strong>.
              </p>
            </div>

            {message && (
              <div className={`mb-4 p-3 rounded-xl ${
                message.type === 'success' 
                  ? 'bg-[#d1fae5] text-[#059669]' 
                  : 'bg-[#fde8e4] text-[#e17055]'
              }`}>
                {message.text}
              </div>
            )}

            <button 
              type="submit" 
              className="btn-primary-custom flex items-center gap-2"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Guardando...
                </>
              ) : (
                <>
                  <FaSave className="w-4 h-4" />
                  Guardar Configuración
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 glass-card-dashboard p-4">
          <p className="text-sm text-[#6b7280]">
            <strong>Nota:</strong> Esta configuración afecta cómo se muestran las transacciones en el módulo de Transacciones. 
            El rango de fechas se calculará automáticamente según el mes que navegues.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
