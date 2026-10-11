import type { CSSProperties } from 'react'

interface BrandWavesProps {
  className?: string
  style?: CSSProperties
}

/* Organic purple waves + spots for brand-purple surfaces (mobile splash,
   auth sheet). Sliced to the top so it scales with any container height.
   Colours are inline so it renders without page CSS; the class names are
   animation hooks only. */
export default function BrandWaves({ className, style }: BrandWavesProps) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 390 600"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#6e08b3"
        d="M0 0H390V330C350 360 318 300 268 318C214 338 236 420 170 440C110 458 84 400 40 420C20 429 8 446 0 460Z"
      />
      <path
        fill="#5a0791"
        fillOpacity={0.55}
        d="M0 0H300C340 40 300 92 252 104C196 118 182 72 132 96C78 122 128 196 78 236C46 262 18 250 0 262Z"
      />
      <g className="pb-waves__spots" fill="#5a0791">
        <ellipse cx="318" cy="96" rx="30" ry="34" />
        <circle cx="348" cy="176" r="9" />
        <ellipse cx="214" cy="248" rx="22" ry="18" />
        <circle cx="96" cy="330" r="7" />
        <ellipse cx="300" cy="392" rx="14" ry="12" />
        <circle cx="172" cy="34" r="6" />
      </g>
      <g className="pb-waves__bubbles" fill="rgba(255,255,255,0.16)">
        <circle cx="62" cy="150" r="5" />
        <circle cx="262" cy="196" r="4" />
        <circle cx="354" cy="292" r="6" />
      </g>
    </svg>
  )
}
