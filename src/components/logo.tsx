export function Logo({ size = 48, className }: { size?: number; className?: string }) {
  const id = `logo-grad-${size}`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Brand gradient: violet → blue → cyan */}
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id={`${id}-accent`} x1="10" y1="28" x2="38" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="50%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#67e8f9" />
        </linearGradient>
        <linearGradient id={`${id}-steth`} x1="14" y1="14" x2="34" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#e0e7ff" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Rounded square background with gradient */}
      <rect width="48" height="48" rx="14" fill={`url(#${id}-bg)`} />

      {/* Subtle inner glow */}
      <rect width="48" height="48" rx="14" fill="white" opacity="0.06" />

      {/* Stethoscope / M shape */}
      <path
        d="M15 31V21a5 5 0 0 1 5-5h0a5 5 0 0 1 4 2 5 5 0 0 1 4-2h0a5 5 0 0 1 5 5v10"
        stroke={`url(#${id}-steth)`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Heart pulse line */}
      <path
        d="M11 29h5l2-3.5 3 7 3-7 2 3.5h5"
        stroke={`url(#${id}-accent)`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dot accent */}
      <circle cx="37" cy="29" r="1.5" fill="#67e8f9" />
    </svg>
  )
}
