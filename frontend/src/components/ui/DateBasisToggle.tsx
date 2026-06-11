import { Box, Button, HStack, useColorModeValue } from '@chakra-ui/react'
import type { TransactionDateBasis } from '../../utils/transactionDates'

export interface DateBasisToggleProps {
  value: TransactionDateBasis
  onChange: (basis: TransactionDateBasis) => void
}

const OPTIONS: { value: TransactionDateBasis; label: string }[] = [
  { value: 'activity', label: 'Behaviour' },
  { value: 'cash-flow', label: 'Payments' },
]

/**
 * Compact segmented control to switch a view between the two date bases:
 *
 *  - **Behaviour** ("activity") — anchored on purchase dates: what you spent.
 *  - **Payments** ("cash-flow") — anchored on payment dates: what hits your
 *    account, including card bills from last month's purchases.
 */
export default function DateBasisToggle({ value, onChange }: DateBasisToggleProps) {
  const trackBg = useColorModeValue('gray.100', 'whiteAlpha.100')
  const activeBg = useColorModeValue('white', 'rgba(255,255,255,0.12)')
  const activeBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.200')
  const activeShadow = useColorModeValue(
    '0 1px 4px rgba(15,23,42,0.12)',
    '0 1px 4px rgba(0,0,0,0.5)',
  )
  const activeColor = useColorModeValue('gray.900', 'gray.50')
  const inactiveColor = useColorModeValue('gray.500', 'gray.400')

  return (
    <Box bg={trackBg} p="3px" borderRadius="lg" display="inline-flex" flexShrink={0}>
      <HStack spacing={0}>
        {OPTIONS.map((option) => {
          const active = value === option.value
          return (
            <Button
              key={option.value}
              h="30px"
              px={3}
              variant="ghost"
              borderRadius="md"
              fontSize="xs"
              fontWeight={active ? 700 : 500}
              color={active ? activeColor : inactiveColor}
              bg={active ? activeBg : 'transparent'}
              border="1px solid"
              borderColor={active ? activeBorder : 'transparent'}
              boxShadow={active ? activeShadow : 'none'}
              _hover={{ bg: active ? activeBg : 'transparent', color: activeColor }}
              _active={{ transform: 'scale(0.97)' }}
              transition="all 0.18s ease"
              onClick={() => onChange(option.value)}
              aria-pressed={active}
            >
              {option.label}
            </Button>
          )
        })}
      </HStack>
    </Box>
  )
}
