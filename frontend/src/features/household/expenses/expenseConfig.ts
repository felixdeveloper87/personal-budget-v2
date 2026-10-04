import { Building, Broom, CookingPot, Drop, Flame, Gear, Home, Lightbulb, Plant, ShoppingCart, Tag, ToiletPaper, WifiHigh, Zap, type LucideIcon } from '../../../components/ui/icons'

export const CATEGORIES = [
  'Groceries',
  'Electricity',
  'Water',
  'Gas',
  'Internet',
  'Cleaning',
  'Rent',
  'Council tax',
  'Repairs',
  'Garden',
  'Other',
] as const

export type HouseholdExpensePreset = {
  key: 'electricity' | 'water' | 'gas' | 'internet' | 'cleaning' | 'garden' | 'kitchen' | 'toilet'
  category: typeof CATEGORIES[number]
  icon: LucideIcon
  color: string
  tint: string
  gradient: string
}

export const HOUSEHOLD_EXPENSE_PRESETS: ReadonlyArray<HouseholdExpensePreset> = [
  {
    key: 'electricity',
    category: 'Electricity',
    icon: Lightbulb,
    color: 'var(--pb-forest)',
    tint: 'var(--pb-tint-green)',
    gradient: 'linear(to-br, #A04DE6, #820AD1)',
  },
  {
    key: 'water',
    category: 'Water',
    icon: Drop,
    color: 'var(--pb-forest)',
    tint: 'var(--pb-tint-green)',
    gradient: 'linear(to-br, #A04DE6, #820AD1)',
  },
  {
    key: 'gas',
    category: 'Gas',
    icon: Flame,
    color: 'var(--pb-forest)',
    tint: 'var(--pb-tint-green)',
    gradient: 'linear(to-br, #A04DE6, #820AD1)',
  },
  {
    key: 'internet',
    category: 'Internet',
    icon: WifiHigh,
    color: 'var(--pb-forest)',
    tint: 'var(--pb-tint-green)',
    gradient: 'linear(to-br, #A04DE6, #820AD1)',
  },
  {
    key: 'cleaning',
    category: 'Cleaning',
    icon: Broom,
    color: 'var(--pb-forest)',
    tint: 'var(--pb-tint-green)',
    gradient: 'linear(to-br, #A04DE6, #820AD1)',
  },
  {
    key: 'garden',
    category: 'Garden',
    icon: Plant,
    color: 'var(--pb-forest)',
    tint: 'var(--pb-tint-green)',
    gradient: 'linear(to-br, #A04DE6, #820AD1)',
  },
  {
    key: 'kitchen',
    category: 'Groceries',
    icon: CookingPot,
    color: 'var(--pb-forest)',
    tint: 'var(--pb-tint-green)',
    gradient: 'linear(to-br, #A04DE6, #820AD1)',
  },
  {
    key: 'toilet',
    category: 'Cleaning',
    icon: ToiletPaper,
    color: 'var(--pb-forest)',
    tint: 'var(--pb-tint-green)',
    gradient: 'linear(to-br, #A04DE6, #820AD1)',
  },
]

export function getHouseholdCategoryConfig(category?: string) {
  switch (category) {
    case 'Electricity':
      return { icon: Zap, color: 'var(--pb-forest)', bg: 'var(--pb-tint-green)' }
    case 'Water':
      return { icon: Drop, color: 'var(--pb-forest)', bg: 'var(--pb-tint-green)' }
    case 'Gas':
      return { icon: Flame, color: 'var(--pb-forest)', bg: 'var(--pb-tint-green)' }
    case 'Internet':
      return { icon: WifiHigh, color: 'var(--pb-forest)', bg: 'var(--pb-tint-green)' }
    case 'Groceries':
      return { icon: ShoppingCart, color: 'var(--pb-forest)', bg: 'var(--pb-tint-green)' }
    case 'Cleaning':
      return { icon: Broom, color: 'var(--pb-forest)', bg: 'var(--pb-tint-green)' }
    case 'Rent':
      return { icon: Home, color: 'var(--pb-forest)', bg: 'var(--pb-tint-green)' }
    case 'Council tax':
      return { icon: Building, color: 'var(--pb-forest)', bg: 'var(--pb-tint-green)' }
    case 'Repairs':
      return { icon: Gear, color: 'var(--pb-forest)', bg: 'var(--pb-tint-green)' }
    case 'Garden':
      return { icon: Plant, color: 'var(--pb-forest)', bg: 'var(--pb-tint-green)' }
    default:
      return { icon: Tag, color: 'var(--pb-forest)', bg: 'var(--pb-tint-green)' }
  }
}
