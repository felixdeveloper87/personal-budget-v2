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

export default function CategorySelector({ type, category, onChange }: CategorySelectorProps) {
  const colors = useThemeColors()
  const categories = type === 'INCOME' ? incomeCategories : expenseCategories

  return (
    <Box>
      <Text fontWeight="600" mb={3} color={colors.text.label}>
        {type === 'INCOME' ? 'Income Category' : 'Expense Category'}
      </Text>
      <SimpleGrid 
        columns={{ base: 2, sm: 3, md: 4 }} 
        spacing={{ base: 4, sm: 3 }}
        w="full"
      >
        {categories.map((cat) => {
          const IconComponent = cat.icon
          return (
            <Button
              key={cat.name}
              variant={category === cat.name ? 'solid' : 'outline'}
              colorScheme={category === cat.name ? 'blue' : 'gray'}
              borderRadius="xl"
              onClick={() => onChange(cat.name)}
              size={{ base: "md", sm: "sm" }}
              h={{ base: "60px", sm: "48px" }}
              fontSize={{ base: "sm", sm: "xs" }}
              fontWeight="bold"
              p={{ base: 2, sm: 1 }}
            >
              <HStack spacing={{ base: 2, sm: 1 }} justify="center" w="full">
                <IconComponent size={20} />
                <Text 
                  fontSize={{ base: "sm", sm: "xs" }}
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
