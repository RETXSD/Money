const variants = {
  primary: 'bg-yellow',
  secondary: 'bg-card',
  danger: 'bg-red',
};

export function SketchButton({
  children,
  as: Element = 'button',
  className = '',
  type = 'button',
  variant = 'primary',
  ...props
}) {
  return (
    <Element
      className={`sketch-button ${variants[variant]} ${className}`.trim()}
      {...(Element === 'button' ? { type } : {})}
      {...props}
    >
      {children}
    </Element>
  );
}
