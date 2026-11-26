import { Link } from 'react-router-dom';
import { EmptyState } from './EmptyState.jsx';
import { PageContainer, PageHeader } from './Layout.jsx';
import { SketchButton } from './SketchButton.jsx';

export function PlaceholderPage({ page }) {
  return (
    <PageContainer>
      <PageHeader
        badge="MTRCK"
        description="Halaman yang kamu cari tidak tersedia."
        title={page}
      />
      <EmptyState
        description="Periksa alamat halaman atau kembali ke beranda."
        icon="wallet"
        title="Halaman tidak ditemukan"
      >
        <SketchButton as={Link} className="no-underline" to="/" variant="secondary">
          Kembali ke beranda
        </SketchButton>
      </EmptyState>
    </PageContainer>
  );
}
