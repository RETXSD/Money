import { Link } from 'react-router-dom';
import { DoodleIcon } from './DoodleIcon.jsx';
import { SketchBadge, Squiggle } from './SketchFeedback.jsx';
import { SketchButton } from './SketchButton.jsx';
import { SketchCard } from './SketchCard.jsx';

const pageCopy = {
  Transaksi: 'Semua pemasukan dan pengeluaranmu, rapi dalam satu tempat.',
  Anggaran: 'Bagi uangmu ke kategori supaya tiap rupiah punya tujuan.',
  'Utang & piutang': 'Urusan patungan dan pinjam-meminjam jadi lebih jelas.',
  'Detail utang': 'Lihat sisa tagihan dan riwayat pembayaran.',
  Profil: 'Kelola informasi dan preferensi akunmu.',
  Pengaturan: 'Atur siklus gajian dan preferensi dompetmu.',
  'Kenali dompetmu': 'Isi beberapa hal sederhana supaya MTRCK terasa lebih personal.',
  'Halaman tidak ditemukan': 'Sepertinya halaman ini belum ada.',
};

export function PlaceholderPage({ page }) {
  const isHome = page === 'Beranda';

  return (
    <div className="page-grid">
      <div>
        <SketchBadge variant="info">Dompet harianmu</SketchBadge>
        <h1 className="page-heading mt-3">{isHome ? 'Halo, teman!' : page}</h1>
        <p className="page-kicker">
          {isHome
            ? 'Pelan-pelan, kita bikin uangmu lebih gampang dipahami.'
            : pageCopy[page] || 'Semua catatan pentingmu, ada di sini.'}
        </p>
      </div>

      {isHome ? (
        <>
          <SketchCard className="sketch-success" sticky>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mt-0 mb-1 font-bold">Jatah hari ini</p>
                <p className="font-heading m-0 text-4xl leading-tight">Mulai dari saldo</p>
                <p className="mt-2 mb-0 text-sm">Atur siklus gajian untuk hitung jatah harianmu.</p>
              </div>
              <DoodleIcon className="mt-1 h-9 w-9 shrink-0" name="wallet" />
            </div>
            <Squiggle className="text-ink mt-4" />
            <SketchButton
              as={Link}
              className="mt-4 no-underline"
              to="/settings"
              variant="secondary"
            >
              Atur dompet <DoodleIcon className="ml-2 inline h-5 w-5 align-middle" name="arrow" />
            </SketchButton>
          </SketchCard>

          <div className="grid gap-4 sm:grid-cols-2">
            <SketchCard>
              <h2 className="showcase-title">Mulai catat</h2>
              <p className="mt-0 mb-4">Transaksi pertamamu bikin ringkasan uang jadi berguna.</p>
              <SketchButton as={Link} className="no-underline" to="/transactions">
                Tambah transaksi
              </SketchButton>
            </SketchCard>
            <SketchCard>
              <div className="flex items-center gap-2">
                <DoodleIcon className="h-6 w-6" name="chart" />
                <h2 className="showcase-title mb-0">Anggaran</h2>
              </div>
              <p className="mt-2 mb-3">Bikin batas nyaman untuk kategori yang penting.</p>
              <div className="bg-blue/25 h-2 rounded-full">
                <div className="bg-blue h-full w-1/3 rounded-full" />
              </div>
            </SketchCard>
          </div>
        </>
      ) : (
        <SketchCard>
          <div className="doodle-illustration" aria-hidden="true">
            <DoodleIcon name={page === 'Anggaran' ? 'chart' : 'wallet'} />
          </div>
          <h2 className="showcase-title text-center">Ruang ini sedang disiapkan</h2>
          <p className="mx-auto max-w-md text-center">
            Kerangka MTRCK sudah siap. Fitur {page.toLowerCase()} akan hadir bertahap supaya
            pencatatanmu tetap sederhana dan jelas.
          </p>
          <div className="mt-5 flex justify-center">
            <SketchButton as={Link} className="no-underline" to="/" variant="secondary">
              Kembali ke beranda
            </SketchButton>
          </div>
        </SketchCard>
      )}

      <p className="text-ink/75 m-0 text-center text-sm">
        Dirancang untuk kebiasaan dan kebutuhan sehari-hari di Indonesia.
      </p>
    </div>
  );
}
