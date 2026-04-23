'use client';

import { useEffect, useRef } from 'react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    document.addEventListener('keydown', handleKey);
    confirmRef.current?.focus();
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md mx-4 border border-[var(--line-strong)] bg-[var(--bg-card)] shadow-2xl animate-in">
        <div className="p-6">
          <p className={`mono text-[11px] uppercase tracking-[0.2em] mb-3 ${danger ? 'text-[var(--bad)]' : 'text-[var(--brand-hi)]'}`}>
            {danger ? '— Action destructive' : '— Confirmation'}
          </p>
          <h3 className="text-xl font-medium tracking-[-0.01em] text-[var(--ink)] mb-3">
            {title}
          </h3>
          <p className="text-[14px] leading-relaxed text-[var(--ink-dim)]">
            {message}
          </p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-transparent px-5 py-3 text-sm font-medium text-[var(--ink)] border border-[var(--line-strong)] hover:border-[var(--ink-dim)] hover:bg-[var(--bg-elev)] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-white transition-colors ${
              danger
                ? 'bg-[var(--bad)] hover:bg-[var(--bad)]/80'
                : 'bg-[var(--brand)] hover:bg-[var(--brand-hi)]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
