import { useId } from 'react';

const fieldClassName = 'sketch-input';

export function SketchInput({ id: providedId, label, hint, className = '', ...props }) {
  const generatedId = useId();
  const id = providedId || generatedId;

  return (
    <div className="layout-stack layout-gap-4 field-control-stack">
      <label className="font-bold" htmlFor={id}>
        {label}
      </label>
      <input className={`${fieldClassName} ${className}`.trim()} id={id} {...props} />
      {hint ? <span className="text-sm">{hint}</span> : null}
    </div>
  );
}

export function SketchSelect({ id: providedId, label, options, className = '', ...props }) {
  const generatedId = useId();
  const id = providedId || generatedId;

  return (
    <div className="layout-stack layout-gap-4 field-control-stack">
      <label className="font-bold" htmlFor={id}>
        {label}
      </label>
      <select className={`${fieldClassName} ${className}`.trim()} id={id} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
