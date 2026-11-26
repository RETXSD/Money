import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { Grid } from '../../shared/components/Layout.jsx';

export function CategoryList({ categories, onEdit, onDelete }) {
  return (
    <Grid className="category-list-grid" gap={16}>
      {categories.map((category) => (
        <SketchCard
          className="flex flex-wrap items-center justify-between gap-3"
          key={category.id}
        >
          <div>
            <h3 className="font-heading text-2xl">
              {category.icon} {category.name}
            </h3>
            <p className="text-ink text-sm">
              {category.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
              {category.keywords?.length ? ` · ${category.keywords.join(', ')}` : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <SketchButton
              aria-label={`Ubah kategori ${category.name}`}
              onClick={() => onEdit(category)}
              variant="secondary"
            >
              Ubah
            </SketchButton>
            <SketchButton
              aria-label={`Hapus kategori ${category.name}`}
              onClick={() => onDelete(category)}
              variant="danger"
            >
              Hapus
            </SketchButton>
          </div>
        </SketchCard>
      ))}
    </Grid>
  );
}
