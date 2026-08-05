import { Spinner, Center, VStack, Text } from '@chakra-ui/react'
import { useAuth } from './contexts/AuthContext'
import Dashboard from './pages/Dashboard'
import BehaviourPage from './pages/BehaviourPage'
import EarningsPage from './pages/EarningsPage'
import AllTransactionsPage from './pages/AllTransactionsPage'
import PaymentsPage from './pages/PaymentsPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import ReportsPage from './pages/ReportsPage'
import AccountsPage from './pages/AccountsPage'
import CardsPage from './pages/CardsPage'
import TransfersPage from './pages/TransfersPage'
import CommitmentsPage from './pages/CommitmentsPage'
import GoalsPage from './pages/GoalsPage'
import PlanningPage from './pages/PlanningPage'
import HouseholdPage from './pages/HouseholdPage'
import { AuthModal, Layout } from './components'
import LandingV3 from './pages/landing-v3/LandingV3'
import { useState, useEffect, useCallback } from 'react'
import type { AppPage } from './components/layout/header/navigation.config'

interface PageRenderArgs {
  onPageChange: (page: AppPage) => void
  cardStatementTarget: CardStatementTarget | null
  onOpenCardStatement: (target: CardStatementTarget) => void
  onCardStatementTargetHandled: () => void
}

interface CardStatementTarget {
  cardId: number
  paymentDate: string
}

const PAGE_RENDERERS: Record<AppPage, (args: PageRenderArgs) => JSX.Element> = {
  dashboard: ({ onPageChange }) => <Dashboard onPageChange={onPageChange} />,
  household: () => <HouseholdPage />,
  accounts: ({ onPageChange }) => <AccountsPage onPageChange={onPageChange} />,
  cards: ({ cardStatementTarget, onCardStatementTargetHandled }) => (
    <CardsPage statementTarget={cardStatementTarget} onStatementTargetHandled={onCardStatementTargetHandled} />
  ),
  transfers: ({ onPageChange }) => <TransfersPage onPageChange={onPageChange} />,
  installments: ({ onPageChange }) => <CommitmentsPage onPageChange={onPageChange} initialTab="installments" />,
  'fixed-payments': ({ onPageChange }) => <CommitmentsPage onPageChange={onPageChange} initialTab="fixed" />,
  commitments: ({ onPageChange }) => <CommitmentsPage onPageChange={onPageChange} />,
  behaviour: () => <BehaviourPage />,
  earnings: () => <EarningsPage />,
  'all-transactions': () => <AllTransactionsPage />,
  payments: ({ onOpenCardStatement }) => <PaymentsPage onOpenCardStatement={onOpenCardStatement} />,
  goals: () => <GoalsPage />,
  planning: ({ onPageChange }) => <PlanningPage onPageChange={onPageChange} />,
  reports: () => <ReportsPage />,
  admin: ({ onPageChange }) => <AdminDashboardPage onPageChange={onPageChange} />,
}

function pageFromBrowserLocation(): AppPage {
  if (window.location.pathname === '/household') return 'household'
  const statePage = window.history.state?.appPage
  return typeof statePage === 'string' && statePage in PAGE_RENDERERS
    ? statePage as AppPage
    : 'dashboard'
}

function AppContent() {
  const { user, loading } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [currentPage, setCurrentPage] = useState<AppPage>(pageFromBrowserLocation)
  const [cardStatementTarget, setCardStatementTarget] = useState<CardStatementTarget | null>(null)

  const navigateToPage = useCallback((page: AppPage) => {
    setCurrentPage(page)
    const nextPath = page === 'household' ? '/household' : '/'
    const nextState = { ...(window.history.state ?? {}), appPage: page }
    if (window.location.pathname !== nextPath) {
      window.history.pushState(nextState, '', nextPath)
    } else {
      window.history.replaceState(nextState, '', nextPath)
    }
  }, [])

  const openCardStatement = (target: CardStatementTarget) => {
    setCardStatementTarget(target)
    navigateToPage('cards')
  }

  useEffect(() => {
    const onPopState = () => setCurrentPage(pageFromBrowserLocation())
    window.addEventListener('popstate', onPopState)
    window.history.replaceState(
      { ...(window.history.state ?? {}), appPage: currentPage },
      '',
      window.location.pathname,
    )
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (user?.admin) {
      setCurrentPage('admin')
    } else if (user) {
      setCurrentPage(pageFromBrowserLocation())
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
          onPageChange={navigateToPage}
          showFooter={false}
        >
          <AdminDashboardPage onPageChange={navigateToPage} />
        </Layout>
      )
    }

    const renderPage = PAGE_RENDERERS[currentPage] ?? PAGE_RENDERERS.dashboard
    return (
      <Layout currentPage={currentPage} onPageChange={navigateToPage}>
        {renderPage({
          onPageChange: navigateToPage,
          cardStatementTarget,
          onOpenCardStatement: openCardStatement,
          onCardStatementTargetHandled: () => setCardStatementTarget(null),
        })}
      </Layout>
    )
  }

  // Se não está logado e não clicou em "Começar", mostrar landing page
  if (!showAuth) {
    return (
      <>
        <LandingV3 onGetStarted={() => setShowAuth(true)} />
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
      <LandingV3 onGetStarted={() => setShowAuth(true)} />
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
