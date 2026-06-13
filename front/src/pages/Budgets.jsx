import { useState, useEffect } from 'react'
import { FiPlus, FiTarget } from 'react-icons/fi'
import { budgetsApi, categoriesApi } from '../services/api'
import { Button } from '../components/ui'
import BudgetCard from '../components/BudgetCard'
import BudgetFormModal from '../components/BudgetFormModal'

const Budgets = () => {
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modal, setModal] = useState(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true); setError(null)
      const [progressResult, catResult] = await Promise.all([
        budgetsApi.getProgress(),
        categoriesApi.list(),
      ])
      setBudgets(progressResult.data ?? [])
      setCategories(catResult.data ?? [])
    } catch { setError('No se pudieron cargar los datos.') } finally { setLoading(false) }
  }

  const handleCreate = async (data) => {
    try {
      await budgetsApi.create(data)
      setModal(null)
      fetchData()
    } catch { alert('Error al crear presupuesto.') }
  }

  const handleUpdate = async (data) => {
    try {
      await budgetsApi.update(modal.data.category_id, { amount: data.amount, category_id: data.category_id })
      setModal(null)
      fetchData()
    } catch { alert('Error al guardar.') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este presupuesto?')) return
    try {
      await budgetsApi.remove(id)
      fetchData()
    } catch { alert('Error al eliminar.') }
  }

  const totalBudgeted = budgets.reduce((s, b) => s + parseFloat(b.budget_amount || 0), 0)
  const totalSpent = budgets.reduce((s, b) => s + parseFloat(b.spent || 0), 0)

  if (loading) return (
    <div className="flex flex-col gap-4 pt-8 animate-slideUp">
      <div className="space-y-3">
        <div className="h-3 w-28 bg-base-300/50 rounded-full animate-pulse" />
        <div className="h-9 w-56 bg-base-300/50 rounded-xl animate-pulse" />
      </div>
      <div className="space-y-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="card bg-base-100 border p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-base-200 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-28 bg-base-200 rounded-full animate-pulse" />
                <div className="h-2 w-full bg-base-200 rounded-full animate-pulse" />
                <div className="h-2 w-20 bg-base-200 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  if (error) return <div className="py-10 text-center text-error text-sm">{error}</div>

  return (
    <div>
      <div className="mb-6 animate-slideUp">
        <p className="section-label mb-1">Presupuesto total</p>
        <p className="text-3xl font-bold amount tracking-tight">
          {budgets.length > 0 ? `$${(totalBudgeted).toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '$0.00'}
        </p>
        {budgets.length > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-base-content/50">
              Gastado: <span className="text-error font-medium">{`$${totalSpent.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}</span>
            </span>
            <span className="text-base-content/20">·</span>
            <span className="text-xs text-base-content/50">
              Disponible: <span className="text-success font-medium">{`$${(totalBudgeted - totalSpent).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}</span>
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3 animate-slideUp" style={{ animationDelay: '60ms' }}>
        {budgets.length === 0 ? (
          <div className="card bg-base-100 border py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-base-200 flex items-center justify-center mx-auto mb-4">
              <FiTarget size={28} className="text-base-content/30" />
            </div>
            <p className="text-base font-semibold text-base-content/70 mb-1">Sin presupuestos</p>
            <p className="text-sm text-base-content/40 max-w-xs mx-auto leading-relaxed">
              Crea tu primer reto financiero. Establece cuánto quieres gastar como máximo en cada categoría.
            </p>
          </div>
        ) : (
          budgets.map(b => (
            <BudgetCard
              key={b.category_id}
              budget={b}
              onEdit={() => setModal({ mode: 'edit', data: { category_id: b.category_id, amount: b.budget_amount } })}
              onDelete={() => handleDelete(b.category_id)}
            />
          ))
        )}
      </div>

      <button
        onClick={() => setModal({ mode: 'create', data: { category_id: '', amount: '' } })}
        className="fixed bottom-24 lg:bottom-28 right-5 lg:right-10 z-40 w-14 h-14 rounded-2xl bg-primary text-primary-content shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-200 active:scale-95 flex items-center justify-center"
        aria-label="Nuevo presupuesto"
      >
        <FiPlus size={24} />
      </button>

      {modal && (
        <BudgetFormModal
          mode={modal.mode}
          initialData={modal.data}
          categories={categories}
          onSubmit={modal.mode === 'create' ? handleCreate : handleUpdate}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}

export default Budgets
