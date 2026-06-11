import { Spinner, Center, VStack, Text } from '@chakra-ui/react'
import { useAuth } from './contexts/AuthContext'
import Dashboard from './pages/Dashboard'
import TransactionsPage from './pages/TransactionsPage'
import AllTransactionsPage from './pages/AllTransactionsPage'
import CategoriesPage from './pages/CategoriesPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import ReportsPage from './pages/ReportsPage'
import AccountsPage from './pages/AccountsPage'
import TransfersPage from './pages/TransfersPage'
import InstallmentsPage from './pages/InstallmentsPage'
import FixedPaymentsPage from './pages/FixedPaymentsPage'
import GoalsPage from './pages/GoalsPage'
import PlanningPage from './pages/PlanningPage'
import { AuthModal, Layout } from './components'
import LandingPage from './pages/LandingPage'
import { useState, useEffect } from 'react'
import type { AppPage } from './components/layout/header/navigation.config'

interface PageRenderArgs {
  onPageChange: (page: AppPage) => void
}

const PAGE_RENDERERS: Record<AppPage, (args: PageRenderArgs) => JSX.Element> = {
  dashboard: ({ onPageChange }) => <Dashboard onPageChange={onPageChange} />,
  accounts: ({ onPageChange }) => <AccountsPage onPageChange={onPageChange} />,
  transfers: ({ onPageChange }) => <TransfersPage onPageChange={onPageChange} />,
  installments: ({ onPageChange }) => <InstallmentsPage onPageChange={onPageChange} />,
  'fixed-payments': ({ onPageChange }) => <FixedPaymentsPage onPageChange={onPageChange} />,
  transactions: () => <TransactionsPage />,
  'all-transactions': () => <AllTransactionsPage />,
  categories: () => <CategoriesPage />,
  goals: () => <GoalsPage />,
  planning: ({ onPageChange }) => <PlanningPage onPageChange={onPageChange} />,
  reports: () => <ReportsPage />,
  admin: ({ onPageChange }) => <AdminDashboardPage onPageChange={onPageChange} />,
}

function AppContent() {
  const { user, loading } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard')

  useEffect(() => {
    if (user?.admin) {
      setCurrentPage('admin')
    }
  }, [user?.admin, user?.id])

  useEffect(() => {
    if (user && currentPage === 'admin' && !user.admin) {
      setCurrentPage('dashboard')
    }
  }, [user, currentPage])

  useEffect(() => {
    if (!user && !loading) {
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
    if (user.admin) {
      return (
        <Layout
          currentPage="admin"
          onPageChange={setCurrentPage}
          showFooter={false}
        >
          <AdminDashboardPage onPageChange={setCurrentPage} />
        </Layout>
      )
    }

    const renderPage = PAGE_RENDERERS[currentPage] ?? PAGE_RENDERERS.dashboard
    return (
      <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderPage({
          onPageChange: setCurrentPage,
        })}
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
      />
    </>
  )
}

export default function App() {
  return <AppContent />
}
