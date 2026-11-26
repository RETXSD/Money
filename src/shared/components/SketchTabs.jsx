export function SketchTabs({ tabs, value, onChange, label = 'Pilihan' }) {
  return (
    <div aria-label={label} className="layout-row layout-gap-8" role="group">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          aria-pressed={value === tab.value}
          className={`sketch-tab ${value === tab.value ? 'sketch-tab-selected' : ''}`}
          onClick={() => onChange(tab.value)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
