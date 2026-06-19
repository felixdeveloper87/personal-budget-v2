import { useMemo } from 'react'
import { useReducedMotion } from 'framer-motion'
import { guilloche } from './guilloche'

interface BalanceSealProps {
  netLabel: string
  currency?: string
  /** Deficit (net < 0) → coral figure; surplus → forest. */
  negative?: boolean
}

export default function BalanceSeal({ netLabel, currency = 'GBP', negative = false }: BalanceSealProps) {
  const reduce = useReducedMotion()

  // Three concentric single-pass rosettes (r divides R ⇒ one clean turn, no muddy
  // overlap). Differing petal counts weave a fine banknote moiré in the annulus
  // between the centre disc (r≈62) and the rim ring (r≈124).
  const ringOuter = useMemo(() => guilloche(102, 3, 17), []) // 34 petals · ~82–116
  const ringMid = useMemo(() => guilloche(90, 3, 15), []) //   30 petals · ~72–102
  const ringInner = useMemo(() => guilloche(78, 3, 12), []) //  26 petals · ~63–87

  const figureColor = negative ? 'var(--pb-coral)' : 'var(--pb-forest-2)'

  return (
    <svg
      viewBox="0 0 320 320"
      width="100%"
      role="img"
      aria-label={`Net balance: ${netLabel}`}
      style={{ display: 'block' }}
    >
      <defs>
        <radialGradient id="pb-disc" cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor="var(--pb-paper-3)" />
          <stop offset="70%" stopColor="var(--pb-surface-2)" />
          <stop offset="100%" stopColor="var(--pb-seal-edge)" />
        </radialGradient>
        <radialGradient id="pb-core" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="var(--pb-paper-3)" />
          <stop offset="100%" stopColor="var(--pb-surface)" />
        </radialGradient>
        <path id="pb-rim" d="M160,160 m-118,0 a118,118 0 1,1 236,0 a118,118 0 1,1 -236,0" />
      </defs>

      {/* Disc background + concentric rims */}
      <circle cx="160" cy="160" r="150" fill="url(#pb-disc)" />
      <circle cx="160" cy="160" r="150" fill="none" stroke="var(--pb-hair-2)" />
      <circle cx="160" cy="160" r="142" fill="none" stroke="var(--pb-forest)" strokeWidth="0.6" opacity="0.35" />
      <circle cx="160" cy="160" r="132" fill="none" stroke="var(--pb-forest)" opacity="0.45" />
      <circle
        cx="160" cy="160" r="125"
        fill="none"
        stroke="var(--pb-gold)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="0.5 7.5"
        opacity="0.5"
      />

      {/* Rim text */}
      <text
        fontFamily="var(--pb-mono)"
        fontSize="10"
        letterSpacing="0.34em"
        fill="var(--pb-forest)"
        opacity="0.5"
        style={{ textTransform: 'uppercase' }}
        aria-hidden="true"
      >
        <textPath href="#pb-rim" startOffset="0">
          PERSONAL BUDGET · CLARITY FOR YOUR MONEY · PERSONAL BUDGET · CLARITY FOR YOUR MONEY ·{' '}
        </textPath>
      </text>

      {/* Guilloché rosette — two counter-rotating layers, thin and faint */}
      <g transform="translate(160 160)" aria-hidden="true">
        <g
          style={{
            transformBox: 'fill-box',
            transformOrigin: 'center',
            animation: reduce ? undefined : 'pb-spin 240s linear infinite',
          }}
        >
          <path d={ringOuter} fill="none" stroke="var(--pb-line)" strokeWidth="0.5" strokeOpacity="0.42" />
          <path d={ringInner} fill="none" stroke="var(--pb-line)" strokeWidth="0.5" strokeOpacity="0.3" />
        </g>
        <g
          style={{
            transformBox: 'fill-box',
            transformOrigin: 'center',
            animation: reduce ? undefined : 'pb-spin-rev 300s linear infinite',
          }}
        >
          <path d={ringMid} fill="none" stroke="var(--pb-gold-2)" strokeWidth="0.5" strokeOpacity="0.4" />
        </g>
      </g>

      {/* Inner disc + net label */}
      <circle cx="160" cy="160" r="63" fill="url(#pb-core)" stroke="var(--pb-hair-2)" strokeWidth="0.8" />
      <circle cx="160" cy="160" r="63" fill="none" stroke="var(--pb-gold)" strokeWidth="0.6" strokeOpacity="0.45" />
      <text
        x="160" y="139"
        textAnchor="middle"
        fontFamily="var(--pb-mono)"
        fontSize="10.5"
        letterSpacing="0.28em"
        fill="var(--pb-ink-faint)"
        style={{ textTransform: 'uppercase' }}
      >
        Net
      </text>
      <text
        x="160" y="176"
        textAnchor="middle"
        fontFamily="var(--pb-serif)"
        fontWeight="500"
        fontSize="31"
        fill={figureColor}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {netLabel}
      </text>
      <text
        x="160" y="194"
        textAnchor="middle"
        fontFamily="var(--pb-mono)"
        fontSize="9.5"
        letterSpacing="0.2em"
        fill="var(--pb-ink-faint)"
      >
        {currency}
      </text>
    </svg>
  )
}
