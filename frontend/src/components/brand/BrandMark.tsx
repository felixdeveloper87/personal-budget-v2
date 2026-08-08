import type { CSSProperties } from 'react'

interface BrandMarkProps {
  size?: number | string
  className?: string
  style?: CSSProperties
  cream?: string
  jade?: string
  gold?: string
}

export default function BrandMark({
  size = 48,
  className,
  style,
  cream = '#f2f4f0',
  jade = '#7fe6b3',
  gold = '#e8c477',
}: BrandMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      focusable="false"
      aria-hidden="true"
      style={style}
    >
      <circle
        className="pbv3-seal__plate"
        cx="24"
        cy="24"
        r="23"
        fill="#06110d"
      />
      <circle
        className="pbv3-seal__rim"
        cx="24"
        cy="24"
        r="22.45"
        stroke={jade}
        strokeOpacity="0.34"
        strokeWidth="0.7"
      />
      <path
        className="pbv3-seal__gold-accent"
        d="M31.3 3.55c6.8 2.2 11.85 7.35 13.5 14"
        stroke={gold}
        strokeLinecap="round"
        strokeWidth="1.15"
      />
      <path
        className="pbv3-seal__gold-accent"
        d="M3.6 30.35c2.2 6.8 7.3 11.85 13.95 13.55"
        stroke={gold}
        strokeLinecap="round"
        strokeWidth="1.15"
      />
      <circle
        className="pbv3-seal__field"
        cx="24"
        cy="24"
        r="17.35"
        fill="#07110d"
        stroke={cream}
        strokeOpacity="0.26"
        strokeWidth="0.72"
      />
      <path
        className="pbv3-seal__letter pbv3-seal__letter--p"
        fill={cream}
        fillOpacity="0.96"
        fillRule="evenodd"
        d="M8.5 35.5v-23h7.2c5.6 0 8.9 2.9 8.9 7.6 0 5-3.4 7.9-8.9 7.9h-2.8v7.5H8.5Zm4.4-11.4h2.5c3.1 0 4.7-1.3 4.7-3.9 0-2.5-1.6-3.8-4.7-3.8h-2.5v7.7Z"
      />
      <path
        className="pbv3-seal__letter pbv3-seal__letter--b"
        fill={jade}
        fillOpacity="0.98"
        fillRule="evenodd"
        d="M24.5 35.5v-23h7.6c5 0 8 2.4 8 6.3 0 2.6-1.4 4.5-3.7 5.4 2.8.7 4.5 2.6 4.5 5.4 0 4.2-3.2 6.9-8.4 6.9h-8Zm4.4-13h2.7c2.7 0 4.1-1.1 4.1-3.1s-1.4-3-4.1-3h-2.7v6.1Zm0 9.1H32c3 0 4.5-1.2 4.5-3.3 0-2.2-1.5-3.3-4.5-3.3h-3.1v6.6Z"
      />
      <circle
        className="pbv3-seal__core"
        cx="38.7"
        cy="38.55"
        r="1.8"
        fill={gold}
        stroke="#07110d"
        strokeWidth="0.65"
      />
    </svg>
  )
}
