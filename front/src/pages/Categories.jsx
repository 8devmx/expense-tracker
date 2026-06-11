import { useState, useEffect } from 'react';
import { categoriesApi } from '../services/api';
import { FiPlus, FiEdit, FiTrash, FiCheck } from 'react-icons/fi';
import { Button, Input, Modal } from '../components/ui';

const PALETTE = [
  '#D32F2F', '#34c759', '#ff3b30', '#ff9500', '#af52de', '#5ac8fa',
  '#ff2d55', '#5856d6', '#ffd60a', '#8e8e93', '#30b0c7', '#66d4a8',
];

const hexToRgba = (hex, a = 0.12) => {
  if (!hex) return `rgba(100,100,100,${a})`;
  const c = hex.replace('#', ''); const f = c.length === 3 ? c.split('').map(x => x + x).join('') : c.substring(0, 6);
  return `rgba(${parseInt(f.substring(0,2),16)},${parseInt(f.substring(2,4),16)},${parseInt(f.substring(4,6),16)},${a})`;
};

const Section = ({ title, categories, onEdit, onDelete }) => (
  <div className="mb-4">
    <p className="section-label mb-2">{title}</p>
    <div className="grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 lg:gap-3">
      {categories.map(cat => (
        <div key={cat.id} className="card bg-base-100 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex flex-col items-center gap-1.5 p-3.5 relative">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
              style={{ background: hexToRgba(cat.color || '#86868b', 0.2) }}>
              {cat.emoji || '📁'}
            </div>
            <p className="text-[10.5px] font-medium text-center leading-tight">{cat.name}</p>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="bg-base-200/40 hover:bg-base-200/70 rounded-lg" onClick={() => onEdit(cat)}><FiEdit size={14} /></Button>
              <Button variant="ghost" size="sm" className="bg-base-200/40 hover:bg-base-200/70 rounded-lg text-error" onClick={() => onDelete(cat.id)}><FiTrash size={14} /></Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try { const { data } = await categoriesApi.list(); setCategories(data); } catch { setError('Error al cargar.'); } finally { setLoading(false); }
  };

  const handleCreate = async () => { try { await categoriesApi.create(form.data); setForm(null); fetchCategories(); } catch { alert('Error.'); } };
  const handleEdit = async () => { try { await categoriesApi.update(form.data.id, form.data); setForm(null); fetchCategories(); } catch { alert('Error.'); } };
  const handleDelete = async (id) => { if (!window.confirm('¿Eliminar?')) return; try { await categoriesApi.remove(id); fetchCategories(); } catch { alert('Error.'); } };

  const expenseCat = categories.filter(c => c.type === 'expense');
  const incomeCat = categories.filter(c => c.type === 'income');

  if (loading) return <div className="flex justify-center pt-20">
    <div className="card bg-base-100 shadow-md p-5">
      <span className="loading loading-spinner loading-md mx-auto block" />
    </div>
  </div>;

  if (error) return <div className="py-10 text-center text-error text-sm">{error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-base-content/50 font-medium">{categories.length} categorías</p>
        <Button variant="primary" size="md" onClick={() => setForm({ mode: 'create', data: { name: '', type: 'expense', emoji: '', color: '#DC3545' } })}>
          <FiPlus size={15} />
          Añadir
        </Button>
      </div>

      <Section title="Gastos" categories={expenseCat} onEdit={(cat) => setForm({ mode: 'edit', data: { ...cat } })} onDelete={handleDelete} />
      <Section title="Ingresos" categories={incomeCat} onEdit={(cat) => setForm({ mode: 'edit', data: { ...cat } })} onDelete={handleDelete} />

      {form && (
        <Modal title={form.mode === 'create' ? 'Nueva categoría' : 'Editar categoría'} onClose={() => setForm(null)}
          footer={
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setForm(null)}>Cancelar</Button>
              <Button variant="primary" className="flex-1" onClick={form.mode === 'create' ? handleCreate : handleEdit}>
                {form.mode === 'create' ? 'Crear' : 'Guardar'}
              </Button>
            </div>
          }>
          <div className="flex flex-col gap-4 p-5">
            <Input label="Nombre" type="text" value={form.data.name}
              onChange={(e) => setForm(f => ({ ...f, data: { ...f.data, name: e.target.value } }))}
              placeholder="Ej: Comida" required />
            <Input label="Emoji" type="text" value={form.data.emoji}
              onChange={(e) => setForm(f => ({ ...f, data: { ...f.data, emoji: e.target.value } }))}
              placeholder="🍔" required />
            <label className="form-control w-full">
              <span className="label-text text-xs text-base-content/60 mb-1">Tipo</span>
              <div className="flex gap-1.5">
                {[{ value: 'expense', label: 'Gasto' }, { value: 'income', label: 'Ingreso' }].map(o => (
                  <Button key={o.value} variant={form.data.type === o.value ? 'primary' : 'ghost'} size="md" className="flex-1"
                    onClick={() => setForm(f => ({ ...f, data: { ...f.data, type: o.value } }))}>
                    {o.label}
                  </Button>
                ))}
              </div>
            </label>
            <label className="form-control w-full">
              <span className="label-text text-xs text-base-content/60 mb-1.5">Color</span>
              <div className="grid grid-cols-6 gap-2">
                {PALETTE.map(c => (
                  <button key={c} type="button" onClick={() => setForm(f => ({ ...f, data: { ...f.data, color: c } }))}
                    className={`w-full h-9 rounded-xl transition-all ${form.data.color === c ? 'ring-2 ring-base-content scale-110 shadow-lg' : 'hover:scale-105'}`}
                    style={{ background: c }}>
                    {form.data.color === c && <FiCheck size={15} color="white" className="mx-auto" />}
                  </button>
                ))}
              </div>
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Categories;
