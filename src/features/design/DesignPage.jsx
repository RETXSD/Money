import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SketchBadge, SketchProgress, Squiggle } from '../../shared/components/SketchFeedback.jsx';
import { DoodleIcon } from '../../shared/components/DoodleIcon.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { SketchInput, SketchSelect } from '../../shared/components/SketchField.jsx';
import { SketchModal } from '../../shared/components/SketchModal.jsx';
import { SketchTabs } from '../../shared/components/SketchTabs.jsx';
import { Grid, PageContainer, PageHeader, Row, Section, Stack } from '../../shared/components/Layout.jsx';

const swatches = [
  { name: 'Paper', token: '--color-paper', className: 'bg-paper' },
  { name: 'Card', token: '--color-card', className: 'bg-card' },
  { name: 'Ink', token: '--color-ink', className: 'bg-ink text-paper' },
  { name: 'Yellow', token: '--color-yellow', className: 'bg-yellow' },
  { name: 'Red', token: '--color-red', className: 'bg-red' },
  { name: 'Green', token: '--color-green', className: 'bg-green' },
  { name: 'Blue', token: '--color-blue', className: 'bg-blue' },
];

export function DesignPage() {
  const [activeTab, setActiveTab] = useState('semua');
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <PageContainer className="design-page" gap={32}>
      <PageHeader
        actions={
          <SketchButton as={Link} className="no-underline" to="/" variant="secondary">
            Beranda
          </SketchButton>
        }
        badge="Sistem visual"
        description="Warna, jarak, tipografi, dan komponen MTRCK."
        title="Studio desain"
      />

      <Section aria-labelledby="colors-heading" gap={16}>
        <h2 className="showcase-title" id="colors-heading">Warna</h2>
        <div className="swatches">
          {swatches.map((swatch) => (
            <div className={`swatch ${swatch.className}`} key={swatch.name}>
              <strong>{swatch.name}</strong>
              <span>{swatch.token}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section aria-labelledby="spacing-heading" gap={16}>
        <h2 className="showcase-title" id="spacing-heading">Skala jarak</h2>
        <Grid className="scale-grid" gap={12}>
          {[
            ['4 px', 'Label dan ikon'],
            ['8 px', 'Jarak rapat'],
            ['12 px', 'Jarak normal'],
            ['16 px', 'Kartu dan grid'],
            ['24 px', 'Padding kartu desktop'],
            ['32 px', 'Antarseksi'],
            ['48 px', 'Ruang lebar'],
            ['64 px', 'Ruang ekstra'],
          ].map(([value, role]) => (
            <SketchCard className="scale-card" key={value}>
              <strong>{value}</strong>
              <span>{role}</span>
            </SketchCard>
          ))}
        </Grid>
        <p className="text-sm">Padding halaman: 16 px, 24 px, 32 px. Tombol: padding horizontal 20 px.</p>
      </Section>

      <Section aria-labelledby="spacing-roles-heading" gap={16}>
        <h2 className="showcase-title" id="spacing-roles-heading">Peran jarak</h2>
        <Grid className="scale-roles" gap={8}>
          {[
            ['Padding samping halaman', '16 / 24 / 32 px'],
            ['Jarak antarbagian', '32 px'],
            ['Jarak antarkartu', '16 px'],
            ['Padding kartu', '16 / 24 px'],
            ['Isi kartu rapat / normal', '8 / 12 px'],
            ['Jarak antarbidang form', '16 px'],
            ['Label ke input', '4 px'],
            ['Form ke tombol simpan', '24 px'],
            ['Ikon ke teks', '8 px'],
            ['Tombol', '44 px tinggi · 20 px samping'],
          ].map(([role, value]) => (
            <div className="scale-role" key={role}>
              <span>{role}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </Grid>
      </Section>

      <Section aria-labelledby="type-heading" gap={16}>
        <h2 className="showcase-title" id="type-heading">Tipografi</h2>
        <Stack gap={8}>
          <p className="type-sample-secondary">Teks pendamping 15 px</p>
          <p className="type-sample-body">Teks isi 17 px</p>
          <p className="type-sample-card">Judul kartu 20 px</p>
          <p className="type-sample-section">Judul bagian 24 px</p>
          <p className="type-sample-page">Judul halaman 32–44 px</p>
          <p className="type-sample-hero">Nominal utama</p>
        </Stack>
      </Section>

      <Section aria-labelledby="shape-heading" gap={16}>
        <h2 className="showcase-title" id="shape-heading">Bentuk</h2>
        <Row gap={12}>
          <div className="radius-sample radius-a">Kartu A</div>
          <div className="radius-sample radius-b">Tombol B</div>
          <div className="radius-sample radius-c">Input C</div>
          <div className="radius-sample radius-full">Penuh</div>
          <div className="radius-sample shadow-sample">Bayangan 4 px</div>
        </Row>
      </Section>

      <Grid className="showcase-grid" gap={16}>
        <SketchCard>
          <h2 className="showcase-title">Tombol</h2>
          <Row gap={12}>
            <SketchButton>Utama</SketchButton>
            <SketchButton variant="secondary">Sekunder</SketchButton>
            <SketchButton variant="danger">Hapus</SketchButton>
            <SketchButton disabled variant="secondary">
              Nonaktif
            </SketchButton>
          </Row>
        </SketchCard>

        <SketchCard sticky>
          <h2 className="showcase-title">Kartu sticky</h2>
          <p>Kertas kuning untuk angka utama.</p>
          <Squiggle className="text-ink" />
        </SketchCard>

        <SketchCard>
          <h2 className="showcase-title">Input dan select</h2>
          <Stack gap={12}>
            <SketchInput label="Nama kategori" defaultValue="Jajan" />
            <SketchSelect
              label="Jenis"
              defaultValue="expense"
              options={[
                { label: 'Pengeluaran', value: 'expense' },
                { label: 'Pemasukan', value: 'income' },
              ]}
            />
          </Stack>
        </SketchCard>

        <SketchCard>
          <h2 className="showcase-title">Status dan progres</h2>
          <Row gap={8}>
            <SketchBadge variant="success">Aman</SketchBadge>
            <SketchBadge variant="warning">Hampir penuh</SketchBadge>
            <SketchBadge variant="danger">Lewat batas</SketchBadge>
            <SketchBadge variant="info">Info</SketchBadge>
          </Row>
          <Stack gap={12}>
            <SketchProgress label="Makan" value={44} />
            <SketchProgress label="Jajan" value={82} />
            <SketchProgress label="Belanja" value={112} />
          </Stack>
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
          <Row gap={16}>
            <DoodleIcon className="h-7 w-7" name="home" />
            <DoodleIcon className="h-7 w-7" name="receipt" />
            <DoodleIcon className="h-7 w-7" name="chart" />
            <DoodleIcon className="h-7 w-7" name="people" />
            <DoodleIcon className="h-7 w-7" name="settings" />
          </Row>
        </SketchCard>

        <SketchCard>
          <h2 className="showcase-title">Modal</h2>
          <p>Dialog konfirmasi dengan fokus yang jelas.</p>
          <SketchButton onClick={() => setModalOpen(true)} variant="secondary">
            Buka contoh modal
          </SketchButton>
        </SketchCard>
      </Grid>

      <SketchModal onClose={() => setModalOpen(false)} open={modalOpen} title="Contoh dialog">
        <p>Konten modal tetap mudah dibaca dan punya aksi yang jelas.</p>
        <SketchButton onClick={() => setModalOpen(false)}>Mengerti</SketchButton>
      </SketchModal>
    </PageContainer>
  );
}
