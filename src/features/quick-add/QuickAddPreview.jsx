import { useState } from 'react';
import { MoneyInput } from '../../shared/components/MoneyInput.jsx';
import { SketchBadge } from '../../shared/components/SketchFeedback.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { SketchInput, SketchSelect } from '../../shared/components/SketchField.jsx';
import { SketchModal } from '../../shared/components/SketchModal.jsx';
import { SketchTabs } from '../../shared/components/SketchTabs.jsx';
import { formatLocalDate } from '../../shared/utils/dates.js';
import { getKeywordSuggestion } from './quickAddHelpers.js';

const confidenceLabel = {
  high: 'Cukup yakin',
  medium: 'Periksa sebentar',
  low: 'Perlu dilengkapi',
};

export function QuickAddPreview({ categories, error, onChange, onClose, onSave, preview, saving }) {
  const [learnedKeywordKey, setLearnedKeywordKey] = useState('');
  const keywordSuggestion = preview
    ? getKeywordSuggestion(preview.note, categories, preview.categoryId, preview.parsedCategoryId)
    : '';
  if (!preview) return null;
  const category = categories.find((item) => item.id === preview.categoryId);
  const suggestionKey = `${preview.categoryId}:${keywordSuggestion}`;
  const learnKeyword = Boolean(keywordSuggestion) && learnedKeywordKey === suggestionKey;
  const categoryOptions = categories
    .filter((item) => item.type === preview.type)
    .map((item) => ({ value: item.id, label: `${item.icon} ${item.name}` }));

  return (
    <SketchModal onClose={onClose} open title="Periksa catatanmu">
      <div className="field-stack">
        <SketchBadge variant={preview.confidence === 'low' ? 'warning' : 'info'}>
          {confidenceLabel[preview.confidence]}
        </SketchBadge>
        <SketchTabs
          label="Jenis transaksi"
          onChange={(type) => {
            onChange('type', type);
            if (!categories.some((item) => item.id === preview.categoryId && item.type === type)) {
              onChange('categoryId', null);
            }
          }}
          tabs={[
            { value: 'expense', label: 'Pengeluaran' },
            { value: 'income', label: 'Pemasukan' },
          ]}
          value={preview.type}
        />
        <MoneyInput
          label="Jumlah (rupiah)"
          onChange={(amount) => onChange('amount', amount)}
          required
          value={preview.amount}
        />
        <SketchSelect
          label="Kategori"
          onChange={(event) => onChange('categoryId', event.target.value || null)}
          options={[{ value: '', label: 'Tanpa kategori' }, ...categoryOptions]}
          value={preview.categoryId || ''}
        />
        <SketchInput
          label="Catatan"
          onChange={(event) => onChange('note', event.target.value)}
          value={preview.note}
        />
        <SketchInput
          label="Tanggal"
          onChange={(event) => {
            if (event.target.value) onChange('date', new Date(`${event.target.value}T12:00:00`));
          }}
          required
          type="date"
          value={formatLocalDate(preview.date)}
        />

        {preview.debt ? (
          <SketchCard className="p-3" sticky>
            <h3 className="m-0 font-bold">Rincian utang</h3>
            <p className="mt-1 mb-0">
              {preview.debt.repayment ? 'Pembayaran' : 'Catatan'}{' '}
              {preview.debt.direction === 'owed_to_me' ? 'piutang dari' : 'utang ke'}{' '}
              <strong>{preview.debt.personName}</strong>.{' '}
              {preview.debt.affectsCash
                ? 'Memengaruhi saldo tunai.'
                : 'Tidak mengubah saldo tunai.'}
            </p>
            <p className="mt-2 mb-0 text-sm">
              Penyimpanan utang dan pembayaran tersedia pada milestone fitur berikutnya.
            </p>
          </SketchCard>
        ) : null}

        {keywordSuggestion ? (
          <label className="flex min-h-11 items-center gap-3 px-1 py-2">
            <input
              checked={learnKeyword}
              onChange={(event) => setLearnedKeywordKey(event.target.checked ? suggestionKey : '')}
              type="checkbox"
            />
            <span>
              Ingat kata <strong>“{keywordSuggestion}”</strong> untuk kategori{' '}
              <strong>{category?.name}</strong>
            </span>
          </label>
        ) : null}

        {error ? (
          <p className="text-red-dark m-0" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <SketchButton
            disabled={saving || Boolean(preview.debt)}
            onClick={() =>
              onSave({
                learnKeyword: learnKeyword ? keywordSuggestion : '',
                categoryKeywords: category?.keywords || [],
              })
            }
          >
            {saving ? 'Menyimpan…' : 'Simpan transaksi'}
          </SketchButton>
          <SketchButton disabled={saving} onClick={onClose} variant="secondary">
            Batal
          </SketchButton>
        </div>
      </div>
    </SketchModal>
  );
}
