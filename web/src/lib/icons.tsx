import type { ReactNode } from "react";

const paths: Record<string, ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  calendar: <><rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 6.2a3 3 0 0 1 0 5.6M20.5 19a5 5 0 0 0-3.5-4.8" /></>,
  rotate: <><path d="M20 12a8 8 0 1 1-2.3-5.6" /><path d="M20 3.5V8h-4.5" /></>,
  box: <><path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5v-9Z" /><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" /></>,
  doc: <><path d="M6 2.5h8l5 5v14H6z" /><path d="M14 2.5v5h5M9 13h6M9 17h6M9 9h2" /></>,
  list: <><path d="M8 6h12M8 12h12M8 18h12" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  chevR: <path d="m9 5 7 7-7 7" />,
  chevL: <path d="m15 5-7 7 7 7" />,
  chevD: <path d="m6 9 6 6 6-6" />,
  check: <path d="m5 12 5 5 9-10" />,
  pin: <><path d="M12 21s-6.5-5.5-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.5 12 21 12 21Z" /><circle cx="12" cy="10.5" r="2.3" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1.5-1.5" /></>,
  bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />,
  alert: <><path d="M12 3 2 20h20L12 3Z" /><path d="M12 9v5M12 17.5v.5" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-3.5-3.5" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2l-.3-2.5H9.7l-.3 2.5a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2l.3 2.5h4.6l.3-2.5a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z" /></>,
  download: <><path d="M12 3v12M7 10l5 5 5-5" /><path d="M4 20h16" /></>,
  bell: <><path d="M18 8.5a6 6 0 0 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14.5 18 8.5Z" /><path d="M10 20a2 2 0 0 0 4 0" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" /></>,
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z" />,
  external: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>,
  sheet: <><rect x="3.5" y="3.5" width="17" height="17" rx="2" /><path d="M3.5 9h17M3.5 14.5h17M9 9v11.5M15 9v11.5" /></>,
  slides: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M12 16v4M8 20h8" /></>,
  cart: <><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /><path d="M2.5 3.5h2l2.2 11a1.5 1.5 0 0 0 1.5 1.2h8.8a1.5 1.5 0 0 0 1.5-1.2l1.3-6.8H6" /></>,
  trophy: <><path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" /><path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3M9 15h6l1 5H8l1-5Z" /></>,
  play: <path d="M7 4.5v15l12-7.5-12-7.5Z" />,
  pause: <><rect x="6" y="4.5" width="4" height="15" rx="1" /><rect x="14" y="4.5" width="4" height="15" rx="1" /></>,
  folder: <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4l2 2.5h7A1.5 1.5 0 0 1 19 9v8.5A1.5 1.5 0 0 1 17.5 19h-13A1.5 1.5 0 0 1 3 17.5v-11Z" />,
  edit: <><path d="M4 20h4L18.5 9.5a2 2 0 0 0-3-3L5 17v3Z" /><path d="M13.5 6.5l3 3" /></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M4 16V5a1 1 0 0 1 1-1h11" /></>,
  badge: <><path d="M12 2.5l7 3.2v5.1c0 4.3-2.9 7.5-7 8.7-4.1-1.2-7-4.4-7-8.7V5.7l7-3.2Z" /><path d="M9 12l2 2 4-4.2" /></>,
};

export type IconName = keyof typeof paths;

export function Icon({
  name,
  className = "w-4 h-4",
  stroke = 1.7,
  style,
}: {
  name: IconName;
  className?: string;
  stroke?: number;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
