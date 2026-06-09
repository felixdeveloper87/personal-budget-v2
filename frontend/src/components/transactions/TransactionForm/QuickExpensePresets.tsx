import {
  Box,
  Button,
  HStack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  Car,
  Coffee,
  Globe,
  Heart,
  ShoppingBag,
  ShoppingCart,
  Zap,
  type LucideIcon,
} from '../../ui/icons'

interface ExpensePreset {
  label: string
  category: string
  icon: LucideIcon
}

const PRIMARY_PRESETS: ReadonlyArray<ExpensePreset> = [
  { label: 'Lidl', category: 'Groceries', icon: ShoppingCart },
  { label: "Sainsbury's", category: 'Groceries', icon: ShoppingCart },
  { label: 'Aldi', category: 'Groceries', icon: ShoppingCart },
  { label: "Tesco", category: 'Groceries', icon: ShoppingCart },
  { label: 'Off-licence', category: 'Groceries', icon: Coffee },
  { label: 'Morrisons', category: 'Groceries', icon: ShoppingCart },
  { label: 'Asda', category: 'Groceries', icon: ShoppingCart },
  { label: 'Waitrose', category: 'Groceries', icon: ShoppingCart },
  { label: 'Co-op', category: 'Groceries', icon: ShoppingCart },
  { label: 'Iceland', category: 'Groceries', icon: ShoppingCart },

  { label: 'Boots', category: 'Health', icon: Heart },
  { label: 'Holland & Barrett', category: 'Health', icon: Heart },
  { label: 'Superdrug', category: 'Health', icon: Heart },

  { label: 'Petrol', category: 'Transport', icon: Car },
  { label: 'Oil change', category: 'Transport', icon: Car },
  { label: 'General Maintenance', category: 'Transport', icon: Car },

  { label: 'Primark', category: 'Shopping', icon: ShoppingBag },
  { label: 'Zara', category: 'Shopping', icon: ShoppingBag },
  { label: 'H&M', category: 'Shopping', icon: ShoppingBag },
  { label: 'Next', category: 'Shopping', icon: ShoppingBag },
  { label: 'New Look', category: 'Shopping', icon: ShoppingBag },
  { label: 'River Island', category: 'Shopping', icon: ShoppingBag },
  { label: 'ASOS', category: 'Shopping', icon: ShoppingBag },

  { label: 'Gas', category: 'Utilities', icon: Zap },
  { label: 'Energy', category: 'Utilities', icon: Zap },
  { label: 'Water', category: 'Utilities', icon: Zap },
  { label: 'Internet', category: 'Utilities', icon: Globe },

  { label: 'YouTube Premium', category: 'Subscriptions', icon: ShoppingBag },
  { label: 'Claude', category: 'Subscriptions', icon: ShoppingBag },
  { label: 'ChatGPT Plus', category: 'Subscriptions', icon: ShoppingBag },
  { label: 'Apple Music', category: 'Subscriptions', icon: ShoppingBag },
  { label: 'Spotify', category: 'Subscriptions', icon: ShoppingBag },
  { label: 'Netflix', category: 'Subscriptions', icon: ShoppingBag },
  { label: 'Amazon Prime', category: 'Subscriptions', icon: ShoppingBag },
  { label: 'Disney+', category: 'Subscriptions', icon: ShoppingBag },
]

interface QuickExpensePresetsProps {
  category: string
  onSelect: (preset: { description: string; category: string }) => void
}

export default function QuickExpensePresets({
  category,
  onSelect,
}: QuickExpensePresetsProps) {
  const labelColor = useColorModeValue('gray.500', 'gray.400')
  const chipBg = useColorModeValue('white', 'whiteAlpha.50')
  const chipBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const chipColor = useColorModeValue('gray.700', 'gray.200')
  const chipHoverBg = useColorModeValue('gray.50', 'whiteAlpha.100')

  const applyPreset = (preset: ExpensePreset) => {
    onSelect({
      description: preset.label,
      category: preset.category,
    })
  }

  const presets = PRIMARY_PRESETS.filter(
    preset => preset.category === category,
  )

  if (presets.length === 0) return null

  return (
    <Box>
      <Text
        mb={2}
        fontSize="xs"
        fontWeight={700}
        color={labelColor}
        textTransform="uppercase"
        letterSpacing="0.05em"
      >
        Quick add for {category}
      </Text>

      <HStack
        spacing={2}
        overflowX="auto"
        pb={1}
        sx={{
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {presets.map((preset) => {
          const PresetIcon = preset.icon

          return (
            <Button
              key={preset.label}
              size="sm"
              h="34px"
              px={3}
              flexShrink={0}
              borderRadius="full"
              border="1px solid"
              borderColor={chipBorder}
              bg={chipBg}
              color={chipColor}
              fontSize="xs"
              fontWeight={600}
              leftIcon={<PresetIcon size={15} aria-hidden />}
              onClick={() => applyPreset(preset)}
              _hover={{ bg: chipHoverBg, borderColor: 'red.200' }}
            >
              {preset.label}
            </Button>
          )
        })}
      </HStack>
    </Box>
  )
}
