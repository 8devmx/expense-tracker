import { useState, useRef, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from 'react-icons/fa';

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAYS_ES = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

const CustomDatePicker = ({ selected, onChange, placeholder = 'Selecciona una fecha' }) => {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(selected || new Date());
  const ref = useRef(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sincronizar viewDate cuando cambia selected externamente
  useEffect(() => {
    if (selected) setViewDate(new Date(selected));
  }, [selected]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Primer día del mes (0=dom, ajustamos a lunes=0)
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Construir grid de 42 celdas (6 semanas)
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const dayNum = i - startOffset + 1;
    if (dayNum < 1) {
      cells.push({ day: daysInPrevMonth + dayNum, type: 'prev' });
    } else if (dayNum > daysInMonth) {
      cells.push({ day: dayNum - daysInMonth, type: 'next' });
    } else {
      cells.push({ day: dayNum, type: 'current' });
    }
  }

  const handleDayClick = (cell) => {
    let d;
    if (cell.type === 'prev') {
      d = new Date(year, month - 1, cell.day);
    } else if (cell.type === 'next') {
      d = new Date(year, month + 1, cell.day);
    } else {
      d = new Date(year, month, cell.day);
    }
    onChange(d);
    setOpen(false);
  };

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const isSelected = (cell) => {
    if (!selected || cell.type !== 'current') return false;
    const s = new Date(selected);
    return s.getFullYear() === year && s.getMonth() === month && s.getDate() === cell.day;
  };

  const isToday = (cell) => {
    if (cell.type !== 'current') return false;
    const t = new Date();
    return t.getFullYear() === year && t.getMonth() === month && t.getDate() === cell.day;
  };

  const displayValue = selected
    ? new Date(selected).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
    : '';

  return (
    <div ref={ref} className="relative w-full">
      {/* Input trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 text-left cursor-pointer"
        style={{
          background: 'rgba(255,255,255,0.7)',
          borderColor: open ? '#e17055' : 'rgba(0,0,0,0.1)',
          boxShadow: open ? '0 0 0 3px rgba(225,112,85,0.12)' : 'none',
          color: selected ? '#1f2937' : '#9ca3af',
        }}
      >
        <FaCalendarAlt style={{ color: '#e17055', flexShrink: 0 }} />
        <span className="flex-1 text-sm font-medium">
          {displayValue || placeholder}
        </span>
        <svg
          className="w-4 h-4 transition-transform duration-200"
          style={{
            color: '#9ca3af',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown calendar */}
      {open && (
        <div
          className="absolute z-[70] mt-2 rounded-2xl overflow-hidden"
          style={{
            width: '100%',
            minWidth: '280px',
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(225,112,85,0.2)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(225,112,85,0.1)',
          }}
        >
          {/* Header mes/año */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ background: 'linear-gradient(135deg, #e17055, #f5a692)' }}
          >
            <button
              type="button"
              onClick={prevMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/20"
              style={{ color: 'white' }}
            >
              <FaChevronLeft className="w-3 h-3" />
            </button>

            <div className="text-center">
              <p className="text-white font-bold text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {MONTHS_ES[month]}
              </p>
              <p className="text-white/80 text-xs font-medium">{year}</p>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/20"
              style={{ color: 'white' }}
            >
              <FaChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 px-3 pt-3 pb-1">
            {DAYS_ES.map(d => (
              <div key={d} className="text-center text-xs font-semibold py-1" style={{ color: '#9ca3af' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Grid de días */}
          <div className="grid grid-cols-7 px-3 pb-3 gap-y-1">
            {cells.map((cell, i) => {
              const selected_ = isSelected(cell);
              const today = isToday(cell);
              const isOtherMonth = cell.type !== 'current';

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDayClick(cell)}
                  className="flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer"
                  style={{
                    height: '34px',
                    color: selected_
                      ? 'white'
                      : isOtherMonth
                      ? '#d1d5db'
                      : today
                      ? '#e17055'
                      : '#374151',
                    background: selected_
                      ? 'linear-gradient(135deg, #e17055, #f5a692)'
                      : 'transparent',
                    fontWeight: selected_ || today ? '700' : '400',
                    boxShadow: selected_ ? '0 4px 12px rgba(225,112,85,0.35)' : 'none',
                    border: today && !selected_ ? '1.5px solid #e17055' : '1.5px solid transparent',
                  }}
                  onMouseEnter={e => {
                    if (!selected_) e.currentTarget.style.background = 'rgba(225,112,85,0.1)';
                  }}
                  onMouseLeave={e => {
                    if (!selected_) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Footer — botón "Hoy" */}
          <div
            className="px-3 pb-3"
            style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
          >
            <button
              type="button"
              onClick={() => { onChange(new Date()); setOpen(false); }}
              className="w-full mt-2 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
              style={{
                color: '#e17055',
                background: 'rgba(225,112,85,0.08)',
                border: '1px solid rgba(225,112,85,0.2)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(225,112,85,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(225,112,85,0.08)'}
            >
              Hoy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
