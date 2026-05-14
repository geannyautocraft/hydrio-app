export type MascotMood = 'happy' | 'excited' | 'worried' | 'thoughtful' | 'sleepy';

interface MascotProps {
  mood: MascotMood;
  size?: number;
  className?: string;
}

function Face({ mood }: { mood: MascotMood }) {
  const eyeFill = '#0F172A';

  // Happy: big smile, normal eyes with shine
  if (mood === 'happy') {
    return (
      <g>
        {/* Eyes */}
        <circle cx="38" cy="80" r="4.5" fill={eyeFill} />
        <circle cx="62" cy="80" r="4.5" fill={eyeFill} />
        <circle cx="36.5" cy="78" r="1.5" fill="white" />
        <circle cx="60.5" cy="78" r="1.5" fill="white" />
        {/* Big smile */}
        <path d="M38 95 Q50 106 62 95" stroke={eyeFill} strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    );
  }

  // Excited: huge sparkling eyes, open mouth, sparkles around
  if (mood === 'excited') {
    return (
      <g>
        {/* Sparkles around the face */}
        <path d="M22 60 L24 65 L29 67 L24 69 L22 74 L20 69 L15 67 L20 65 Z" fill="#FCD34D" opacity="0.85" />
        <path d="M78 55 L79 58 L82 59 L79 60 L78 63 L77 60 L74 59 L77 58 Z" fill="#FCD34D" opacity="0.85" />
        {/* Star-shaped eyes */}
        <circle cx="38" cy="80" r="5" fill={eyeFill} />
        <circle cx="62" cy="80" r="5" fill={eyeFill} />
        <circle cx="36" cy="78" r="2" fill="white" />
        <circle cx="60" cy="78" r="2" fill="white" />
        <circle cx="40" cy="82" r="1" fill="white" />
        <circle cx="64" cy="82" r="1" fill="white" />
        {/* Open smiling mouth */}
        <path d="M40 93 Q50 108 60 93 Z" fill={eyeFill} />
        <ellipse cx="50" cy="102" rx="4" ry="2.5" fill="#F472B6" />
      </g>
    );
  }

  // Worried: clear droopy/sad eyes, eyebrows down, sweat drop
  if (mood === 'worried') {
    return (
      <g>
        {/* Eyebrows pointing down-inward (sad/concerned) */}
        <path d="M30 70 L44 76" stroke={eyeFill} strokeWidth="3" strokeLinecap="round" />
        <path d="M70 70 L56 76" stroke={eyeFill} strokeWidth="3" strokeLinecap="round" />
        {/* Smaller worried eyes */}
        <circle cx="38" cy="83" r="3.5" fill={eyeFill} />
        <circle cx="62" cy="83" r="3.5" fill={eyeFill} />
        <circle cx="37" cy="82" r="1" fill="white" />
        <circle cx="61" cy="82" r="1" fill="white" />
        {/* Frown mouth */}
        <path d="M40 102 Q50 94 60 102" stroke={eyeFill} strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Sweat drop */}
        <path d="M78 50 Q78 52 76 54 Q74 56 74 58 Q74 60 76 60 Q78 60 78 58 Q78 56 80 54 Q82 52 82 50 Q82 48 80 48 Q78 48 78 50 Z" fill="#7DD3FC" opacity="0.85" />
      </g>
    );
  }

  // Thoughtful: one eye half-closed (winking), small neutral mouth, "hmm" feel
  if (mood === 'thoughtful') {
    return (
      <g>
        {/* Left eye: open with raised brow */}
        <path d="M32 72 L44 70" stroke={eyeFill} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="38" cy="81" r="4" fill={eyeFill} />
        <circle cx="37" cy="79" r="1.3" fill="white" />
        {/* Right eye: closed (squint/thinking) */}
        <path d="M55 81 Q62 75 69 81" stroke={eyeFill} strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Pursed mouth (slightly off-center for character) */}
        <ellipse cx="48" cy="97" rx="5" ry="2" fill={eyeFill} />
        {/* Question mark floating */}
        <text x="76" y="40" fontSize="14" fontWeight="bold" fill="#A78BFA">?</text>
      </g>
    );
  }

  // Sleepy: tightly closed eyes with eyelashes, tiny mouth, Z's floating
  return (
    <g>
      {/* Closed eyes (downward arcs like ‿‿) */}
      <path d="M32 80 Q38 86 44 80" stroke={eyeFill} strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M56 80 Q62 86 68 80" stroke={eyeFill} strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Tiny mouth */}
      <ellipse cx="50" cy="98" rx="3" ry="1.5" fill={eyeFill} />
      {/* Floating Z's */}
      <text x="68" y="48" fontSize="12" fontWeight="bold" fill="#94A3B8">z</text>
      <text x="78" y="38" fontSize="9" fontWeight="bold" fill="#94A3B8">z</text>
    </g>
  );
}

export function Mascot({ mood, size = 80, className = '' }: MascotProps) {
  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`mascot-body-${mood}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#BAE6FD" />
          <stop offset="55%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>

      {/* Droplet body */}
      <path
        d="M50 6 C35 26 20 48 18 76 C18 100 32 115 50 115 C68 115 82 100 82 76 C80 48 65 26 50 6 Z"
        fill={`url(#mascot-body-${mood})`}
      />

      {/* Glossy highlights */}
      <ellipse cx="35" cy="50" rx="5" ry="12" fill="white" opacity="0.55" />
      <ellipse cx="40" cy="30" rx="2.5" ry="5" fill="white" opacity="0.7" />

      {/* Cheeks */}
      <ellipse cx="32" cy="92" rx="4" ry="3" fill="#FCA5A5" opacity="0.55" />
      <ellipse cx="68" cy="92" rx="4" ry="3" fill="#FCA5A5" opacity="0.55" />

      {/* Face */}
      <Face mood={mood} />
    </svg>
  );
}
