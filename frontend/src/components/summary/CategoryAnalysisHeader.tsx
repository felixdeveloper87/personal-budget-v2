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
import { getResponsiveStyles } from '../ui'
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

  const analysisIconBg = useColorModeValue(
    'linear-gradient(135deg,rgb(166, 145, 215),rgb(123, 99, 164))',
    'linear-gradient(135deg, #a78bfa,rgb(166, 131, 247))'
  )
  const titleBg = useColorModeValue(
    'linear-gradient(135deg, #1e293b, #475569)',
    'linear-gradient(135deg, #f8fafc, #e2e8f0)'
  )

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
          p={responsiveStyles.addTransactionSection.header.icon.padding}
          borderRadius={responsiveStyles.addTransactionSection.header.icon.borderRadius}
          bg={analysisIconBg}
          boxShadow="lg"
          sx={{
            animation: 'glow 3s ease-in-out infinite',
            '@keyframes glow': {
              '0%, 100%': { boxShadow: '0 0 5px rgba(139, 92, 246, 0.3)' },
              '50%': {
                boxShadow:
                  '0 0 20px rgba(139, 92, 246, 0.6), 0 0 30px rgba(139, 92, 246, 0.4)',
              },
            },
          }}
        >
          <Icon
            as={BarChart3}
            boxSize={responsiveStyles.addTransactionSection.header.icon.size}
            color="white"
          />
        </Box>

        <VStack align="start" spacing={1} flex="1">
          <Heading
            size={responsiveStyles.addTransactionSection.header.title.size}
            bg={titleBg}
            bgClip="text"
            fontWeight="800"
            textAlign="left"
          >
            Category Analysis
          </Heading>
          <Text
            fontSize={responsiveStyles.addTransactionSection.header.title.fontSize}
            color={colors.text.secondary}
            fontWeight="400"
            opacity={0.8}
            textAlign="left"
            display={{ base: 'none', sm: 'block' }}
          >
            Detailed category breakdown and insights
          </Text>
        </VStack>
      </HStack>

      {/* Right side - Tab Buttons */}
      <HStack spacing={2} align="center" justify="center">
        <Button
          size="sm"
          variant={activeTab === 'expenses' ? 'solid' : 'outline'}
          colorScheme="red"
          leftIcon={<Icon as={TrendingDown} boxSize={3} />}
          borderRadius="lg"
          fontSize="xs"
          fontWeight="600"
          px={3}
          py={2}
          h="auto"
          bg={activeTab === 'expenses' ? 'red.50' : 'transparent'}
          color={activeTab === 'expenses' ? 'red.600' : 'gray.600'}
          borderColor={activeTab === 'expenses' ? 'red.200' : 'gray.300'}
          _hover={{
            bg: activeTab === 'expenses' ? 'red.100' : 'red.50',
            color: 'red.600',
            borderColor: 'red.300'
          }}
          onClick={() => onTabChange('expenses')}
        >
          Expenses
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'incomes' ? 'solid' : 'outline'}
          colorScheme="green"
          leftIcon={<Icon as={TrendingUp} boxSize={3} />}
          borderRadius="lg"
          fontSize="xs"
          fontWeight="600"
          px={3}
          py={2}
          h="auto"
          bg={activeTab === 'incomes' ? 'green.50' : 'transparent'}
          color={activeTab === 'incomes' ? 'green.600' : 'gray.600'}
          borderColor={activeTab === 'incomes' ? 'green.200' : 'gray.300'}
          _hover={{
            bg: activeTab === 'incomes' ? 'green.100' : 'green.50',
            color: 'green.600',
            borderColor: 'green.300'
          }}
          onClick={() => onTabChange('incomes')}
        >
          Incomes
        </Button>
      </HStack>
    </Flex>
  )
}
