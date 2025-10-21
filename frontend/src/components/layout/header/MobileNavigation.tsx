import { 
  IconButton,
  Tooltip,
  useBreakpointValue,
  Icon
} from '@chakra-ui/react'
import { Home, FileText } from 'lucide-react'
import { getHeaderSearchButtonStyles, getResponsiveStyles } from '../../ui'
import { getSharedEffects, sharedHoverEffects, sharedTransitions, sharedSizes, getSharedColors } from '../../ui/sharedStyles'

interface MobileNavigationProps {
  user?: any
  currentPage?: 'dashboard' | 'transactions'
  onPageChange?: (page: 'dashboard' | 'transactions') => void
}

export default function MobileNavigation({ user, currentPage = 'dashboard', onPageChange }: MobileNavigationProps) {
  if (!user) return null

  const isMobile = useBreakpointValue({ base: true, md: false })

  if (!isMobile) return null

  const isDashboard = currentPage === 'dashboard'
  const icon = isDashboard ? FileText : Home
  const label = isDashboard ? 'All Transactions' : 'Dashboard'
  const tooltip = isDashboard ? 'View all transactions' : 'Go to dashboard'
  const sharedEffects = getSharedEffects()
  const sharedColors = getSharedColors()
  const responsive = getResponsiveStyles()

  return (
    <Tooltip label={tooltip} hasArrow>
      <IconButton
        icon={<Icon as={icon} />}
        aria-label={label}
        onClick={() => onPageChange?.(isDashboard ? 'transactions' : 'dashboard')}
        size={responsive.header.mobileIcons.search.size}
        fontSize={responsive.header.mobileIcons.search.fontSize}
        p={responsive.header.mobileIcons.search.padding}
        borderRadius={sharedSizes.borderRadius.md}
        {...getHeaderSearchButtonStyles()}
        boxShadow={sharedEffects.shadows.sm}
        _hover={{
          bg: sharedColors.gradients.gray,
          borderColor: 'blue.500',
          color: 'blue.500',
          transform: `${sharedHoverEffects.lift.small} scale(1.05)`,
          boxShadow: sharedEffects.shadows.md
        }}
        _active={{
          transform: `translateY(0px) scale(1.02)`,
          boxShadow: sharedEffects.shadows.sm
        }}
        transition={sharedTransitions.smooth}
      />
    </Tooltip>
  )
}
