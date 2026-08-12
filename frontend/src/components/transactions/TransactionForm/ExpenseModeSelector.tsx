import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { useI18n } from '../../../i18n'

export type ExpenseMode = 'single' | 'fixed' | 'installment'

interface ExpenseModeSelectorProps {
  value: ExpenseMode
  onChange: (mode: ExpenseMode) => void
}

const MODES = [
  {
    value: 'single' as const,
    titleKey: 'form.oneOff',
    captionKey: 'form.regularExpense',
    accent: '#ef4444',
  },
  {
    value: 'fixed' as const,
    titleKey: 'form.fixedMonthly',
    captionKey: 'form.fixedExpenseCaption',
    accent: '#14b8a6',
  },
  {
    value: 'installment' as const,
    titleKey: 'dashboard.installments',
    captionKey: 'form.installmentsCaption',
    accent: '#6366f1',
  },
]

export default function ExpenseModeSelector({
  value,
  onChange,
}: ExpenseModeSelectorProps) {
  const colors = useThemeColors()
  const { t } = useI18n()

  return (
    <Box>
      <Text fontWeight="600" mb={3} color={colors.text.label} fontSize={{ base: 'sm', sm: 'md' }}>
        {t('form.expenseModeQuestion')}
      </Text>

      {/* Mobile: a single horizontal row that scrolls (carousel) so all three
          modes stay on one line. sm+: an equal 3-column grid. */}
      <Flex
        direction="row"
        gap={{ base: 2.5, sm: 3 }}
        overflowX={{ base: 'auto', sm: 'visible' }}
        mx={{ base: -1, sm: 0 }}
        px={{ base: 1, sm: 0 }}
        sx={{
          scrollSnapType: 'x proximity',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          '::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {MODES.map((mode) => {
          const selected = value === mode.value
          return (
            <Box
              key={mode.value}
              as="button"
              type="button"
              role="group"
              onClick={() => onChange(mode.value)}
              textAlign="left"
              borderRadius="2xl"
              flex={{ base: '0 0 auto', sm: 1 }}
              minW={{ base: '128px', sm: 0 }}
              minH={{ base: '64px', sm: '78px' }}
              px={{ base: 3, sm: 3.5 }}
              py={{ base: 2.5, sm: 3 }}
              border="2px solid"
              borderColor={selected ? mode.accent : colors.border}
              bg={selected ? `${mode.accent}14` : colors.inputBg}
              boxShadow={selected ? `0 12px 30px -18px ${mode.accent}` : 'none'}
              transition="border-color 0.18s ease, box-shadow 0.18s ease"
              sx={{ scrollSnapAlign: 'center' }}
              _hover={{ borderColor: mode.accent }}
              _focusVisible={{
                outline: '2px solid',
                outlineColor: mode.accent,
                outlineOffset: '2px',
              }}
            >
              <VStack align="stretch" spacing={{ base: 1, sm: 2 }}>
                <HStack justify="space-between" align="flex-start">
                  <Text
                    color={colors.text.primary}
                    fontWeight={800}
                    fontSize="sm"
                    _groupHover={{ textDecoration: 'underline' }}
                  >
                    {t(mode.titleKey)}
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
                <Text
                  color={colors.text.secondary}
                  fontSize="xs"
                  lineHeight="short"
                  noOfLines={{ base: 1, sm: 2 }}
                >
                  {t(mode.captionKey)}
                </Text>
              </VStack>
            </Box>
          )
        })}
      </Flex>
    </Box>
  )
}
