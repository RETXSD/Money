import { useEffect, useId, useRef } from 'react';
import { SketchButton } from './SketchButton.jsx';
import { SketchCard } from './SketchCard.jsx';

export function SketchModal({ open, onClose, title, children }) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    dialogRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current?.();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="bg-ink/45 fixed inset-0 z-50 grid place-items-center overflow-y-auto p-5"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
      role="presentation"
    >
      <SketchCard
        aria-labelledby={titleId}
        aria-modal="true"
        className="w-full max-w-md"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
        as="div"
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <h2 className="font-heading m-0 text-3xl" id={titleId}>
            {title}
          </h2>
          <SketchButton aria-label="Tutup dialog" onClick={onClose} variant="secondary">
            ×
          </SketchButton>
        </div>
        {children}
      </SketchCard>
    </div>
  );
}
