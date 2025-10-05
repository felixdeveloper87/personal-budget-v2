import { Box, Spinner, Center, VStack, Text } from '@chakra-ui/react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Dashboard from './pages/Dashboard'
import { AuthPage, Layout } from './components'
import LandingPage from './pages/LandingPage'
import { useState, useEffect } from 'react'

function AppContent() {
  const { user, loading } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  // Reset showAuth quando o usuário faz logout (quando user se torna null)
  useEffect(() => {
    if (!user && !loading) {
      console.log('User is null and not loading, resetting showAuth to false')
      setShowAuth(false)
    }
  }, [user, loading])

  if (loading) {
    return (
      <Center minH="100vh" bg="gray.50" _dark={{ bg: "black" }}>
        <VStack spacing={4}>
          <Spinner 
            size="xl" 
            color="brand.500"
            thickness="4px"
            speed="0.8s"
            emptyColor="gray.200"
            _dark={{ emptyColor: "gray.700" }}
          />
          <Text color="gray.600" _dark={{ color: "gray.400" }} fontSize="sm">
            Loading your dashboard...
          </Text>
        </VStack>
      </Center>
    )
  }

  // Se usuário está logado, mostrar dashboard
  if (user) {
    return (
      <Layout>
        <Dashboard />
      </Layout>
    )
  }

  // Se não está logado e não clicou em "Começar", mostrar landing page
  if (!showAuth) {
    return <LandingPage onGetStarted={() => setShowAuth(true)} />
  }

  // Se clicou em "Começar", mostrar página de login/cadastro
  return <AuthPage onBackToLanding={() => setShowAuth(false)} />
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
