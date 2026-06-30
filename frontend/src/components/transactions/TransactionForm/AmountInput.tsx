import { Box, Text, HStack, useDisclosure, VStack, Wrap, WrapItem, Button, Icon } from '@chakra-ui/react'
import { Calculator } from '../../ui/icons'
import { useThemeColors } from '../../../hooks/useThemeColors'
import NumberPad from './NumberPad'

interface AmountInputProps {
  amount: number
  onChange: (amount: number) => void
  type: 'INCOME' | 'EXPENSE'
}

/**
 * 💰 AmountInput Component
 * - Currency picker + quick amounts (matches DateSelector card pattern)
 * - Opens number pad from the keypad icon or displayed value
 */
export default function AmountInput({ amount, onChange, type }: AmountInputProps) {
  const colors = useThemeColors()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleOpenPad = () => {
    onOpen()
  }

  const handleNumberPadChange = (value: number) => {
    onChange(value)
  }

  const formatDisplayValue = (value: number) => {
    if (value === 0) return ''
    return value.toString()
  }

  const getQuickAmountOptions = () => {
    return [
      { label: '£5', value: 5, color: 'green' },
      { label: '£10', value: 10, color: 'blue' },
      { label: '£20', value: 20, color: 'purple' },
      { label: '£50', value: 50, color: 'orange' },
      { label: '£100', value: 100, color: 'teal' },
      { label: '£500', value: 500, color: 'pink' },
    ]
  }

  const quickAmountOptions = getQuickAmountOptions()
  const amountLabel =
    amount !== 0 ? formatDisplayValue(amount) : '0.00'
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
                      onClick={handleOpenPad}
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
                      How much?
                    </Text>
                  </HStack>

                  <Box
                    flexShrink={0}
                    minW={{ base: '72px', sm: '88px', md: '104px' }}
                  >
                    <Text
                      as="button"
                      type="button"
                      onClick={handleOpenPad}
                      display="block"
                      w="full"
                      fontSize={{ base: 'sm', sm: 'lg' }}
                      fontWeight="700"
                      color={
                        amount !== 0
                          ? colors.text.primary
                          : colors.text.secondary
                      }
                      lineHeight="1.1"
                      noOfLines={1}
                      textDecoration="underline"
                      textUnderlineOffset="3px"
                      cursor="pointer"
                      textAlign="right"
                      sx={{ fontVariantNumeric: 'tabular-nums' }}
                      _hover={{
                        color:
                          type === 'INCOME' ? 'green.400' : 'red.400',
                      }}
                      _focusVisible={{ boxShadow: focusRing }}
                    >
                      £{amountLabel}
                    </Text>
                  </Box>
                </HStack>

                <Wrap spacing={2} align="center">
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
                        {option.label}
                      </Button>
                    </WrapItem>
                  ))}
                </Wrap>
              </VStack>
            </VStack>
          </Box>
        </Box>
      </VStack>

      {isOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
          backdropFilter="blur(10px)"
          zIndex={1000}
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={4}
        >
          <Box
            bg={colors.cardBg}
            borderRadius="2xl"
            p={6}
            maxW="400px"
            w="full"
            border="1px solid"
            borderColor={colors.border}
            shadow="2xl"
          >
            <NumberPad
              value={amount}
              onValueChange={handleNumberPadChange}
              onDone={onClose}
            />
          </Box>
        </Box>
      )}
    </>
  )
}
