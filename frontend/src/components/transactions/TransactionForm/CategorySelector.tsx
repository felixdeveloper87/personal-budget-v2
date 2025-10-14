import { Box, Text, SimpleGrid, Button, HStack } from '@chakra-ui/react'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { getResponsiveStyles } from '../../../utils/ui'
import {
  Briefcase,
  Laptop,
  TrendingUp,
  Building,
  Home,
  Gift,
  RotateCcw,
  FileText,
  ShoppingCart,
  Car,
  Film,
  Heart,
  Zap,
  ShoppingBag,
} from 'lucide-react'

// 🔹 Predefined categories for income transactions
const incomeCategories = [
  { name: 'Salary', icon: Briefcase },
  { name: 'Freelance', icon: Laptop },
  { name: 'Investments', icon: TrendingUp },
  { name: 'Business', icon: Building },
  { name: 'Rental', icon: Home },
  { name: 'Bonus', icon: Gift },
  { name: 'Refund', icon: RotateCcw },
  { name: 'Others', icon: FileText },
]

// 🔹 Predefined categories for expense transactions
const expenseCategories = [
  { name: 'Groceries', icon: ShoppingCart },
  { name: 'Rent', icon: Home },
  { name: 'Transport', icon: Car },
  { name: 'Entertainment', icon: Film },
  { name: 'Health', icon: Heart },
  { name: 'Utilities', icon: Zap },
  { name: 'Shopping', icon: ShoppingBag },
  { name: 'Others', icon: FileText },
]

interface CategorySelectorProps {
  type: 'INCOME' | 'EXPENSE'
  category: string
  onChange: (c: string) => void
}

/**
 * 💡 CategorySelector Component
 * - Displays a grid of category buttons depending on transaction type (INCOME / EXPENSE)
 * - Each button shows an icon + name
 * - The selected category is highlighted using a solid color scheme
 */
export default function CategorySelector({ type, category, onChange }: CategorySelectorProps) {
  const colors = useThemeColors()
  const responsiveStyles = getResponsiveStyles()

  // Pick the correct list based on transaction type
  const categories = type === 'INCOME' ? incomeCategories : expenseCategories

  return (
    <Box>
      {/* Section title */}
      <Text fontWeight="600" mb={3} color={colors.text.label} fontSize={{ base: 'sm', sm: 'md' }}>
        {type === 'INCOME' ? 'Income Category' : 'Expense Category'}
      </Text>

      {/* Responsive grid layout for category buttons */}
      <SimpleGrid
        columns={{ base: 2, sm: 3, md: 4 }}
        spacing={responsiveStyles.categoryList.spacing}
        w="full"
      >
        {categories.map((cat) => {
          const IconComponent = cat.icon
          const isSelected = category === cat.name

          return (
            <Button
              key={cat.name}
              aria-label={`Select ${cat.name} category`} // ♿ Accessibility: describes each button
              variant={isSelected ? 'solid' : 'outline'}
              colorScheme={isSelected ? 'blue' : 'gray'}
              borderRadius="xl"
              onClick={() => onChange(cat.name)}
              {...responsiveStyles.buttons.category}
              h={responsiveStyles.buttons.category.height}
              fontWeight="bold"
              borderWidth="2px"
              _hover={{
                transform: 'translateY(-2px)',
                shadow: 'md',
              }}
              _active={{
                transform: 'translateY(0)',
              }}
              transition="all 0.2s"
            >
              <HStack spacing={1} justify="center" w="full">
                {/* Icon for category */}
                <IconComponent size={16} aria-hidden="true" />
                {/* Category label */}
                <Text
                  fontSize={responsiveStyles.buttons.category.fontSize}
                  fontWeight="bold"
                  textAlign="center"
                  noOfLines={1}
                >
                  {cat.name}
                </Text>
              </HStack>
            </Button>
          )
        })}
      </SimpleGrid>
    </Box>
  )
}

