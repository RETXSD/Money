import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { SketchInput, SketchSelect } from '../../shared/components/SketchField.jsx';
import { formatLocalDate } from '../../shared/utils/dates.js';

export function TransactionFilters({
  period,
  month,
  categoryId,
  categories,
  range,
  onPeriodChange,
  onMonthChange,
  onCategoryChange,
}) {
  return (
    <SketchCard className="grid gap-3 sm:grid-cols-3">
      <SketchSelect
        label="Periode"
        onChange={(event) => onPeriodChange(event.target.value)}
        options={[
          { value: 'cycle', label: 'Siklus gajian' },
          { value: 'month', label: 'Bulan kalender' },
        ]}
        value={period}
      />
      {period === 'month' ? (
        <SketchInput
          label="Bulan"
          onChange={(event) => onMonthChange(event.target.value)}
          type="month"
          value={month}
        />
      ) : (
        <div className="text-ink/75 grid content-end text-sm">
          Siklus {formatLocalDate(range.start)} – {formatLocalDate(range.end)}
        </div>
      )}
      <SketchSelect
        label="Kategori"
        onChange={(event) => onCategoryChange(event.target.value)}
        options={[
          { value: '', label: 'Semua kategori' },
          ...categories.map((category) => ({
            value: category.id,
            label: `${category.icon} ${category.name}`,
          })),
        ]}
        value={categoryId}
      />
    </SketchCard>
  );
}
