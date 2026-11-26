import { DoodleIcon } from './DoodleIcon.jsx';
import { SketchCard } from './SketchCard.jsx';

export function EmptyState({ title, description, icon = 'receipt', children }) {
  return (
    <SketchCard className="text-center">
      <div aria-hidden="true" className="doodle-illustration">
        <DoodleIcon name={icon} />
      </div>
      <h2 className="showcase-title">{title}</h2>
      <p className="mx-auto max-w-md">{description}</p>
      {children ? <div className="mt-4 flex justify-center">{children}</div> : null}
    </SketchCard>
  );
}
