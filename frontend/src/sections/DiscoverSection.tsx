import { useCallback, useRef, useState } from 'react'
import {
  Badge,
  Box,
  Grid,
  GridItem,
  HStack,
  VStack,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { Sparkles } from '../components/ui/icons'
import { SectionCard, SectionHeader } from '../components/ui'
import {
  DiscoverCard,
  DiscoverDetailModal,
  type DiscoverCardItem,
  type DiscoverInsightsContext,
  type DiscoverModalId,
} from '../components/discover'
import { useDiscoverCards } from '../hooks/useDiscoverCards'
import { useTransactionInsights } from '../hooks/useTransactionInsights'
import type { Transaction, PeriodType } from '../types'

export interface DiscoverSectionProps {
  transactions: Transaction[]
  selectedPeriod: PeriodType
  income: number
  expense: number
  balance: number
}

function CarouselDots({
  count,
  activeIndex,
}: {
  count: number
  activeIndex: number
}) {
  const activeColor = useColorModeValue('purple.500', 'purple.300')
  const inactiveColor = useColorModeValue('blackAlpha.200', 'whiteAlpha.200')

  if (count <= 1) return null

  return (
    <HStack justify="center" spacing={1.5} pt={1}>
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          w={index === activeIndex ? '18px' : '6px'}
          h="6px"
          borderRadius="full"
          bg={index === activeIndex ? activeColor : inactiveColor}
          transition="background 0.2s ease, width 0.2s ease"
        />
      ))}
    </HStack>
  )
}

export default function DiscoverSection({
  transactions,
  selectedPeriod,
  income,
  expense,
  balance,
}: DiscoverSectionProps) {
  const cards = useDiscoverCards({ transactions, selectedPeriod, income, expense, balance })
  const insights = useTransactionInsights(transactions, selectedPeriod)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [activeModal, setActiveModal] = useState<DiscoverModalId | null>(null)
  const [activeSlide, setActiveSlide] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const countBg = useColorModeValue('purple.50', 'rgba(139,92,246,0.16)')
  const countColor = useColorModeValue('purple.700', 'purple.200')

  const context: DiscoverInsightsContext = {
    totalIncome: income,
    totalExpense: expense,
    netBalance: balance,
    savingsRate: insights.savingsRate,
    mostUsedCategory: insights.mostUsedCategory,
    totalTransactions: insights.totalTransactions,
    averageExpensePerDay: insights.averageExpensePerDay,
    transactions,
  }

  const handleCardClick = useCallback(
    (item: DiscoverCardItem) => {
      setActiveModal(item.modalId)
      onOpen()
    },
    [onOpen],
  )

  const handleModalClose = useCallback(() => {
    onClose()
    setActiveModal(null)
  }, [onClose])

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    const firstCard = el?.firstElementChild as HTMLElement | null
    if (!el || !firstCard || cards.length === 0) return

    const styles = window.getComputedStyle(el)
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0
    const cardWidth = firstCard.getBoundingClientRect().width + gap
    const index = cardWidth > 0 ? Math.round(el.scrollLeft / cardWidth) : 0
    setActiveSlide(Math.min(Math.max(index, 0), cards.length - 1))
  }, [cards.length])

  if (cards.length === 0) return null

  return (
    <>
      <SectionCard staticOnHover>
        <Box p={{ base: 4, sm: 5, md: 6 }}>
          <VStack spacing={{ base: 4, md: 5 }} align="stretch">
            <SectionHeader
              icon={Sparkles}
              title="For you"
              caption="Personalised insights from your activity this period."
              accent="violet"
              rightSlot={
                <Badge
                  px={2.5}
                  py={1}
                  borderRadius="full"
                  bg={countBg}
                  color={countColor}
                  fontSize="2xs"
                  fontWeight={700}
                  textTransform="none"
                  letterSpacing="0"
                >
                  {cards.length} {cards.length === 1 ? 'insight' : 'insights'}
                </Badge>
              }
            />

            <Box display={{ base: 'block', md: 'none' }}>
              <Box
                ref={scrollRef}
                onScroll={handleScroll}
                overflowX="auto"
                overflowY="hidden"
                display="flex"
                gap={3}
                mx={-4}
                px={4}
                pb={1}
                scrollSnapType="x mandatory"
                sx={{
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': { display: 'none' },
                }}
              >
                {cards.map((item) => (
                  <Box key={item.id} flex="0 0 86%" scrollSnapAlign="center">
                    <DiscoverCard
                      item={item}
                      onClick={() => handleCardClick(item)}
                      featured={item.featured}
                      compact
                    />
                  </Box>
                ))}
              </Box>
              <CarouselDots count={cards.length} activeIndex={activeSlide} />
            </Box>

            <Grid
              display={{ base: 'none', md: 'grid' }}
              templateColumns={{
                md: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(3, minmax(0, 1fr))',
              }}
              gap={{ md: 4 }}
              alignItems="stretch"
            >
              {cards.map((item, index) => (
                <GridItem
                  key={item.id}
                  colSpan={item.featured && index === 0 ? { md: 2, lg: 2 } : 1}
                >
                  <DiscoverCard
                    item={item}
                    onClick={() => handleCardClick(item)}
                    featured={item.featured && index === 0}
                    compact={!item.featured}
                  />
                </GridItem>
              ))}
            </Grid>
          </VStack>
        </Box>
      </SectionCard>

      <DiscoverDetailModal
        modalId={activeModal}
        isOpen={isOpen}
        onClose={handleModalClose}
        context={context}
      />
    </>
  )
}
