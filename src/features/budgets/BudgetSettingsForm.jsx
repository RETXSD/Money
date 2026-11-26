import { useState } from 'react';
import { MoneyInput } from '../../shared/components/MoneyInput.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchSelect } from '../../shared/components/SketchField.jsx';

import { MAX_PAYDAY_DAY } from '../../shared/constants/budget.js';

const paydayOptions = Array.from({ length: MAX_PAYDAY_DAY }, (_, index) => ({
  value: String(index + 1),
  label: `Tanggal ${index + 1}`,
}));

export function BudgetSettingsForm({ settings, saving, error, onSave }) {
  const [paydayDay, setPaydayDay] = useState(String(settings.paydayDay));
  const [balanceBase, setBalanceBase] = useState(settings.balanceBase);
  const [resetBalance, setResetBalance] = useState(false);
  const [message, setMessage] = useState('');

  async function submit(event) {
    event.preventDefault();
    const normalizedPayday = Number(paydayDay);
    if (!Number.isInteger(normalizedPayday) || normalizedPayday < 1 || normalizedPayday > 31) {
      setMessage('Pilih tanggal gajian antara 1 dan 31.');
      return;
    }
    if (!Number.isSafeInteger(balanceBase)) {
      setMessage('Masukkan saldo awal dalam rupiah bulat.');
      return;
    }
    setMessage('');
    await onSave({ paydayDay: normalizedPayday, balanceBase, resetBalance });
  }

  return (
    <form className="field-stack" onSubmit={submit}>
      <SketchSelect
        label="Tanggal gajian"
        onChange={(event) => setPaydayDay(event.target.value)}
        options={paydayOptions}
        value={paydayDay}
      />
      <MoneyInput
        hint="Untuk mereset saldo, masukkan saldo rekening saat ini. Transaksi berikutnya dihitung dari nilai baru ini."
        label="Saldo dasar baru (rupiah)"
        onChange={setBalanceBase}
        required
        value={balanceBase}
      />
      <p className="text-ink/75 m-0 text-sm">
        Nilai ini menggantikan saldo dasar sekarang. Saat mereset, masukkan saldo rekening saat ini;
        transaksi berikutnya akan dihitung dari titik tersebut.
      </p>
      <label className="flex min-h-11 items-center gap-3">
        <input
          checked={resetBalance}
          onChange={(event) => setResetBalance(event.target.checked)}
          type="checkbox"
        />
        Mulai hitung transaksi dari tanggal hari ini
      </label>
      {message || error ? (
        <p className="text-red-dark m-0" role="alert">
          {message || error}
        </p>
      ) : null}
      <SketchButton disabled={saving} type="submit">
        {saving ? 'Menyimpan…' : 'Simpan pengaturan dompet'}
      </SketchButton>
    </form>
  );
}
