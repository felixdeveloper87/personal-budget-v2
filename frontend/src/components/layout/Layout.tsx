import { Box, Flex, useDisclosure } from '@chakra-ui/react'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Header from './Header'
import Footer from './Footer'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { user } = useAuth()

  const handleOpenSettings = () => {
    setSettingsOpen(true)
    console.log('Settings opened')
  }

  return (
    <Flex direction="column" minH="100vh">
      <Header onOpenSettings={handleOpenSettings} />

      <Box as="main" flex="1">
        {children}
      </Box>

      <Footer />
    </Flex>
  )
}
