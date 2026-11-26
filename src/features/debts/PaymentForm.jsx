import { useState } from 'react';
import { MoneyInput } from '../../shared/components/MoneyInput.jsx';
import { SketchButton } from '../../shared/components/SketchButton.jsx';
import { SketchInput } from '../../shared/components/SketchField.jsx';
import { formatRupiah } from '../../shared/utils/money.js';

export function PaymentForm({ remaining, saving, error, onSave }) {
  const [amount, setAmount] = useState(null);
  const [note, setNote] = useState('');
  const [validationError, setValidationError] = useState('');
  const [success, setSuccess] = useState('');

  async function submit(event) {
    event.preventDefault();
    if (!Number.isSafeInteger(amount) || amount <= 0 || amount > remaining) {
      setValidationError('Jumlah harus lebih dari nol dan tidak melebihi sisa utang.');
      return;
    }
    setValidationError('');
    if (await onSave({ amount, note })) {
      setAmount(null);
      setNote('');
      setSuccess('Pembayaran tersimpan.');
    }
  }

  return (
    <form className="field-stack" onSubmit={submit}>
      <MoneyInput
        label={`Jumlah pembayaran (sisa ${formatRupiah(remaining)})`}
        onChange={setAmount}
        required
        value={amount}
      />
      <SketchInput
        label="Catatan pembayaran"
        onChange={(event) => setNote(event.target.value)}
        value={note}
      />
      {validationError || error ? (
        <p className="text-red-dark m-0" role="alert">
          {validationError || error}
        </p>
      ) : null}
      {success ? (
        <p className="text-green-dark m-0" role="status">
          {success}
        </p>
      ) : null}
      <SketchButton disabled={saving || remaining <= 0} type="submit">
        {saving ? 'Menyimpan…' : 'Simpan pembayaran'}
      </SketchButton>
    </form>
  );
}
