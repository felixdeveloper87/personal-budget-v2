import { Box, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { useThemeColors } from '../../../hooks/useThemeColors'

export type ExpenseMode = 'single' | 'fixed' | 'installment'

interface ExpenseModeSelectorProps {
  value: ExpenseMode
  onChange: (mode: ExpenseMode) => void
}

const MODES = [
  {
    value: 'single' as const,
    title: 'One-off',
    caption: 'A regular expense',
    accent: '#ef4444',
  },
  {
    value: 'fixed' as const,
    title: 'Fixed monthly',
    caption: 'Rent, bills, subscriptions',
    accent: '#14b8a6',
  },
  {
    value: 'installment' as const,
    title: 'Installments',
    caption: 'Split a purchase',
    accent: '#6366f1',
  },
]

export default function ExpenseModeSelector({
  value,
  onChange,
}: ExpenseModeSelectorProps) {
  const colors = useThemeColors()

  return (
    <Box>
      <Text fontWeight="600" mb={3} color={colors.text.label} fontSize={{ base: 'sm', sm: 'md' }}>
        How should this expense work?
      </Text>

      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3}>
        {MODES.map((mode) => {
          const selected = value === mode.value
          return (
            <Box
              key={mode.value}
              as="button"
              type="button"
              onClick={() => onChange(mode.value)}
              textAlign="left"
              borderRadius="2xl"
              minH={{ base: '72px', sm: '78px' }}
              px={{ base: 3, sm: 3.5 }}
              py={{ base: 2.5, sm: 3 }}
              border="2px solid"
              borderColor={selected ? mode.accent : colors.border}
              bg={selected ? `${mode.accent}14` : colors.inputBg}
              boxShadow={selected ? `0 12px 30px -18px ${mode.accent}` : 'none'}
              transition="transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease"
              _hover={{
                transform: 'translateY(-2px)',
                borderColor: mode.accent,
              }}
              _focusVisible={{
                outline: '2px solid',
                outlineColor: mode.accent,
                outlineOffset: '2px',
              }}
            >
              <VStack align="stretch" spacing={2}>
                <HStack justify="space-between" align="flex-start">
                  <Text color={colors.text.primary} fontWeight={800} fontSize="sm">
                    {mode.title}
                  </Text>
                  <Box
                    w={2.5}
                    h={2.5}
                    mt={1}
                    borderRadius="full"
                    bg={selected ? mode.accent : 'transparent'}
                    border="1.5px solid"
                    borderColor={selected ? mode.accent : colors.border}
                    flexShrink={0}
                  />
                </HStack>
                <Text color={colors.text.secondary} fontSize="xs" lineHeight="short" noOfLines={2}>
                  {mode.caption}
                </Text>
              </VStack>
            </Box>
          )
        })}
      </SimpleGrid>
    </Box>
  )
}
