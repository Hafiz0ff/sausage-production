import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ModalProps {
  title: string;
  children: ReactNode;
  footer: ReactNode;
  onClose: () => void;
}

export function Modal({ title, children, footer, onClose }: ModalProps) {
  return (
    <div className="modal-overlay active" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {title}
          </h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Закрыть">
            <X size={16} />
          </button>
        </header>
        <div className="modal-body">{children}</div>
        <footer className="modal-footer">{footer}</footer>
      </section>
    </div>
  );
}
