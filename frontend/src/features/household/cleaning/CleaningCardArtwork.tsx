/** Thin lilac line art (spray bottle + sparkles), anchored to the card's right
    edge and faded towards the copy so it never sits behind the text. */
export function CleaningCardArtwork() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMaxYMid meet"
      viewBox="0 0 200 220"
      style={{
        color: 'var(--nu-brand, #820ad1)',
        display: 'block',
        height: '100%',
        pointerEvents: 'none',
        position: 'absolute',
        right: 0,
        top: 0,
        width: '42%',
        maxWidth: '240px',
        WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 45%)',
        maskImage: 'linear-gradient(90deg, transparent 0%, #000 45%)',
      }}
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* spray bottle */}
        <g opacity="0.2" strokeWidth="1.6">
          <path d="M119 68h35l-3 18c-1 6 1 11 6 15l8 7c5 4 7 10 7 16v46c0 8-6 14-14 14h-48c-8 0-14-6-14-14v-45c0-8 3-14 9-19l8-6c5-4 7-9 6-15Z" />
          <path d="M118 68V57h28l13 7-4 9-15-5" />
          <path d="M126 57v-9h17v9" />
          <path d="M97 133c20 8 46 7 74-3" />
        </g>
        {/* bubbles + sparkles */}
        <g opacity="0.24" strokeWidth="1.4">
          <circle cx="82" cy="76" r="7" />
          <circle cx="166" cy="40" r="4.5" />
          <circle cx="186" cy="78" r="8" />
          <path d="M76 40v12M70 46h12" />
          <path d="m184 16 3 5 5 3-5 3-3 5-3-5-5-3 5-3Z" />
        </g>
      </g>
    </svg>
  )
}
