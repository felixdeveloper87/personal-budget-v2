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
import { BarChart3, TrendingDown, TrendingUp } from 'lucide-react'
import { getResponsiveStyles, sectionTitleStyles } from '../ui'
import { useThemeColors } from '../../hooks/useThemeColors'

interface CategoryAnalysisHeaderProps {
  activeTab: 'expenses' | 'incomes'
  onTabChange: (tab: 'expenses' | 'incomes') => void
}

export default function CategoryAnalysisHeader({ 
  activeTab, 
  onTabChange 
}: CategoryAnalysisHeaderProps) {
  const colors = useThemeColors()
  const responsiveStyles = getResponsiveStyles()

  // Modern post-it inspired colors
  const analysisIconBg = useColorModeValue('#dbeafe', '#1e293b') // Azul post-it
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
        <Box
          p={{ base: 2, sm: 2.5, md: 3 }}
          borderRadius="xl"
          bg={analysisIconBg}
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
            as={BarChart3}
            boxSize={{ base: 4, sm: 5, md: 6 }}
            color={useColorModeValue('blue.600', 'blue.300')}
          />
        </Box>

        <VStack align="start" spacing={1} flex="1">
          <Heading
            size={sectionTitleStyles.size}
            color={titleColor}
            fontWeight={sectionTitleStyles.fontWeight}
            textAlign="left"
            fontFamily={sectionTitleStyles.fontFamily}
            letterSpacing={sectionTitleStyles.letterSpacing}
            lineHeight={sectionTitleStyles.lineHeight}
          >
            Category Analysis
          </Heading>
          <Text
            fontSize={{ base: 'sm', sm: 'md' }}
            color={subtitleColor}
            fontWeight="500"
            textAlign="left"
            display={{ base: 'none', sm: 'block' }}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            Detailed category breakdown and insights
          </Text>
        </VStack>
      </HStack>

      {/* Right side - Tab Buttons */}
      <HStack spacing={2} align="center" justify="center">
        <Button
          size="sm"
          leftIcon={<Icon as={TrendingDown} boxSize={3} />}
          borderRadius="xl"
          fontSize="xs"
          fontWeight="500"
          px={3}
          py={2}
          h="auto"
          bg={useColorModeValue(
            activeTab === 'expenses' ? '#fecaca' : 'rgba(255, 255, 255, 0.9)',
            activeTab === 'expenses' ? '#2d1b1b' : 'rgba(255, 255, 255, 0.05)'
          )}
          color={useColorModeValue(
            activeTab === 'expenses' ? 'red.600' : 'gray.600',
            activeTab === 'expenses' ? 'red.300' : 'gray.300'
          )}
          border="1px solid"
          borderColor={useColorModeValue(
            activeTab === 'expenses' ? 'red.200' : 'gray.200',
            activeTab === 'expenses' ? 'red.500' : 'gray.600'
          )}
          fontFamily="system-ui, -apple-system, sans-serif"
          backdropFilter="blur(10px)"
          _hover={{
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderColor: useColorModeValue('red.300', 'red.400'),
            bg: useColorModeValue('red.50', 'red.900')
          }}
          _active={{
            transform: 'translateY(0)',
          }}
          transition="all 0.2s ease"
          onClick={() => onTabChange('expenses')}
        >
          Expenses
        </Button>
        <Button
          size="sm"
          leftIcon={<Icon as={TrendingUp} boxSize={3} />}
          borderRadius="xl"
          fontSize="xs"
          fontWeight="500"
          px={3}
          py={2}
          h="auto"
          bg={useColorModeValue(
            activeTab === 'incomes' ? '#dcfce7' : 'rgba(255, 255, 255, 0.9)',
            activeTab === 'incomes' ? '#1f2937' : 'rgba(255, 255, 255, 0.05)'
          )}
          color={useColorModeValue(
            activeTab === 'incomes' ? 'green.600' : 'gray.600',
            activeTab === 'incomes' ? 'green.300' : 'gray.300'
          )}
          border="1px solid"
          borderColor={useColorModeValue(
            activeTab === 'incomes' ? 'green.200' : 'gray.200',
            activeTab === 'incomes' ? 'green.500' : 'gray.600'
          )}
          fontFamily="system-ui, -apple-system, sans-serif"
          backdropFilter="blur(10px)"
          _hover={{
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderColor: useColorModeValue('green.300', 'green.400'),
            bg: useColorModeValue('green.50', 'green.900')
          }}
          _active={{
            transform: 'translateY(0)',
          }}
          transition="all 0.2s ease"
          onClick={() => onTabChange('incomes')}
        >
          Incomes
        </Button>
      </HStack>
    </Flex>
  )
}
