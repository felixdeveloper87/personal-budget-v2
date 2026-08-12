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
      <Text fontWeight="600" mb={3} color={colors.text.label} fontSize={{ base: 'sm', sm: 'md' }}>
        {t('form.incomeModeQuestion')}
      </Text>

      <SimpleGrid columns={{ base: 2 }} spacing={3}>
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
              minH={{ base: '72px', sm: '78px' }}
              px={{ base: 3, sm: 3.5 }}
              py={{ base: 2.5, sm: 3 }}
              border="2px solid"
              borderColor={selected ? mode.accent : colors.border}
              bg={selected ? `${mode.accent}14` : colors.inputBg}
              transition="border-color 0.18s ease, box-shadow 0.18s ease"
              _hover={{ borderColor: mode.accent }}
              _focusVisible={{
                outline: '2px solid',
                outlineColor: mode.accent,
                outlineOffset: '2px',
              }}
            >
              <VStack align="stretch" spacing={2}>
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
                <Text color={colors.text.secondary} fontSize="xs" lineHeight="short" noOfLines={2}>
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
