import { 
  IconButton,
  Tooltip,
  useBreakpointValue,
  Icon
} from '@chakra-ui/react'
import { Home, List } from 'lucide-react'
import { getHeaderSearchButtonStyles } from '../../ui'

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
  const icon = isDashboard ? List : Home
  const label = isDashboard ? 'All Transactions' : 'Dashboard'
  const tooltip = isDashboard ? 'View all transactions' : 'Go to dashboard'

  return (
    <Tooltip label={tooltip} hasArrow>
      <IconButton
        icon={<Icon as={icon} boxSize={4} />}
        aria-label={label}
        onClick={() => onPageChange?.(isDashboard ? 'transactions' : 'dashboard')}
        size="sm"
        {...getHeaderSearchButtonStyles()}
      />
    </Tooltip>
  )
}
