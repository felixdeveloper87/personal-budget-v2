import { Spinner, Center, VStack, Text } from '@chakra-ui/react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Dashboard from './pages/Dashboard'
import AllTransactionsPage from './pages/AllTransactionsPage'
import ChartsPage from './pages/ChartsPage'
import CategoriesPage from './pages/CategoriesPage'
import { AuthModal, Layout } from './components'
import LandingPage from './pages/LandingPage'
import { useState, useEffect } from 'react'
import type { AppPage } from './components/layout/header/navigation.config'

const PAGE_RENDERERS: Record<AppPage, () => JSX.Element> = {
  dashboard: () => <Dashboard />,
  transactions: () => <AllTransactionsPage />,
  categories: () => <CategoriesPage />,
  charts: () => <ChartsPage />,
}

function AppContent() {
  const { user, loading } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard')

  // Reset showAuth quando o usuário faz logout ?(quando user se torna null)
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

  // Se usuário está logado, mostrar página atual
  if (user) {
    const renderPage = PAGE_RENDERERS[currentPage] ?? PAGE_RENDERERS.dashboard
    return (
      <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderPage()}
      </Layout>
    )
  }

  // Se não está logado e não clicou em "Começar", mostrar landing page
  if (!showAuth) {
    return (
      <>
        <LandingPage onGetStarted={() => setShowAuth(true)} />
        <AuthModal 
          isOpen={showAuth} 
          onClose={() => setShowAuth(false)} 
          onBackToLanding={() => setShowAuth(false)} 
        />
      </>
    )
  }

  // Se clicou em "Começar", mostrar modal de login/cadastro
  return (
    <>
      <LandingPage onGetStarted={() => setShowAuth(true)} />
      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
        onBackToLanding={() => setShowAuth(false)} 
      />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
