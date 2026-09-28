export default function IncomeHeroArtwork() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 390 320"
      width="100%"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="incomeWebSky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0" stopColor="#E8E8E2" />
          <stop offset="0.47" stopColor="#F3DCC0" />
          <stop offset="1" stopColor="#EAC9A7" />
        </linearGradient>
        <linearGradient id="incomeWebWater" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0" stopColor="#F2D7B5" />
          <stop offset="0.55" stopColor="#D6D7CC" />
          <stop offset="1" stopColor="#A8B5B0" />
        </linearGradient>
        <linearGradient id="incomeWebGlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0" stopColor="#FFF3D3" stopOpacity="0.92" />
          <stop offset="0.65" stopColor="#FFF3D3" stopOpacity="0.12" />
          <stop offset="1" stopColor="#FFF3D3" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect height="178" width="390" fill="url(#incomeWebSky)" />
      <circle cx="42" cy="123" r="14" fill="#FFF4CA" opacity="0.9" />
      <circle cx="42" cy="123" r="30" fill="#FFF0C8" opacity="0.22" />

      <path d="M0 155c47-7 75-9 112-2 38-25 70-26 108-4 39-28 83-20 112-5 19-20 39-27 58-33v76H0Z" fill="#AAB1A2" opacity="0.72" />
      <path d="M0 166c61-8 98-5 143 1 45-17 75-17 111-2 47-32 91-27 136-21v44H0Z" fill="#7D8D7C" opacity="0.66" />
      <path d="M226 166c45-29 92-27 164-16v42H216Z" fill="#667B68" opacity="0.65" />
      <rect y="174" width="390" height="146" fill="url(#incomeWebWater)" />
      <rect y="158" width="390" height="52" fill="url(#incomeWebGlow)" />

      <g fill="none" strokeLinecap="round">
        <path d="M18 211c70 3 119 1 180-2M3 230c84 4 159 1 238-3M80 251c94 3 179 1 278-4M0 280c95-1 183 4 285-1" stroke="#F7E6CE" strokeWidth="2" opacity="0.63" />
        <path d="M225 218c51 5 101 2 151-4M181 266c76 5 133 3 205-3M41 301c91 3 177 0 263-3" stroke="#859894" strokeWidth="1.6" opacity="0.42" />
      </g>

      <g transform="translate(333 161)" fill="none" stroke="#71805B" strokeLinecap="round">
        <path d="M41 159C29 112 31 63 48 4M29 159C14 107 11 66 17 21M52 159c-2-58 5-102 20-136M18 159C10 126 2 96-10 72" strokeWidth="2.2" />
        <path d="M17 48 2 31M17 69 34 49M12 91-5 73M35 75 54 55M31 106 13 88M55 91 72 69M43 127 63 109" strokeWidth="1.5" />
      </g>
      <path d="M332 287c24 5 39 6 58 3v30h-58Z" fill="#768677" opacity="0.48" />
    </svg>
  )
}
