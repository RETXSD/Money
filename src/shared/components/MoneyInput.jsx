import { useState } from 'react';
import { SketchInput } from './SketchField.jsx';
import { formatRupiah, parseRupiahInput } from '../utils/money.js';

export function MoneyInput({ label, value, onChange, ...props }) {
  const [focused, setFocused] = useState(false);
  const displayValue = focused ? (value ?? '') : value === null ? '' : formatRupiah(value);

  return (
    <SketchInput
      inputMode="numeric"
      label={label}
      onBlur={() => setFocused(false)}
      onChange={(event) => onChange(parseRupiahInput(event.target.value))}
      onFocus={() => setFocused(true)}
      type="text"
      value={displayValue}
      {...props}
    />
  );
}
