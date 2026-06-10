import { useState, useRef, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';
import { Button } from './ui';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS = ['Lu','Ma','Mi','Ju','Vi','Sá','Do'];

const CustomDatePicker = ({ selected, onChange, placeholder = 'Selecciona una fecha' }) => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(selected || new Date());
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { if (selected) setView(new Date(selected)); }, [selected]);

  const y = view.getFullYear(), m = view.getMonth();
  const firstDay = new Date(y, m, 1).getDay();
  const startOff = firstDay === 0 ? 6 : firstDay - 1;
  const dim = new Date(y, m + 1, 0).getDate();
  const dimPrev = new Date(y, m, 0).getDate();
  const cells = [];
  for (let i = 0; i < 42; i++) { const d = i - startOff + 1; if (d < 1) cells.push({ day: dimPrev + d, type: 'prev' }); else if (d > dim) cells.push({ day: d - dim, type: 'next' }); else cells.push({ day: d, type: 'current' }); }

  const clickDay = (cell) => {
    let d;
    if (cell.type === 'prev') d = new Date(y, m - 1, cell.day);
    else if (cell.type === 'next') d = new Date(y, m + 1, cell.day);
    else d = new Date(y, m, cell.day);
    onChange(d); setOpen(false);
  };

  const isSel = (cell) => { if (!selected || cell.type !== 'current') return false; const s = new Date(selected); return s.getFullYear() === y && s.getMonth() === m && s.getDate() === cell.day; };
  const isToday = (cell) => { if (cell.type !== 'current') return false; const t = new Date(); return t.getFullYear() === y && t.getMonth() === m && t.getDate() === cell.day; };

  const display = selected ? new Date(selected).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : '';

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`input-field flex items-center gap-2 cursor-pointer text-left ${open ? '[border-color:var(--primary)]' : ''}`}
        style={{ color: selected ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
      >
        <FiCalendar size={14} className="text-primary shrink-0" />
        <span className="flex-1 text-sm">{display || placeholder}</span>
      </button>

      {open && (
        <div className="glass-heavy absolute top-full left-0 right-0 z-[70] mt-1.5 rounded-[var(--radius-md)] overflow-hidden min-w-[280px] animate-[scaleIn_0.15s_ease]">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--separator)]">
            <Button variant="ghost" size="xs" onClick={() => setView(new Date(y, m - 1, 1))}>
              <FiChevronLeft size={15} />
            </Button>
            <div className="text-center">
              <p className="text-sm font-semibold m-0">{MONTHS[m]}</p>
              <p className="text-[10px] text-base-content/40 -mt-0.5">{y}</p>
            </div>
            <Button variant="ghost" size="xs" onClick={() => setView(new Date(y, m + 1, 1))}>
              <FiChevronRight size={15} />
            </Button>
          </div>

          <div className="grid grid-cols-7 px-2 pt-2 pb-0">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-base-content/40 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 px-2 pb-2 gap-0.5">
            {cells.map((cell, i) => {
              const sel = isSel(cell), today = isToday(cell);
              return (
                <button key={i} type="button" onClick={() => clickDay(cell)}
                  className={`h-7 rounded-[var(--radius-sm)] border-none text-[11px] cursor-pointer transition-colors ${
                    sel
                      ? 'bg-primary text-white font-semibold'
                      : today
                        ? 'bg-primary/10 text-base-content'
                        : cell.type !== 'current'
                          ? 'text-base-content/30'
                          : 'text-base-content hover:bg-base-200'
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          <div className="pt-1 pb-2 px-2 border-t border-[var(--separator)]">
            <Button variant="ghost" size="xs" className="w-full text-[11px]" onClick={() => { onChange(new Date()); setOpen(false); }}>
              Hoy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
