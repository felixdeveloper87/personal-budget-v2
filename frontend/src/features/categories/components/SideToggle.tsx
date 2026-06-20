import { Box, HStack, Icon } from '@chakra-ui/react'
import { ArrowDownRight, ArrowUpRight } from '../../../components/ui/icons'
import type { Side } from '../data/types'

const OPTIONS: Array<{ value: Side; label: string; icon: typeof ArrowDownRight }> = [
  { value: 'expense', label: 'Expenses', icon: ArrowDownRight },
  { value: 'income', label: 'Income', icon: ArrowUpRight },
]

interface SideToggleProps {
  value: Side
  onChange: (s: Side) => void
}

/** Segmented control (Expenses / Income) — same chrome as the period Segmented, plus icons. */
export default function SideToggle({ value, onChange }: SideToggleProps) {
  return (
    <HStack
      spacing={0}
      bg="rgba(28,58,92,0.06)"
      borderRadius="999px"
      p="3px"
      border="1px solid var(--pb-hair)"
      role="tablist"
      aria-label="Expense or income"
      display="inline-flex"
    >
      {OPTIONS.map((opt) => {
        const isActive = value === opt.value
        return (
          <Box
            key={opt.value}
            as="button"
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.value)}
            display="inline-flex"
            alignItems="center"
            gap="0.32rem"
            px="0.9rem"
            py="0.42rem"
            borderRadius="999px"
            bg={isActive ? 'var(--pb-surface)' : 'transparent'}
            boxShadow={isActive ? '0 1px 2px rgba(15,23,42,.12), 0 2px 8px rgba(15,23,42,.08)' : 'none'}
            color={isActive ? 'var(--pb-ink)' : 'var(--pb-ink-soft)'}
            fontWeight={isActive ? 500 : 400}
            fontSize="0.92rem"
            whiteSpace="nowrap"
            transition="all 0.18s ease"
            _hover={{ color: 'var(--pb-ink)' }}
          >
            <Icon as={opt.icon} boxSize="1.05em" weight={isActive ? 'duotone' : 'regular'} />
            {opt.label}
          </Box>
        )
      })}
    </HStack>
  )
}
