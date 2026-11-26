export function SketchCard({ as: Element = 'section', className = '', sticky = false, ...props }) {
  const baseClassName =
    'sketch-card rounded-sketch-a border-[2.5px] border-ink px-5 py-4 shadow-sketch';

  return (
    <Element
      className={`${baseClassName} ${sticky ? 'bg-yellow' : 'bg-card'} ${className}`.trim()}
      {...props}
    />
  );
}
