const variants = {
  primary: 'btn-primary shadow-md hover:shadow-lg',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost text-base-content/60',
  error: 'btn-error text-error-content'
};

const sizes = {
  xs: 'btn-xs h-7 px-2 text-[11px]',
  sm: 'btn-sm h-9 px-3.5 text-sm',
  md: 'btn-md h-11 px-5 text-base',
  lg: 'btn-lg h-14 px-7 text-lg'
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => (
  <button className={`btn ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
    {children}
  </button>
);
