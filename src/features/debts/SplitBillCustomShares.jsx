import { MoneyInput } from '../../shared/components/MoneyInput.jsx';

export function SplitBillCustomShares({
  ownShare,
  onOwnShareChange,
  people,
  shares,
  onShareChange,
}) {
  return (
    <div className="field-stack">
      <MoneyInput label="Bagian saya" onChange={onOwnShareChange} required value={ownShare} />
      {people.map((person) => (
        <MoneyInput
          key={person.id}
          label={`Bagian ${person.name}`}
          onChange={(amount) => onShareChange(person.id, amount)}
          required
          value={shares[person.id] ?? null}
        />
      ))}
      <p className="text-ink/75 m-0 text-sm">Semua bagian harus tepat sama dengan total tagihan.</p>
    </div>
  );
}
