import { FiX } from 'react-icons/fi';
import { Button } from './Button';

export const Modal = ({
  title,
  subtitle,
  children,
  footer,
  onClose,
  className = '',
}) => (
  <dialog className="modal modal-bottom sm:modal-middle" open>
    <div className={`modal-box p-0 max-w-sm overflow-hidden ${className}`}>
      {(title || onClose) && (
        <div className="sticky top-0 z-10 bg-base-100 px-5 pt-4 pb-3 border-b border-base-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              {title && <h2 className="font-display text-lg font-semibold">{title}</h2>}
              {subtitle && <p className="caption">{subtitle}</p>}
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" className="btn-circle" onClick={onClose}>
                <FiX size={18} />
              </Button>
            )}
          </div>
        </div>
      )}
      <div>{children}</div>
      {footer && (
        <div className="border-t border-base-200 px-5 py-4">
          {footer}
        </div>
      )}
    </div>
    <form method="dialog" className="modal-backdrop">
      <button type="button" onClick={onClose}>close</button>
    </form>
  </dialog>
);
