import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SketchBadge, SketchProgress, Squiggle } from '../../shared/components/SketchFeedback.jsx';
import { DoodleIcon } from '../../shared/components/DoodleIcon.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { SketchInput, SketchSelect } from '../../shared/components/SketchField.jsx';
import { SketchModal } from '../../shared/components/SketchModal.jsx';
import { SketchTabs } from '../../shared/components/SketchTabs.jsx';

const swatches = [
  { name: 'Paper', hex: '#FFFDF7', className: 'bg-paper' },
  { name: 'Card', hex: '#FFFFFF', className: 'bg-card' },
  { name: 'Ink', hex: '#1A1A1A', className: 'bg-ink text-paper' },
  { name: 'Yellow', hex: '#FFD93D', className: 'bg-yellow' },
  { name: 'Red', hex: '#FF6B6B', className: 'bg-red' },
  { name: 'Green', hex: '#6BCB77', className: 'bg-green' },
  { name: 'Blue', hex: '#4D96FF', className: 'bg-blue' },
];

export function DesignPage() {
  const [activeTab, setActiveTab] = useState('semua');
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main className="mx-auto grid w-[min(100%-32px,1000px)] gap-6 py-8">
      <header>
        <Link className="brand no-underline" to="/">
          <span aria-hidden="true" className="brand-mark">
            m
          </span>
          <span>MTRCK</span>
        </Link>
        <h1 className="page-heading mt-4">Studio desain</h1>
        <p className="page-kicker">Pratinjau komponen dan token visual MTRCK.</p>
      </header>

      <section aria-labelledby="colors-heading">
        <h2 className="showcase-title" id="colors-heading">
          Warna
        </h2>
        <div className="swatches">
          {swatches.map((swatch) => (
            <div className={`swatch ${swatch.className}`} key={swatch.name}>
              <strong>{swatch.name}</strong>
              <br />
              {swatch.hex}
            </div>
          ))}
        </div>
      </section>

      <div className="showcase-grid">
        <SketchCard>
          <h2 className="showcase-title">Tombol</h2>
          <div className="flex flex-wrap gap-3">
            <SketchButton>Utama</SketchButton>
            <SketchButton variant="secondary">Sekunder</SketchButton>
            <SketchButton variant="danger">Hapus</SketchButton>
            <SketchButton disabled>Nonaktif</SketchButton>
          </div>
        </SketchCard>

        <SketchCard sticky>
          <h2 className="showcase-title">Kartu sticky</h2>
          <p className="my-0">Kertas kuning untuk angka dan perhatian utama.</p>
          <Squiggle className="text-ink mt-4" />
        </SketchCard>

        <SketchCard>
          <h2 className="showcase-title">Input dan select</h2>
          <div className="grid gap-3">
            <SketchInput label="Nama kategori" defaultValue="Jajan" />
            <SketchSelect
              label="Jenis"
              defaultValue="expense"
              options={[
                { label: 'Pengeluaran', value: 'expense' },
                { label: 'Pemasukan', value: 'income' },
              ]}
            />
          </div>
        </SketchCard>

        <SketchCard>
          <h2 className="showcase-title">Status dan progres</h2>
          <div className="mb-4 flex flex-wrap gap-2">
            <SketchBadge variant="success">Aman</SketchBadge>
            <SketchBadge variant="warning">Hampir penuh</SketchBadge>
            <SketchBadge variant="danger">Lewat batas</SketchBadge>
            <SketchBadge variant="info">Info</SketchBadge>
          </div>
          <div className="grid gap-3">
            <SketchProgress label="Makan" value={44} />
            <SketchProgress label="Jajan" value={82} />
            <SketchProgress label="Belanja" value={112} />
          </div>
        </SketchCard>

        <SketchCard>
          <h2 className="showcase-title">Tab dan ikon</h2>
          <SketchTabs
            label="Filter catatan"
            onChange={setActiveTab}
            tabs={[
              { label: 'Semua', value: 'semua' },
              { label: 'Masuk', value: 'masuk' },
              { label: 'Keluar', value: 'keluar' },
            ]}
            value={activeTab}
          />
          <div className="mt-5 flex items-center gap-4">
            <DoodleIcon className="h-7 w-7" name="home" />
            <DoodleIcon className="h-7 w-7" name="receipt" />
            <DoodleIcon className="h-7 w-7" name="chart" />
            <DoodleIcon className="h-7 w-7" name="people" />
            <DoodleIcon className="h-7 w-7" name="settings" />
          </div>
        </SketchCard>

        <SketchCard>
          <h2 className="showcase-title">Modal</h2>
          <p className="mt-0">Dialog konfirmasi dengan fokus yang jelas.</p>
          <SketchButton onClick={() => setModalOpen(true)} variant="secondary">
            Buka contoh modal
          </SketchButton>
        </SketchCard>
      </div>

      <SketchModal onClose={() => setModalOpen(false)} open={modalOpen} title="Contoh dialog">
        <p className="mt-0">Konten modal tetap mudah dibaca dan punya aksi yang jelas.</p>
        <SketchButton onClick={() => setModalOpen(false)}>Mengerti</SketchButton>
      </SketchModal>
    </main>
  );
}
