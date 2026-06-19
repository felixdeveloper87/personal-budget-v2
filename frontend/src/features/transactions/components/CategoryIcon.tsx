import { Icon } from '@chakra-ui/react'
import type { IconProps as ChakraIconProps } from '@chakra-ui/react'
import { Play, Pill } from '@phosphor-icons/react'
import {
  Briefcase,
  Car,
  Clock,
  Home,
  RotateCcw,
  ShoppingBag,
  ShoppingCart,
  Coffee,
  Tag,
  Zap,
  type LucideIcon,
} from '../../../components/ui/icons'
import type { IconKey } from '../transactions.types'

const ICON_BY_KEY: Record<IconKey, LucideIcon> = {
  cart: ShoppingCart,
  cup: Coffee,
  car: Car,
  bag: ShoppingBag,
  play: Play as unknown as LucideIcon,
  pill: Pill as unknown as LucideIcon,
  bolt: Zap,
  house: Home,
  brief: Briefcase,
  refund: RotateCcw,
  tag: Tag,
}

interface CategoryIconProps extends ChakraIconProps {
  iconKey: IconKey
}

export default function CategoryIcon({ iconKey, ...props }: CategoryIconProps) {
  return <Icon as={ICON_BY_KEY[iconKey] ?? Tag} {...props} />
}

export { Clock }
