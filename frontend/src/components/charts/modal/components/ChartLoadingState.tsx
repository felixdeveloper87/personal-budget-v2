import { Center, VStack, Text, Spinner, useColorModeValue } from '@chakra-ui/react'
import { useThemeColors } from '../../../../hooks/useThemeColors'

interface ChartLoadingStateProps {
  message?: string
}

export default function ChartLoadingState({ 
  message = 'Loading chart data...' 
}: ChartLoadingStateProps) {
  const colors = useThemeColors()
  const spinnerColor = useColorModeValue('blue.500', 'blue.300')
  
  return (
    <Center py={20}>
      <VStack spacing={4}>
        <Spinner size="lg" color={spinnerColor} thickness="3px" />
        <Text color={colors.text.secondary} fontSize="sm">
          {message}
        </Text>
      </VStack>
    </Center>
  )
}

