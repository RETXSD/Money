import { SketchButton } from './SketchButton.jsx';
import { SketchCard } from './SketchCard.jsx';

export function SketchModal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="bg-ink/45 fixed inset-0 z-50 grid place-items-center p-5" role="presentation">
      <SketchCard
        aria-labelledby="sketch-modal-title"
        aria-modal="true"
        className="w-full max-w-md"
        role="dialog"
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <h2 className="font-heading m-0 text-3xl" id="sketch-modal-title">
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
