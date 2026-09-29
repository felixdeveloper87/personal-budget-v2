import { Box, Text, HStack, Input, VStack, Wrap, WrapItem, Button, Icon } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { Calculator } from '../../ui/icons'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { useI18n } from '../../../i18n'

interface AmountInputProps {
  amount: number
  onChange: (amount: number) => void
  type: 'INCOME' | 'EXPENSE'
  hideQuickAmountsOnMobile?: boolean
}

/**
 * 💰 AmountInput Component
 * - Currency picker + quick amounts (matches DateSelector card pattern)
 * - Opens number pad from the keypad icon or displayed value
 */
export default function AmountInput({
  amount,
  onChange,
  type,
  hideQuickAmountsOnMobile = false,
}: AmountInputProps) {
  const { t, formatCurrency } = useI18n()
  const colors = useThemeColors()
  const [amountDraft, setAmountDraft] = useState(() => amount > 0 ? String(amount) : '')
  const nativeInputRef = useRef<HTMLInputElement>(null)
  const nativeInputFocused = useRef(false)

  useEffect(() => {
    if (!nativeInputFocused.current) {
      setAmountDraft(amount > 0 ? String(amount) : '')
    }
  }, [amount])

  const focusAmountInput = () => nativeInputRef.current?.focus()

  const handleNativeAmountChange = (value: string) => {
    const numericCharacters = value.replace(/[^0-9.,]/g, '')
    const separatorIndex = numericCharacters.search(/[.,]/)
    const sanitized = separatorIndex === -1
      ? numericCharacters
      : numericCharacters.slice(0, separatorIndex + 1)
        + numericCharacters.slice(separatorIndex + 1).replace(/[.,]/g, '')
    setAmountDraft(sanitized)

    const numericValue = Number(sanitized.replace(',', '.'))
    onChange(Number.isFinite(numericValue) ? numericValue : 0)
  }

  const getQuickAmountOptions = () => {
    return [
      { value: 5, color: 'green' },
      { value: 10, color: 'blue' },
      { value: 20, color: 'purple' },
      { value: 50, color: 'orange' },
      { value: 100, color: 'teal' },
      { value: 500, color: 'pink' },
    ]
  }

  const quickAmountOptions = getQuickAmountOptions()
  const currencyMark = formatCurrency(0).replace(/[\d\s.,]/g, '') || '\u00A3'
  const focusRing =
    type === 'INCOME'
      ? '0 0 0 2px rgba(74, 222, 128, 0.2)'
      : '0 0 0 2px rgba(248, 113, 113, 0.2)'

  return (
    <>
      <VStack spacing={3} align="stretch">
        <Box>
          <Box
            borderRadius="2xl"
            bg={colors.inputBg}
            border="2px solid"
            borderColor={colors.border}
            _hover={{ borderColor: type === 'INCOME' ? 'green.400' : 'red.400' }}
            _focusWithin={{
              borderColor: type === 'INCOME' ? 'green.400' : 'red.400',
              boxShadow:
                type === 'INCOME'
                  ? '0 0 0 3px #4ade8020'
                  : '0 0 0 3px #f8717120',
            }}
            transition="border-color 0.3s ease, box-shadow 0.3s ease"
          >
            <VStack align="stretch" spacing={0}>
              <VStack
                spacing={3}
                px={{ base: 3, sm: 4 }}
                py={{ base: 3, sm: 4 }}
                align="stretch"
              >
                <HStack justify="space-between" spacing={3} align="center">
                  <HStack spacing={2.5} minW={0} flex="1">
                    <Box
                      as="button"
                      type="button"
                      onClick={focusAmountInput}
                      w={{ base: 8, sm: 10 }}
                      h={{ base: 8, sm: 10 }}
                      borderRadius="xl"
                      bg={colors.bgSecondary}
                      color={
                        type === 'INCOME' ? 'green.400' : 'red.400'
                      }
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                      cursor="pointer"
                      _hover={{ bg: colors.border }}
                      _focusVisible={{ boxShadow: focusRing }}
                    >
                      <Icon
                        as={Calculator}
                        boxSize={{ base: 4, sm: 5 }}
                        sx={{ '& svg': { display: 'block' } }}
                      />
                    </Box>
                    <Text
                      fontSize={{ base: 'sm', sm: 'md' }}
                      fontWeight="600"
                      color={colors.text.secondary}
                      lineHeight="1.1"
                      noOfLines={1}
                    >
                      {t('form.howMuch')}
                    </Text>
                  </HStack>

                  <Box
                    flexShrink={0}
                    minW={{ base: '72px', sm: '88px', md: '104px' }}
                  >
                    <HStack spacing={1} justify="flex-end" whiteSpace="nowrap">
                      <Text
                        color={colors.text.secondary}
                        fontSize={{ base: 'sm', sm: 'lg' }}
                        fontWeight={700}
                      >
                        {currencyMark}
                      </Text>
                      <Input
                        ref={nativeInputRef}
                        variant="unstyled"
                        inputMode="decimal"
                        value={amountDraft}
                        onFocus={() => { nativeInputFocused.current = true }}
                        onBlur={() => {
                          nativeInputFocused.current = false
                          setAmountDraft(amount > 0 ? String(amount) : '')
                        }}
                        onChange={(event) => handleNativeAmountChange(event.target.value)}
                        placeholder="0.00"
                        aria-label={t('form.howMuch')}
                        w={{ base: '62px', sm: '76px' }}
                        minW={{ base: '62px', sm: '76px' }}
                        flex="none"
                        p={0}
                        color={colors.text.primary}
                        fontSize={{ base: 'sm', sm: 'lg' }}
                        fontWeight={700}
                        lineHeight="1.1"
                        textAlign="left"
                        sx={{
                          fontVariantNumeric: 'tabular-nums',
                          _placeholder: { color: colors.text.secondary, opacity: 0.8 },
                        }}
                      />
                    </HStack>
                  </Box>
                </HStack>

                <Wrap
                  spacing={2}
                  align="center"
                  display={hideQuickAmountsOnMobile ? { base: 'none', md: 'flex' } : 'flex'}
                >
                  {quickAmountOptions.map((option) => (
                    <WrapItem key={option.value}>
                      <Button
                        variant="ghost"
                        onClick={() => onChange(option.value)}
                        h={{ base: 7, sm: 8 }}
                        px={{ base: 2, sm: 3 }}
                        minW="unset"
                        borderRadius="full"
                        color={
                          amount === option.value
                            ? colors.text.primary
                            : colors.text.secondary
                        }
                        bg={
                          amount === option.value
                            ? colors.bgSecondary
                            : 'transparent'
                        }
                        fontSize={{ base: 'xs', sm: 'xs' }}
                        fontWeight={amount === option.value ? 600 : 500}
                        opacity={amount === option.value ? 1 : 0.78}
                        _hover={{
                          bg: colors.bgSecondary,
                          opacity: 1,
                          textDecoration: 'underline',
                        }}
                        _active={{ bg: colors.bgSecondary }}
                        _focusVisible={{ boxShadow: focusRing }}
                      >
                        {formatCurrency(option.value, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </Button>
                    </WrapItem>
                  ))}
                </Wrap>
              </VStack>
            </VStack>
          </Box>
        </Box>
      </VStack>

    </>
  )
}
