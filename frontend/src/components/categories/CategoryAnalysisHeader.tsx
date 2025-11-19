import {
  HStack,
  Text,
  Button,
  Icon,
  Flex,
  Heading,
  useColorModeValue,
  Box,
  VStack,
} from '@chakra-ui/react'
import { TrendingDown, TrendingUp, PieChart } from 'lucide-react'

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
      <HStack spacing={4}>
        <Box
          p={3}
          bg={useColorModeValue('purple.50', 'whiteAlpha.100')}
          color={useColorModeValue('purple.500', 'purple.300')}
          borderRadius="xl"
          boxShadow="0 4px 12px rgba(168, 85, 247, 0.15)"
        >
          <Icon as={PieChart} boxSize={6} strokeWidth={2.5} />
        </Box>
        <VStack align="start" spacing={0.5}>
          <Heading
            size="md"
            fontWeight="700"
            textAlign="left"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="-0.02em"
            fontSize={{ base: 'lg', sm: 'xl' }}
            bgGradient={useColorModeValue(
              'linear(to-r, gray.800, gray.600)',
              'linear(to-r, white, gray.300)'
            )}
            bgClip="text"
          >
            Categories
          </Heading>
          <Text
            fontSize="sm"
            color={useColorModeValue('gray.500', 'gray.400')}
            fontWeight="600"
            textAlign="left"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            Breakdown by category
          </Text>
        </VStack>
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
