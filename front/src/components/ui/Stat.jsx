export const StatCard = ({ icon, label, value, color, trend, delay = 0 }) => (
  <div
    className="card bg-base-100 border surface-2 overflow-hidden group"
    style={{ animation: `slideUp 0.4s ease ${delay}ms both` }}
  >
    <div
      className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"
      style={{ background: color, filter: 'blur(20px)' }}
    />

    <div className="card-body p-5 lg:p-6 flex flex-col justify-between h-full relative z-10">
      <div
        className="w-9 lg:w-10 h-9 lg:h-10 rounded-[10px] lg:rounded-[12px] flex items-center justify-center mb-3 lg:mb-4"
        style={{ background: `${color}18`, color }}
      >
        {icon}
      </div>

      <div>
        <p className="text-[10px] lg:text-xs font-semibold text-base-content/40 uppercase tracking-[0.08em] mb-1.5 lg:mb-2">
          {label}
        </p>
        <p className="text-xl lg:text-2xl font-bold text-base-content amount leading-none">
          {value}
        </p>
        {trend && (
          <p className={`text-[11px] lg:text-xs mt-2 font-medium ${trend > 0 ? 'text-success' : 'text-error'}`}>
            {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
          </p>
        )}
      </div>
    </div>
  </div>
);
