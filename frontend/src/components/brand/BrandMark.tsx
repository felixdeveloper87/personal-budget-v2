import { useId, type CSSProperties } from 'react'
import { useColorMode } from '@chakra-ui/react'

interface BrandMarkProps {
  size?: number | string
  variant?: 'mark' | 'wordmark' | 'title'
  colorMode?: 'light' | 'dark'
  className?: string
  style?: CSSProperties
}

/** Display the supplied artwork; the viewBox trims its presentation margins.
 * The compact mark and full lockup use the same original image assets.
 */
export default function BrandMark({
  size = 48,
  variant = 'mark',
  colorMode: requestedMode,
  className,
  style,
}: BrandMarkProps) {
  const { colorMode } = useColorMode()
  const dark = (requestedMode ?? colorMode) === 'dark'
  const wordmark = variant !== 'mark'
  const source = dark ? '/brandingDark.png' : '/branding.png'
  const filterId = `brand-background-${useId().replace(/:/g, '')}`

  return (
    <svg
      className={className}
      viewBox={variant === 'title' ? '0 0 1650 350' : wordmark ? '265 178 1650 350' : '265 178 318 350'}
      width={size}
      height={wordmark ? undefined : size}
      aria-hidden="true"
      focusable="false"
      style={{
        display: 'block',
        flexShrink: 0,
        maxWidth: '100%',
        aspectRatio: wordmark ? '1650 / 350' : '1',
        ...style,
      }}
    >
      <defs>
        {/* Remove the artwork's near-white/near-black matte at render time.
            Unlike blend modes, this also works inside transformed buttons. */}
        <filter id={filterId} colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
          <feColorMatrix type="matrix" values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  ${dark ? '10 10 10 0 -2.8' : '-10 -10 -10 0 29'}`} />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`}>
      {variant === 'title' ? (
        <>
          <svg x="0" y="0" width="318" height="350" viewBox="265 178 318 350">
            <image href={source} width="2172" height="724" />
          </svg>
          <svg x="360" y="82" width="1290" height="185" viewBox="620 246 1295 185">
            <image href={source} width="2172" height="724" />
          </svg>
        </>
      ) : <image href={source} width="2172" height="724" />}
      </g>
    </svg>
  )
}
