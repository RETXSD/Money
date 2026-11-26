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
      className={`sketch-button rounded-sketch-b border-ink text-ink min-h-11 border-[2.5px] px-4 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant]} ${className}`.trim()}
      {...(Element === 'button' ? { type } : {})}
      {...props}
    >
      {children}
    </Element>
  );
}
