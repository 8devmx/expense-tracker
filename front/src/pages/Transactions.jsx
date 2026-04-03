import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaPlus, FaArrowUp, FaArrowDown, FaCalendar } from 'react-icons/fa';
import { formatCurrency } from '../utils/format';
import CustomDatePicker from '../components/CustomDatePicker';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    type: 'expense',
    date: new Date(),
    category_id: '',
    repeat_frequency: 'none',
    repeat_end_date: null,
  });
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [currentDisplayDate, setCurrentDisplayDate] = useState(new Date());

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [balance, setBalance] = useState(0);
  const [period, setPeriod] = useState(null);

  useEffect(() => {
    let income = 0;
    let expenses = 0;
    transactions.forEach(t => {
      if (t.type === 'income') {
        income += parseFloat(t.amount);
      } else {
        expenses += parseFloat(t.amount);
      }
    });
    setTotalIncome(income);
    setTotalExpenses(expenses);
    setBalance(income - expenses);
  }, [transactions]);

  useEffect(() => {
    fetchData();
  }, [currentDisplayDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const year = currentDisplayDate.getFullYear();
      const month = currentDisplayDate.getMonth() + 1;
      const [transactionsResponse, categoriesResponse] = await Promise.all([
        api.get(`/transactions?month=${month}&year=${year}`),
        api.get('/categories')
      ]);

      const { transactions: rawTransactions, period: periodData } = transactionsResponse.data;
      setPeriod(periodData);

      const formattedTransactions = rawTransactions.map(t => ({
        ...t,
        date: new Date(t.date),
        repeat_end_date: t.repeat_end_date ? new Date(t.repeat_end_date) : null,
      }));
      setTransactions(formattedTransactions);
      setCategories(categoriesResponse.data);
      setLoading(false);
    } catch (err) {
      console.error('Error al obtener datos:', err);
      setError('No se pudieron cargar los datos. Por favor, revisa la consola.');
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Sin Categoría';
  };

  const filteredCategories = (type) => {
    return categories.filter(category => category.type === type);
  };

  const handleMonthChange = (direction) => {
    const newDate = new Date(currentDisplayDate);
    if (direction === 'next') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDisplayDate(newDate);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingTransaction(prev => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (transaction) => {
    const transactionToEdit = { ...transaction };
    if (transactionToEdit.repeat_end_date) {
      transactionToEdit.repeat_end_date = new Date(transactionToEdit.repeat_end_date);
    }
    setEditingTransaction(transactionToEdit);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let payload = {
        ...newTransaction,
        date: newTransaction.date.toISOString().slice(0, 10),
      };

      if (newTransaction.repeat_frequency !== 'none' && !newTransaction.repeat_end_date) {
        const endDate = new Date(newTransaction.date);
        endDate.setFullYear(endDate.getFullYear() + 1);
        payload.repeat_end_date = endDate.toISOString().slice(0, 10);
      } else if (newTransaction.repeat_end_date) {
        payload.repeat_end_date = newTransaction.repeat_end_date.toISOString().slice(0, 10);
      }

      await api.post('/transactions', payload);
      fetchData();
      setShowForm(false);
      setNewTransaction({
        description: '',
        amount: '',
        type: 'expense',
        date: new Date(),
        category_id: '',
        repeat_frequency: 'none',
        repeat_end_date: null,
      });
    } catch (err) {
      console.error('Error al crear transacción:', err);
      alert('No se pudo crear la transacción. Asegúrate de que todos los campos son válidos.');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      let payload = {
        ...editingTransaction,
        date: editingTransaction.date.toISOString().slice(0, 10),
      };
      if (editingTransaction.repeat_end_date) {
        payload.repeat_end_date = editingTransaction.repeat_end_date.toISOString().slice(0, 10);
      }
      await api.put(`/transactions/${editingTransaction.id}`, payload);
      fetchData();
      setEditingTransaction(null);
    } catch (err) {
      console.error('Error al editar transacción:', err);
      alert('No se pudo editar la transacción. Asegúrate de que todos los campos son válidos.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
      try {
        await api.delete(`/transactions/${id}`);
        fetchData();
      } catch (err) {
        console.error('Error al eliminar transacción:', err);
        alert('No se pudo eliminar la transacción.');
      }
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-[#e17055] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-[#e17055] font-medium">Cargando transacciones...</p>
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => handleMonthChange('prev')} className="month-nav-btn">
            <FaChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-bold capitalize" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {currentDisplayDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
            </h2>
            {period && (
              <p className="text-xs text-[#6b7280] mt-0.5">
                {new Date(period.start + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                {' – '}
                {new Date(period.end + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>
          <button onClick={() => handleMonthChange('next')} className="month-nav-btn">
            <FaChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button 
          className="btn-primary-custom flex items-center gap-2" 
          onClick={() => setShowForm(true)}
        >
          <FaPlus className="w-4 h-4" />
          Añadir Transacción
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card-dashboard p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d1fae5] to-[#a7f3d0] flex items-center justify-center">
            <FaArrowUp className="w-5 h-5 text-[#10b981]" />
          </div>
          <div>
            <p className="text-sm text-[#6b7280]">Ingresos</p>
            <p className="text-xl font-bold text-[#10b981]">{formatCurrency(totalIncome)}</p>
          </div>
        </div>

        <div className="glass-card-dashboard p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#fde8e4] to-[#fadbd8] flex items-center justify-center">
            <FaArrowDown className="w-5 h-5 text-[#e17055]" />
          </div>
          <div>
            <p className="text-sm text-[#6b7280]">Gastos</p>
            <p className="text-xl font-bold text-[#e17055]">{formatCurrency(totalExpenses)}</p>
          </div>
        </div>

        <div className="glass-card-dashboard p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#dbeafe] to-[#bfdbfe] flex items-center justify-center">
            <FaCalendar className="w-5 h-5 text-[#3b82f6]" />
          </div>
          <div>
            <p className="text-sm text-[#6b7280]">Balance</p>
            <p className={`text-xl font-bold ${balance >= 0 ? 'text-[#10b981]' : 'text-[#e17055]'}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card-dashboard overflow-hidden animate-fade-in">
        <div className="table-container">
          <table className="table-glass">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th className="text-right">Monto</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((transaction, index) => (
                  <tr key={transaction.id || `virtual-${index}`}>
                    <td>
                      <span className="text-sm text-[#6b7280]">
                        {transaction.date.toLocaleDateString('es-ES', { 
                          day: '2-digit', 
                          month: 'short' 
                        })}
                      </span>
                    </td>
                    <td>
                      <span className="font-medium">{transaction.description}</span>
                    </td>
                    <td>
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                        style={transaction.category?.color ? {
                          backgroundColor: transaction.category.color + '28',
                          color: transaction.category.color,
                        } : {}}
                      >
                        {transaction.category
                          ? `${transaction.category.emoji ?? ''} ${transaction.category.name}`.trim()
                          : getCategoryName(transaction.category_id)}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className={`font-semibold ${transaction.type === 'income' ? 'text-[#10b981]' : 'text-[#e17055]'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => handleEditClick(transaction)} 
                          className="icon-btn"
                          title="Editar"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        {transaction.id && (
                          <button 
                            onClick={() => handleDelete(transaction.id)} 
                            className="icon-btn hover:text-[#e17055]"
                            title="Eliminar"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-state">
                    No hay transacciones para este mes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowForm(false)}></div>
          <div className="modal-content-custom w-full max-w-lg animate-slide-up relative z-10 flex flex-col" style={{ maxHeight: '90vh' }}>
            <div className="px-6 pt-5 pb-3 flex-shrink-0">
              <h3 className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e17055] to-[#f5a692] flex items-center justify-center">
                  <FaPlus className="w-4 h-4 text-white" />
                </span>
                Nueva Transacción
              </h3>
            </div>
            <div className="overflow-y-auto px-6 pb-2 flex-1">
            <form onSubmit={handleSubmit}>

              {/* Fila 1: Tipo */}
              <div className="mb-3">
                <label className="form-label-custom">Tipo</label>
                <div className="flex gap-2">
                  <button type="button"
                    onClick={() => setNewTransaction(prev => ({ ...prev, type: 'expense', category_id: '' }))}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all ${
                      newTransaction.type === 'expense' ? 'bg-[#e17055] text-white shadow-lg' : 'bg-[#fde8e4] text-[#e17055]'
                    }`}>
                    💸 Gasto
                  </button>
                  <button type="button"
                    onClick={() => setNewTransaction(prev => ({ ...prev, type: 'income', category_id: '' }))}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all ${
                      newTransaction.type === 'income' ? 'bg-[#10b981] text-white shadow-lg' : 'bg-[#d1fae5] text-[#10b981]'
                    }`}>
                    💰 Ingreso
                  </button>
                </div>
              </div>

              {/* Fila 2: Monto + Fecha */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="form-label-custom">Monto</label>
                  <input type="number" name="amount" value={newTransaction.amount}
                    onChange={handleChange} className="form-input-custom" required step="0.01" placeholder="0.00" />
                </div>
                <div>
                  <label className="form-label-custom">Fecha</label>
                  <CustomDatePicker
                    selected={newTransaction.date}
                    onChange={(date) => setNewTransaction({ ...newTransaction, date })}
                  />
                </div>
              </div>

              {/* Fila 3: Descripción */}
              <div className="mb-3">
                <label className="form-label-custom">Descripción</label>
                <input type="text" name="description" value={newTransaction.description}
                  onChange={handleChange} className="form-input-custom" required placeholder="Ej: Gasolina, comida..." />
              </div>

              {/* Fila 4: Categoría — grid 4 columnas */}
              <div className="mb-3">
                <label className="form-label-custom">Categoría</label>
                <div className="grid grid-cols-4 gap-1.5 mt-1">
                  {filteredCategories(newTransaction.type).map(category => {
                    const isSelected = String(newTransaction.category_id) === String(category.id);
                    const hex = category.color || '#6b7280';
                    return (
                      <button key={category.id} type="button"
                        onClick={() => setNewTransaction(prev => ({ ...prev, category_id: category.id }))}
                        className="flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all duration-150 cursor-pointer"
                        style={{
                          border: isSelected ? `2px solid ${hex}` : '2px solid transparent',
                          backgroundColor: isSelected ? hex + '22' : 'rgba(0,0,0,0.04)',
                          color: isSelected ? hex : '#374151',
                          boxShadow: isSelected ? `0 0 0 1px ${hex}40` : 'none',
                        }}>
                        <span className="text-lg">{category.emoji}</span>
                        <span className="text-center leading-tight" style={{ fontSize: '10px', fontWeight: 500 }}>{category.name}</span>
                      </button>
                    );
                  })}
                </div>
                {!newTransaction.category_id && (
                  <p className="text-xs text-[#e17055] mt-1">Selecciona una categoría</p>
                )}
              </div>

              {/* Fila 5: Repetir + Fecha fin (solo gastos) */}
              {newTransaction.type === 'expense' && (
                <div className="mb-3">
                  <label className="form-label-custom">Repetir</label>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {[
                      { value: 'none', label: 'No', icon: '🚫' },
                      { value: 'daily', label: 'Diario', icon: '📅' },
                      { value: 'weekly', label: 'Semanal', icon: '📆' },
                      { value: 'biweekly', label: 'Quincenal', icon: '🗓️' },
                      { value: 'monthly', label: 'Mensual', icon: '📊' },
                      { value: 'bimonthly', label: 'Bimestral', icon: '🔄' },
                    ].map(opt => {
                      const isSelected = (newTransaction.repeat_frequency || 'none') === opt.value;
                      return (
                        <button key={opt.value} type="button"
                          onClick={() => setNewTransaction(prev => ({ ...prev, repeat_frequency: opt.value }))}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
                          style={{
                            background: isSelected ? '#e17055' : 'rgba(0,0,0,0.05)',
                            color: isSelected ? 'white' : '#6b7280',
                            boxShadow: isSelected ? '0 2px 8px rgba(225,112,85,0.35)' : 'none',
                            border: isSelected ? '1.5px solid #e17055' : '1.5px solid transparent',
                          }}>
                          <span>{opt.icon}</span>
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {newTransaction.repeat_frequency !== 'none' && (
                    <div className="mt-3">
                      <label className="form-label-custom">Repetir hasta</label>
                      <CustomDatePicker
                        selected={newTransaction.repeat_end_date}
                        onChange={(date) => setNewTransaction({ ...newTransaction, repeat_end_date: date })}
                        placeholder="Sin fecha límite"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-4 mb-2">
                <button type="submit" className="btn-primary-custom flex-1">Guardar</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary-custom px-6">Cancelar</button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {editingTransaction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setEditingTransaction(null)}></div>
          <div className="modal-content-custom w-full max-w-md animate-slide-up relative z-10 flex flex-col" style={{ maxHeight: '90vh' }}>
            <div className="p-6 pb-2 flex-shrink-0">
              <h3 className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] flex items-center justify-center">
                  <FaEdit className="w-4 h-4 text-white" />
                </span>
                Editar Transacción
              </h3>
            </div>
            <div className="overflow-y-auto px-6 pb-2 flex-1">
            <form onSubmit={handleEdit}>
              <div className="mb-4">
                <label className="form-label-custom">Descripción</label>
                <input 
                  type="text" 
                  name="description" 
                  value={editingTransaction.description} 
                  onChange={handleEditChange} 
                  className="form-input-custom" 
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="form-label-custom">Monto</label>
                <input 
                  type="number" 
                  name="amount" 
                  value={editingTransaction.amount} 
                  onChange={handleEditChange} 
                  className="form-input-custom" 
                  required 
                  step="0.01"
                />
              </div>
              <div className="mb-4">
                <label className="form-label-custom">Tipo</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTransaction(prev => ({ ...prev, type: 'expense' }))}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      editingTransaction.type === 'expense' 
                        ? 'bg-[#e17055] text-white shadow-lg' 
                        : 'bg-[#fde8e4] text-[#e17055]'
                    }`}
                  >
                    Gasto
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingTransaction(prev => ({ ...prev, type: 'income' }))}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      editingTransaction.type === 'income' 
                        ? 'bg-[#10b981] text-white shadow-lg' 
                        : 'bg-[#d1fae5] text-[#10b981]'
                    }`}
                  >
                    Ingreso
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label-custom">Fecha</label>
                <CustomDatePicker
                  selected={editingTransaction.date}
                  onChange={(date) => setEditingTransaction({ ...editingTransaction, date })}
                />
              </div>
              <div className="mb-4">
                <label className="form-label-custom">Categoría</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {filteredCategories(editingTransaction.type).map(category => {
                    const isSelected = String(editingTransaction.category_id) === String(category.id);
                    const hex = category.color || '#6b7280';
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setEditingTransaction(prev => ({ ...prev, category_id: category.id }))}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer"
                        style={{
                          border: isSelected ? `2px solid ${hex}` : '2px solid transparent',
                          backgroundColor: isSelected ? hex + '22' : 'rgba(0,0,0,0.04)',
                          color: isSelected ? hex : 'inherit',
                          boxShadow: isSelected ? `0 0 0 1px ${hex}40` : 'none',
                        }}
                      >
                        <span className="text-xl">{category.emoji}</span>
                        <span className="leading-tight text-center">{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {editingTransaction.type === 'expense' && (
                <div className="mb-4">
                  <label className="form-label-custom">Repetir</label>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {[
                      { value: 'none', label: 'No', icon: '🚫' },
                      { value: 'daily', label: 'Diario', icon: '📅' },
                      { value: 'weekly', label: 'Semanal', icon: '📆' },
                      { value: 'biweekly', label: 'Quincenal', icon: '🗓️' },
                      { value: 'monthly', label: 'Mensual', icon: '📊' },
                      { value: 'bimonthly', label: 'Bimestral', icon: '🔄' },
                    ].map(opt => {
                      const isSelected = (editingTransaction.repeat_frequency || 'none') === opt.value;
                      return (
                        <button key={opt.value} type="button"
                          onClick={() => setEditingTransaction(prev => ({ ...prev, repeat_frequency: opt.value }))}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
                          style={{
                            background: isSelected ? '#e17055' : 'rgba(0,0,0,0.05)',
                            color: isSelected ? 'white' : '#6b7280',
                            boxShadow: isSelected ? '0 2px 8px rgba(225,112,85,0.35)' : 'none',
                            border: isSelected ? '1.5px solid #e17055' : '1.5px solid transparent',
                          }}>
                          <span>{opt.icon}</span>
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {editingTransaction.repeat_frequency && editingTransaction.repeat_frequency !== 'none' && (
                    <div className="mt-3">
                      <label className="form-label-custom">Repetir hasta</label>
                      <CustomDatePicker
                        selected={editingTransaction.repeat_end_date}
                        onChange={(date) => setEditingTransaction({ ...editingTransaction, repeat_end_date: date })}
                        placeholder="Sin fecha límite"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button type="submit" className="btn-primary-custom flex-1">
                  Guardar Cambios
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditingTransaction(null)} 
                  className="btn-secondary-custom px-6"
                >
                  Cancelar
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
