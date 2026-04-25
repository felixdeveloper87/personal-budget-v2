import { HStack, Button, Icon, useColorModeValue } from '@chakra-ui/react'
import { LayoutDashboard, ReceiptText, ChartColumn } from 'lucide-react'

interface NavigationProps {
  user?: any
  currentPage?: 'dashboard' | 'transactions' | 'charts'
  onPageChange?: (page: 'dashboard' | 'transactions' | 'charts') => void
}

export default function Navigation({ user, currentPage = 'dashboard', onPageChange }: NavigationProps) {
  if (!user) return null

  const navBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')
  const inactiveColor = useColorModeValue('gray.600', 'gray.300')
  const activeBg = useColorModeValue('white', 'whiteAlpha.200')
  const activeColor = useColorModeValue('blue.600', 'blue.200')
  const activeBorderColor = useColorModeValue('blue.100', 'blue.500')
  const containerBorderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.200')
  const hoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')
  const hoverColor = useColorModeValue('gray.800', 'white')

  return (
    <HStack
      spacing={1}
      ml={{ md: 2, lg: 4, xl: 6 }}
      display={{ base: 'none', lg: 'flex' }}
      flexShrink={0}
      p={1}
      borderRadius="xl"
      bg={navBg}
      border="1px solid"
      borderColor={containerBorderColor}
      backdropFilter="blur(6px)"
    >
      {[
        { key: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
        { key: 'transactions' as const, label: 'Transactions', icon: ReceiptText },
        { key: 'charts' as const, label: 'Charts', icon: ChartColumn },
      ].map((item) => {
        const isActive = currentPage === item.key

        return (
          <Button
            key={item.key}
            leftIcon={<Icon as={item.icon} boxSize={4} />}
            onClick={() => onPageChange?.(item.key)}
            size="sm"
            px={3}
            borderRadius="lg"
            fontWeight={isActive ? '700' : '600'}
            variant="ghost"
            bg={isActive ? activeBg : 'transparent'}
            color={isActive ? activeColor : inactiveColor}
            border="1px solid"
            borderColor={isActive ? activeBorderColor : 'transparent'}
            boxShadow={isActive ? 'sm' : 'none'}
            _hover={{
              bg: isActive ? activeBg : hoverBg,
              color: isActive ? activeColor : hoverColor,
              transform: 'translateY(-1px)',
            }}
            _active={{ transform: 'translateY(0)' }}
            transition="all 0.2s ease"
          >
            {item.label}
          </Button>
        )
      })}
    </HStack>
  )
}
