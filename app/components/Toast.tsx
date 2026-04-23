'use client';

import { useEffect, useState } from 'react';
import { cx } from '../../lib/ui';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

const toastAccent: Record<ToastType, string> = {
  success: 'bg-[var(--good)]',
  error: 'bg-[var(--bad)]',
  info: 'bg-[var(--brand)]',
  warning: 'bg-[var(--warn)]',
};

const toastIcons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'i',
  warning: '!',
};

function ToastItem({ toast, onRemove }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={cx(
        'pointer-events-auto flex items-stretch gap-0 border border-[var(--line-strong)] bg-[var(--bg-card)] shadow-2xl transition-all duration-300 overflow-hidden',
        isExiting ? 'translate-x-[110%] opacity-0' : 'translate-x-0 opacity-100'
      )}
      role="alert"
    >
      <div className={cx('w-1 shrink-0', toastAccent[toast.type])} />
      <div className="flex items-center gap-3 px-4 py-3 flex-1">
        <span className={cx(
          'mono inline-flex h-5 w-5 items-center justify-center text-[11px] text-white',
          toastAccent[toast.type]
        )}>
          {toastIcons[toast.type]}
        </span>
        <span className="flex-1 text-[13px] text-[var(--ink)]">{toast.message}</span>
        <button
          onClick={handleClose}
          className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors text-lg leading-none"
          aria-label="Fermer"
        >
          ×
        </button>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-[360px] w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
