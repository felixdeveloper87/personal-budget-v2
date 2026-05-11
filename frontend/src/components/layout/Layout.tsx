import { Box, Flex } from '@chakra-ui/react'
import Header from './header/Header'
import Footer from './Footer'
import type { AppPage } from './header/navigation.config'

interface LayoutProps {
  children: React.ReactNode
  currentPage?: AppPage
  onPageChange?: (page: AppPage) => void
  /** Set false for admin-only shell (no marketing footer). */
  showFooter?: boolean
}

export default function Layout({
  children,
  currentPage = 'dashboard',
  onPageChange,
  showFooter = true,
}: LayoutProps) {
  const handleOpenSettings = () => {
    // TODO: Implement settings modal
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

      {showFooter ? <Footer /> : null}
    </Flex>
  )
}
