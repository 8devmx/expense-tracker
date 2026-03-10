import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaPlus, FaArrowUp, FaArrowDown, FaCalendar } from 'react-icons/fa';
import { formatCurrency } from '../utils/format';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

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

      const formattedTransactions = transactionsResponse.data.map(t => ({
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
                      <span className={`badge ${transaction.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                        {transaction.category ? transaction.category.name : getCategoryName(transaction.category_id)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowForm(false)}></div>
          <div className="modal-content-custom p-6 w-full max-w-md animate-slide-up relative z-10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e17055] to-[#f5a692] flex items-center justify-center">
                <FaPlus className="w-4 h-4 text-white" />
              </span>
              Nueva Transacción
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label-custom">Descripción</label>
                <input 
                  type="text" 
                  name="description" 
                  value={newTransaction.description} 
                  onChange={handleChange} 
                  className="form-input-custom" 
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="form-label-custom">Monto</label>
                <input 
                  type="number" 
                  name="amount" 
                  value={newTransaction.amount} 
                  onChange={handleChange} 
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
                    onClick={() => setNewTransaction(prev => ({ ...prev, type: 'expense' }))}
                    className={`flex-1 py-3-xl font-medium transition-all ${
                      newTransaction.type === 'expense' 
                        ? 'bg-[ px-4 rounded#e17055] text-white shadow-lg' 
                        : 'bg-[#fde8e4] text-[#e17055]'
                    }`}
                  >
                    Gasto
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTransaction(prev => ({ ...prev, type: 'income' }))}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      newTransaction.type === 'income' 
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
                <DatePicker
                  selected={newTransaction.date}
                  onChange={(date) => setNewTransaction({ ...newTransaction, date: date })}
                  className="form-input-custom"
                  dateFormat="yyyy-MM-dd"
                  showYearDropdown
                  scrollableYearDropdown
                  wrapperClassName="w-full"
                />
              </div>
              <div className="mb-4">
                <label className="form-label-custom">Categoría</label>
                <select 
                  name="category_id" 
                  value={newTransaction.category_id} 
                  onChange={handleChange} 
                  className="form-input-custom"
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {filteredCategories(newTransaction.type).map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              {newTransaction.type === 'expense' && (
                <div className="mb-4">
                  <label className="form-label-custom">Repetir</label>
                  <select
                    name="repeat_frequency"
                    value={newTransaction.repeat_frequency}
                    onChange={handleChange}
                    className="form-input-custom"
                  >
                    <option value="none">Ninguno</option>
                    <option value="daily">Diario</option>
                    <option value="weekly">Semanal</option>
                    <option value="biweekly">Quincenal</option>
                    <option value="monthly">Mensual</option>
                    <option value="bimonthly">Bimestral</option>
                  </select>
                </div>
              )}
              {newTransaction.repeat_frequency !== 'none' && (
                <div className="mb-4">
                  <label className="form-label-custom">Repetir hasta</label>
                  <DatePicker
                    selected={newTransaction.repeat_end_date}
                    onChange={(date) => setNewTransaction({ ...newTransaction, repeat_end_date: date })}
                    className="form-input-custom"
                    dateFormat="yyyy-MM-dd"
                    showYearDropdown
                    scrollableYearDropdown
                    wrapperClassName="w-full"
                  />
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button type="submit" className="btn-primary-custom flex-1">
                  Guardar
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  className="btn-secondary-custom px-6"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setEditingTransaction(null)}></div>
          <div className="modal-content-custom p-6 w-full max-w-md animate-slide-up relative z-10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] flex items-center justify-center">
                <FaEdit className="w-4 h-4 text-white" />
              </span>
              Editar Transacción
            </h3>
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
                <DatePicker
                  selected={editingTransaction.date}
                  onChange={(date) => setEditingTransaction({ ...editingTransaction, date: date })}
                  className="form-input-custom"
                  dateFormat="yyyy-MM-dd"
                  showYearDropdown
                  scrollableYearDropdown
                  wrapperClassName="w-full"
                />
              </div>
              <div className="mb-4">
                <label className="form-label-custom">Categoría</label>
                <select 
                  name="category_id" 
                  value={editingTransaction.category_id} 
                  onChange={handleEditChange} 
                  className="form-input-custom"
                  required
                >
                  {filteredCategories(editingTransaction.type).map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              {editingTransaction.type === 'expense' && (
                <div className="mb-4">
                  <label className="form-label-custom">Repetir</label>
                  <select
                    name="repeat_frequency"
                    value={editingTransaction.repeat_frequency || 'none'}
                    onChange={handleEditChange}
                    className="form-input-custom"
                  >
                    <option value="none">Ninguno</option>
                    <option value="daily">Diario</option>
                    <option value="weekly">Semanal</option>
                    <option value="biweekly">Quincenal</option>
                    <option value="monthly">Mensual</option>
                    <option value="bimonthly">Bimestral</option>
                  </select>
                </div>
              )}
              {editingTransaction.repeat_frequency !== 'none' && (
                <div className="mb-4">
                  <label className="form-label-custom">Repetir hasta</label>
                  <DatePicker
                    selected={editingTransaction.repeat_end_date}
                    onChange={(date) => setEditingTransaction({ ...editingTransaction, repeat_end_date: date })}
                    className="form-input-custom"
                    dateFormat="yyyy-MM-dd"
                    showYearDropdown
                    scrollableYearDropdown
                    wrapperClassName="w-full"
                  />
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
      )}
    </div>
  );
};

export default Transactions;
