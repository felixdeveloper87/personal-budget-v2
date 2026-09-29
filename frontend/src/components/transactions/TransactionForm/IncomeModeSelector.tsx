import { Box, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { useI18n } from '../../../i18n'

export type IncomeMode = 'single' | 'fixed'

interface IncomeModeSelectorProps {
  value: IncomeMode
  onChange: (mode: IncomeMode) => void
}

const MODES = [
  {
    value: 'single' as const,
    titleKey: 'form.oneOff',
    captionKey: 'form.incomeOneOffCaption',
    accent: '#10b981',
  },
  {
    value: 'fixed' as const,
    titleKey: 'form.fixedIncome',
    captionKey: 'form.fixedIncomeCaption',
    accent: '#0ea5e9',
  },
]

export default function IncomeModeSelector({ value, onChange }: IncomeModeSelectorProps) {
  const colors = useThemeColors()
  const { t } = useI18n()

  return (
    <Box>
      <Text
        mb={2}
        color={colors.text.label}
        fontSize="xs"
        fontWeight={700}
        letterSpacing="0.025em"
      >
        {t('form.incomeModeQuestion')}
      </Text>

      <SimpleGrid
        columns={2}
        spacing={1.5}
        p={1.5}
        border="1px solid"
        borderColor={colors.border}
        borderRadius="18px"
        bg={colors.bgSecondary}
      >
        {MODES.map((mode) => {
          const selected = value === mode.value
          return (
            <Box
              key={mode.value}
              as="button"
              type="button"
              role="group"
              aria-pressed={selected}
              onClick={() => onChange(mode.value)}
              textAlign="left"
              borderRadius="14px"
              minH={{ base: '58px', sm: '62px' }}
              px={{ base: 2.5, sm: 3 }}
              py={{ base: 2, sm: 2.5 }}
              border="1px solid"
              borderColor={selected ? mode.accent : colors.border}
              bg={selected ? colors.inputBg : 'transparent'}
              boxShadow={selected ? `0 5px 14px -10px ${mode.accent}` : 'none'}
              transform={selected ? 'translateY(-1px)' : 'none'}
              transition="background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease"
              _hover={{ borderColor: mode.accent, bg: colors.inputBg }}
              _active={{ transform: 'translateY(0) scale(0.985)' }}
              _focusVisible={{
                outline: '2px solid',
                outlineColor: mode.accent,
                outlineOffset: '2px',
              }}
            >
              <VStack align="stretch" spacing={0.5}>
                <HStack justify="space-between" align="center" spacing={1.5}>
                  <Text
                    color={colors.text.primary}
                    fontWeight={800}
                    fontSize={{ base: 'xs', sm: 'sm' }}
                    lineHeight="shorter"
                    noOfLines={1}
                  >
                    {t(mode.titleKey)}
                  </Text>
                  <Box
                    w={2}
                    h={2}
                    borderRadius="full"
                    bg={selected ? mode.accent : 'transparent'}
                    border="1px solid"
                    borderColor={selected ? mode.accent : colors.border}
                    boxShadow={selected ? `0 0 0 3px ${mode.accent}20` : 'none'}
                    flexShrink={0}
                  />
                </HStack>
                <Text
                  color={colors.text.secondary}
                  fontSize={{ base: '10px', sm: '11px' }}
                  lineHeight="1.25"
                  noOfLines={2}
                >
                  {t(mode.captionKey)}
                </Text>
              </VStack>
            </Box>
          )
        })}
      </SimpleGrid>
    </Box>
  )
}
