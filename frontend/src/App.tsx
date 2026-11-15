import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
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
import BusinessPage from './pages/BusinessPage'
import { AuthModal, Layout } from './components'
import LandingV3 from './pages/landing-v3/LandingV3'
import PullToRefresh from './components/layout/PullToRefresh'
import PageTransition from './components/layout/PageTransition'
import EdgeSwipeBack from './components/layout/EdgeSwipeBack'
import AppSplash from './components/layout/AppSplash'
import { useRefreshOnReturn } from './hooks/useRefreshOnReturn'
import { useTabScrollRestoration, type TabNavigationState } from './hooks/useTabScrollRestoration'
import { useThemeColorDimming } from './hooks/useThemeColorDimming'
import type { AppPage, PageChangeOptions } from './components/layout/header/navigation.config'
import { PAGE_PATHS, cardPath, pageFromPath } from './routes'
import { queryClient } from './queries/queryClient'

function authTabFromSearch(search: string): 'signIn' | 'signUp' | null {
  const value = new URLSearchParams(search).get('auth')
  if (value === 'signup') return 'signUp'
  if (value === 'signin') return 'signIn'
  return null
}

function AppContent() {
  const refreshKey = useRefreshOnReturn()
  const { user, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [showAuth, setShowAuth] = useState(() => authTabFromSearch(location.search) !== null)
  const [authTab, setAuthTab] = useState<'signIn' | 'signUp'>(
    () => authTabFromSearch(location.search) ?? 'signIn',
  )
  useTabScrollRestoration()
  useThemeColorDimming()

  const currentPage: AppPage = pageFromPath(location.pathname) ?? 'dashboard'

  /** Kept for the many buttons that navigate by page id; it now just changes the URL. */
  const navigateToPage = useCallback((page: AppPage, options?: PageChangeOptions) => {
    const state: TabNavigationState | undefined = options?.fromTab ? { tab: true } : undefined
    navigate(PAGE_PATHS[page], { state })
  }, [navigate])

  const openCardStatement = useCallback((target: { cardId: number; paymentDate: string }) => {
    navigate(cardPath(target.cardId, target.paymentDate))
  }, [navigate])

  // Cached data belongs to one user: drop it on logout or account switch, and
  // leave whatever deep link the session ended on.
  const previousUserId = useRef(user?.id)
  useEffect(() => {
    if (previousUserId.current === user?.id) return
    previousUserId.current = user?.id
    queryClient.clear()
    if (!user && location.pathname !== '/') navigate('/', { replace: true })
  }, [user, location.pathname, navigate])

  useEffect(() => {
    if (user) setShowAuth(false)
  }, [user])

  const openAuth = (tab: 'signIn' | 'signUp') => {
    setAuthTab(tab)
    setShowAuth(true)
  }

  const closeAuth = () => {
    setShowAuth(false)
    const params = new URLSearchParams(location.search)
    if (!params.has('auth')) return
    params.delete('auth')
    const search = params.toString()
    navigate({ pathname: location.pathname, search: search ? `?${search}` : '' }, { replace: true })
  }

  if (loading) return <AppSplash />

  if (!user) {
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

  if (user.admin) {
    return (
      <>
        <Layout currentPage="admin" onPageChange={navigateToPage} showFooter={false}>
          <AdminDashboardPage key={refreshKey} onPageChange={navigateToPage} />
        </Layout>
        <PullToRefresh />
      </>
    )
  }

  return (
    <>
      <Layout currentPage={currentPage} onPageChange={navigateToPage}>
        {/* A new key after a long time away remounts the page so it refetches. */}
        <Fragment key={refreshKey}>
          <PageTransition>
          <Routes>
            <Route path={PAGE_PATHS.dashboard} element={<Dashboard onPageChange={navigateToPage} />} />
            <Route path={PAGE_PATHS.household} element={<HouseholdPage />} />
            <Route path={PAGE_PATHS.accounts} element={<AccountsPage />} />
            <Route path={`${PAGE_PATHS.accounts}/:accountId`} element={<AccountsPage />} />
            <Route path={PAGE_PATHS.cards} element={<CardsPage />} />
            <Route path={`${PAGE_PATHS.cards}/:cardId`} element={<CardsPage />} />
            <Route path={PAGE_PATHS.installments} element={<CommitmentsPage onPageChange={navigateToPage} initialTab="installments" />} />
            <Route path={PAGE_PATHS['fixed-payments']} element={<CommitmentsPage onPageChange={navigateToPage} initialTab="fixed" />} />
            <Route path={PAGE_PATHS.commitments} element={<CommitmentsPage onPageChange={navigateToPage} />} />
            <Route path={PAGE_PATHS.behaviour} element={<BehaviourPage />} />
            <Route path={PAGE_PATHS.earnings} element={<EarningsPage />} />
            <Route path={PAGE_PATHS.business} element={<BusinessPage />} />
            <Route path={PAGE_PATHS['all-transactions']} element={<AllTransactionsPage />} />
            <Route path={PAGE_PATHS.payments} element={<PaymentsPage onOpenCardStatement={openCardStatement} />} />
            <Route path={PAGE_PATHS.goals} element={<GoalsPage />} />
            <Route path={PAGE_PATHS.planning} element={<PlanningPage onPageChange={navigateToPage} />} />
            <Route path={PAGE_PATHS.reports} element={<ReportsPage />} />
            {/* Unknown paths — and /admin for non-admins — land on the dashboard. */}
            <Route path="*" element={<Navigate to={PAGE_PATHS.dashboard} replace />} />
          </Routes>
          </PageTransition>
        </Fragment>
      </Layout>
      <PullToRefresh />
      <EdgeSwipeBack />
    </>
  )
}

export default function App() {
  return <AppContent />
}
