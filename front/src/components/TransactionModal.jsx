import { useState, useEffect } from 'react';
import { FiX, FiChevronLeft } from 'react-icons/fi';
import { Button, Input } from './ui';
import CustomDatePicker from './CustomDatePicker';

const REPEAT_OPTIONS = [
  { value: 'none', label: 'No' },
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
  const set = (field, value) => setData(p => ({ ...p, [field]: value }));
  const filteredCats = categories.filter(c => c.type === data.type);
  const isIncome = data.type === 'income';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    onSubmit(data);
  };

  return (
    <dialog className="modal modal-bottom sm:modal-middle" open>
      <div className="modal-box p-0 pb-2 max-w-sm">
        <div className="sticky top-0 bg-base-100 z-10 rounded-t-2xl">
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <div>
              <h2 className="font-display text-lg font-semibold">
                {isEdit ? 'Editar' : 'Nueva'} transacción
              </h2>
              <p className="caption">Paso {step} de 2</p>
            </div>
            <Button variant="ghost" size="sm" className="btn-circle" onClick={onClose}>
              <FiX size={18} />
            </Button>
          </div>

          <div className="flex gap-1.5 px-5 pb-3">
            {['expense', 'income'].map(t => (
              <Button key={t} variant={data.type === t ? 'primary' : 'ghost'} size="md" className="flex-1"
                onClick={() => { set('type', t); set('category_id', ''); }}
              >
                {t === 'income' ? '💰 Ingreso' : '💸 Gasto'}
              </Button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-5 py-2 flex flex-col gap-3.5">
            {step === 1 && (
              <>
                <Input
                  label="Monto"
                  leftIcon={<span className={`text-lg font-bold ${isIncome ? 'text-success' : 'text-error'}`}>$</span>}
                  type="number"
                  value={data.amount}
                  onChange={e => set('amount', e.target.value)}
                  inputClassName={`text-lg font-bold ${isIncome ? 'text-success' : 'text-error'}`}
                  placeholder="0.00"
                  step="0.01"
                  required
                />
                <Input
                  label="Descripción"
                  type="text"
                  value={data.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Ej: Comida, gasolina..."
                  required
                />
                <label className="form-control w-full">
                  <span className="label-text text-xs text-base-content/60 mb-1">Fecha</span>
                  <CustomDatePicker selected={data.date} onChange={d => set('date', d)} />
                </label>
              </>
            )}

            {step === 2 && (
              <>
                <label className="form-control w-full">
                  <span className="label-text text-xs text-base-content/60 mb-1.5">Categoría</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {filteredCats.map(cat => {
                      const sel = String(data.category_id) === String(cat.id);
                      return (
                        <button key={cat.id} type="button" onClick={() => set('category_id', cat.id)}
                          className={`flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] font-medium transition-all ${sel ? 'bg-primary/10 text-primary ring-2 ring-primary' : 'bg-base-200 text-base-content/60 hover:bg-base-300'}`}
                        >
                          <span className="text-lg">{cat.emoji}</span>
                          <span className="leading-tight">{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </label>
                <label className="form-control w-full">
                  <span className="label-text text-xs text-base-content/60 mb-1.5">¿Se repite?</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {REPEAT_OPTIONS.map(opt => {
                      const sel = (data.repeat_frequency || 'none') === opt.value;
                      return (
                        <Button key={opt.value} variant={sel ? 'primary' : 'ghost'} size="sm" onClick={() => set('repeat_frequency', opt.value)}>
                      {opt.label}
                    </Button>
                      );
                    })}
                  </div>
                </label>
                {data.repeat_frequency && data.repeat_frequency !== 'none' && (
                  <label className="form-control w-full">
                    <span className="label-text text-xs text-base-content/60 mb-1">Repetir hasta</span>
                    <CustomDatePicker selected={data.repeat_end_date} onChange={d => set('repeat_end_date', d)} placeholder="Sin fecha límite" />
                  </label>
                )}
              </>
            )}
          </div>

          <div className="flex gap-2 px-5 pt-3 pb-4 border-t border-base-200 mt-3">
            {step === 2 && (
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                <FiChevronLeft size={15} />
                Atrás
              </Button>
            )}
            <Button variant="primary" className="flex-1" type="submit"
              disabled={step === 1 ? (!data.description || !data.amount) : !data.category_id}
            >
              {step === 1 ? 'Siguiente' : (isEdit ? 'Guardar cambios' : 'Guardar')}
            </Button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default TransactionModal;
