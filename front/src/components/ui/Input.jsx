export const Input = ({
  label,
  leftIcon,
  rightSlot,
  className = '',
  inputClassName = '',
  ...props
}) => (
  <label className={`form-control w-full ${className}`}>
    {label && (
      <span className="label-text text-xs text-base-content/60 mb-1">
        {label}
      </span>
    )}
    <div className="relative">
      {leftIcon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none">
          {leftIcon}
        </span>
      )}
      <input
        className={`input input-bordered w-full ${leftIcon ? 'pl-10' : ''} ${rightSlot ? 'pr-12' : ''} ${inputClassName}`}
        {...props}
      />
      {rightSlot && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex items-center">
          {rightSlot}
        </span>
      )}
    </div>
  </label>
);
