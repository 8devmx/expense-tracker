import { NavLink } from 'react-router-dom';
import { LuChartColumn, LuArrowLeftRight, LuTarget, LuGrid3X3, LuSettings } from 'react-icons/lu';

const tabs = [
  { to: '/dashboard', icon: LuChartColumn, label: 'Dashboard' },
  { to: '/transactions', icon: LuArrowLeftRight, label: 'Movimientos' },
  { to: '/budgets', icon: LuTarget, label: 'Presupuestos' },
  { to: '/categories', icon: LuGrid3X3, label: 'Categorías' },
  { to: '/settings', icon: LuSettings, label: 'Ajustes' },
];

const BottomNav = () => {
  return (
    <div className="dock z-50 bg-base-100/85 backdrop-blur-2xl border-t border-base-300/50 rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)] max-w-3xl lg:max-w-6xl mx-auto">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className="after:!content-none group"
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute -top-0.5 w-6 h-[3px] rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
              )}
              <Icon
                size={22}
                strokeWidth={isActive ? 2.6 : 1.8}
                className={`transition-all duration-200 ${isActive ? 'text-primary' : 'text-base-content/35 group-hover:text-base-content/55'}`}
              />
              <span className={`text-[10px] lg:text-xs leading-none mt-0.5 transition-colors duration-200 ${isActive ? 'font-semibold text-primary' : 'text-base-content/40 group-hover:text-base-content/60'}`}>
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
};

export default BottomNav;
