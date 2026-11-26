import { useId } from 'react';

const fieldClassName =
  'block min-h-11 w-full rounded-sketch-c border-[2.5px] border-ink bg-card px-3 py-2 text-ink shadow-[2px_2px_0_var(--color-ink)]';

export function SketchInput({ id: providedId, label, hint, className = '', ...props }) {
  const generatedId = useId();
  const id = providedId || generatedId;

  return (
    <div className="grid gap-1.5">
      <label className="font-bold" htmlFor={id}>
        {label}
      </label>
      <input className={`${fieldClassName} ${className}`.trim()} id={id} {...props} />
      {hint ? <span className="text-ink/75 text-sm">{hint}</span> : null}
    </div>
  );
}

export function SketchSelect({ id: providedId, label, options, className = '', ...props }) {
  const generatedId = useId();
  const id = providedId || generatedId;

  return (
    <div className="grid gap-1.5">
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
