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
import { GRADIENTS } from '../../theme'
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
      direction={{ base: 'row', sm: 'row' }}
      align="center"
      justify="space-between"
      gap={{ base: 2, sm: 4 }}
    >
      {/* Left side */}
      <HStack spacing={{ base: 2, sm: 2, md: 3 }} align="center" flex="0">
        <Box
          p={{ base: 1.5, sm: 2, md: 2.5 }}
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
            boxSize={{ base: 3.5, sm: 4, md: 5 }}
            color={useColorModeValue('blue.600', 'blue.300')}
          />
        </Box>

        <HStack align="center" spacing={3} flex="0">
          <Heading
            size={sectionTitleStyles.size}
            color={titleColor}
            fontWeight="600"
            textAlign="left"
            fontFamily={sectionTitleStyles.fontFamily}
            letterSpacing="-0.01em"
            lineHeight="1.2"
            whiteSpace="nowrap"
            fontSize={{ base: 'xs', sm: 'md' }}
            opacity={0.9}
          >
            Categories
          </Heading>
          <Text
            fontSize={{ base: 'xs', sm: 'sm' }}
            color={subtitleColor}
            fontWeight="500"
            textAlign="left"
            display={{ base: 'none', sm: 'block' }}
            fontFamily="system-ui, -apple-system, sans-serif"
            whiteSpace="nowrap"
          >
            Detailed category breakdown and insights
          </Text>
        </HStack>
      </HStack>

      {/* Right side - Tab Buttons */}
      <HStack spacing={{ base: 1, sm: 2 }} align="center" justify="center">
        <Button
          size={{ base: 'xs', sm: 'sm' }}
          leftIcon={<Icon as={TrendingDown} boxSize={{ base: 2, sm: 2.5 }} />}
          borderRadius="xl"
          fontSize={{ base: '2xs', sm: '2xs' }}
          fontWeight="500"
          px={{ base: 2, sm: 2.5 }}
          py={{ base: 1, sm: 1.5 }}
          h="auto"
          bg={useColorModeValue(
            activeTab === 'expenses' ? '#fecaca' : GRADIENTS.cardLight,
            activeTab === 'expenses' ? '#2d1b1b' : GRADIENTS.cardDark
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
          size={{ base: 'xs', sm: 'sm' }}
          leftIcon={<Icon as={TrendingUp} boxSize={{ base: 2, sm: 2.5 }} />}
          borderRadius="xl"
          fontSize={{ base: '2xs', sm: '2xs' }}
          fontWeight="500"
          px={{ base: 2, sm: 2.5 }}
          py={{ base: 1, sm: 1.5 }}
          h="auto"
          bg={useColorModeValue(
            activeTab === 'incomes' ? '#dcfce7' : GRADIENTS.cardLight,
            activeTab === 'incomes' ? '#1f2937' : GRADIENTS.cardDark
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
