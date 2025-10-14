import { Box, Flex, useDisclosure } from '@chakra-ui/react'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Header from './header/Header'
import Footer from './Footer'

interface LayoutProps {
  children: React.ReactNode
  currentPage?: 'dashboard' | 'transactions'
  onPageChange?: (page: 'dashboard' | 'transactions') => void
}

export default function Layout({ children, currentPage = 'dashboard', onPageChange }: LayoutProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { user } = useAuth()

  const handleOpenSettings = () => {
    setSettingsOpen(true)
    console.log('Settings opened')
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
