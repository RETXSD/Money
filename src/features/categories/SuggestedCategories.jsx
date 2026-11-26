import { SUGGESTED_CATEGORIES } from '../../shared/constants/categories.js';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';

export function SuggestedCategories({ categories, saving, onAdd }) {
  const existingNames = new Set(categories.map((category) => category.name.toLowerCase()));

  return (
    <SketchCard>
      <h2 className="showcase-title">Ide kategori</h2>
      <p>Tambahkan kategori yang belum ada.</p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_CATEGORIES.map((suggestion) => {
          const exists = existingNames.has(suggestion.name.toLowerCase());
          return (
            <SketchButton
              disabled={exists || saving}
              key={suggestion.name}
              onClick={() => onAdd(suggestion)}
              variant="secondary"
            >
              {suggestion.icon} {exists ? 'Ditambahkan' : `Tambah ${suggestion.name}`}
            </SketchButton>
          );
        })}
      </div>
    </SketchCard>
  );
}
