import { Box, Text, Input, HStack, useDisclosure, VStack, Wrap, WrapItem, Button, Icon } from '@chakra-ui/react'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { getResponsiveStyles } from '../../ui'
import NumberPad from './NumberPad'

interface AmountInputProps {
  amount: number
  onChange: (amount: number) => void
  type: 'INCOME' | 'EXPENSE'
}

/**
 * 💰 AmountInput Component
 * - Displays a currency input with £ (pound sterling) symbol
 * - Changes color based on transaction type (green for income, red for expense)
 * - Handles number formatting and validation
 */
export default function AmountInput({ amount, onChange, type }: AmountInputProps) {
  const colors = useThemeColors()
  const responsiveStyles = getResponsiveStyles()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleInputClick = () => {
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
      { label: '£500', value: 500, color: 'pink' }
    ]
  }

  const quickAmountOptions = getQuickAmountOptions()

  return (
    <>
      <VStack spacing={4} align="stretch">
        <Box>
          <Text fontWeight="600" mb={3} color={colors.text.label} fontSize={{ base: 'sm', sm: 'md' }}>
            Amount
          </Text>
        <Box
        position="relative"
        borderRadius="2xl"
        bg={colors.inputBg}
        border="2px solid"
        borderColor={colors.border}
        _hover={{
          borderColor: type === 'INCOME' ? 'green.400' : 'red.400',
          transform: 'translateY(-2px)',
          boxShadow: 'lg'
        }}
        _focusWithin={{
          borderColor: type === 'INCOME' ? 'green.400' : 'red.400',
          boxShadow: `0 0 0 3px ${type === 'INCOME' ? '#4ade8020' : '#f8717120'}`,
          transform: 'translateY(-2px)'
        }}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        overflow="hidden"
      >
        {/* Decorative gradient background */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          height="2px"
          bg={type === 'INCOME' 
            ? 'linear-gradient(90deg, #22c55e, #16a34a, #15803d)' 
            : 'linear-gradient(90deg, #ef4444, #dc2626, #b91c1c)'
          }
          opacity={0.8}
        />
        
        <HStack spacing={4} align="center" p={4}>
          <Box
            p={2}
            borderRadius="xl"
            bg={type === 'INCOME' ? 'green.500' : 'red.500'}
            color="white"
            boxShadow="md"
            fontWeight="bold"
            fontSize={{ base: 'lg', sm: 'xl' }}
          >
            £
          </Box>
          
          <Input
            type="text"
            value={formatDisplayValue(amount)}
            onClick={handleInputClick}
            placeholder="0.00"
            fontSize={{ base: 'lg', sm: 'xl' }}
            fontWeight="bold"
            border="none"
            bg="transparent"
            color={colors.text.primary}
            h="auto"
            p={0}
            _focus={{
              outline: 'none',
              boxShadow: 'none'
            }}
            _hover={{
              border: 'none'
            }}
            cursor="pointer"
            readOnly
          />
        </HStack>
        </Box>
        </Box>

        {/* Quick Amount Buttons */}
        <Box>
          <Text fontWeight="500" mb={2} color={colors.text.secondary} fontSize={{ base: 'xs', sm: 'sm' }}>
            Quick Amount
          </Text>
          <Wrap spacing={responsiveStyles.categoryList.spacing}>
            {quickAmountOptions.map((option) => (
              <WrapItem key={option.value}>
                <Button
                  variant={amount === option.value ? 'solid' : 'outline'}
                  colorScheme={amount === option.value ? 'blue' : 'gray'}
                  onClick={() => onChange(option.value)}
                  {...responsiveStyles.buttons.category}
                  h={responsiveStyles.buttons.category.height}
                  fontWeight="bold"
                  borderWidth="2px"
                  borderRadius="xl"
                  _hover={{
                    transform: 'translateY(-2px)',
                    shadow: 'md',
                  }}
                  _active={{
                    transform: 'translateY(0)',
                  }}
                  transition="all 0.2s"
                >
                  {option.label}
                </Button>
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      </VStack>

      {/* NumberPad Modal */}
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
            <NumberPad value={amount} onValueChange={handleNumberPadChange} onDone={onClose} />
          </Box>
        </Box>
      )}
    </>
  )
}
