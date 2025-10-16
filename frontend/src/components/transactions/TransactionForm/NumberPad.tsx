import { Box, Button, Grid, Text, useColorModeValue } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { getShimmerStyles } from '../../ui'

interface NumberPadProps {
  value: number
  onValueChange: (value: number) => void
  onDone?: () => void
}

export default function NumberPad({ value, onValueChange, onDone }: NumberPadProps) {
  const [displayValue, setDisplayValue] = useState<string>('0.00')

  // Update display value when prop value changes
  useEffect(() => {
    if (value === 0) {
      setDisplayValue('0.00')
    } else {
      setDisplayValue(value.toString())
    }
  }, [value])

  const handleNumberClick = (num: string) => {
    let newValue: string
    
    if (displayValue === '0.00' || displayValue === '0') {
      newValue = num
    } else if (displayValue.includes('.')) {
      // If already has decimal, check if we can add more digits after decimal
      const parts = displayValue.split('.')
      if (parts[1].length < 2) {
        newValue = displayValue + num
      } else {
        return // Don't add more than 2 decimal places
      }
    } else {
      newValue = displayValue + num
    }
    
    setDisplayValue(newValue)
    onValueChange(parseFloat(newValue))
  }

  const handleDecimal = () => {
    if (!displayValue.includes('.')) {
      const newValue = displayValue + '.'
      setDisplayValue(newValue)
      onValueChange(parseFloat(newValue))
    }
  }

  const handleClear = () => {
    setDisplayValue('0.00')
    onValueChange(0)
  }

  const handleBackspace = () => {
    if (displayValue.length > 1 && displayValue !== '0.00') {
      let newValue = displayValue.slice(0, -1)
      
      // If we removed the decimal point, ensure we still have a valid number
      if (newValue === '') {
        newValue = '0'
      }
      
      setDisplayValue(newValue)
      onValueChange(parseFloat(newValue))
    } else {
      setDisplayValue('0.00')
      onValueChange(0)
    }
  }

  const formatDisplayValue = (val: string) => {
    if (val === '0' || val === '0.00') return '0.00'
    if (!val.includes('.')) return val + '.00'
    if (val.endsWith('.')) return val + '00'
    if (val.split('.')[1].length === 1) return val + '0'
    return val
  }

  const displayBg = useColorModeValue('gray.50', '#1a1a1a')
  const displayBorder = useColorModeValue('gray.200', 'gray.800')
  const displayText = useColorModeValue('gray.800', 'white')

  return (
    <Box w="full" maxW={{ base: "100%", sm: "320px" }} mx="auto">
      {/* Animated top bar */}
      <Box
        height="4px"
        borderRadius="2xl 2xl 0 0"
        mb={4}
        sx={getShimmerStyles()}
      />
      
      {/* Display */}
      <Box 
        p={{ base: 6, sm: 4 }} 
        bg={displayBg}
        borderRadius="xl" 
        mb={{ base: 6, sm: 4 }} 
        textAlign="center"
        border="2px solid"
        borderColor={displayBorder}
        minH={{ base: "80px", sm: "60px" }}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize={{ base: "3xl", sm: "2xl" }} fontWeight="bold" color={displayText}>
          £{formatDisplayValue(displayValue)}
        </Text>
      </Box>

      {/* Number Pad */}
      <Grid 
        templateColumns="repeat(3, 1fr)" 
        gap={{ base: 3, sm: 2 }} 
        w="full"
        maxW={{ base: "100%", sm: "240px" }}
        mx="auto"
      >
        {/* Row 1 */}
        <Button 
          size={{ base: "xl", sm: "lg" }}
          h={{ base: "60px", sm: "48px" }}
          onClick={() => handleNumberClick('1')}
          colorScheme="gray"
          variant="outline"
          fontSize={{ base: "xl", sm: "lg" }}
          fontWeight="bold"
        >
          1
        </Button>
        <Button 
          size={{ base: "xl", sm: "lg" }}
          h={{ base: "60px", sm: "48px" }}
          onClick={() => handleNumberClick('2')}
          colorScheme="gray"
          variant="outline"
          fontSize={{ base: "xl", sm: "lg" }}
          fontWeight="bold"
        >
          2
        </Button>
        <Button 
          size={{ base: "xl", sm: "lg" }}
          h={{ base: "60px", sm: "48px" }}
          onClick={() => handleNumberClick('3')}
          colorScheme="gray"
          variant="outline"
          fontSize={{ base: "xl", sm: "lg" }}
          fontWeight="bold"
        >
          3
        </Button>
        
        {/* Row 2 */}
        <Button 
          size={{ base: "xl", sm: "lg" }}
          h={{ base: "60px", sm: "48px" }}
          onClick={() => handleNumberClick('4')}
          colorScheme="gray"
          variant="outline"
          fontSize={{ base: "xl", sm: "lg" }}
          fontWeight="bold"
        >
          4
        </Button>
        <Button 
          size={{ base: "xl", sm: "lg" }}
          h={{ base: "60px", sm: "48px" }}
          onClick={() => handleNumberClick('5')}
          colorScheme="gray"
          variant="outline"
          fontSize={{ base: "xl", sm: "lg" }}
          fontWeight="bold"
        >
          5
        </Button>
        <Button 
          size={{ base: "xl", sm: "lg" }}
          h={{ base: "60px", sm: "48px" }}
          onClick={() => handleNumberClick('6')}
          colorScheme="gray"
          variant="outline"
          fontSize={{ base: "xl", sm: "lg" }}
          fontWeight="bold"
        >
          6
        </Button>
        
        {/* Row 3 */}
        <Button 
          size={{ base: "xl", sm: "lg" }}
          h={{ base: "60px", sm: "48px" }}
          onClick={() => handleNumberClick('7')}
          colorScheme="gray"
          variant="outline"
          fontSize={{ base: "xl", sm: "lg" }}
          fontWeight="bold"
        >
          7
        </Button>
        <Button 
          size={{ base: "xl", sm: "lg" }}
          h={{ base: "60px", sm: "48px" }}
          onClick={() => handleNumberClick('8')}
          colorScheme="gray"
          variant="outline"
          fontSize={{ base: "xl", sm: "lg" }}
          fontWeight="bold"
        >
          8
        </Button>
        <Button 
          size={{ base: "xl", sm: "lg" }}
          h={{ base: "60px", sm: "48px" }}
          onClick={() => handleNumberClick('9')}
          colorScheme="gray"
          variant="outline"
          fontSize={{ base: "xl", sm: "lg" }}
          fontWeight="bold"
        >
          9
        </Button>
        
        {/* Row 4 */}
        <Button 
          size={{ base: "xl", sm: "lg" }}
          h={{ base: "60px", sm: "48px" }}
          onClick={handleDecimal} 
          colorScheme="blue"
          variant="outline"
          fontSize={{ base: "xl", sm: "lg" }}
          fontWeight="bold"
        >
          .
        </Button>
        <Button 
          size={{ base: "xl", sm: "lg" }}
          h={{ base: "60px", sm: "48px" }}
          onClick={() => handleNumberClick('0')}
          colorScheme="gray"
          variant="outline"
          fontSize={{ base: "xl", sm: "lg" }}
          fontWeight="bold"
        >
          0
        </Button>
        <Button 
          size={{ base: "xl", sm: "lg" }}
          h={{ base: "60px", sm: "48px" }}
          onClick={handleBackspace} 
          colorScheme="red"
          variant="outline"
          fontSize={{ base: "xl", sm: "lg" }}
          fontWeight="bold"
        >
          ⌫
        </Button>
      </Grid>

      {/* Clear Button */}
      <Button 
        size={{ base: "lg", sm: "sm" }}
        h={{ base: "50px", sm: "40px" }}
        colorScheme="red" 
        variant="outline" 
        w="full" 
        mt={{ base: 4, sm: 2 }}
        onClick={handleClear}
        fontSize={{ base: "lg", sm: "sm" }}
        fontWeight="bold"
      >
        Clear
      </Button>

      {/* Done Button - only show if onDone is provided */}
      {onDone && (
        <Button 
          size={{ base: "lg", sm: "sm" }}
          h={{ base: "50px", sm: "40px" }}
          colorScheme="green" 
          variant="solid" 
          w="full" 
          mt={2}
          onClick={onDone}
          fontSize={{ base: "lg", sm: "sm" }}
          fontWeight="bold"
        >
          Done
        </Button>
      )}
    </Box>
  )
}
