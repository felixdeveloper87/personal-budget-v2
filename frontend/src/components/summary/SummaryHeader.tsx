import {
  HStack,
  VStack,
  Text,
  Button,
  Icon,
  Flex,
  Heading,
  Box,
  useColorModeValue,
} from '@chakra-ui/react'
import { Activity, RotateCcw } from 'lucide-react'
import { getResponsiveStyles } from '../ui'
import { useThemeColors } from '../../hooks/useThemeColors'

interface SummaryHeaderProps {
  onGoToToday: () => void
}

export default function SummaryHeader({ onGoToToday }: SummaryHeaderProps) {
  const colors = useThemeColors()
  const responsiveStyles = getResponsiveStyles()

  // Modern post-it inspired colors
  const iconBg = useColorModeValue(
    '#dbeafe', // Azul post-it
    '#1e293b'  // Azul escuro
  )
  const iconColor = useColorModeValue('blue.600', 'blue.300')
  const titleColor = useColorModeValue('gray.800', 'gray.100')
  const subtitleColor = useColorModeValue('gray.600', 'gray.300')

  return (
    <Flex
      direction={responsiveStyles.addTransactionSection.header.direction}
      align={{ base: 'stretch', sm: 'center' }}
      justify="space-between"
      gap={responsiveStyles.addTransactionSection.header.gap}
    >
      {/* Left side */}
      <HStack spacing={{ base: 2, sm: 3, md: 4 }} align="center" flex="1">
        {/* Modern Icon Container */}
        <Box
          p={{ base: 2, sm: 2.5, md: 3 }}
          borderRadius={responsiveStyles.addTransactionSection.header.icon.borderRadius}
          bg={iconBg}
          border="1px solid"
          borderColor={useColorModeValue('blue.200', 'blue.500')}
          boxShadow="sm"
          _hover={{
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderColor: useColorModeValue('blue.300', 'blue.400')
          }}
          transition="all 0.2s ease"
        >
          <Icon
            as={Activity}
            boxSize={responsiveStyles.addTransactionSection.header.icon.size}
            color={iconColor}
          />
        </Box>

        <VStack align={{ base: 'center', sm: 'start' }} spacing={1} flex="1">
          <Heading
            size={responsiveStyles.addTransactionSection.header.title.size}
            color={titleColor}
            fontWeight="700"
            textAlign={{ base: 'center', sm: 'left' }}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            Financial Overview
          </Heading>
          <Text
            fontSize={responsiveStyles.addTransactionSection.header.title.fontSize}
            color={subtitleColor}
            fontWeight="500"
            textAlign={{ base: 'center', sm: 'left' }}
            display={{ base: 'none', sm: 'block' }}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            Complete overview with category analysis
          </Text>
        </VStack>
      </HStack>

      {/* Right side - Modern Today Button */}
      <Button
        size="sm"
        leftIcon={<RotateCcw size={14} />}
        onClick={onGoToToday}
        display={{ base: 'none', sm: 'flex' }}
        borderRadius="xl"
        px={4}
        py={2}
        fontWeight="500"
        bg={useColorModeValue(
          'rgba(255, 255, 255, 0.9)',
          'rgba(255, 255, 255, 0.05)'
        )}
        color={useColorModeValue('blue.600', 'blue.300')}
        border="1px solid"
        borderColor={useColorModeValue('blue.200', 'blue.500')}
        boxShadow="sm"
        fontFamily="system-ui, -apple-system, sans-serif"
        backdropFilter="blur(10px)"
        _hover={{
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderColor: useColorModeValue('blue.300', 'blue.400'),
          bg: useColorModeValue('blue.50', 'blue.900')
        }}
        _active={{
          transform: 'translateY(0)',
        }}
        transition="all 0.2s ease"
      >
        Today
      </Button>
    </Flex>
  )
}
