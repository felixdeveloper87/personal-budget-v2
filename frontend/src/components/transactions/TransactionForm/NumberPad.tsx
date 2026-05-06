import { Box, Button, Grid, HStack, Icon, Text, VStack, useColorModeValue } from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import { Backspace, Check } from '../../ui/icons'

interface NumberPadProps {
  value: number
  onValueChange: (value: number) => void
  onDone?: () => void
}

interface NumberKeyProps {
  children: string
  displayText: string
  keyBg: string
  keyBorder: string
  keyHoverBg: string
  onClick: () => void
}

function NumberKey({
  children,
  displayText,
  keyBg,
  keyBorder,
  keyHoverBg,
  onClick,
}: NumberKeyProps) {
  return (
    <Button
      h={{ base: '62px', sm: '56px' }}
      borderRadius="2xl"
      bg={keyBg}
      border="1px solid"
      borderColor={keyBorder}
      color={displayText}
      fontSize={{ base: '2xl', sm: 'xl' }}
      fontWeight={700}
      lineHeight="1"
      onClick={onClick}
      _hover={{ bg: keyHoverBg, transform: 'translateY(-1px)' }}
      _active={{ transform: 'translateY(0)', bg: keyBg }}
      transition="background 0.15s ease, transform 0.15s ease"
    >
      {children}
    </Button>
  )
}

export default function NumberPad({ value, onValueChange, onDone }: NumberPadProps) {
  const [displayValue, setDisplayValue] = useState<string>('0.00')

  useEffect(() => {
    setDisplayValue(value === 0 ? '0.00' : value.toString())
  }, [value])

  const handleNumberClick = useCallback((num: string) => {
    let newValue: string

    if (displayValue === '0.00' || displayValue === '0') {
      newValue = num
    } else if (displayValue.includes('.')) {
      const parts = displayValue.split('.')
      if (parts[1].length >= 2) return
      newValue = displayValue + num
    } else {
      newValue = displayValue + num
    }

    setDisplayValue(newValue)
    onValueChange(parseFloat(newValue))
  }, [displayValue, onValueChange])

  const handleDecimal = useCallback(() => {
    if (displayValue.includes('.')) return

    const newValue = displayValue + '.'
    setDisplayValue(newValue)
    onValueChange(parseFloat(newValue))
  }, [displayValue, onValueChange])

  const handleClear = useCallback(() => {
    setDisplayValue('0.00')
    onValueChange(0)
  }, [onValueChange])

  const handleBackspace = useCallback(() => {
    if (displayValue.length > 1 && displayValue !== '0.00') {
      const newValue = displayValue.slice(0, -1) || '0'
      setDisplayValue(newValue)
      onValueChange(parseFloat(newValue))
      return
    }

    setDisplayValue('0.00')
    onValueChange(0)
  }, [displayValue, onValueChange])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event

      if (/^\d$/.test(key)) {
        event.preventDefault()
        handleNumberClick(key)
        return
      }

      if (key === '.' || key === ',') {
        event.preventDefault()
        handleDecimal()
        return
      }

      if (key === 'Backspace') {
        event.preventDefault()
        handleBackspace()
        return
      }

      if (key === 'Delete') {
        event.preventDefault()
        handleClear()
        return
      }

      if (key === 'Enter') {
        event.preventDefault()
        onDone?.()
        return
      }

      if (key === 'Escape') {
        event.preventDefault()
        onDone?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleBackspace, handleClear, handleDecimal, handleNumberClick, onDone])

  const formatDisplayValue = (val: string) => {
    if (val === '0' || val === '0.00') return '0.00'
    if (!val.includes('.')) return val + '.00'
    if (val.endsWith('.')) return val + '00'
    if (val.split('.')[1].length === 1) return val + '0'
    return val
  }

  const currencySymbol =
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })
      .formatToParts(0)
      .find((part) => part.type === 'currency')?.value ?? 'GBP'

  const shellBg = useColorModeValue('white', 'gray.950')
  const displayBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const displayBorder = useColorModeValue('gray.200', 'whiteAlpha.100')
  const displayText = useColorModeValue('gray.900', 'white')
  const mutedText = useColorModeValue('gray.500', 'gray.400')
  const keyBg = useColorModeValue('gray.50', 'whiteAlpha.100')
  const keyHoverBg = useColorModeValue('gray.100', 'whiteAlpha.200')
  const keyBorder = useColorModeValue('gray.200', 'whiteAlpha.100')
  const actionBg = useColorModeValue('gray.100', 'whiteAlpha.100')
  const dangerColor = useColorModeValue('red.600', 'red.300')
  const primaryGradient = useColorModeValue(
    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'linear-gradient(135deg, #34d399 0%, #10b981 100%)'
  )

  const numberKeyProps = {
    displayText,
    keyBg,
    keyBorder,
    keyHoverBg,
  }

  return (
    <Box
      w="full"
      maxW={{ base: '100%', sm: '340px' }}
      mx="auto"
      bg={shellBg}
      borderRadius="2xl"
    >
      <VStack spacing={4} align="stretch">
        <Box
          px={{ base: 5, sm: 4 }}
          py={{ base: 5, sm: 4 }}
          bg={displayBg}
          borderRadius="2xl"
          border="1px solid"
          borderColor={displayBorder}
          minH={{ base: '96px', sm: '84px' }}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <HStack spacing={2} align="baseline" maxW="full">
            <Text fontSize={{ base: '2xl', sm: 'xl' }} fontWeight={700} color={mutedText}>
              {currencySymbol}
            </Text>
            <Text
              fontSize={{ base: '4xl', sm: '3xl' }}
              fontWeight={800}
              color={displayText}
              lineHeight="1"
              noOfLines={1}
              sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {formatDisplayValue(displayValue)}
            </Text>
          </HStack>
        </Box>

        <Grid templateColumns="repeat(3, 1fr)" gap={2.5} w="full">
          <NumberKey {...numberKeyProps} onClick={() => handleNumberClick('1')}>1</NumberKey>
          <NumberKey {...numberKeyProps} onClick={() => handleNumberClick('2')}>2</NumberKey>
          <NumberKey {...numberKeyProps} onClick={() => handleNumberClick('3')}>3</NumberKey>
          <NumberKey {...numberKeyProps} onClick={() => handleNumberClick('4')}>4</NumberKey>
          <NumberKey {...numberKeyProps} onClick={() => handleNumberClick('5')}>5</NumberKey>
          <NumberKey {...numberKeyProps} onClick={() => handleNumberClick('6')}>6</NumberKey>
          <NumberKey {...numberKeyProps} onClick={() => handleNumberClick('7')}>7</NumberKey>
          <NumberKey {...numberKeyProps} onClick={() => handleNumberClick('8')}>8</NumberKey>
          <NumberKey {...numberKeyProps} onClick={() => handleNumberClick('9')}>9</NumberKey>
          <Button
            h={{ base: '62px', sm: '56px' }}
            borderRadius="2xl"
            bg={actionBg}
            color={mutedText}
            fontSize="lg"
            fontWeight={700}
            onClick={handleDecimal}
            _hover={{ bg: keyHoverBg }}
            _active={{ bg: actionBg }}
          >
            .
          </Button>
          <NumberKey {...numberKeyProps} onClick={() => handleNumberClick('0')}>0</NumberKey>
          <Button
            h={{ base: '62px', sm: '56px' }}
            borderRadius="2xl"
            bg={actionBg}
            color={dangerColor}
            onClick={handleBackspace}
            aria-label="Delete last digit"
            _hover={{ bg: keyHoverBg }}
            _active={{ bg: actionBg }}
          >
            <Icon as={Backspace} boxSize={6} />
          </Button>
        </Grid>

        <HStack spacing={2.5}>
          <Button
            h={{ base: '52px', sm: '46px' }}
            flex="1"
            borderRadius="xl"
            bg={actionBg}
            color={dangerColor}
            fontWeight={700}
            onClick={handleClear}
            _hover={{ bg: keyHoverBg }}
            _active={{ bg: actionBg }}
          >
            Clear
          </Button>

          {onDone && (
            <Button
              h={{ base: '52px', sm: '46px' }}
              flex="1.5"
              borderRadius="xl"
              color="white"
              bg={primaryGradient}
              leftIcon={<Icon as={Check} boxSize={5} />}
              onClick={onDone}
              fontWeight={800}
              _hover={{ filter: 'brightness(1.03)', transform: 'translateY(-1px)' }}
              _active={{ transform: 'translateY(0)' }}
              transition="filter 0.15s ease, transform 0.15s ease"
            >
              Done
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  )
}
