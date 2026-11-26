const paths = {
  home: (
    <>
      <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
      <path d="M8 21h8" />
    </>
  ),
  receipt: (
    <>
      <path d="M5 3h14v18l-3-2-4 2-4-2-3 2z" />
      <path d="M8 8h8M8 12h6" />
    </>
  ),
  chart: (
    <>
      <path d="M4 19V5M4 19h17" />
      <path d="m7 15 4-4 3 2 5-7" />
      <path d="M17 6h2v2" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20v-1a6 6 0 0 1 12 0v1z" />
      <path d="M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5v1h-3" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="m19 13 2 1-2 3-2-1a7 7 0 0 1-2 1l-.5 2.5h-4L10 17a7 7 0 0 1-2-1l-2 1-2-3 2-1a7 7 0 0 1 0-2l-2-1 2-3 2 1a7 7 0 0 1 2-1l.5-2.5h4L15 7a7 7 0 0 1 2 1l2-1 2 3-2 1a7 7 0 0 1 0 2z" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20v16H6.5A2.5 2.5 0 0 1 4 17.5z" />
      <path d="M4 8h16M15 13h5" />
      <circle cx="15" cy="13" r=".5" />
    </>
  ),
  arrow: (
    <>
      <path d="M4 12h15" />
      <path d="m13 5 7 7-7 7" />
    </>
  ),
};

export function DoodleIcon({ name, className = '', ...props }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
      {...props}
    >
      {paths[name] || paths.wallet}
    </svg>
  );
}
