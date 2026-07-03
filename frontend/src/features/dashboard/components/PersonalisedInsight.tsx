import { HStack, Text, VStack } from '@chakra-ui/react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import type { AppPage } from '../../../components/layout/header/navigation.config'
import Panel from './Panel'

export interface PersonalInsightData {
  headline: string
  body: string
  bodyLines?: string[]
  actionLabel?: string
  deltaLabel?: string
  deltaPositive?: boolean
  href?: AppPage | null
}

interface PersonalisedInsightProps {
  insight: PersonalInsightData
  onPageChange?: (page: AppPage) => void
}

const PERCENT_PATTERN = /(\(?\d+(?:\.\d+)?%\)?)/g
const PERCENT_TOKEN_PATTERN = /^\(?\d+(?:\.\d+)?%\)?$/

function percentColor(paragraph: string): string | undefined {
  if (/\b(above|up)\b/i.test(paragraph)) return 'var(--pb-income-2)'
  if (/\bbelow\b/i.test(paragraph)) return 'var(--pb-coral)'
  return undefined
}

function HighlightedParagraph({ text }: { text: string }) {
  const color = percentColor(text)
  const parts = text.split(PERCENT_PATTERN)

  return (
    <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink-soft)" lineHeight={1.6}>
      {parts.map((part, index) =>
        PERCENT_TOKEN_PATTERN.test(part) && color ? (
          <Text
            key={`${index}-${part}`}
            as="span"
            color={color}
            fontFamily="var(--pb-mono)"
            fontWeight={500}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {part}
          </Text>
        ) : (
          part
        ),
      )}
    </Text>
  )
}

export default function PersonalisedInsight({ insight }: PersonalisedInsightProps) {
  const { headline, body, bodyLines, deltaLabel, deltaPositive } = insight
  const DeltaIcon = deltaPositive ? TrendingUp : TrendingDown
  const deltaColor = deltaPositive ? 'var(--pb-income-2)' : 'var(--pb-coral)'
  const paragraphs = bodyLines?.length ? bodyLines : [body]

  return (
    <Panel h="full">
      <VStack align="stretch" spacing={4} h="full">
        <HStack justify="space-between">
          <HStack spacing={2}>
            <Text
              fontFamily="var(--pb-mono)"
              fontSize="10.5px"
              letterSpacing="0.2em"
              textTransform="uppercase"
              color="var(--pb-ink-faint)"
            >
              Personalised insight
            </Text>
          </HStack>

          {deltaLabel && (
            <HStack
              spacing={1}
              px={2}
              py="2px"
              borderRadius="999px"
              bg={deltaPositive ? 'var(--pb-tint-income)' : 'var(--pb-tint-coral)'}
              color={deltaColor}
            >
              <DeltaIcon size={12} />
              <Text fontFamily="var(--pb-mono)" fontSize="11px" fontWeight={500} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {deltaLabel}
              </Text>
            </HStack>
          )}
        </HStack>

        <Text
          fontFamily="var(--pb-serif)"
          fontSize="clamp(1.15rem, 2.4vw, 1.4rem)"
          fontWeight={400}
          color="var(--pb-ink)"
          lineHeight={1.25}
        >
          {headline}
        </Text>

        <VStack align="stretch" spacing={2}>
          {paragraphs.map((paragraph, index) => (
            <HighlightedParagraph key={`${index}-${paragraph}`} text={paragraph} />
          ))}
        </VStack>
      </VStack>
    </Panel>
  )
}
