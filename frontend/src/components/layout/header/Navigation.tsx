import { HStack, Button } from '@chakra-ui/react'
import { getNavigationButtonStyles, navigationButtonSizes } from '../../ui'

interface NavigationProps {
  user?: any
  currentPage?: 'dashboard' | 'transactions'
  onPageChange?: (page: 'dashboard' | 'transactions') => void
}

export default function Navigation({ user, currentPage = 'dashboard', onPageChange }: NavigationProps) {
  if (!user) return null

  return (
    <HStack
      spacing={{ md: 2, lg: 3 }}
      ml={{ md: 6, lg: 10, xl: 14 }}
      display={{ base: 'none', md: 'flex' }}
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
    </HStack>
  )
}
