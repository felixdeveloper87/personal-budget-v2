import { Box, Flex, Text } from '@chakra-ui/react'
import { Fragment, type ReactNode } from 'react'

const BRAND = '#820ad1'
/** Seconds each headline stays on the bar, so a longer list scrolls at the same speed. */
const SECONDS_PER_ITEM = 5

const TONES = {
  /** Dark CNN-style bar with a blinking red dot (the "Live" balances bar). */
  live: { bg: '#1f1f24', ink: 'white', separator: 'rgba(255,255,255,.45)', labelBg: BRAND, labelInk: 'white', shadow: '8px 0 12px -6px rgba(0,0,0,.6)' },
  /** Soft lilac bar for calmer info (the cleaning "Next" turns). */
  soft: { bg: '#f3e8fc', ink: 'var(--pb-ink)', separator: 'rgba(130,10,209,.3)', labelBg: '#e4cdf7', labelInk: BRAND, shadow: '6px 0 10px -6px rgba(130,10,209,.25)' },
} as const

/**
 * Headline bar: a fixed label on the left and the headlines scrolling on a loop.
 * The track holds the headlines twice and slides by half its width, so the loop is seamless.
 */
export function NewsTicker({ label, headlines, ariaLabel, emptyText, tone = 'live', onClick }: {
  label: string
  headlines: ReactNode[]
  ariaLabel: string
  emptyText?: string
  tone?: keyof typeof TONES
  onClick?: () => void
}) {
  const colors = TONES[tone]
  const track = (copy: number) => (
    <Flex align="center" flexShrink={0} aria-hidden={copy > 0 ? true : undefined}>
      {headlines.map((headline, index) => (
        <Fragment key={`${copy}-${index}`}>
          {headline}
          <Box as="span" mx={4} w="6px" h="6px" borderRadius="full" bg={colors.separator} flexShrink={0} />
        </Fragment>
      ))}
    </Flex>
  )

  return (
    <Flex
      {...(onClick ? { as: 'button', type: 'button', onClick } : { role: 'group' })}
      w="full" h="40px" align="stretch" overflow="hidden"
      borderRadius="12px" bg={colors.bg} color={colors.ink} textAlign="left" aria-label={ariaLabel}
      _focusVisible={{ outline: `2px solid ${BRAND}`, outlineOffset: '2px' }}
      sx={{
        '@keyframes newsTicker': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        '@keyframes newsTickerDot': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.25 } },
        '&:hover .news-ticker-track': { animationPlayState: 'paused' },
      }}
    >
      <Flex align="center" gap={1.5} px={3} flexShrink={0} bg={colors.labelBg} position="relative" zIndex={1} boxShadow={colors.shadow}>
        {tone === 'live' && (
          <Box w="7px" h="7px" borderRadius="full" bg="#ff4d4d" sx={{ animation: 'newsTickerDot 1.4s ease-in-out infinite' }} />
        )}
        <Text fontSize="11px" fontWeight={800} letterSpacing=".08em" color={colors.labelInk} textTransform="uppercase">
          {label}
        </Text>
      </Flex>
      <Flex flex={1} minW={0} align="center" overflow="hidden" aria-hidden="true">
        {headlines.length === 0 ? (
          <Text px={4} fontSize="sm" noOfLines={1}>{emptyText}</Text>
        ) : (
          <Flex
            className="news-ticker-track" pl={4} w="max-content"
            sx={{
              animation: `newsTicker ${Math.max(10, headlines.length * SECONDS_PER_ITEM)}s linear infinite`,
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }}
          >
            {track(0)}
            {track(1)}
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}
