import { Box, Button, Grid, Text, useColorModeValue } from '@chakra-ui/react'
import { useState, useEffect } from 'react'

interface NumberPadProps {
  value: number
  onValueChange: (value: number) => void
}

export default function NumberPad({ value, onValueChange }: NumberPadProps) {
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
    <Box>
      {/* Display */}
      <Box 
        p={4} 
        bg={displayBg}
        borderRadius="lg" 
        mb={4} 
        textAlign="center"
        border="2px solid"
        borderColor={displayBorder}
        minH="60px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize="2xl" fontWeight="bold" color={displayText}>
          £{formatDisplayValue(displayValue)}
        </Text>
      </Box>

      {/* Number Pad */}
      <Grid templateColumns="repeat(3, 1fr)" gap={2} maxW="240px">
        {/* Row 1 */}
        <Button 
          size="lg" 
          onClick={() => handleNumberClick('1')}
          colorScheme="gray"
          variant="outline"
        >
          1
        </Button>
        <Button 
          size="lg" 
          onClick={() => handleNumberClick('2')}
          colorScheme="gray"
          variant="outline"
        >
          2
        </Button>
        <Button 
          size="lg" 
          onClick={() => handleNumberClick('3')}
          colorScheme="gray"
          variant="outline"
        >
          3
        </Button>
        
        {/* Row 2 */}
        <Button 
          size="lg" 
          onClick={() => handleNumberClick('4')}
          colorScheme="gray"
          variant="outline"
        >
          4
        </Button>
        <Button 
          size="lg" 
          onClick={() => handleNumberClick('5')}
          colorScheme="gray"
          variant="outline"
        >
          5
        </Button>
        <Button 
          size="lg" 
          onClick={() => handleNumberClick('6')}
          colorScheme="gray"
          variant="outline"
        >
          6
        </Button>
        
        {/* Row 3 */}
        <Button 
          size="lg" 
          onClick={() => handleNumberClick('7')}
          colorScheme="gray"
          variant="outline"
        >
          7
        </Button>
        <Button 
          size="lg" 
          onClick={() => handleNumberClick('8')}
          colorScheme="gray"
          variant="outline"
        >
          8
        </Button>
        <Button 
          size="lg" 
          onClick={() => handleNumberClick('9')}
          colorScheme="gray"
          variant="outline"
        >
          9
        </Button>
        
        {/* Row 4 */}
        <Button 
          size="lg" 
          onClick={handleDecimal} 
          colorScheme="blue"
          variant="outline"
        >
          .
        </Button>
        <Button 
          size="lg" 
          onClick={() => handleNumberClick('0')}
          colorScheme="gray"
          variant="outline"
        >
          0
        </Button>
        <Button 
          size="lg" 
          onClick={handleBackspace} 
          colorScheme="red"
          variant="outline"
        >
          ⌫
        </Button>
      </Grid>

      {/* Clear Button - only show in modal context */}
      <Button 
        size="sm" 
        colorScheme="red" 
        variant="outline" 
        w="full" 
        mt={2}
        onClick={handleClear}
      >
        Clear
      </Button>
    </Box>
  )
}
