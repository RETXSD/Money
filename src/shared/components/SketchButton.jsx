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
      className={`sketch-button rounded-sketch-b border-ink text-ink shadow-sketch active:shadow-sketch-pressed min-h-11 border-[2.5px] px-4 py-2 font-bold transition-transform active:translate-x-0.5 active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant]} ${className}`.trim()}
      {...(Element === 'button' ? { type } : {})}
      {...props}
    >
      {children}
    </Element>
  );
}
