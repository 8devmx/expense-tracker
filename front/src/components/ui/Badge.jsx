export const Badge = ({
  variant = 'default',
  children,
  className = '',
  ...props
}) => {
  const variants = {
    default: 'badge badge-primary',
    success: 'badge badge-success',
    error: 'badge badge-error',
    warning: 'badge badge-warning',
    info: 'badge badge-info',
    ghost: 'badge badge-ghost'
  };

  return (
    <span className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
