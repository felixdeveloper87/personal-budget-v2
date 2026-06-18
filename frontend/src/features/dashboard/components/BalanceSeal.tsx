import { useMemo } from 'react'
import { useReducedMotion } from 'framer-motion'
import { guilloche } from './guilloche'

interface BalanceSealProps {
  netLabel: string
  currency?: string
}

export default function BalanceSeal({ netLabel, currency = 'GBP' }: BalanceSealProps) {
  const reduce = useReducedMotion()
  const ring1 = useMemo(() => guilloche(58, 19, 62), [])
  const ring2 = useMemo(() => guilloche(58, 27, 44), [])

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
        <path
          id="pb-rim"
          d="M160,160 m-118,0 a118,118 0 1,1 236,0 a118,118 0 1,1 -236,0"
        />
      </defs>

      {/* Disc background */}
      <circle cx="160" cy="160" r="150" fill="url(#pb-disc)" />
      <circle cx="160" cy="160" r="150" fill="none" stroke="var(--pb-hair-2)" />
      <circle cx="160" cy="160" r="132" fill="none" stroke="var(--pb-forest)" opacity="0.5" />
      <circle
        cx="160" cy="160" r="124"
        fill="none"
        stroke="var(--pb-gold)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="0.4 6.4"
        opacity="0.55"
      />

      {/* Rim text */}
      <text
        fontFamily="var(--pb-mono)"
        fontSize="10.5"
        letterSpacing="0.3em"
        fill="var(--pb-forest)"
        opacity="0.62"
        style={{ textTransform: 'uppercase' }}
        aria-hidden="true"
      >
        <textPath href="#pb-rim" startOffset="0">
          PERSONAL BUDGET · CLARITY FOR YOUR MONEY · PERSONAL BUDGET · CLARITY FOR YOUR MONEY ·{' '}
        </textPath>
      </text>

      {/* Spinning guilloché rosette */}
      <g transform="translate(160 160)" aria-hidden="true">
        <g
          style={{
            transformBox: 'fill-box',
            transformOrigin: 'center',
            animation: reduce ? undefined : 'pb-spin 170s linear infinite',
          }}
        >
          <path d={ring1} fill="none" stroke="var(--pb-line)" strokeWidth="0.6" strokeOpacity="0.5" />
          <path d={ring2} fill="none" stroke="var(--pb-gold-2)" strokeWidth="0.6" strokeOpacity="0.5" />
        </g>
      </g>

      {/* Inner disc + net label */}
      <circle cx="160" cy="160" r="62" fill="var(--pb-surface)" stroke="var(--pb-hair)" />
      <text
        x="160" y="140"
        textAnchor="middle"
        fontFamily="var(--pb-mono)"
        fontSize="11"
        letterSpacing="0.22em"
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
        fontSize="30"
        fill="var(--pb-coral)"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {netLabel}
      </text>
      <text
        x="160" y="193"
        textAnchor="middle"
        fontFamily="var(--pb-mono)"
        fontSize="10"
        letterSpacing="0.18em"
        fill="var(--pb-ink-faint)"
      >
        {currency}
      </text>
    </svg>
  )
}
