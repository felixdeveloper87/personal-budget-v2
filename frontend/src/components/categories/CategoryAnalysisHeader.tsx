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
  Image,
} from '@chakra-ui/react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { sectionHeaderStyles, sectionTitleStyles } from '../ui'
import categoriesImage from '../../../assets/categories.png'

interface CategoryAnalysisHeaderProps {
  activeTab: 'expenses' | 'incomes'
  onTabChange: (tab: 'expenses' | 'incomes') => void
}

export default function CategoryAnalysisHeader({
  activeTab,
  onTabChange
}: CategoryAnalysisHeaderProps) {
  // Styles matching the premium look of AllTransactionsSection
  const iconBg = useColorModeValue('purple.50', 'whiteAlpha.100')
  const iconColor = useColorModeValue('purple.500', 'purple.300')
  const iconBorderColor = useColorModeValue('purple.200', 'purple.500')

  // Tab Button Styles
  const getTabStyles = (isActive: boolean, type: 'expenses' | 'incomes') => {
    const isExpense = type === 'expenses'
    
    // Active state colors
    const activeBg = useColorModeValue(
      isExpense ? 'red.50' : 'green.50', 
      isExpense ? 'rgba(254, 202, 202, 0.1)' : 'rgba(187, 247, 208, 0.1)'
    )
    const activeColor = useColorModeValue(
      isExpense ? 'red.600' : 'green.600', 
      isExpense ? 'red.200' : 'green.200'
    )
    const activeBorder = useColorModeValue(
      isExpense ? 'red.200' : 'green.200', 
      isExpense ? 'red.500' : 'green.500'
    )

    // Inactive state colors
    const inactiveBg = 'transparent'
    const inactiveColor = useColorModeValue('gray.500', 'gray.400')
    const inactiveBorder = useColorModeValue('gray.200', 'gray.700')

    return {
      bg: isActive ? activeBg : inactiveBg,
      color: isActive ? activeColor : inactiveColor,
      borderColor: isActive ? activeBorder : inactiveBorder,
      _hover: {
        bg: isActive ? activeBg : useColorModeValue('gray.50', 'whiteAlpha.50'),
        borderColor: isActive ? activeBorder : useColorModeValue('gray.300', 'gray.600'),
        transform: 'translateY(-1px)',
        boxShadow: 'sm'
      }
    }
  }

  const expenseStyles = getTabStyles(activeTab === 'expenses', 'expenses')
  const incomeStyles = getTabStyles(activeTab === 'incomes', 'incomes')

  return (
    <Flex
      direction={sectionHeaderStyles.container.direction}
      align={sectionHeaderStyles.container.align}
      justify={sectionHeaderStyles.container.justify}
      gap={sectionHeaderStyles.container.gap}
      w={sectionHeaderStyles.container.w}
      mb={4}
      flexWrap={{ base: 'wrap', sm: 'nowrap' }}
    >
      {/* Left side: Icon & Title */}
      <HStack 
        spacing={sectionHeaderStyles.iconAndTitle.spacing} 
        align={sectionHeaderStyles.iconAndTitle.align}
        flex={{ base: '1 1 auto', sm: '0 1 auto' }}
      >
        <Box
          p={2}
          bg="transparent"
          borderRadius={sectionHeaderStyles.icon.borderRadius}
          display="flex"
          alignItems="center"
          justifyContent="center"
          transition="all 0.2s ease"
        >
          <Image
            src={categoriesImage}
            alt="Categories"
            boxSize={{ base: 8, sm: 10, md: 12 }}
            objectFit="contain"
          />
        </Box>
        
        <VStack align="start" spacing={0} ml={1}>
          <Heading
            size={sectionTitleStyles.size}
            fontWeight={sectionTitleStyles.fontWeight}
            fontFamily={sectionTitleStyles.fontFamily}
            letterSpacing={sectionTitleStyles.letterSpacing}
            lineHeight={sectionTitleStyles.lineHeight}
            color={useColorModeValue('gray.800', 'white')}
          >
            Categories
          </Heading>
          <Text
            fontSize="sm"
            color={useColorModeValue('gray.500', 'gray.400')}
            fontWeight="500"
            display={{ base: 'none', sm: 'block' }}
          >
            Breakdown by category
          </Text>
        </VStack>
      </HStack>

      {/* Right side: Tab Buttons (Segmented Control style) */}
      <HStack 
        spacing={0} 
        p={1}
        bg={useColorModeValue('gray.100', 'gray.800')}
        borderRadius="xl"
        border="1px solid"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        w={{ base: 'full', sm: 'auto' }}
      >
        <Button
          size="sm"
          leftIcon={<Icon as={TrendingDown} boxSize={4} />}
          borderRadius="lg"
          fontSize="xs"
          fontWeight="600"
          h="32px"
          px={4}
          flex={{ base: 1, sm: 'auto' }}
          {...expenseStyles}
          onClick={() => onTabChange('expenses')}
          transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
        >
          Expenses
        </Button>
        <Button
          size="sm"
          leftIcon={<Icon as={TrendingUp} boxSize={4} />}
          borderRadius="lg"
          fontSize="xs"
          fontWeight="600"
          h="32px"
          px={4}
          flex={{ base: 1, sm: 'auto' }}
          {...incomeStyles}
          onClick={() => onTabChange('incomes')}
          transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
        >
          Incomes
        </Button>
      </HStack>
    </Flex>
  )
}
