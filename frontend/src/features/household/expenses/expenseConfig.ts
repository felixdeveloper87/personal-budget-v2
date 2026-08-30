import { Building, Broom, CookingPot, Drop, Flame, Gear, Home, Lightbulb, Plant, ShoppingCart, Tag, ToiletPaper, WifiHigh, Zap, type LucideIcon } from '../../../components/ui/icons'

export const CATEGORIES = [
  'Electricity',
  'Water',
  'Gas',
  'Internet',
  'Groceries',
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
    color: '#D97706',
    tint: 'rgba(245, 158, 11, 0.14)',
    gradient: 'linear(to-br, #F59E0B, #D97706)',
  },
  {
    key: 'water',
    category: 'Water',
    icon: Drop,
    color: '#0284C7',
    tint: 'rgba(14, 165, 233, 0.14)',
    gradient: 'linear(to-br, #38BDF8, #0284C7)',
  },
  {
    key: 'gas',
    category: 'Gas',
    icon: Flame,
    color: '#E11D48',
    tint: 'rgba(244, 63, 94, 0.14)',
    gradient: 'linear(to-br, #FB7185, #E11D48)',
  },
  {
    key: 'internet',
    category: 'Internet',
    icon: WifiHigh,
    color: '#7C3AED',
    tint: 'rgba(139, 92, 246, 0.14)',
    gradient: 'linear(to-br, #A78BFA, #7C3AED)',
  },
  {
    key: 'cleaning',
    category: 'Cleaning',
    icon: Broom,
    color: '#059669',
    tint: 'rgba(16, 185, 129, 0.14)',
    gradient: 'linear(to-br, #34D399, #059669)',
  },
  {
    key: 'garden',
    category: 'Garden',
    icon: Plant,
    color: '#65A30D',
    tint: 'rgba(132, 204, 22, 0.14)',
    gradient: 'linear(to-br, #A3E635, #65A30D)',
  },
  {
    key: 'kitchen',
    category: 'Groceries',
    icon: CookingPot,
    color: '#EA580C',
    tint: 'rgba(249, 115, 22, 0.14)',
    gradient: 'linear(to-br, #FB923C, #EA580C)',
  },
  {
    key: 'toilet',
    category: 'Cleaning',
    icon: ToiletPaper,
    color: '#0D9488',
    tint: 'rgba(20, 184, 166, 0.14)',
    gradient: 'linear(to-br, #2DD4BF, #0D9488)',
  },
]

export function getHouseholdCategoryConfig(category?: string) {
  switch (category) {
    case 'Electricity':
      return { icon: Zap, color: 'var(--pb-gold)', bg: 'var(--pb-tint-gold)' }
    case 'Water':
      return { icon: Drop, color: '#0284c7', bg: 'rgba(2, 132, 199, 0.12)' }
    case 'Gas':
      return { icon: Flame, color: 'var(--pb-coral)', bg: 'var(--pb-tint-coral)' }
    case 'Internet':
      return { icon: WifiHigh, color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.12)' }
    case 'Groceries':
      return { icon: ShoppingCart, color: 'var(--pb-forest-2)', bg: 'var(--pb-tint-green)' }
    case 'Cleaning':
      return { icon: Broom, color: '#0d9488', bg: 'rgba(13, 148, 136, 0.12)' }
    case 'Rent':
      return { icon: Home, color: '#4f46e5', bg: 'rgba(79, 70, 229, 0.12)' }
    case 'Council tax':
      return { icon: Building, color: 'var(--pb-ink-soft)', bg: 'var(--pb-surface-3)' }
    case 'Repairs':
      return { icon: Gear, color: 'var(--pb-gold)', bg: 'var(--pb-tint-gold)' }
    case 'Garden':
      return { icon: Plant, color: 'var(--pb-income)', bg: 'var(--pb-tint-income)' }
    default:
      return { icon: Tag, color: 'var(--pb-ink-soft)', bg: 'var(--pb-surface-3)' }
  }
}
