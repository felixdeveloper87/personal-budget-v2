import {
  HStack,
  Text,
  Button,
  Icon,
  Flex,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react'
import { TrendingDown, TrendingUp } from 'lucide-react'

interface CategoryAnalysisHeaderProps {
  activeTab: 'expenses' | 'incomes'
  onTabChange: (tab: 'expenses' | 'incomes') => void
}

export default function CategoryAnalysisHeader({ 
  activeTab, 
  onTabChange 
}: CategoryAnalysisHeaderProps) {
  return (
    <Flex
      direction="row"
      align="center"
      justify="space-between"
      gap={{ base: 2, sm: 4 }}
      w="full"
    >
      {/* Left side */}
      <HStack spacing={2} align="baseline" flex="1" minW={0}>
        <Heading
          size="md"
          fontWeight="600"
          textAlign="left"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="-0.015em"
          fontSize={{ base: 'md', sm: 'lg', md: 'xl' }}
          color={useColorModeValue('gray.800', 'white')}
        >
          Categories
        </Heading>
        <Text
          fontSize={{ base: 'xs', sm: 'md' }}
          color={useColorModeValue('gray.600', 'gray.400')}
          fontWeight="400"
          textAlign="left"
          fontFamily="system-ui, -apple-system, sans-serif"
          display={{ base: 'none', sm: 'block' }}
          whiteSpace="nowrap"
        >
          • Detailed category breakdown and insights
        </Text>
      </HStack>

      {/* Right side - Tab Buttons */}
      <HStack spacing={{ base: 1, sm: 2 }} align="center" justify="flex-end" flexShrink={0}>
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
            activeTab === 'expenses' ? '#fecaca' : 'white',
            activeTab === 'expenses' ? '#2d1b1b' : '#0a0a0a'
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
            activeTab === 'incomes' ? '#dcfce7' : 'white',
            activeTab === 'incomes' ? '#1f2937' : '#0a0a0a'
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
