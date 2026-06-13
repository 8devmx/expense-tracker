import { useState, useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import { Button, Input } from './ui'

const BudgetFormModal = ({ mode = 'create', initialData, categories, onSubmit, onClose }) => {
  const [data, setData] = useState(initialData)
  const expenseCats = categories.filter(c => c.type === 'expense')

  useEffect(() => { setData(initialData) }, [initialData])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(data)
  }

  return (
    <dialog className="modal modal-bottom sm:modal-middle" open>
      <div className="modal-box p-0 pb-2 max-w-full sm:max-w-sm">
        <div className="sticky top-0 bg-base-100 z-10 rounded-t-2xl">
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <h2 className="font-display text-lg font-semibold">
              {mode === 'create' ? 'Nuevo presupuesto' : 'Editar presupuesto'}
            </h2>
            <Button variant="ghost" size="sm" className="btn-circle" onClick={onClose}>
              <FiX size={18} />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-5 py-2 flex flex-col gap-4">
            <label className="form-control w-full">
              <span className="label-text text-xs text-base-content/60 mb-1.5">Categoría</span>
              <div className="grid grid-cols-3 gap-1.5">
                {expenseCats.map(cat => {
                  const sel = String(data.category_id) === String(cat.id)
                  return (
                    <button key={cat.id} type="button" onClick={() => setData(p => ({ ...p, category_id: cat.id }))}
                      className={`flex flex-col items-center gap-0.5 p-2.5 rounded-xl text-[10px] font-medium transition-all ${sel ? 'bg-primary/10 text-primary ring-2 ring-primary' : 'bg-base-200 text-base-content/60 hover:bg-base-300'}`}
                    >
                      <span className="text-lg">{cat.emoji}</span>
                      <span className="leading-tight">{cat.name}</span>
                    </button>
                  )
                })}
                {expenseCats.length === 0 && (
                  <p className="col-span-3 text-sm text-base-content/40 text-center py-4">No hay categorías de gasto</p>
                )}
              </div>
            </label>

            <Input
              label="Presupuesto mensual"
              leftIcon={<span className="text-lg font-bold text-base-content/40">$</span>}
              type="number"
              inputMode="decimal"
              value={data.amount}
              onChange={e => setData(p => ({ ...p, amount: e.target.value }))}
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>

          <div className="flex gap-2 px-5 pt-3 pb-4 border-t border-base-200 mt-3">
            <Button variant="ghost" className="flex-1" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" className="flex-1" type="submit"
              disabled={!data.category_id || !data.amount}>
              {mode === 'create' ? 'Crear' : 'Guardar'}
            </Button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  )
}

export default BudgetFormModal
