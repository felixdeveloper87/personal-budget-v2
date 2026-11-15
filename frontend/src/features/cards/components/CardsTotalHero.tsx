import { Box, Flex, SimpleGrid, Text } from '@chakra-ui/react'
import { useI18n } from '../../../i18n'

interface CardsTotalHeroProps {
  cardCount: number
  used: number
  limit: number
  currentTotal: number
  nextPayment: { amount: number; date: Date } | null
  hideValues: boolean
}

/** Purple-hero summary for the card list — same composition as the accounts TotalHero. */
export default function CardsTotalHero({ cardCount, used, limit, currentTotal, nextPayment, hideValues }: CardsTotalHeroProps) {
  const { t, formatCurrency, formatDate } = useI18n()
  const display = (amount: number) => hideValues ? '••••••' : formatCurrency(amount)
  const hasLimit = limit > 0
  const available = Math.max(limit - used, 0)
  const usage = hasLimit ? Math.min(100, Math.max(0, used / limit * 100)) : 0

  return (
    <Flex
      mt={{ base: 3, md: 4 }}
      direction={{ base: 'column', md: 'row' }}
      align={{ base: 'stretch', md: 'flex-end' }}
      justify="space-between"
      gap={{ base: 4, md: 10 }}
    >
      <Box minW={0} flex={1}>
        <Text fontSize="sm" color="rgba(255,255,255,.78)">
          {t(hasLimit ? 'cards.availableCredit' : 'cards.creditInUse')}
        </Text>
        <Text
          mt={0.5}
          fontSize={{ base: '2rem', md: '2.5rem' }}
          fontWeight={700}
          letterSpacing="-0.025em"
          lineHeight={1.1}
          color="white"
          noOfLines={1}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {display(hasLimit ? available : used)}
        </Text>
        <Text mt={1} fontSize="sm" color="rgba(255,255,255,.72)">
          {hasLimit
            ? t('cards.amountOfLimit', { amount: display(used), limit: display(limit) })
            : t('cards.limitsNotSet')}
        </Text>
        {hasLimit && (
          <Box mt={3} maxW="360px" h="4px" borderRadius="full" bg="rgba(255,255,255,.2)" overflow="hidden">
            <Box h="full" w={hideValues ? '0%' : `${usage}%`} borderRadius="full" bg="white" transition="width .35s ease" />
          </Box>
        )}
      </Box>

      <SimpleGrid
        columns={2}
        minW={{ md: '360px' }}
        borderTop={{ base: '1px solid rgba(255,255,255,.18)', md: 0 }}
        pt={{ base: 3, md: 0 }}
      >
        <HeroLine
          label={t('cards.currentStatement')}
          value={display(currentTotal)}
          note={t(cardCount === 1 ? 'cards.count.one' : 'cards.count.other', { count: cardCount })}
        />
        <HeroLine
          label={t('cards.hero.next')}
          value={nextPayment ? display(nextPayment.amount) : '—'}
          note={nextPayment
            ? formatDate(nextPayment.date, { day: 'numeric', month: 'short' })
            : t('cards.nothingScheduled')}
          bordered
        />
      </SimpleGrid>
    </Flex>
  )
}

function HeroLine({ label, value, note, bordered = false }: { label: string; value: string; note: string; bordered?: boolean }) {
  return (
    <Box minW={0} pl={bordered ? 4 : 0} ml={bordered ? 4 : 0} borderLeft={bordered ? '1px solid rgba(255,255,255,.18)' : 0}>
      <Text fontSize="11px" color="rgba(255,255,255,.7)" noOfLines={1}>{label}</Text>
      <Text mt={1} fontSize={{ base: 'md', md: 'lg' }} fontWeight={650} color="white" noOfLines={1} style={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Text>
      <Text mt={0.5} fontSize="10px" color="rgba(255,255,255,.62)" noOfLines={1}>{note}</Text>
    </Box>
  )
}
