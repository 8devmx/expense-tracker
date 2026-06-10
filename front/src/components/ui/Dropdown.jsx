export const Dropdown = ({
  trigger,
  children,
  align = 'end',
  className = '',
}) => (
  <div className={`dropdown ${align === 'end' ? 'dropdown-end' : ''} ${className}`}>
    <div tabIndex={0} role="button">
      {trigger}
    </div>
    <div tabIndex={0} className="dropdown-content z-50 mt-2 min-w-48 rounded-box border border-base-300 bg-base-100 p-2 shadow-xl">
      {children}
    </div>
  </div>
);
