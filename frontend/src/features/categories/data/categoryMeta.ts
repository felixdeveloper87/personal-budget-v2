import {
  Briefcase,
  Car,
  Coffee,
  CreditCard,
  Film,
  Gift,
  GraduationCap,
  Heart,
  Home,
  Laptop,
  LayoutDashboard,
  Percent,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Tag,
  TrendingUp,
  Wallet,
  Zap,
  type LucideIcon,
} from '../../../components/ui/icons'
import { CATEGORY_COLORS } from '../../dashboard/components/format'

/** Lowercased category name → sprite icon, mirroring the rest of the app. */
const ICON_BY_CATEGORY: Record<string, LucideIcon> = {
  salary: Briefcase,
  freelance: Laptop,
  investments: TrendingUp,
  rental: Home,
  rent: Home,
  housing: Home,
  bonus: Sparkles,
  gift: Gift,
  gifts: Gift,
  groceries: ShoppingCart,
  utilities: Zap,
  transport: Car,
  health: Heart,
  dining: Coffee,
  'dining out': Coffee,
  shopping: ShoppingBag,
  subscriptions: CreditCard,
  entertainment: Film,
  insurance: ShieldCheck,
  education: GraduationCap,
  refund: RotateCcw,
  refunds: RotateCcw,
  savings: Wallet,
  others: LayoutDashboard,
  other: LayoutDashboard,
  overdraft: Percent,
  interest: Percent,
  'juros overdraft': Percent,
}

export function iconForCategory(category: string): LucideIcon {
  return ICON_BY_CATEGORY[category.trim().toLowerCase()] ?? Tag
}

/** Stable colour per category name so a slice keeps its colour across views/sides. */
export function colorForCategory(category: string): string {
  const key = category.trim().toLowerCase()
  let h = 0
  for (let i = 0; i < key.length; i += 1) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0
  }
  return CATEGORY_COLORS[h % CATEGORY_COLORS.length]
}
