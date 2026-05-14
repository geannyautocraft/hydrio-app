interface BottleIconProps {
  size: 'sm' | 'md' | 'lg';
  fillLevel?: number; // 0–1, just visual flair (no logic)
  className?: string;
}

const DIMENSIONS = {
  sm: { width: 30, height: 48 },
  md: { width: 38, height: 60 },
  lg: { width: 46, height: 72 },
};

export function BottleIcon({ size, fillLevel = 0.75, className = '' }: BottleIconProps) {
  const { width, height } = DIMENSIONS[size];
  // The bottle body occupies y=14..70 in viewBox 50x80. Water fills from the bottom upward.
  const bodyTop = 14;
  const bodyBottom = 72;
  const waterTop = bodyBottom - (bodyBottom - bodyTop) * fillLevel;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 50 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Cap */}
      <rect x="18" y="2" width="14" height="6" rx="2" className="fill-slate-400 dark:fill-slate-500" />
      {/* Neck */}
      <rect x="21" y="8" width="8" height="6" className="fill-slate-300 dark:fill-slate-600" />
      {/* Bottle body (outline + light fill) */}
      <path
        d="M14 18 Q14 14 18 14 L32 14 Q36 14 36 18 L36 70 Q36 76 30 76 L20 76 Q14 76 14 70 Z"
        className="fill-white/30 stroke-blue-300 dark:fill-slate-700/40 dark:stroke-blue-400"
        strokeWidth="1.5"
      />
      {/* Water (clipped to bottle body via the same path used as a mask) */}
      <defs>
        <clipPath id={`bottle-clip-${size}`}>
          <path d="M14 18 Q14 14 18 14 L32 14 Q36 14 36 18 L36 70 Q36 76 30 76 L20 76 Q14 76 14 70 Z" />
        </clipPath>
        <linearGradient id={`water-grad-${size}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#bottle-clip-${size})`}>
        <rect x="14" y={waterTop} width="22" height={bodyBottom - waterTop + 4} fill={`url(#water-grad-${size})`} opacity="0.8" />
        {/* Wave highlight on top of water */}
        <ellipse cx="25" cy={waterTop} rx="11" ry="1.5" fill="white" opacity="0.35" />
      </g>
      {/* Bottle highlight (subtle gloss) */}
      <path d="M17 22 L17 60" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
