import { useCallback, useRef, useState } from 'react'
import {
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
          transition="all 0.2s ease"
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
  const cards = useDiscoverCards({
    transactions,
    selectedPeriod,
    income,
    expense,
    balance,
  })
  const insights = useTransactionInsights(transactions, selectedPeriod)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [activeModal, setActiveModal] = useState<DiscoverModalId | null>(null)
  const [activeSlide, setActiveSlide] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

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
    if (!el || cards.length === 0) return

    const cardWidth = el.scrollWidth / cards.length
    const index = Math.round(el.scrollLeft / cardWidth)
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
              caption="Personalised tips based on your activity — everything stays in the app."
              accent="violet"
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
                  <Box
                    key={item.id}
                    flex="0 0 86%"
                    scrollSnapAlign="center"
                  >
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
              templateColumns={{ md: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }}
              gap={{ md: 4 }}
            >
              {cards.map((item, index) => (
                <GridItem
                  key={item.id}
                  colSpan={
                    item.featured && index === 0
                      ? { md: 2, lg: 2 }
                      : 1
                  }
                >
                  <DiscoverCard
                    item={item}
                    onClick={() => handleCardClick(item)}
                    featured={item.featured && index === 0}
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
