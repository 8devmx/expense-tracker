export const Card = ({ children, className = '', ...props }) => (
  <div className={`card bg-base-100 border stat-card ${className}`} {...props}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`card-body p-6 lg:p-8 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`card-title text-base font-semibold ${className}`}>{children}</h3>
);
