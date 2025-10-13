import { Box, Text, SimpleGrid, Button, HStack } from '@chakra-ui/react'
import { useThemeColors } from '../../../hooks/useThemeColors'
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
        spacing={{ base: 3, sm: 3 }}
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
              size={{ base: 'md', sm: 'md' }}
              h={{ base: '60px', sm: '56px' }}
              fontSize={{ base: 'xs', sm: 'sm', md: 'sm' }}
              fontWeight="bold"
              borderWidth="2px"
              p={{ base: 3, sm: 2 }}
              _hover={{
                transform: 'translateY(-2px)',
                shadow: 'md',
              }}
              _active={{
                transform: 'translateY(0)',
              }}
              transition="all 0.2s"
            >
              <HStack spacing={{ base: 1.5, sm: 1, md: 1 }} justify="center" w="full">
                {/* Icon for category */}
                <IconComponent size={20} aria-hidden="true" />
                {/* Category label */}
                <Text
                  fontSize={{ base: 'xs', sm: 'sm', md: 'sm' }}
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
