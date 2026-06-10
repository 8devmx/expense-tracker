import { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/format';
import { FiDownload, FiArrowUp, FiArrowDown, FiDollarSign } from 'react-icons/fi';
import { Button, Card, CardBody, CardTitle, StatCard } from '../components/ui';

const Dashboard = () => {
  const [data, setData] = useState({ monthly: [], totals: { income: 0, expenses: 0, balance: 0 }, categories: [] });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const year = new Date().getFullYear();
        const promises = Array.from({ length: 12 }, (_, i) => api.get(`/transactions?month=${i + 1}&year=${year}`));
        const responses = await Promise.all(promises);

        let totalIncome = 0, totalExpenses = 0;
        const catMap = {};

        const monthly = responses.map((res, i) => {
          const txs = res.data.transactions ?? res.data;
          let inc = 0, exp = 0;
          txs.forEach(t => {
            const a = parseFloat(t.amount);
            if (t.type === 'income') { inc += a; totalIncome += a; }
            else { exp += a; totalExpenses += a; }
            if (t.category) {
              if (!catMap[t.category.name]) catMap[t.category.name] = { income: 0, expenses: 0 };
              if (t.type === 'income') catMap[t.category.name].income += a;
              else catMap[t.category.name].expenses += a;
            }
          });
          return { month: new Date(year, i).toLocaleString('es-ES', { month: 'short' }), Ingresos: inc, Gastos: exp };
        });

        setData({
          monthly,
          totals: { income: totalIncome, expenses: totalExpenses, balance: totalIncome - totalExpenses },
          categories: Object.entries(catMap).map(([name, t]) => ({ name, ...t })),
        });
      } catch { setError('No se pudieron cargar los datos.'); } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try { await api.post('/export/transactions'); alert('Exportación completada.'); } catch { alert('Error al exportar.'); } finally { setExporting(false); }
  };

  if (loading) return (
    <div className="flex flex-col gap-5 pt-8 animate-slideUp">
      <div className="space-y-3">
        <div className="h-3 w-24 bg-base-300/50 rounded-full animate-pulse" />
        <div className="h-9 w-48 bg-base-300/50 rounded-xl animate-pulse" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="card bg-base-100 border surface-2 p-5 space-y-4">
            <div className="w-9 h-9 rounded-[10px] bg-base-200 animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 w-16 bg-base-200 rounded-full animate-pulse" />
              <div className="h-6 w-20 bg-base-200 rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (error) return <div className="py-10 text-center text-error text-sm">{error}</div>;

  const { totals, monthly, categories } = data;

  const incomeCats = categories.filter(c => c.income > 0).sort((a, b) => b.income - a.income);
  const expenseCats = categories.filter(c => c.expenses > 0).sort((a, b) => b.expenses - a.expenses);
  const totalIncomeCats = incomeCats.reduce((s, c) => s + c.income, 0);
  const totalExpenseCats = expenseCats.reduce((s, c) => s + c.expenses, 0);
  const hasIncome = incomeCats.length > 0;
  const hasExpenses = expenseCats.length > 0;

  const CategoryRow = ({ name, amount, total, color }) => {
    const pct = total > 0 ? (amount / total) * 100 : 0;
    return (
      <div className="group flex items-center gap-4 py-3 lg:py-3.5 px-2 -mx-2 rounded-xl hover:bg-base-200/40 transition-colors cursor-default">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-base-content">{name}</span>
            <span className="text-sm font-semibold tabular-nums" style={{ color }}>
              {formatCurrency(amount)}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-base-200 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 group-hover:opacity-70"
              style={{ width: `${Math.max(pct, 2)}%`, background: color }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 lg:space-y-12">

      {/* Hero: Balance neto */}
      <section className="animate-slideUp">
        <div className="flex items-center justify-between mb-2">
          <p className="section-label">Balance neto</p>
          <span className="text-[11px] lg:text-xs text-base-content/30 font-medium">{new Date().getFullYear()}</span>
        </div>
        <p className="text-4xl lg:text-5xl font-bold amount tracking-tight mb-3">
          {formatCurrency(totals.balance)}
        </p>
        <div className="flex items-center gap-3 text-[13px] lg:text-sm">
          <span className="text-success font-medium">+{formatCurrency(totals.income)}</span>
          <span className="text-base-content/20">·</span>
          <span className="text-error font-medium">-{formatCurrency(totals.expenses)}</span>
        </div>
      </section>

      {/* Acciones + Stats */}
      <div className="flex justify-end -mt-2 animate-slideUp" style={{ animationDelay: '40ms' }}>
        <Button variant="ghost" size="sm" onClick={handleExport} disabled={exporting}>
          <FiDownload size={14} />
          {exporting ? 'Exportando...' : 'Exportar'}
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3 lg:gap-5">
        <StatCard
          icon={<FiArrowUp size={18} />}
          label="Ingresos"
          value={formatCurrency(totals.income)}
          color="var(--color-success)"
          delay={80}
        />
        <StatCard
          icon={<FiArrowDown size={18} />}
          label="Gastos"
          value={formatCurrency(totals.expenses)}
          color="var(--color-error)"
          delay={140}
        />
        <StatCard
          icon={<FiDollarSign size={18} />}
          label="Balance"
          value={formatCurrency(totals.balance)}
          color="var(--color-primary)"
          delay={200}
        />
      </div>

      {/* Gráfico mensual */}
      <section className="animate-slideUp" style={{ animationDelay: '100ms' }}>
        <Card>
          <CardBody>
            <CardTitle className="mb-6 text-[15px]">Balance mensual</CardTitle>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthly} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="var(--separator)" vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => '$' + (v / 1000).toFixed(0) + 'k'} />
                <Tooltip
                  formatter={(v) => formatCurrency(v)}
                  contentStyle={{
                    background: 'var(--color-base-100)',
                    border: '1px solid var(--separator)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-lg)',
                    fontSize: 13,
                    padding: '8px 12px',
                  }}
                  cursor={{ fill: 'var(--separator)' }}
                />
                <Bar dataKey="Ingresos" fill="var(--color-success)" radius={[3, 3, 0, 0]} maxBarSize={28} />
                <Bar dataKey="Gastos" fill="var(--color-error)" radius={[3, 3, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </section>

      {/* Resumen por categoría */}
      <section className="animate-slideUp" style={{ animationDelay: '160ms' }}>
        <Card>
          <CardBody className="p-0">
            <h3 className="card-title px-6 lg:px-8 pt-6 lg:pt-8 pb-1">Resumen por categoría</h3>
            {!hasIncome && !hasExpenses ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-base-content/40">No hay datos de categorías disponibles.</p>
              </div>
            ) : (
              <div className="px-5 lg:px-8 pb-4 lg:pb-6">
                {hasIncome && (
                  <div className="pt-3">
                    <div className="flex items-center gap-2 px-1 mb-2">
                      <span className="w-2 h-2 rounded-full bg-success" />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-base-content/40">Ingresos</span>
                      <span className="text-[10px] text-base-content/20 ml-auto tabular-nums">{incomeCats.length} categorías</span>
                    </div>
                    {incomeCats.map((cat, i) => (
                      <CategoryRow key={`inc-${i}`} name={cat.name} amount={cat.income} total={totalIncomeCats} color="var(--color-success)" />
                    ))}
                  </div>
                )}
                {hasExpenses && (
                  <div className={hasIncome ? 'mt-4 pt-4 border-t border-[var(--separator)]' : 'pt-3'}>
                    <div className="flex items-center gap-2 px-1 mb-2">
                      <span className="w-2 h-2 rounded-full bg-error" />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-base-content/40">Gastos</span>
                      <span className="text-[10px] text-base-content/20 ml-auto tabular-nums">{expenseCats.length} categorías</span>
                    </div>
                    {expenseCats.map((cat, i) => (
                      <CategoryRow key={`exp-${i}`} name={cat.name} amount={cat.expenses} total={totalExpenseCats} color="var(--color-error)" />
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </section>

    </div>
  );
};

export default Dashboard;
