export function ActivityCardArtwork() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 360 96"
      style={{
        color: 'var(--pb-income)',
        display: 'block',
        height: '100%',
        inset: 0,
        pointerEvents: 'none',
        position: 'absolute',
        width: '100%',
      }}
    >
      <circle cx="174" cy="49" r="48" fill="currentColor" opacity="0.04" />
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="174" cy="49" r="34" opacity="0.15" strokeWidth="1.7" />
        <circle cx="174" cy="49" r="28" opacity="0.08" strokeWidth="1.2" />
        <path
          d="M185 35c-2-8-9-12-16-9-8 3-9 11-7 19 2 9-2 17-10 23h34M153 48h24M153 68h35"
          opacity="0.24"
          strokeWidth="2.2"
          transform="translate(174 49) scale(.78) translate(-174 -49)"
        />
        <circle cx="121" cy="62" r="17" opacity="0.11" strokeWidth="1.5" />
        <circle cx="220" cy="31" r="13" opacity="0.1" strokeWidth="1.4" />
        <path d="M105 86c24-8 48-9 70-3M191 79c13-5 25-5 37-1" opacity="0.12" strokeWidth="1.5" />
      </g>
    </svg>
  )
}
