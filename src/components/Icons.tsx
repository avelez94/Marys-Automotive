type P = React.SVGProps<SVGSVGElement>;
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

export const PhoneIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.8.7a2 2 0 0 1 1.7 2z" /></svg>
);
export const TextIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
);
export const ArrowIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const PinIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></svg>
);
export const MenuIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const CloseIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const PlusIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>
);
export const CameraIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} strokeWidth={1.5} {...p}><path d="M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" /><circle cx="12" cy="13" r="4" /></svg>
);
export const ClipboardIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><rect x="5" y="4" width="14" height="17" rx="1.5" /><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3" /></svg>
);
