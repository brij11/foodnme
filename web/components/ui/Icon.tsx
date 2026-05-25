import type { SVGProps } from "react";

// Inline SVG icon system (TECHNICAL-REQUIREMENTS.md §8 — no emoji in UI surfaces).
// Ported 1:1 from the prototype `ui.jsx` icon set.
export type IconName =
  | "search" | "arrow" | "download" | "shield" | "clipboard" | "file" | "flask"
  | "layers" | "check" | "menu" | "close" | "calendar" | "clock" | "leaf" | "mail"
  | "user" | "linkedin" | "twitter" | "briefcase" | "map-pin" | "star" | "bookmark"
  | "trending" | "settings" | "logout" | "plus" | "eye" | "upload" | "filter"
  | "edit" | "verified" | "trash";

type IconProps = {
  name: IconName;
  size?: number;
  stroke?: number;
  className?: string;
  title?: string;
};

export function Icon({ name, size = 20, stroke = 1.6, className, title }: IconProps) {
  const strokeProps: SVGProps<SVGSVGElement> = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    role: title ? "img" : "presentation",
    "aria-hidden": title ? undefined : true,
    "aria-label": title,
  };
  const fillProps: SVGProps<SVGSVGElement> = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "currentColor",
    className,
    role: title ? "img" : "presentation",
    "aria-hidden": title ? undefined : true,
    "aria-label": title,
  };

  switch (name) {
    case "search": return (<svg {...strokeProps}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
    case "arrow": return (<svg {...strokeProps}><path d="M5 12h14" /><path d="m13 5 7 7-7 7" /></svg>);
    case "download": return (<svg {...strokeProps}><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg>);
    case "shield": return (<svg {...strokeProps}><path d="M12 3 5 6v6c0 4.4 3 8 7 9 4-1 7-4.6 7-9V6l-7-3z" /><path d="m9 12 2 2 4-4" /></svg>);
    case "clipboard": return (<svg {...strokeProps}><rect x="7" y="4" width="10" height="4" rx="1" /><path d="M7 6H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2" /><path d="M9 13h6" /><path d="M9 17h4" /></svg>);
    case "file": return (<svg {...strokeProps}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6" /><path d="M9 17h4" /></svg>);
    case "flask": return (<svg {...strokeProps}><path d="M9 3h6" /><path d="M10 3v6L5 19a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 19l-5-10V3" /><path d="M7 14h10" /></svg>);
    case "layers": return (<svg {...strokeProps}><path d="m12 3 9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" /><path d="M3 18l9 5 9-5" /></svg>);
    case "check": return (<svg {...strokeProps}><path d="M20 6 9 17l-5-5" /></svg>);
    case "menu": return (<svg {...strokeProps}><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></svg>);
    case "close": return (<svg {...strokeProps}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>);
    case "calendar": return (<svg {...strokeProps}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18" /><path d="M8 3v4" /><path d="M16 3v4" /></svg>);
    case "clock": return (<svg {...strokeProps}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
    case "leaf": return (<svg {...strokeProps}><path d="M11 20A7 7 0 0 1 4 13C4 8 8 4 14 4c4 0 6 1 6 1s-1 12-9 15c-2 .8-4 1-4 1z" /><path d="M2 22c5-5 6-8 12-13" /></svg>);
    case "mail": return (<svg {...strokeProps}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>);
    case "user": return (<svg {...strokeProps}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></svg>);
    case "linkedin": return (<svg {...fillProps}><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.59 0 4.27 2.36 4.27 5.44v6.3zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" /></svg>);
    case "twitter": return (<svg {...fillProps}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" /></svg>);
    case "briefcase": return (<svg {...strokeProps}><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M3 13h18" /></svg>);
    case "map-pin": return (<svg {...strokeProps}><path d="M12 21s-7-7-7-12a7 7 0 1 1 14 0c0 5-7 12-7 12z" /><circle cx="12" cy="9" r="3" /></svg>);
    case "star": return (<svg {...fillProps}><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>);
    case "bookmark": return (<svg {...strokeProps}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>);
    case "trending": return (<svg {...strokeProps}><path d="m3 17 6-6 4 4 8-8" /><path d="M17 7h4v4" /></svg>);
    case "settings": return (<svg {...strokeProps}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>);
    case "logout": return (<svg {...strokeProps}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>);
    case "plus": return (<svg {...strokeProps}><path d="M12 5v14" /><path d="M5 12h14" /></svg>);
    case "eye": return (<svg {...strokeProps}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>);
    case "upload": return (<svg {...strokeProps}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5" /><path d="M12 3v12" /></svg>);
    case "filter": return (<svg {...strokeProps}><path d="M3 6h18" /><path d="M7 12h10" /><path d="M10 18h4" /></svg>);
    case "edit": return (<svg {...strokeProps}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>);
    case "verified": return (<svg {...strokeProps}><path d="m9 12 2 2 4-4" /><circle cx="12" cy="12" r="9" /></svg>);
    case "trash": return (<svg {...strokeProps}><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>);
    default: return null;
  }
}
