import { Box, Flex, useBreakpointValue, useColorMode, useDisclosure } from '@chakra-ui/react'
import { useCallback, useMemo, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { EditorialBackdrop, EditorialProvider, editorialPalette } from '../../editorial'
import { UserProfileModal, UserSettingsModal } from '../user'
import Footer from './Footer'
import Header from './header/Header'
import Sidebar, { SIDEBAR_COLLAPSED_W, SIDEBAR_EXPANDED_W } from './Sidebar'
import type { AppPage } from './header/navigation.config'
import { ADMIN_NAV_ITEM, NAV_ITEMS } from './header/navigation.config'

/* -------------------------------------------------------------------------- */
/* Persist sidebar collapse preference                                         */
/* -------------------------------------------------------------------------- */

const SIDEBAR_KEY = 'pb-sidebar-collapsed'

function useSidebarCollapse() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === 'true'
    } catch {
      return false
    }
  })

  const toggle = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev
      try { localStorage.setItem(SIDEBAR_KEY, String(next)) } catch { /* noop */ }
      return next
    })
  }, [])

  return { isCollapsed, toggle }
}

/* -------------------------------------------------------------------------- */
/* Layout                                                                      */
/* -------------------------------------------------------------------------- */

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
  const { user } = useAuth()
  const { colorMode } = useColorMode()
  const profileModal = useDisclosure()
  const settingsModal = useDisclosure()
  const { isCollapsed, toggle } = useSidebarCollapse()

  // Show sidebar for logged-in non-admin users on md+ screens
  const isDesktopOrTablet = useBreakpointValue({ base: false, md: true }) ?? false
  const isAdmin = Boolean(user?.admin)
  const showSidebar = Boolean(user) && !isAdmin && isDesktopOrTablet

  // The whole user app wears the "Editorial · guilloché" identity (light/dark
  // variants). The provider lives here once, so the chrome and every shared
  // primitive that reads `useEd()` (PageHeader, SectionCard, SectionHeader,
  // summary, …) pick it up automatically — DRY, no per-page wiring. Only the
  // admin shell is left on its own theming.
  const editorial = !isAdmin
  const pal = editorial ? editorialPalette(colorMode) : null

  const navItems = useMemo(
    () => (user?.admin ? [ADMIN_NAV_ITEM] : NAV_ITEMS),
    [user?.admin],
  )

  const sidebarWidth = isCollapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_EXPANDED_W

  return (
    <EditorialProvider active={editorial}>
    <Flex
      direction="row"
      minH="100vh"
      bg={pal ? pal.bg : undefined}
      color={pal ? pal.cream : undefined}
      fontFamily={pal ? pal.fontDisplay : undefined}
    >
      {/* ─── Sidebar (md+ screens, logged-in, non-admin) ─── */}
      {showSidebar && (
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={toggle}
          currentPage={currentPage}
          onPageChange={onPageChange}
          items={navItems}
        />
      )}

      {/* ─── Main content column ─── */}
      <Flex
        direction="column"
        flex={1}
        minW={0}
        ml={showSidebar ? `${sidebarWidth}px` : 0}
        transition="margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
        minH="100vh"
      >
        <Header
          onOpenProfile={profileModal.onOpen}
          onOpenSettings={settingsModal.onOpen}
          currentPage={currentPage}
          onPageChange={onPageChange}
          hasSidebar={showSidebar}
        />

        {/* Backdrop guilloché único — toda página herda o fundo da home
            (dark e claro), sem repetir o estilo em cada arquivo. */}
        <Box as="main" flex="1" position="relative" overflow="hidden">
          <EditorialBackdrop />
          <Box position="relative" zIndex={1}>
            {children}
          </Box>
        </Box>

        {showFooter ? <Footer /> : null}

        <UserProfileModal
          isOpen={profileModal.isOpen}
          onClose={profileModal.onClose}
          user={user}
        />
        <UserSettingsModal
          isOpen={settingsModal.isOpen}
          onClose={settingsModal.onClose}
        />
      </Flex>
    </Flex>
    </EditorialProvider>
  )
}
