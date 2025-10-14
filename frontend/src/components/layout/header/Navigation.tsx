import { HStack, Button, useColorModeValue } from '@chakra-ui/react'

interface NavigationProps {
  user?: any
  currentPage?: 'dashboard' | 'transactions'
  onPageChange?: (page: 'dashboard' | 'transactions') => void
}

export default function Navigation({ user, currentPage = 'dashboard', onPageChange }: NavigationProps) {
  const textColor = useColorModeValue('gray.800', 'white')

  if (!user) return null

  return (
    <HStack
      spacing={{ md: 2, lg: 3 }}
      ml={{ md: 6, lg: 10, xl: 14 }}
      display={{ base: 'none', md: 'flex' }}
    >
      <Button 
        variant="ghost" 
        size={{ md: "md", lg: "lg", xl: "lg" }}
        fontWeight="800"
        fontSize={{ md: "md", lg: "lg", xl: "xl" }}
        color={currentPage === 'dashboard' ? 'white' : textColor}
        bg={currentPage === 'dashboard' ? 
          useColorModeValue(
            'linear-gradient(135deg, #3b82f6, #1d4ed8, #7c3aed)',
            'linear-gradient(135deg, #60a5fa, #3b82f6, #a78bfa)'
          ) : 
          'transparent'
        }
        _hover={{ 
          bg: currentPage === 'dashboard' ? 
            useColorModeValue(
              'linear-gradient(135deg, #2563eb, #1e40af, #6d28d9)',
              'linear-gradient(135deg, #3b82f6, #2563eb, #8b5cf6)'
            ) :
            useColorModeValue(
              'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
              'linear-gradient(135deg, #334155, #475569)'
            ),
          color: currentPage === 'dashboard' ? 'white' : 'blue.500',
          transform: 'translateY(-2px) scale(1.02)',
          boxShadow: currentPage === 'dashboard' ? 
            useColorModeValue(
              '0 12px 35px rgba(59, 130, 246, 0.4)',
              '0 12px 35px rgba(96, 165, 250, 0.5)'
            ) : 
            useColorModeValue(
              '0 8px 25px rgba(0, 0, 0, 0.1)',
              '0 8px 25px rgba(0, 0, 0, 0.3)'
            )
        }}
        onClick={() => onPageChange?.('dashboard')}
        borderRadius="2xl"
        px={{ md: 6, lg: 8, xl: 10 }}
        py={{ md: 3, lg: 4, xl: 5 }}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        boxShadow={currentPage === 'dashboard' ? 
          useColorModeValue(
            '0 8px 25px rgba(59, 130, 246, 0.3)',
            '0 8px 25px rgba(96, 165, 250, 0.4)'
          ) : 
          'none'
        }
        letterSpacing="wide"
      >
        Dashboard
      </Button>
      <Button 
        variant="ghost"
        size={{ md: "md", lg: "lg", xl: "lg" }}
        fontWeight="800"
        fontSize={{ md: "md", lg: "lg", xl: "xl" }}
        color={currentPage === 'transactions' ? 'white' : textColor}
        bg={currentPage === 'transactions' ? 
          useColorModeValue(
            'linear-gradient(135deg, #3b82f6, #1d4ed8, #7c3aed)',
            'linear-gradient(135deg, #60a5fa, #3b82f6, #a78bfa)'
          ) : 
          'transparent'
        }
        _hover={{ 
          bg: currentPage === 'transactions' ? 
            useColorModeValue(
              'linear-gradient(135deg, #2563eb, #1e40af, #6d28d9)',
              'linear-gradient(135deg, #3b82f6, #2563eb, #8b5cf6)'
            ) :
            useColorModeValue(
              'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
              'linear-gradient(135deg, #334155, #475569)'
            ),
          color: currentPage === 'transactions' ? 'white' : 'blue.500',
          transform: 'translateY(-2px) scale(1.02)',
          boxShadow: currentPage === 'transactions' ? 
            useColorModeValue(
              '0 12px 35px rgba(59, 130, 246, 0.4)',
              '0 12px 35px rgba(96, 165, 250, 0.5)'
            ) : 
            useColorModeValue(
              '0 8px 25px rgba(0, 0, 0, 0.1)',
              '0 8px 25px rgba(0, 0, 0, 0.3)'
            )
        }}
        onClick={() => onPageChange?.('transactions')}
        borderRadius="2xl"
        px={{ md: 6, lg: 8, xl: 10 }}
        py={{ md: 3, lg: 4, xl: 5 }}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        boxShadow={currentPage === 'transactions' ? 
          useColorModeValue(
            '0 8px 25px rgba(59, 130, 246, 0.3)',
            '0 8px 25px rgba(96, 165, 250, 0.4)'
          ) : 
          'none'
        }
        letterSpacing="wide"
      >
        Transactions
      </Button>
    </HStack>
  )
}
