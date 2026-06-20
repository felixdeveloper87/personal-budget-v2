import { Box, Grid, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import type { Side } from '../data/types'

const MotionGrid = motion(Grid)

interface SummaryStripProps {
  /** Re-keyed on the active view so figures cross-fade when they re-tick. */
  viewKey: string
  cards: Array<{ label: string; value: string; side: Side }>
}

export default function SummaryStrip({ viewKey, cards }: SummaryStripProps) {
  return (
    <MotionGrid
      key={viewKey}
      initial={{ opacity: 0.35 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      templateColumns={{ base: '1fr 1fr', md: 'repeat(4, 1fr)' }}
      gap="0.7rem"
    >
      {cards.map((card) => (
        <SummaryCard key={card.label} {...card} />
      ))}
    </MotionGrid>
  )
}

function SummaryCard({ label, value, side }: { label: string; value: string; side: Side }) {
  const accent = side === 'expense' ? 'var(--pb-coral)' : 'var(--pb-income)'
  return (
    <Box
      position="relative"
      bg="var(--pb-surface)"
      border="1px solid var(--pb-hair)"
      borderRadius="14px"
      boxShadow="0 1px 2px rgba(15,23,42,.05), 0 10px 28px rgba(15,23,42,.06)"
      pl="1.05rem"
      pr="0.95rem"
      py="0.85rem"
      overflow="hidden"
    >
      <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={accent} />
      <Text
        fontFamily="var(--pb-mono)"
        fontSize="9.5px"
        letterSpacing="0.13em"
        textTransform="uppercase"
        color="var(--pb-ink-faint)"
        mb="0.35rem"
        noOfLines={1}
      >
        {label}
      </Text>
      <Text
        className="num"
        fontSize={{ base: '1.3rem', md: '1.5rem' }}
        fontWeight={500}
        lineHeight="1"
        color="var(--pb-ink)"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </Text>
    </Box>
  )
}
