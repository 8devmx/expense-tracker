import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTimes, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import CustomDatePicker from './CustomDatePicker';

const REPEAT_OPTIONS = [
  { value: 'none', label: 'Sin repetición' },
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quincenal' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'bimonthly', label: 'Bimestral' },
];

const TransactionModal = ({ mode = 'create', initialData, categories, onSubmit, onClose }) => {
  const isEdit = mode === 'edit';
  const [step, setStep] = useState(1);
  const [data, setData] = useState(initialData);

  useEffect(() => { setData(initialData); }, [initialData]);

  const set = (field, value) => setData(prev => ({ ...prev, [field]: value }));

  const filteredCats = categories.filter(c => c.type === data.type);

  const canGoNext = data.description.trim() && data.amount && data.date;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    onSubmit(data);
  };

  const accentColor = data.type === 'income' ? '#10b981' : '#e17055';
  const accentLight = data.type === 'income' ? '#d1fae5' : '#fde8e4';
  const accentGradient = data.type === 'income'
    ? 'linear-gradient(135deg, #10b981, #6ee7b7)'
    : 'linear-gradient(135deg, #e17055, #f5a692)';

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal — sheet en mobile, centrado en desktop */}
      <div
        className="relative z-10 w-full sm:max-w-lg animate-slide-up"
        style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(24px)',
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
        }}
      >
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header con gradiente */}
        <div
          className="px-6 pt-4 pb-5 rounded-t-2xl"
          style={{ background: accentGradient }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                {isEdit
                  ? <FaEdit className="w-4 h-4 text-white" />
                  : <FaPlus className="w-4 h-4 text-white" />
                }
              </div>
              <div>
                <p className="text-white font-bold text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {isEdit ? 'Editar transacción' : 'Nueva transacción'}
                </p>
                <p className="text-white/70 text-xs">
                  Paso {step} de 2 — {step === 1 ? 'Datos principales' : 'Categoría y repetición'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
            >
              <FaTimes className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4 flex gap-1.5">
            {[1, 2].map(s => (
              <div
                key={s}
                className="h-1 flex-1 rounded-full transition-all duration-300"
                style={{ background: s <= step ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)' }}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5">

            {/* ── PASO 1 ── */}
            {step === 1 && (
              <div className="space-y-4">

                {/* Tipo */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { set('type', 'expense'); set('category_id', ''); }}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
                    style={{
                      background: data.type === 'expense' ? '#e17055' : '#fde8e4',
                      color: data.type === 'expense' ? 'white' : '#e17055',
                      boxShadow: data.type === 'expense' ? '0 4px 14px rgba(225,112,85,0.35)' : 'none',
                    }}
                  >
                    💸 Gasto
                  </button>
                  <button
                    type="button"
                    onClick={() => { set('type', 'income'); set('category_id', ''); }}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
                    style={{
                      background: data.type === 'income' ? '#10b981' : '#d1fae5',
                      color: data.type === 'income' ? 'white' : '#10b981',
                      boxShadow: data.type === 'income' ? '0 4px 14px rgba(16,185,129,0.35)' : 'none',
                    }}
                  >
                    💰 Ingreso
                  </button>
                </div>

                {/* Monto — grande y prominente */}
                <div>
                  <label className="form-label-custom">Monto</label>
                  <div className="relative">
                    <span
                      className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg"
                      style={{ color: accentColor }}
                    >
                      $
                    </span>
                    <input
                      type="number"
                      value={data.amount}
                      onChange={e => set('amount', e.target.value)}
                      className="form-input-custom pl-8 text-2xl font-bold"
                      placeholder="0.00"
                      step="0.01"
                      required
                      style={{ color: accentColor }}
                    />
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label className="form-label-custom">Descripción</label>
                  <input
                    type="text"
                    value={data.description}
                    onChange={e => set('description', e.target.value)}
                    className="form-input-custom"
                    placeholder="Ej: Comida, gasolina..."
                    required
                  />
                </div>

                {/* Fecha */}
                <div>
                  <label className="form-label-custom">Fecha</label>
                  <CustomDatePicker
                    selected={data.date}
                    onChange={date => set('date', date)}
                  />
                </div>
              </div>
            )}

            {/* ── PASO 2 ── */}
            {step === 2 && (
              <div className="space-y-4">

                {/* Categoría */}
                <div>
                  <label className="form-label-custom">Categoría</label>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {filteredCats.map(cat => {
                      const isSelected = String(data.category_id) === String(cat.id);
                      const hex = cat.color || '#6b7280';
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => set('category_id', cat.id)}
                          className="flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer"
                          style={{
                            border: isSelected ? `2px solid ${hex}` : '2px solid transparent',
                            backgroundColor: isSelected ? hex + '22' : 'rgba(0,0,0,0.04)',
                            color: isSelected ? hex : '#374151',
                            boxShadow: isSelected ? `0 0 0 1px ${hex}40` : 'none',
                          }}
                        >
                          <span className="text-xl">{cat.emoji}</span>
                          <span className="leading-tight text-center" style={{ fontSize: '10px' }}>{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  {!data.category_id && (
                    <p className="text-xs mt-1" style={{ color: accentColor }}>Selecciona una categoría</p>
                  )}
                </div>

                {/* Repetición — solo gastos */}
                {data.type === 'expense' && (
                  <div>
                    <label className="form-label-custom">¿Se repite?</label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {REPEAT_OPTIONS.map(opt => {
                        const isSelected = (data.repeat_frequency || 'none') === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => set('repeat_frequency', opt.value)}
                            className="py-2 px-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer text-center"
                            style={{
                              border: isSelected ? `2px solid ${accentColor}` : '2px solid transparent',
                              backgroundColor: isSelected ? accentColor + '18' : 'rgba(0,0,0,0.04)',
                              color: isSelected ? accentColor : '#374151',
                            }}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Fecha fin de repetición */}
                {data.repeat_frequency && data.repeat_frequency !== 'none' && (
                  <div>
                    <label className="form-label-custom">Repetir hasta</label>
                    <CustomDatePicker
                      selected={data.repeat_end_date}
                      onChange={date => set('repeat_end_date', date)}
                      placeholder="Sin fecha límite"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer con botones */}
          <div
            className="px-6 pb-6 flex gap-3"
            style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '16px' }}
          >
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all"
                style={{ background: 'rgba(0,0,0,0.05)', color: '#6b7280' }}
              >
                <FaChevronLeft className="w-3 h-3" />
                Atrás
              </button>
            )}

            {step === 1 ? (
              <button
                type="submit"
                disabled={!canGoNext}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200"
                style={{
                  background: canGoNext ? accentGradient : 'rgba(0,0,0,0.1)',
                  color: canGoNext ? 'white' : '#9ca3af',
                  cursor: canGoNext ? 'pointer' : 'not-allowed',
                  boxShadow: canGoNext ? `0 4px 14px ${accentColor}40` : 'none',
                }}
              >
                Siguiente
                <FaChevronRight className="w-3 h-3" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!data.category_id}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
                style={{
                  background: data.category_id ? accentGradient : 'rgba(0,0,0,0.1)',
                  color: data.category_id ? 'white' : '#9ca3af',
                  cursor: data.category_id ? 'pointer' : 'not-allowed',
                  boxShadow: data.category_id ? `0 4px 14px ${accentColor}40` : 'none',
                }}
              >
                {isEdit ? '✓ Guardar cambios' : '✓ Guardar'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
