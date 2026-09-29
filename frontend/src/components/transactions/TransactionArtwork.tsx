import { useId } from 'react'

interface TransactionArtworkProps {
  showSun?: boolean
  tone: 'income' | 'expense'
}

export default function TransactionArtwork({ showSun = true, tone }: TransactionArtworkProps) {
  const id = useId().replace(/:/g, '')
  const isIncome = tone === 'income'
  const skyId = `${id}-sky`
  const curveId = `${id}-curve`

  return (
    <svg
      aria-hidden="true"
      height="100%"
      preserveAspectRatio="none"
      viewBox="0 0 390 106"
      width="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={skyId} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={isIncome ? '#173D31' : '#6E302E'} />
          <stop offset="0.58" stopColor={isIncome ? '#285847' : '#91463E'} />
          <stop offset="1" stopColor={isIncome ? '#496D55' : '#B66E58'} />
        </linearGradient>
        <linearGradient id={curveId} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={isIncome ? '#D9C896' : '#F3C89E'} stopOpacity={isIncome ? 0.16 : 0.12} />
          <stop offset="1" stopColor={isIncome ? '#F2E6BE' : '#F8DFBE'} stopOpacity={isIncome ? 0.42 : 0.45} />
        </linearGradient>
      </defs>
      <rect fill={`url(#${skyId})`} height="106" width="390" />
      {showSun && (
        <>
          <circle cx={isIncome ? 326 : 330} cy={isIncome ? 18 : 16} fill={isIncome ? '#F1D98E' : '#F2C87F'} opacity={isIncome ? 0.82 : 0.88} r={isIncome ? 25 : 24} />
          <circle cx={isIncome ? 326 : 330} cy={isIncome ? 18 : 16} fill="none" opacity={isIncome ? 0.23 : 0.24} r="35" stroke={isIncome ? '#FFF5D6' : '#FFF0D5'} />
        </>
      )}
      <path
        d={isIncome ? 'M170 106 C220 62 276 62 390 82 L390 106 Z' : 'M150 106 C214 60 286 64 390 81 L390 106 Z'}
        fill={`url(#${curveId})`}
      />
      <path
        d={isIncome ? 'M220 106 C272 74 327 72 390 90 L390 106 Z' : 'M218 106 C274 77 333 76 390 91 L390 106 Z'}
        fill={isIncome ? '#102E27' : '#562825'}
        opacity={isIncome ? 0.48 : 0.5}
      />
      <path
        d={isIncome ? 'M286 106 C318 83 348 81 390 91' : 'M270 106 C310 82 352 82 390 93'}
        fill="none"
        opacity="0.2"
        stroke={isIncome ? '#FFF8E8' : '#FFF4E4'}
        strokeWidth="1"
      />
    </svg>
  )
}
