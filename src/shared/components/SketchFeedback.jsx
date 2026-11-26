export function SketchBadge({ children, variant = 'info' }) {
  const variantClass = {
    info: 'bg-blue',
    success: 'bg-green',
    warning: 'bg-yellow',
    danger: 'bg-red',
  }[variant];

  return (
    <span
      className={`sketch-badge badge-${variant} ${variantClass}`}
    >
      {children}
    </span>
  );
}

export function SketchProgress({ value, label = 'Kemajuan' }) {
  const safeValue = Math.min(100, Math.max(0, value));
  const status = safeValue < 75 ? 'green' : safeValue <= 100 ? 'yellow' : 'red';

  return (
    <div className="layout-stack layout-gap-8">
      <div className="layout-row layout-gap-8 text-sm">
        <span>{label}</span>
        <span>{Math.round(safeValue)}%</span>
      </div>
      <div
        aria-label={label}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={safeValue}
        className="sketch-progress-track"
        role="progressbar"
      >
        <div className={`h-full sketch-progress-${status}`} style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}

export function Squiggle({ className = '' }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="12"
      viewBox="0 0 160 12"
      width="160"
    >
      <path
        d="M2 7c10-8 15 7 25 0s15-7 25 0 15 7 25 0 15-7 25 0 15 7 25 0 15-7 25 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}
