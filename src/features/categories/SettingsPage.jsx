import { Link } from 'react-router-dom';
import { SketchBadge } from '../../shared/components/SketchFeedback.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';

export function SettingsPage() {
  return (
    <div className="page-grid">
      <header>
        <SketchBadge variant="info">Preferensi</SketchBadge>
        <h1 className="page-heading mt-3">Pengaturan</h1>
        <p className="page-kicker">Sesuaikan cara MTRCK mengatur dompetmu.</p>
      </header>
      <SketchCard>
        <h2 className="showcase-title">Kategori</h2>
        <p className="mt-0">Atur kategori pemasukan dan pengeluaran yang kamu pakai.</p>
        <Link className="inline-flex no-underline" to="/settings/categories">
          <SketchButton>Kelola kategori</SketchButton>
        </Link>
      </SketchCard>
      <SketchCard>
        <h2 className="showcase-title">Siklus gajian</h2>
        <p className="mt-0">
          Pengaturan tanggal gajian dan saldo awal akan hadir bersama jatah harian.
        </p>
      </SketchCard>
    </div>
  );
}
