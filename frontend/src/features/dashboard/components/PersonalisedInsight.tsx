import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { Sparkles, TrendingDown, TrendingUp } from 'lucide-react'
import type { AppPage } from '../../../components/layout/header/navigation.config'
import Panel from './Panel'

export interface PersonalInsightData {
  headline: string
  body: string
  actionLabel?: string
  deltaLabel?: string
  deltaPositive?: boolean
  href?: AppPage | null
}

interface PersonalisedInsightProps {
  insight: PersonalInsightData
  onPageChange?: (page: AppPage) => void
}

export default function PersonalisedInsight({ insight, onPageChange }: PersonalisedInsightProps) {
  const { headline, body, actionLabel, deltaLabel, deltaPositive, href } = insight
  const DeltaIcon = deltaPositive ? TrendingUp : TrendingDown
  const deltaColor = deltaPositive ? 'var(--pb-forest-2)' : 'var(--pb-coral)'

  return (
    <Panel h="full">
      <VStack align="stretch" spacing={4} h="full">
        <HStack justify="space-between">
          <HStack spacing={2}>
            <Box
              w={7}
              h={7}
              borderRadius="10px"
              bg="var(--pb-tint-gold)"
              border="1px solid var(--pb-hair)"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Sparkles size={14} color="var(--pb-gold)" />
            </Box>
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
              bg={deltaPositive ? 'var(--pb-tint-green)' : 'var(--pb-tint-coral)'}
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

        <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink-soft)" lineHeight={1.6}>
          {body}
        </Text>

        {actionLabel && (
          <Button
            alignSelf="flex-start"
            mt="auto"
            h="34px"
            px={4}
            borderRadius="999px"
            bg="var(--pb-forest)"
            color="var(--pb-paper-3)"
            fontFamily="var(--pb-mono)"
            fontSize="11px"
            fontWeight={500}
            letterSpacing="0.06em"
            textTransform="uppercase"
            _hover={{ bg: 'var(--pb-forest-2)' }}
            onClick={href ? () => onPageChange?.(href) : undefined}
          >
            {actionLabel}
          </Button>
        )}
      </VStack>
    </Panel>
  )
}
