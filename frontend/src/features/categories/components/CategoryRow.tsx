import { Box, Collapse, Flex, HStack, Icon, Text } from '@chakra-ui/react'
import { ChevronDown, List } from '../../../components/ui/icons'
import { gbp } from '../data/format'
import type { ComputedCategory, Side } from '../data/types'
import CategoryTxnRow from './CategoryTxnRow'

/** How many sample transactions to render before collapsing into "+N more". */
const DISPLAY_LIMIT = 5

interface CategoryRowProps {
  cat: ComputedCategory
  side: Side
  isOpen: boolean
  isHot: boolean
  onToggle: () => void
  onHover: (id: string | null) => void
}

export default function CategoryRow({
  cat,
  side,
  isOpen,
  isHot,
  onToggle,
  onHover,
}: CategoryRowProps) {
  const sign = side === 'expense' ? '−' : '+'
  const amtColor = side === 'expense' ? 'var(--pb-coral)' : 'var(--pb-income)'

  const shown = cat.sample.slice(0, DISPLAY_LIMIT)
  const more = Math.max(0, cat.shownCount - shown.length)

  return (
    <Box
      id={`cat-row-${cat.id}`}
      border="1px solid"
      borderColor={isHot || isOpen ? 'var(--pb-hair-2)' : 'var(--pb-hair)'}
      borderRadius="14px"
      bg="var(--pb-surface)"
      overflow="hidden"
      boxShadow={isHot || isOpen ? '0 1px 2px rgba(15,23,42,.05), 0 10px 28px rgba(15,23,42,.07)' : 'none'}
      transition="border-color 0.18s, box-shadow 0.18s"
      onMouseEnter={() => onHover(cat.id)}
      onMouseLeave={() => onHover(null)}
    >
      <Box
        as="button"
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        position="relative"
        w="full"
        display="grid"
        gridTemplateColumns="auto 1fr auto auto"
        alignItems="center"
        gap={3}
        textAlign="left"
        pt="0.8rem"
        px="0.9rem"
        pb="1.05rem"
      >
        {/* Colour dot */}
        <Box
          w="11px"
          h="11px"
          borderRadius="50%"
          flexShrink={0}
          bg={cat.color}
          boxShadow="0 0 0 3px var(--pb-surface)"
        />

        {/* Name + count */}
        <Box minW={0}>
          <Text fontSize="1.05rem" fontWeight={500} lineHeight="1.2" color="var(--pb-ink)" noOfLines={1}>
            {cat.name}
          </Text>
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="9.5px"
            letterSpacing="0.06em"
            textTransform="uppercase"
            color="var(--pb-ink-faint)"
            mt="0.14rem"
          >
            {cat.shownCount} transaction{cat.shownCount !== 1 ? 's' : ''}
          </Text>
        </Box>

        {/* Amount + pct pill */}
        <HStack spacing="0.55rem" align="baseline" flexShrink={0}>
          <Text
            fontSize="1.08rem"
            fontWeight={500}
            color={amtColor}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {sign}
            {gbp(cat.amount, 2)}
          </Text>
          <Text
            className="num"
            fontFamily="var(--pb-mono)"
            fontSize="10px"
            fontWeight={500}
            color="var(--pb-ink-soft)"
            bg="var(--pb-surface-2)"
            border="1px solid var(--pb-hair)"
            borderRadius="999px"
            px="0.45rem"
            py="0.2rem"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {cat.pct.toFixed(1)}%
          </Text>
        </HStack>

        {/* Chevron */}
        <Icon
          as={ChevronDown}
          boxSize="18px"
          color="var(--pb-ink-faint)"
          transition="transform 0.25s"
          transform={isOpen ? 'rotate(180deg)' : undefined}
        />

        {/* Share bar */}
        <Box position="absolute" left="0.9rem" right="0.9rem" bottom="0.6rem" h="3px" borderRadius="3px" bg="var(--pb-hair)" overflow="hidden">
          <Box
            h="100%"
            borderRadius="3px"
            bg={cat.color}
            w={`${cat.pct}%`}
            transition="width 0.5s cubic-bezier(.2,.7,.2,1)"
          />
        </Box>
      </Box>

      {/* Expand */}
      <Collapse in={isOpen} animateOpacity>
        <Box px="0.9rem" pt="0.3rem" pb="0.85rem" borderTop="1px solid var(--pb-hair)" bg="var(--pb-surface-2)">
          {shown.map((txn) => (
            <CategoryTxnRow key={txn.id} txn={txn} icon={cat.icon} color={cat.color} side={side} />
          ))}
          {more > 0 && (
            <Flex
              align="center"
              gap="0.35rem"
              pt="0.6rem"
              pb="0.15rem"
              fontFamily="var(--pb-mono)"
              fontSize="9.5px"
              letterSpacing="0.06em"
              textTransform="uppercase"
              color="var(--pb-income)"
            >
              <Icon as={List} boxSize="13px" />
              <span>+{more} more in this category</span>
            </Flex>
          )}
        </Box>
      </Collapse>
    </Box>
  )
}
