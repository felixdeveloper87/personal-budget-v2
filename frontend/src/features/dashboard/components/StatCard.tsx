import { HStack, IconButton, Text, VStack } from '@chakra-ui/react'
import { ArrowDownRight, ArrowUpRight, Eye, EyeOff } from 'lucide-react'
import Panel from './Panel'

export const MASK = '••••••'

interface StatCardProps {
  eyebrow: string
  figure: string
  /** Sub-line under the figure, e.g. "from the previous month" or "£7,162 projected". */
  caption: string
  /** Signed delta value used to colour and arrow the trend chip (optional). */
  deltaLabel?: string
  deltaPositive?: boolean
  accent?: 'forest' | 'gold'
  /** When true, the figure and delta are replaced by a privacy mask. */
  masked?: boolean
  /** When provided, renders an eye toggle in the top-right corner. */
  onToggleMask?: () => void
}

export default function StatCard({
  eyebrow,
  figure,
  caption,
  deltaLabel,
  deltaPositive,
  accent = 'forest',
  masked = false,
  onToggleMask,
}: StatCardProps) {
  const figureColor = accent === 'gold' ? 'var(--pb-gold-2)' : 'var(--pb-forest)'
  const deltaColor = deltaPositive ? 'var(--pb-forest-2)' : 'var(--pb-coral)'
  const DeltaIcon = deltaPositive ? ArrowUpRight : ArrowDownRight

  return (
    <Panel h="full">
      <VStack align="stretch" spacing={2}>
        <HStack justify="space-between" align="center">
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="10.5px"
            letterSpacing="0.2em"
            textTransform="uppercase"
            color="var(--pb-ink-faint)"
          >
            {eyebrow}
          </Text>

          {onToggleMask && (
            <IconButton
              aria-label={masked ? 'Show value' : 'Hide value'}
              title={masked ? 'Show value' : 'Hide value'}
              icon={masked ? <Eye size={14} /> : <EyeOff size={14} />}
              onClick={onToggleMask}
              variant="ghost"
              size="xs"
              h="26px"
              w="26px"
              minW="26px"
              borderRadius="999px"
              color="var(--pb-ink-faint)"
              _hover={{ bg: 'var(--pb-surface-3)', color: 'var(--pb-ink-soft)' }}
            />
          )}
        </HStack>

        <HStack align="baseline" spacing={3} flexWrap="wrap">
          <Text
            fontFamily="var(--pb-serif)"
            fontSize="clamp(1.9rem, 4vw, 2.4rem)"
            fontWeight={500}
            color={masked ? 'var(--pb-ink-faint)' : figureColor}
            lineHeight={1.05}
            style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}
          >
            {masked ? MASK : figure}
          </Text>

          {deltaLabel && !masked && (
            <HStack
              spacing={1}
              px={2}
              py="2px"
              borderRadius="999px"
              bg={deltaPositive ? 'var(--pb-tint-green)' : 'var(--pb-tint-coral)'}
              color={deltaColor}
              flexShrink={0}
            >
              <DeltaIcon size={12} />
              <Text
                fontFamily="var(--pb-mono)"
                fontSize="11px"
                fontWeight={500}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {deltaLabel}
              </Text>
            </HStack>
          )}
        </HStack>

        <Text
          fontFamily="var(--pb-serif)"
          fontSize="sm"
          color="var(--pb-ink-soft)"
          lineHeight={1.5}
        >
          {caption}
        </Text>
      </VStack>
    </Panel>
  )
}
