import { SketchBadge } from '../../shared/components/SketchFeedback.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { formatRupiah } from '../../shared/utils/money.js';

export function BudgetWarning({ warning }) {
  if (!warning) return null;
  return (
    <SketchCard aria-live="polite" sticky>
      <SketchBadge variant="warning">Alokasi perlu ditinjau</SketchBadge>
      <h2 className="showcase-title">Total anggaran melebihi dana tersedia</h2>
      <p>
        Anggaran kategori berjumlah <strong>{formatRupiah(warning.totalLimit)}</strong>, sementara
        dana tersedia <strong>{formatRupiah(warning.availableFunds)}</strong>. Kurangi alokasi
        sebesar <strong>{formatRupiah(warning.shortfall)}</strong> agar rencana tetap realistis.
      </p>
    </SketchCard>
  );
}
