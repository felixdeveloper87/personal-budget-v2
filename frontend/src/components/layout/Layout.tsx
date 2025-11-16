import { Box, Flex } from '@chakra-ui/react'
import Header from './header/Header'
import Footer from './Footer'

interface LayoutProps {
  children: React.ReactNode
  currentPage?: 'dashboard' | 'transactions' | 'charts'
  onPageChange?: (page: 'dashboard' | 'transactions' | 'charts') => void
}

export default function Layout({ children, currentPage = 'dashboard', onPageChange }: LayoutProps) {
  const handleOpenSettings = () => {
    // TODO: Implement settings modal
    console.log('Settings clicked')
  }

  return (
    <Flex direction="column" minH="100vh">
      <Header 
        onOpenSettings={handleOpenSettings} 
        currentPage={currentPage}
        onPageChange={onPageChange}
      />

      <Box as="main" flex="1">
        {children}
      </Box>

      <Footer />
    </Flex>
  )
}
