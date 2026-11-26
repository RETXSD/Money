export function SketchTabs({ tabs, value, onChange, label = 'Pilihan' }) {
  return (
    <div aria-label={label} className="flex flex-wrap gap-2" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          aria-selected={value === tab.value}
          className={`rounded-sketch-c border-ink text-ink min-h-11 border-[2.5px] px-4 py-2 font-bold ${value === tab.value ? 'bg-blue shadow-sketch' : 'bg-card'}`}
          onClick={() => onChange(tab.value)}
          role="tab"
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
