import { FiEdit, FiTrash } from 'react-icons/fi'
import { Button } from './ui'
import { formatCurrency } from '../utils/format'

const BudgetCard = ({ budget, onEdit, onDelete }) => {
  const pct = budget.percentage || 0
  const remaining = budget.remaining ?? 0
  const isOver = pct >= 100
  const barColor = isOver ? 'var(--color-error)' : pct > 85 ? 'var(--color-warning)' : 'var(--color-success)'

  return (
    <div className="card bg-base-100 border px-4 py-4 lg:px-6 lg:py-5">
      <div className="flex items-center gap-3 lg:gap-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: `${budget.category_color || '#86868b'}1A` }}>
          {budget.category_emoji || '🎯'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold truncate">{budget.category_name}</p>
            <p className={`text-xs font-bold tabular-nums ml-2 ${isOver ? 'text-error' : 'text-base-content/50'}`}>
              {isOver ? '+$' : ''}{formatCurrency(Math.abs(remaining))}
              <span className="text-base-content/30 font-normal text-[10px] ml-1">
                {isOver ? 'excedido' : 'restante'}
              </span>
            </p>
          </div>
          <div className="h-2 rounded-full bg-base-200 overflow-hidden mb-1.5">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(pct, 100)}%`, background: barColor }} />
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-base-content/50">
              {formatCurrency(budget.spent)} <span className="text-base-content/30">de</span> {formatCurrency(budget.budget_amount)}
            </span>
            <span className="font-medium" style={{ color: barColor }}>{pct}%</span>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Button variant="ghost" size="sm" className="rounded-lg bg-base-200/40 hover:bg-base-200/70" onClick={onEdit}>
            <FiEdit size={15} />
          </Button>
          <Button variant="ghost" size="sm" className="rounded-lg bg-base-200/40 hover:bg-base-200/70 text-error" onClick={onDelete}>
            <FiTrash size={15} />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BudgetCard
