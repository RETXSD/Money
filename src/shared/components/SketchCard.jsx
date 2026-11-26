import { forwardRef } from 'react';

export const SketchCard = forwardRef(function SketchCard(
  { as: Element = 'section', className = '', sticky = false, ...props },
  ref,
) {
  const baseClassName = 'sketch-card';

  return (
    <Element
      className={`${baseClassName} ${sticky ? 'bg-yellow' : 'bg-card'} ${className}`.trim()}
      ref={ref}
      {...props}
    />
  );
});
