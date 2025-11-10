import { 
  IconButton,
  Tooltip,
  useBreakpointValue,
  Icon,
  HStack,
  useColorModeValue
} from '@chakra-ui/react'
import { Home, FileText, BarChart3 } from 'lucide-react'
import { getHeaderSearchButtonStyles, getResponsiveStyles } from '../../ui'
import { getSharedEffects, sharedHoverEffects, sharedTransitions, sharedSizes, getSharedColors } from '../../ui/sharedStyles'

interface MobileNavigationProps {
  user?: any
  currentPage?: 'dashboard' | 'transactions' | 'charts'
  onPageChange?: (page: 'dashboard' | 'transactions' | 'charts') => void
}

export default function MobileNavigation({ user, currentPage = 'dashboard', onPageChange }: MobileNavigationProps) {
  if (!user) return null

  const isMobile = useBreakpointValue({ base: true, md: false })

  if (!isMobile) return null

  const sharedEffects = getSharedEffects()
  const sharedColors = getSharedColors()
  const responsive = getResponsiveStyles()
  
  const activeBg = useColorModeValue('blue.100', 'blue.900')
  const activeColor = useColorModeValue('blue.600', 'blue.300')
  const activeBorder = useColorModeValue('blue.400', 'blue.500')

  const navigationItems = [
    { page: 'dashboard' as const, icon: Home, label: 'Dashboard', tooltip: 'Go to dashboard' },
    { page: 'transactions' as const, icon: FileText, label: 'Transactions', tooltip: 'View all transactions' },
    { page: 'charts' as const, icon: BarChart3, label: 'Charts', tooltip: 'View charts' },
  ]

  return (
    <HStack spacing={0.5}>
      {navigationItems.map((item) => {
        const isActive = currentPage === item.page
        return (
          <Tooltip key={item.page} label={item.tooltip} hasArrow>
            <IconButton
              icon={<Icon as={item.icon} boxSize={3.5} />}
              aria-label={item.label}
              onClick={() => onPageChange?.(item.page)}
              size="sm"
              fontSize="sm"
              p={1.5}
              minW="32px"
              h="32px"
              borderRadius={sharedSizes.borderRadius.md}
              {...getHeaderSearchButtonStyles()}
              boxShadow={sharedEffects.shadows.sm}
              bg={isActive ? activeBg : 'transparent'}
              color={isActive ? activeColor : undefined}
              borderColor={isActive ? activeBorder : undefined}
              _hover={{
                bg: isActive ? activeBg : sharedColors.gradients.gray,
                borderColor: isActive ? activeBorder : 'blue.500',
                color: isActive ? activeColor : 'blue.500',
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
      })}
    </HStack>
  )
}
