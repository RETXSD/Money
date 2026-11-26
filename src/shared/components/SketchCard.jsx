import { forwardRef } from 'react';

export const SketchCard = forwardRef(function SketchCard(
  { as: Element = 'section', className = '', sticky = false, ...props },
  ref,
) {
  const baseClassName =
    'sketch-card rounded-sketch-a border-[2.5px] border-ink px-5 py-4 shadow-sketch';

  return (
    <Element
      className={`${baseClassName} ${sticky ? 'bg-yellow' : 'bg-card'} ${className}`.trim()}
      ref={ref}
      {...props}
    />
  );
});
