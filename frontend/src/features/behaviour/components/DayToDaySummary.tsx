import type { ReactNode } from 'react'
import { Box, Text, VStack, useColorModeValue } from '@chakra-ui/react'
import { useI18n } from '../../../i18n'
import ExpenseHeroArtwork from './ExpenseHeroArtwork'

interface DayToDaySummaryProps {
  expense: number
  periodLabel: string
  narrativePeriodLabel: string
  periodNavigator: ReactNode
}

export default function DayToDaySummary({
  expense,
  periodLabel,
  narrativePeriodLabel,
  periodNavigator,
}: DayToDaySummaryProps) {
  const { t, formatCurrency } = useI18n()
  const artworkVeil = useColorModeValue('rgba(251,249,244,0.44)', 'rgba(25,34,32,0.6)')
  return (
    <Box
      position="relative"
      overflow="hidden"
      bg="#E8D5C6"
      border="1px solid var(--pb-summary-line)"
      borderRadius="22px"
      boxShadow="var(--pb-shadow)"
      p="clamp(1.1rem, 2.4vw, 1.5rem)"
    >
      <Box position="absolute" inset={0} pointerEvents="none">
        <ExpenseHeroArtwork />
      </Box>
      <Box position="absolute" inset={0} bg={artworkVeil} pointerEvents="none" />

      <Box position="relative" zIndex={1}>
        <Box mb={4} pb={4} borderBottom="1px solid var(--pb-summary-line)">
          {periodNavigator}
        </Box>

        <VStack align="stretch" spacing={4}>
          <VStack align="stretch" spacing={1}>
            <Text fontFamily="var(--pb-mono)" fontSize="10.5px" letterSpacing="0.2em" textTransform="uppercase" color="var(--pb-summary-ink-faint)">
              {t('behaviour.summary.heading', { period: periodLabel })}
            </Text>
            <Text fontSize="sm" color="var(--pb-summary-ink-soft)">{t('behaviour.summary.subtitle')}</Text>
          </VStack>

          <Text fontFamily="var(--pb-serif)" fontSize="clamp(1.2rem, 2.6vw, 1.55rem)" fontWeight={400} lineHeight={1.25} color="var(--pb-summary-ink)" maxW="48ch">
            {expense > 0 ? (
              <>
                {t('behaviour.summary.spentPrefix')}{' '}
                <Text as="em" color="var(--pb-summary-coral)">{formatCurrency(expense)}</Text>{' '}
                {t('behaviour.summary.spentSuffix', { period: narrativePeriodLabel })}
              </>
            ) : (
              <>{t('behaviour.summary.empty', { period: narrativePeriodLabel })}</>
            )}
          </Text>

          <Text pt={3} borderTop="1px solid var(--pb-summary-line)" fontFamily="var(--pb-mono)" fontSize="9.5px" letterSpacing="0.08em" textTransform="uppercase" color="var(--pb-summary-ink-faint)">
            {t('behaviour.summary.installmentsNote')}
          </Text>
        </VStack>
      </Box>
    </Box>
  )
}
