import { HStack, Button } from '@chakra-ui/react'
import { getNavigationButtonStyles, navigationButtonSizes } from '../../ui'

interface NavigationProps {
  user?: any
  currentPage?: 'dashboard' | 'transactions' | 'charts'
  onPageChange?: (page: 'dashboard' | 'transactions' | 'charts') => void
}

export default function Navigation({ user, currentPage = 'dashboard', onPageChange }: NavigationProps) {
  if (!user) return null

  return (
    <HStack
      spacing={{ md: 1, lg: 2, xl: 3 }}
      ml={{ md: 2, lg: 4, xl: 6 }}
      display={{ base: 'none', md: 'flex' }}
      flexShrink={0}
    >
      <Button 
        {...getNavigationButtonStyles(currentPage === 'dashboard')}
        {...navigationButtonSizes}
        onClick={() => onPageChange?.('dashboard')}
      >
        Dashboard
      </Button>
      <Button 
        {...getNavigationButtonStyles(currentPage === 'transactions')}
        {...navigationButtonSizes}
        onClick={() => onPageChange?.('transactions')}
      >
        Transactions
      </Button>
      <Button 
        {...getNavigationButtonStyles(currentPage === 'charts')}
        {...navigationButtonSizes}
        onClick={() => onPageChange?.('charts')}
      >
        Charts
      </Button>
    </HStack>
  )
}
