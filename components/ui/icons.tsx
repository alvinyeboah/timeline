interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

const base = (strokeWidth = 1.5) => ({
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

// ── Goal type icons ────────────────────────────────────────────────────────────

export function HomeIcon({ size = 20, className = '', strokeWidth = 1.5 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base(strokeWidth)}>
      <path d="M3 12L12 3l9 9" />
      <path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
    </svg>
  );
}

export function BriefcaseIcon({ size = 20, className = '', strokeWidth = 1.5 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base(strokeWidth)}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="12" />
      <path d="M2 13h20" />
    </svg>
  );
}

export function BookIcon({ size = 20, className = '', strokeWidth = 1.5 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base(strokeWidth)}>
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
    </svg>
  );
}

export function PlaneIcon({ size = 20, className = '', strokeWidth = 1.5 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base(strokeWidth)}>
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22l-4-9-9-4 20-7z" />
    </svg>
  );
}

export function SunriseIcon({ size = 20, className = '', strokeWidth = 1.5 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base(strokeWidth)}>
      <path d="M17 18a5 5 0 00-10 0" />
      <line x1="12" y1="2" x2="12" y2="9" />
      <line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
      <line x1="2" y1="18" x2="4" y2="18" />
      <line x1="20" y1="18" x2="22" y2="18" />
      <line x1="19.78" y1="10.22" x2="18.36" y2="11.64" />
      <line x1="2" y1="22" x2="22" y2="22" />
    </svg>
  );
}

export function DiamondIcon({ size = 20, className = '', strokeWidth = 1.5 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base(strokeWidth)}>
      <path d="M6 3h12l4 6-10 13L2 9z" />
      <path d="M2 9h20" />
      <path d="M12 3l4 6-4 13-4-13z" />
    </svg>
  );
}

// ── Trend / Growth ─────────────────────────────────────────────────────────────

export function TrendUpIcon({ size = 20, className = '', strokeWidth = 1.5 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base(strokeWidth)}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

// ── Layout / Overview ──────────────────────────────────────────────────────────

export function LayoutIcon({ size = 20, className = '', strokeWidth = 1.5 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base(strokeWidth)}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  );
}

// ── Compass / Explore ──────────────────────────────────────────────────────────

export function CompassIcon({ size = 20, className = '', strokeWidth = 1.5 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base(strokeWidth)}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

// ── People / Advisor ───────────────────────────────────────────────────────────

export function UsersIcon({ size = 20, className = '', strokeWidth = 1.5 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base(strokeWidth)}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

// ── Edit / Add ─────────────────────────────────────────────────────────────────

export function EditIcon({ size = 20, className = '', strokeWidth = 1.5 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base(strokeWidth)}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

// ── Move / Drag ────────────────────────────────────────────────────────────────

export function MoveIcon({ size = 20, className = '', strokeWidth = 1.5 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base(strokeWidth)}>
      <polyline points="5 9 2 12 5 15" />
      <polyline points="9 5 12 2 15 5" />
      <polyline points="15 19 12 22 9 19" />
      <polyline points="19 9 22 12 19 15" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="12" y1="2" x2="12" y2="22" />
    </svg>
  );
}

// ── Sliders / Settings ─────────────────────────────────────────────────────────

export function SlidersIcon({ size = 20, className = '', strokeWidth = 1.5 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base(strokeWidth)}>
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  );
}

// ── Close / X ─────────────────────────────────────────────────────────────────

export function XIcon({ size = 16, className = '', strokeWidth = 1.75 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base(strokeWidth)}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ── Arrow left ────────────────────────────────────────────────────────────────

export function ArrowLeftIcon({ size = 16, className = '', strokeWidth = 1.75 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base(strokeWidth)}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

// ── Plus ──────────────────────────────────────────────────────────────────────

export function PlusIcon({ size = 16, className = '', strokeWidth = 2 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base(strokeWidth)}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// ── Timeline strip icon ───────────────────────────────────────────────────────

export function TimelineIcon({ size = 20, className = '', strokeWidth = 1.5 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base(strokeWidth)}>
      <line x1="3" y1="12" x2="21" y2="12" />
      <circle cx="6" cy="12" r="2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="2" fill="currentColor" stroke="none" />
      <line x1="6" y1="7" x2="6" y2="10" />
      <line x1="12" y1="5" x2="12" y2="10" />
      <line x1="18" y1="8" x2="18" y2="10" />
    </svg>
  );
}

// ── Convenience map for goal types ────────────────────────────────────────────

export const GOAL_ICONS = {
  real_estate: HomeIcon,
  career: BriefcaseIcon,
  education: BookIcon,
  travel: PlaneIcon,
  retirement: SunriseIcon,
  custom: DiamondIcon,
} as const;
