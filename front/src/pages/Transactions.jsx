import { useState, useEffect } from 'react';
import { transactionsApi, categoriesApi } from '../services/api';
import { FiChevronLeft, FiChevronRight, FiPlus, FiEdit, FiTrash, FiCalendar } from 'react-icons/fi';
import { formatCurrency } from '../utils/format';
import TransactionModal from '../components/TransactionModal';
import { Button, Card, CardBody } from '../components/ui';

const FILTERS = ['Todos', 'Ingresos', 'Gastos'];

const mapTx = (t) => ({
  ...t,
  category: t.category_name ? {
    name: t.category_name,
    emoji: t.category_emoji,
    color: t.category_color,
  } : null,
  date: new Date(t.date + 'T12:00:00'),
  repeat_end_date: t.repeat_end_date ? new Date(t.repeat_end_date + 'T12:00:00') : null,
});

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [date, setDate] = useState(new Date());
  const [filter, setFilter] = useState('Todos');
  const [totals, setTotals] = useState({ income: 0, expenses: 0, balance: 0 });

  useEffect(() => {
    let inc = 0, exp = 0;
    transactions.forEach(t => { if (t.type === 'income') inc += parseFloat(t.amount); else exp += parseFloat(t.amount); });
    setTotals({ income: inc, expenses: exp, balance: inc - exp });
  }, [transactions]);

  useEffect(() => { fetchData(); }, [date]);

  const fetchData = async () => {
    try {
      setLoading(true); setError(null);
      const y = date.getFullYear(), m = date.getMonth() + 1;
      const [txResult, catResult] = await Promise.all([
        transactionsApi.listMonthly(y, m),
        categoriesApi.list(),
      ]);
      setTransactions((txResult.data ?? []).map(mapTx));
      setCategories(catResult.data ?? []);
    } catch { setError('No se pudieron cargar los datos.'); } finally { setLoading(false); }
  };

  const monthDir = (dir) => { const d = new Date(date); d.setMonth(d.getMonth() + dir); setDate(d); };

  const filtered = filter === 'Todos' ? transactions : transactions.filter(t => t.type === (filter === 'Ingresos' ? 'income' : 'expense'));

  const grouped = filtered.reduce((acc, t) => {
    const key = t.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="px-2" onClick={() => monthDir(-1)}>
            <FiChevronLeft size={20} />
          </Button>
          <p className="font-display text-lg font-bold tracking-tight min-w-[140px] text-center">
            {date.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
          </p>
          <Button variant="ghost" size="sm" className="px-2" onClick={() => monthDir(1)}>
            <FiChevronRight size={20} />
          </Button>
        </div>
        <Button 
          variant="primary" 
          size="md" 
          onClick={() => setModal({ mode: 'create', data: { description: '', amount: '', type: 'expense', date: new Date(), category_id: '', repeat_frequency: 'none', repeat_end_date: null } })}
        >
          <FiPlus size={18} />
          Nuevo
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 mb-6">
        {[
          { label: 'Ingresos', value: totals.income, color: 'var(--color-success)' },
          { label: 'Gastos', value: totals.expenses, color: 'var(--color-error)' },
          { label: 'Balance', value: totals.balance, color: 'var(--color-primary)' },
        ].map((s, i) => (
          <Card key={s.label} className={`overflow-hidden ${i === 2 ? 'col-span-2 lg:col-span-1' : ''}`}>
            <CardBody className="p-4">
              <p className="section-label mb-2">{s.label}</p>
              <p className="amount text-lg font-bold" style={{ color: s.color }}>
                {formatCurrency(s.value)}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 lg:gap-3 mb-6">
        {FILTERS.map(f => (
          <Button key={f} variant={filter === f ? 'primary' : 'ghost'} size="sm" onClick={() => setFilter(f)}>
            {f}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center pt-20">
          <Card className="p-6 text-center">
            <span className="loading loading-spinner loading-md mb-2" />
            <p className="caption">Cargando...</p>
          </Card>
        </div>
      ) : error ? (
        <div className="py-10 text-center text-error text-sm">{error}</div>
      ) : Object.keys(grouped).length === 0 ? (
        <Card className="py-10 text-center">
          <p className="text-base-content/40 text-sm">No hay transacciones este mes</p>
        </Card>
      ) : (
        Object.entries(grouped).map(([section, txs]) => (
          <div key={section} className="mb-6">
            <div className="flex items-center gap-2 mb-3 lg:mb-4 pl-1">
              <FiCalendar size={14} className="text-base-content/50" />
              <p className="text-xs lg:text-sm font-semibold uppercase tracking-wider text-base-content/50">{section}</p>
            </div>
            <Card>
              {txs.map((tx, idx) => {
                const cat = tx.category;
                const isIncome = tx.type === 'income';
                return (
                  <div key={`${tx.id}-${idx}`} className={`flex items-center gap-3 lg:gap-4 px-4 lg:px-6 py-3.5 lg:py-4 ${idx < txs.length - 1 ? 'border-b border-[var(--separator)]' : ''}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${isIncome ? 'bg-success/10' : 'bg-error/10'}`}>
                      {cat?.emoji || (isIncome ? '💰' : '💸')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tx.description}</p>
                      <p className="caption mt-0.5">{cat?.name || 'Sin categoría'}</p>
                    </div>
                    <p className={`amount text-sm font-semibold whitespace-nowrap ${isIncome ? 'text-success' : 'text-error'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button variant="ghost" size="sm" className="rounded-lg bg-base-200/40 hover:bg-base-200/70"
                        onClick={() => setModal({ mode: 'edit', data: { ...tx, date: new Date(tx.date) } })}>
                        <FiEdit size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" className="rounded-lg bg-base-200/40 hover:bg-base-200/70 text-error"
                        onClick={async () => { if (window.confirm('¿Eliminar?')) { try { await transactionsApi.remove(tx.id); fetchData(); } catch { alert('Error.'); } } }}>
                        <FiTrash size={16} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>
        ))
      )}

      {modal && (
        <TransactionModal
          mode={modal.mode}
          initialData={modal.data}
          categories={categories}
          onSubmit={async (payload) => {
            try {
              const body = {
                description: payload.description,
                amount: payload.amount,
                type: payload.type,
                date: payload.date.toISOString().slice(0, 10),
                category_id: payload.category_id,
                repeat_frequency: payload.repeat_frequency || 'none',
              };
              if (payload.repeat_end_date) body.repeat_end_date = payload.repeat_end_date.toISOString().slice(0, 10);
              if (modal.mode === 'create') await transactionsApi.create(body);
              else await transactionsApi.update(payload.id, body);
              setModal(null);
              fetchData();
            } catch { alert('Error al guardar.'); }
          }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

export default Transactions;
