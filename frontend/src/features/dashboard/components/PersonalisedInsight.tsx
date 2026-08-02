import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { ArrowUpRight, Check, ShieldAlert, Sparkles } from 'lucide-react'
import type { AppPage } from '../../../components/layout/header/navigation.config'
import Panel from './Panel'

export type PersonalInsightTone = 'attention' | 'positive' | 'neutral'

export interface PersonalInsightData {
  tone: PersonalInsightTone
  headline: string
  detail: string
  context?: string
  metricLabel?: string
  metricValue?: string
  actionLabel: string
  href: AppPage | null
}

interface PersonalisedInsightProps {
  insight: PersonalInsightData
  onPageChange?: (page: AppPage) => void
}

const TONE = {
  attention: {
    label: 'Needs attention',
    color: 'var(--pb-coral)',
    tint: 'var(--pb-tint-coral)',
    Icon: ShieldAlert,
  },
  positive: {
    label: 'On track',
    color: 'var(--pb-income-2)',
    tint: 'var(--pb-tint-income)',
    Icon: Check,
  },
  neutral: {
    label: 'Worth a look',
    color: 'var(--pb-gold)',
    tint: 'var(--pb-tint-gold)',
    Icon: Sparkles,
  },
} as const

/**
 * The dashboard has one primary, explainable recommendation rather than a
 * collection of generic percentage comparisons. Every state states the change,
 * the evidence behind it, and the next useful place to go.
 */
export default function PersonalisedInsight({ insight, onPageChange }: PersonalisedInsightProps) {
  const tone = TONE[insight.tone]
  const Icon = tone.Icon
  const actionable = !!insight.href && !!onPageChange

  return (
    <Panel h="full">
      <HStack align={{ base: 'stretch', md: 'center' }} spacing={{ base: 5, md: 7 }} flexDir={{ base: 'column', md: 'row' }}>
        <Box
          w={12}
          h={12}
          borderRadius="16px"
          bg={tone.tint}
          border="1px solid var(--pb-hair)"
          color={tone.color}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <Icon size={21} strokeWidth={1.7} />
        </Box>

        <VStack align="stretch" spacing={2} flex={1} minW={0}>
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="10.5px"
            letterSpacing="0.2em"
            textTransform="uppercase"
            color={tone.color}
          >
            Focus · {tone.label}
          </Text>
          <Text
            fontFamily="var(--pb-serif)"
            fontSize={{ base: 'xl', md: '2xl' }}
            fontWeight={500}
            color="var(--pb-ink)"
            lineHeight={1.18}
          >
            {insight.headline}
          </Text>
          <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink-soft)" lineHeight={1.55}>
            {insight.detail}
          </Text>
          {insight.context && (
            <Text fontFamily="var(--pb-serif)" fontSize="xs" color="var(--pb-ink-faint)" lineHeight={1.5}>
              {insight.context}
            </Text>
          )}
        </VStack>

        <VStack align={{ base: 'stretch', md: 'flex-end' }} justify="space-between" spacing={4} flexShrink={0} minW={{ md: '172px' }}>
          {insight.metricValue && (
            <VStack align={{ base: 'flex-start', md: 'flex-end' }} spacing={0.5}>
              {insight.metricLabel && (
                <Text fontFamily="var(--pb-mono)" fontSize="9.5px" letterSpacing="0.14em" textTransform="uppercase" color="var(--pb-ink-faint)">
                  {insight.metricLabel}
                </Text>
              )}
              <Text fontFamily="var(--pb-mono)" fontSize="lg" color={tone.color} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {insight.metricValue}
              </Text>
            </VStack>
          )}
          <Box
            as={actionable ? 'button' : 'div'}
            onClick={actionable ? () => onPageChange?.(insight.href as AppPage) : undefined}
            display="inline-flex"
            alignItems="center"
            gap={1.5}
            color={actionable ? tone.color : 'var(--pb-ink-faint)'}
            fontFamily="var(--pb-mono)"
            fontSize="11px"
            letterSpacing="0.08em"
            textTransform="uppercase"
            cursor={actionable ? 'pointer' : 'default'}
            _hover={actionable ? { textDecoration: 'underline' } : undefined}
            _focusVisible={actionable ? { outline: '2px solid', outlineColor: tone.color, outlineOffset: '4px', borderRadius: '3px' } : undefined}
          >
            {insight.actionLabel}
            {actionable && <ArrowUpRight size={14} />}
          </Box>
        </VStack>
      </HStack>
    </Panel>
  )
}
