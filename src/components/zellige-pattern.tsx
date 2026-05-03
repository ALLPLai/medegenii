"use client"

/**
 * ZelligePattern — Moroccan geometric 8-pointed star tiling.
 * Renders as a full-bleed SVG overlay. Use inside a relative container.
 */
export function ZelligePattern({
  opacity = 0.045,
  className = "",
}: {
  opacity?: number
  className?: string
}) {
  // 8-pointed star in a 60×60 tile (center 30,30)
  // outer_r=11, inner_r=4.5
  const star =
    "M30,19 L31.7,25.8 L37.8,22.2 L34.2,28.3 L41,30 L34.2,31.7 L37.8,37.8 L31.7,34.2 L30,41 L28.3,34.2 L22.2,37.8 L25.8,31.7 L19,30 L25.8,28.3 L22.2,22.2 L28.3,25.8 Z"

  // Small diamond at each tile corner (quarter-visible, creates interlocking grid)
  const cornerDiamond = "M0,0 L3,8 L0,16 L-3,8 Z"

  const id = "zellige-pat"

  return (
    <svg
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id={id}
          patternUnits="userSpaceOnUse"
          width="60"
          height="60"
        >
          {/* Central 8-pointed star */}
          <path
            d={star}
            fill="none"
            stroke="#F5A623"
            strokeWidth="0.6"
            opacity="1"
          />
          {/* Corner accent dots — create the lattice feel */}
          <circle cx="0"  cy="0"  r="1.2" fill="#F5A623" opacity="0.5" />
          <circle cx="60" cy="0"  r="1.2" fill="#F5A623" opacity="0.5" />
          <circle cx="0"  cy="60" r="1.2" fill="#F5A623" opacity="0.5" />
          <circle cx="60" cy="60" r="1.2" fill="#F5A623" opacity="0.5" />
          {/* Midpoint cross lines — subtle lattice */}
          <line x1="30" y1="0" x2="30" y2="19" stroke="#F5A623" strokeWidth="0.3" opacity="0.4"/>
          <line x1="30" y1="41" x2="30" y2="60" stroke="#F5A623" strokeWidth="0.3" opacity="0.4"/>
          <line x1="0" y1="30" x2="19" y2="30" stroke="#F5A623" strokeWidth="0.3" opacity="0.4"/>
          <line x1="41" y1="30" x2="60" y2="30" stroke="#F5A623" strokeWidth="0.3" opacity="0.4"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} opacity={opacity} />
    </svg>
  )
}
