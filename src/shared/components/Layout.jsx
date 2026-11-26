import { SketchBadge } from './SketchFeedback.jsx';

const gapClassBySize = new Map([
  [4, 'layout-gap-4'],
  [8, 'layout-gap-8'],
  [12, 'layout-gap-12'],
  [16, 'layout-gap-16'],
  [24, 'layout-gap-24'],
  [32, 'layout-gap-32'],
  [48, 'layout-gap-48'],
  [64, 'layout-gap-64'],
]);

function getGapClass(gap) {
  const className = gapClassBySize.get(gap);
  if (!className) {
    throw new RangeError(`Unsupported layout gap: ${gap}`);
  }
  return className;
}

function createLayoutComponent(baseClass, defaultElement, defaultGap = 16) {
  return function LayoutComponent({
    as: Element = defaultElement,
    children,
    className = '',
    gap = defaultGap,
    ...props
  }) {
    return (
      <Element className={`${baseClass} ${getGapClass(gap)} ${className}`.trim()} {...props}>
        {children}
      </Element>
    );
  };
}

export const PageContainer = createLayoutComponent('page-container', 'div', 32);
export const Section = createLayoutComponent('layout-section', 'section');
export const Stack = createLayoutComponent('layout-stack', 'div');
export const Row = createLayoutComponent('layout-row', 'div');
export const Grid = createLayoutComponent('layout-grid', 'div');

export function PageHeader({
  badge,
  badgeVariant = 'info',
  title,
  description,
  actions,
  className = '',
}) {
  return (
    <header className={`page-header ${className}`.trim()}>
      <Stack className="page-header-copy" gap={4}>
        {badge ? <SketchBadge variant={badgeVariant}>{badge}</SketchBadge> : null}
        <h1 className="page-heading">{title}</h1>
        {description ? <p className="page-description">{description}</p> : null}
      </Stack>
      {actions ? <Row className="page-header-actions" gap={8}>{actions}</Row> : null}
    </header>
  );
}
