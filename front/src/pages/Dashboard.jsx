import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/format';
import { FaFileExport, FaArrowUp, FaArrowDown, FaWallet, FaCreditCard, FaChartLine } from 'react-icons/fa';

const Dashboard = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyTotals, setYearlyTotals] = useState({ income: 0, expenses: 0, balance: 0 });
  const [categorySummary, setCategorySummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        setLoading(true);
        setError(null);

        const currentYear = new Date().getFullYear();
        const promises = [];

        for (let month = 1; month <= 12; month++) {
          promises.push(api.get(`/transactions?month=${month}&year=${currentYear}`));
        }

        const responses = await Promise.all(promises);
        const allTransactions = responses.flatMap(response => response.data);

        let totalIncome = 0;
        let totalExpenses = 0;
        const summary = {};

        allTransactions.forEach(t => {
          const amount = parseFloat(t.amount);
          if (t.type === 'income') {
            totalIncome += amount;
          } else {
            totalExpenses += amount;
          }

          if (t.category) {
            if (!summary[t.category.name]) {
              summary[t.category.name] = { income: 0, expenses: 0 };
            }
            if (t.type === 'income') {
              summary[t.category.name].income += amount;
            } else {
              summary[t.category.name].expenses += amount;
            }
          }
        });

        setYearlyTotals({
          income: totalIncome,
          expenses: totalExpenses,
          balance: totalIncome - totalExpenses
        });

        const formattedSummary = Object.entries(summary).map(([name, totals]) => ({
          name,
          ...totals,
        }));
        setCategorySummary(formattedSummary);

        const monthlyChartData = responses.map((response, index) => {
          const month = index + 1;
          let monthlyIncome = 0;
          let monthlyExpenses = 0;

          response.data.forEach(transaction => {
            const amount = parseFloat(transaction.amount);
            if (transaction.type === 'income') {
              monthlyIncome += amount;
            } else {
              monthlyExpenses += amount;
            }
          });

          return {
            month: new Date(currentYear, month - 1).toLocaleString('es-ES', { month: 'short' }),
            Ingresos: monthlyIncome,
            Gastos: monthlyExpenses
          };
        });

        setMonthlyData(monthlyChartData);
        setLoading(false);
      } catch (err) {
        console.error('Error al obtener datos del dashboard:', err);
        setError('No se pudieron cargar los datos del dashboard. Por favor, revisa la consola.');
        setLoading(false);
      }
    };

    fetchAndProcessData();
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await api.post('/export/transactions');
      alert('Exportación a Google Sheets completada con éxito.');
    } catch (err) {
      console.error('Error al exportar:', err);
      alert('Hubo un error al exportar a Google Sheets.');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-[#e17055] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-[#e17055] font-medium">Cargando datos del dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="glass-card-dashboard p-6 text-center">
          <p className="text-[#e17055]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Dashboard
          </h2>
          <p className="text-[#6b7280] mt-1">Resumen financiero del año</p>
        </div>
        <button
          onClick={handleExport}
          className="btn-primary-custom flex items-center gap-2"
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Exportando...
            </>
          ) : (
            <>
              <FaFileExport className="w-4 h-4" />
              Exportar a Google Sheets
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card-dashboard animate-slide-up" style={{ animationDelay: '0ms' }}>
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' }}>
            <FaArrowUp className="w-5 h-5 text-[#10b981]" />
          </div>
          <p className="stat-card-label">Ingresos Totales</p>
          <p className="stat-card-value text-[#10b981]">{formatCurrency(yearlyTotals.income)}</p>
        </div>

        <div className="stat-card-dashboard animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fde8e4 0%, #fadbd8 100%)' }}>
            <FaArrowDown className="w-5 h-5 text-[#e17055]" />
          </div>
          <p className="stat-card-label">Gastos Totales</p>
          <p className="stat-card-value text-[#e17055]">{formatCurrency(yearlyTotals.expenses)}</p>
        </div>

        <div className="stat-card-dashboard animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' }}>
            <FaWallet className="w-5 h-5 text-[#3b82f6]" />
          </div>
          <p className="stat-card-label">Balance Anual</p>
          <p className={`stat-card-value ${yearlyTotals.balance >= 0 ? 'text-[#10b981]' : 'text-[#e17055]'}`}>
            {formatCurrency(yearlyTotals.balance)}
          </p>
        </div>
      </div>

      <div className="glass-card-dashboard p-6 mb-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] flex items-center justify-center">
            <FaChartLine className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Balance Mensual
          </h3>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={monthlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
              />
              <Tooltip 
                formatter={(value) => `$${value.toFixed(2)}`}
                contentStyle={{ 
                  background: 'rgba(255,255,255,0.95)', 
                  border: 'none', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="Ingresos" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Gastos" stackId="a" fill="#e17055" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card-dashboard p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#a78bfa] flex items-center justify-center">
            <FaCreditCard className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Resumen por Categoría
          </h3>
        </div>
        <div className="table-container">
          <table className="table-glass">
            <thead>
              <tr>
                <th>Categoría</th>
                <th className="text-right">Ingresos</th>
                <th className="text-right">Gastos</th>
                <th className="text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {categorySummary.length > 0 ? (
                categorySummary.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <span className="font-medium">{item.name}</span>
                    </td>
                    <td className="text-right">
                      <span className="badge-income">
                        <FaArrowUp className="w-3 h-3 mr-1" />
                        {formatCurrency(item.income)}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className="badge-expense">
                        <FaArrowDown className="w-3 h-3 mr-1" />
                        {formatCurrency(item.expenses)}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className={`font-semibold ${item.income - item.expenses >= 0 ? 'text-[#10b981]' : 'text-[#e17055]'}`}>
                        {formatCurrency(item.income - item.expenses)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-state">
                    No hay datos de categorías disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
