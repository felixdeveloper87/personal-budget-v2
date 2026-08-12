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
import CommitmentsPage from './pages/CommitmentsPage'
import GoalsPage from './pages/GoalsPage'
import PlanningPage from './pages/PlanningPage'
import HouseholdPage from './pages/HouseholdPage'
import { AuthModal, Layout } from './components'
import LandingV3 from './pages/landing-v3/LandingV3'
import { useState, useEffect, useCallback } from 'react'
import type { AppPage } from './components/layout/header/navigation.config'
import { useI18n } from './i18n'

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
  accounts: () => <AccountsPage />,
  cards: ({ cardStatementTarget, onCardStatementTargetHandled }) => (
    <CardsPage statementTarget={cardStatementTarget} onStatementTargetHandled={onCardStatementTargetHandled} />
  ),
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

function authTabFromBrowserLocation(): 'signIn' | 'signUp' | null {
  const value = new URLSearchParams(window.location.search).get('auth')
  if (value === 'signup') return 'signUp'
  if (value === 'signin') return 'signIn'
  return null
}

function AppContent() {
  const { user, loading } = useAuth()
  const { t } = useI18n()
  const [showAuth, setShowAuth] = useState(() => authTabFromBrowserLocation() !== null)
  const [authTab, setAuthTab] = useState<'signIn' | 'signUp'>(
    () => authTabFromBrowserLocation() ?? 'signIn',
  )
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

  const openAuth = (tab: 'signIn' | 'signUp') => {
    setAuthTab(tab)
    setShowAuth(true)
  }

  const closeAuth = () => {
    setShowAuth(false)
    const url = new URL(window.location.href)
    if (!url.searchParams.has('auth')) return
    url.searchParams.delete('auth')
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
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
    if (user) {
      setShowAuth(false)
    }
  }, [user])

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
            {t('common.loadingDashboard')}
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
        <LandingV3
          onRequestAccess={() => openAuth('signUp')}
          onSignIn={() => openAuth('signIn')}
        />
        <AuthModal 
          isOpen={showAuth} 
          onClose={closeAuth}
          initialTab={authTab}
        />
      </>
    )
  }

  // Se clicou em "Começar", mostrar modal de login/cadastro
  return (
    <>
      <LandingV3
        onRequestAccess={() => openAuth('signUp')}
        onSignIn={() => openAuth('signIn')}
      />
      <AuthModal 
        isOpen={showAuth} 
        onClose={closeAuth}
        initialTab={authTab}
      />
    </>
  )
}

export default function App() {
  return <AppContent />
}
