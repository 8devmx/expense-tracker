import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaEdit, FaTrash, FaPlus, FaTag, FaCheck } from 'react-icons/fa';

const COLOR_PALETTE = [
  '#e17055', // Coral
  '#d35444', // Rojo oscuro
  '#10b981', // Verde mint
  '#059669', // Verde oscuro
  '#3b82f6', // Azul
  '#8b5cf6', // Violeta
  '#f59e0b', // Amarillo
  '#ec4899', // Rosa
  '#06b6d4', // Cyan
  '#64748b', // Gris
  '#f97316', // Naranja
  '#84cc16', // Lima
];

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', type: 'expense', emoji: '', color: '#e17055' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error al obtener categorías:', err);
      setError('No se pudieron cargar las categorías.');
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', newCategory);
      setNewCategory({ name: '', type: 'expense', emoji: '', color: '#e17055' });
      setShowAddForm(false);
      fetchCategories();
    } catch (err) {
      console.error('Error al crear categoría:', err);
      alert('No se pudo crear la categoría. Por favor, revisa la consola.');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/categories/${editingCategory.id}`, editingCategory);
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      console.error('Error al editar categoría:', err);
      alert('No se pudo editar la categoría. Por favor, revisa la consola.');
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      try {
        await api.delete(`/categories/${categoryId}`);
        fetchCategories();
      } catch (err) {
        console.error('Error al eliminar categoría:', err);
        alert('No se pudo eliminar la categoría.');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCategory({ ...newCategory, [name]: value });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingCategory({ ...editingCategory, [name]: value });
  };

  const expenseCategories = categories.filter(c => c.type === 'expense');
  const incomeCategories = categories.filter(c => c.type === 'income');

  if (loading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-[#e17055] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-[#e17055] font-medium">Cargando categorías...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) return (
    <div className="page-container">
      <div className="glass-card-dashboard p-6 text-center">
        <p className="text-[#e17055]">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Categorías
          </h2>
          <p className="text-[#6b7280] mt-1">Gestiona tus categorías de gastos e ingresos</p>
        </div>
        <button 
          className="btn-primary-custom flex items-center gap-2" 
          onClick={() => setShowAddForm(true)}
        >
          <FaPlus className="w-4 h-4" />
          Añadir Categoría
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card-dashboard p-6 animate-slide-up" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e17055] to-[#f5a692] flex items-center justify-center">
              <FaTag className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Categorías de Gastos
            </h3>
          </div>
          
          <div className="space-y-3">
            {expenseCategories.length > 0 ? (
              expenseCategories.map(category => (
                <div 
                  key={category.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      {category.emoji}
                    </span>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="icon-btn"
                      onClick={() => setEditingCategory(category)}
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      className="icon-btn hover:text-[#e17055]"
                      onClick={() => handleDelete(category.id)}
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[#9ca3af] text-center py-4">No hay categorías de gastos</p>
            )}
          </div>
        </div>

        <div className="glass-card-dashboard p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981] to-[#6ee7b7] flex items-center justify-center">
              <FaTag className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Categorías de Ingresos
            </h3>
          </div>
          
          <div className="space-y-3">
            {incomeCategories.length > 0 ? (
              incomeCategories.map(category => (
                <div 
                  key={category.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      {category.emoji}
                    </span>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="icon-btn"
                      onClick={() => setEditingCategory(category)}
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      className="icon-btn hover:text-[#e17055]"
                      onClick={() => handleDelete(category.id)}
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[#9ca3af] text-center py-4">No hay categorías de ingresos</p>
            )}
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowAddForm(false)}></div>
          <div className="modal-content-custom p-6 w-full max-w-md animate-slide-up relative z-10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e17055] to-[#f5a692] flex items-center justify-center">
                <FaPlus className="w-4 h-4 text-white" />
              </span>
              Nueva Categoría
            </h3>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="form-label-custom">Nombre de la Categoría</label>
                <input
                  type="text"
                  name="name"
                  value={newCategory.name}
                  onChange={handleChange}
                  className="form-input-custom"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label-custom">Emoji</label>
                <input
                  type="text"
                  name="emoji"
                  value={newCategory.emoji}
                  onChange={handleChange}
                  className="form-input-custom"
                  placeholder="🍔"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label-custom">Color</label>
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                      className={`w-10 h-10 rounded-xl transition-all duration-200 ${
                        newCategory.color === color 
                          ? 'ring-2 ring-offset-2 ring-[#e17055] scale-110' 
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {newCategory.color === color && <FaCheck className="w-4 h-4 text-white mx-auto" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label-custom">Tipo</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCategory(prev => ({ ...prev, type: 'expense' }))}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      newCategory.type === 'expense' 
                        ? 'bg-[#c45c44] text-white shadow-lg' 
                        : 'bg-[#fde8e4] text-[#c45c44]'
                    }`}
                  >
                    Gasto
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCategory(prev => ({ ...prev, type: 'income' }))}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      newCategory.type === 'income' 
                        ? 'bg-[#059669] text-white shadow-lg' 
                        : 'bg-[#d1fae5] text-[#059669]'
                    }`}
                  >
                    Ingreso
                  </button>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="btn-primary-custom flex-1">
                  Crear Categoría
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)} 
                  className="btn-secondary-custom px-6"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setEditingCategory(null)}></div>
          <div className="modal-content-custom p-6 w-full max-w-md animate-slide-up relative z-10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] flex items-center justify-center">
                <FaEdit className="w-4 h-4 text-white" />
              </span>
              Editar Categoría
            </h3>
            <form onSubmit={handleEdit}>
              <div className="mb-4">
                <label className="form-label-custom">Nombre de la Categoría</label>
                <input
                  type="text"
                  name="name"
                  value={editingCategory.name}
                  onChange={handleEditChange}
                  className="form-input-custom"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label-custom">Emoji</label>
                <input
                  type="text"
                  name="emoji"
                  value={editingCategory.emoji}
                  onChange={handleEditChange}
                  className="form-input-custom"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label-custom">Color</label>
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEditingCategory(prev => ({ ...prev, color }))}
                      className={`w-10 h-10 rounded-xl transition-all duration-200 ${
                        editingCategory.color === color 
                          ? 'ring-2 ring-offset-2 ring-[#e17055] scale-110' 
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {editingCategory.color === color && <FaCheck className="w-4 h-4 text-white mx-auto" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label-custom">Tipo</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(prev => ({ ...prev, type: 'expense' }))}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      editingCategory.type === 'expense' 
                        ? 'bg-[#c45c44] text-white shadow-lg' 
                        : 'bg-[#fde8e4] text-[#c45c44]'
                    }`}
                  >
                    Gasto
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCategory(prev => ({ ...prev, type: 'income' }))}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      editingCategory.type === 'income' 
                        ? 'bg-[#059669] text-white shadow-lg' 
                        : 'bg-[#d1fae5] text-[#059669]'
                    }`}
                  >
                    Ingreso
                  </button>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="btn-primary-custom flex-1">
                  Guardar Cambios
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditingCategory(null)} 
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

export default Categories;
