import { useState, useRef } from 'react'
import { FiEdit, FiTrash } from 'react-icons/fi'
import { Button } from './ui'
import { formatCurrency } from '../utils/format'

const TransactionRow = ({ tx, idx, total, isIncome, cat, onEdit, onDelete }) => {
  const [revealed, setRevealed] = useState(false)
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current == null) return
    const dx = touchStartX.current - e.changedTouches[0].clientX
    const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY)
    touchStartX.current = null
    touchStartY.current = null

    if (dy > 30) return
    if (dx > 40) setRevealed(true)
    else if (dx < -20) setRevealed(false)
  }

  const handleAction = (fn) => {
    setRevealed(false)
    fn()
  }

  return (
    <div className={`relative overflow-hidden ${idx < total - 1 ? 'border-b border-[var(--separator)]' : ''}`}>
      <div className="absolute inset-y-0 right-0 flex items-center gap-1.5 px-4 bg-base-100">
        <Button variant="ghost" size="sm" className="rounded-lg bg-base-200/40 hover:bg-base-200/70"
          onClick={() => handleAction(onEdit)}>
          <FiEdit size={16} />
        </Button>
        <Button variant="ghost" size="sm" className="rounded-lg bg-base-200/40 hover:bg-base-200/70 text-error"
          onClick={() => handleAction(onDelete)}>
          <FiTrash size={16} />
        </Button>
      </div>

      <div
        className="flex items-center gap-3 lg:gap-4 px-4 lg:px-6 py-3.5 lg:py-4 bg-base-100 relative z-10 transition-transform duration-200 select-none"
        style={{ transform: revealed ? 'translateX(-96px)' : 'translateX(0)' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
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
      </div>
    </div>
  )
}

export default TransactionRow
