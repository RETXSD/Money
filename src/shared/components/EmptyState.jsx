import { DoodleIcon } from './DoodleIcon.jsx';
import { Row, Stack } from './Layout.jsx';
import { SketchCard } from './SketchCard.jsx';

export function EmptyState({ title, description, icon = 'receipt', children }) {
  return (
    <SketchCard className="empty-state-card">
      <div aria-hidden="true" className="doodle-illustration">
        <DoodleIcon name={icon} />
      </div>
      <Stack className="empty-state-copy" gap={8}>
        <h2 className="showcase-title">{title}</h2>
        <p>{description}</p>
      </Stack>
      {children ? <Row className="empty-state-actions" gap={8}>{children}</Row> : null}
    </SketchCard>
  );
}
